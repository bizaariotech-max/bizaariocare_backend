const PatientCaseFile = require("../../modals/Patient/PatientCaseFile");
const MedicalHistory = require("../../modals/Patient/MedicalHistory2");
const { __requestResponse, __deepClone } = require("../../utils/constant");
const { __SUCCESS, __SOME_ERROR } = require("../../utils/variable");
const { __CreateAuditLog } = require("../../utils/auditlog");
const mongoose = require("mongoose");

exports.savePatientCaseFile = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { _id } = req.body;
    let patientCaseFile;
    let medicalHistory;
    let oldValue = null;

    const caseFileData = { ...req.body };
    delete caseFileData._id;

    if (_id) {
      // Update existing case file
      oldValue = await PatientCaseFile.findById(_id).lean();
      if (!oldValue) {
        return res.json(
          __requestResponse("404", "Patient Case File not found")
        );
      }

      patientCaseFile = await PatientCaseFile.findByIdAndUpdate(
        _id,
        caseFileData,
        {
          new: true,
          runValidators: true,
          session,
        }
      );

      await __CreateAuditLog(
        "patient_case_file",
        "UPDATE",
        null,
        oldValue,
        patientCaseFile.toObject(),
        patientCaseFile._id
      );
    } else {
      // Create new case file with medical history
      patientCaseFile = await PatientCaseFile.create([caseFileData], {
        session,
      });
      patientCaseFile = patientCaseFile[0];

      // Create initial medical history
      medicalHistory = await MedicalHistory.create(
        [
          {
            CaseFileId: patientCaseFile._id,
            PatientId: patientCaseFile.PatientId,
            Status: "Active",
            // CreatedBy: req.user._id,
            IsActive: true,
            // DoctorHospitalInfo: {
            //   Date: new Date(),
            //   DoctorName: req.body.DoctorName,
            //   DoctorNumber: req.body.DoctorNumber,
            //   HospitalName: req.body.HospitalName,
            //   MedicalSpeciality: req.body.Speciality,
            // },
          },
        ],
        { session }
      );

      await Promise.all([
        __CreateAuditLog(
          "patient_case_file",
          "CREATE",
          null,
          null,
          patientCaseFile.toObject(),
          patientCaseFile._id
        ),
        __CreateAuditLog(
          "medical_history",
          "CREATE",
          null,
          null,
          medicalHistory[0].toObject(),
          medicalHistory[0]._id
        ),
      ]);
    }

    await session.commitTransaction();
    session.endSession();

    // Populate references
    patientCaseFile = await PatientCaseFile.findById(patientCaseFile._id)
      .populate("PatientId", "Name PatientId")
      .populate("DoctorId", "AssetName")
      .populate("HospitalId", "AssetName");

    return res.json(
      __requestResponse("200", __SUCCESS, {
        caseFile: patientCaseFile,
        medicalHistory: medicalHistory ? medicalHistory[0] : null,
      })
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Save Patient Case File (Add/Edit) old
exports.savePatientCaseFilexx = async (req, res) => {
  try {
    const { _id } = req.body;
    let patientCaseFile;
    let oldValue = null;

    // Remove _id from data
    const caseFileData = { ...req.body };
    delete caseFileData._id;

    if (_id && _id !== null && _id !== "") {
      // Get old value for audit log
      oldValue = await PatientCaseFile.findById(_id).lean();

      if (!oldValue) {
        return res.json(
          __requestResponse("404", "Patient Case File not found")
        );
      }

      // Update existing case file
      patientCaseFile = await PatientCaseFile.findByIdAndUpdate(
        _id,
        caseFileData,
        {
          new: true,
          runValidators: true,
        }
      );

      // Create audit log for update
      await __CreateAuditLog(
        "patient_case_file",
        "UPDATE",
        null,
        oldValue,
        patientCaseFile.toObject(),
        patientCaseFile._id
      );
    } else {
      // Create new case file
      patientCaseFile = await PatientCaseFile.create(caseFileData);

      // Create audit log for creation
      await __CreateAuditLog(
        "patient_case_file",
        "CREATE",
        null,
        null,
        patientCaseFile.toObject(),
        patientCaseFile._id
      );
    }

    // Populate references
    patientCaseFile = await PatientCaseFile.findById(patientCaseFile._id)
      .populate("PatientId", "Name PatientId")
      .populate("DoctorId", "AssetName")
      .populate("HospitalId", "AssetName");

    return res.json(__requestResponse("200", __SUCCESS, patientCaseFile));
  } catch (error) {
    console.error("Save Patient Case File Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Get Patient Case File List
exports.patientCaseFileList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      PatientId,
      TreatmentType,
      FromDate,
      ToDate,
    } = req.query;

    const query = { IsDeleted: false };

    // Apply filters
    if (PatientId) {
      query.PatientId = PatientId;
    }
    if (TreatmentType) {
      query.TreatmentType = TreatmentType;
    }
    if (FromDate || ToDate) {
      query.Date = {};
      if (FromDate) query.Date.$gte = new Date(FromDate);
      if (ToDate) query.Date.$lte = new Date(ToDate);
    }
    if (search) {
      query.$or = [
        { DoctorName: new RegExp(search, "i") },
        { HospitalName: new RegExp(search, "i") },
        { Notes: new RegExp(search, "i") },
      ];
    }

    // Count total records
    const total = await PatientCaseFile.countDocuments(query);

    // Get paginated list
    const list = await PatientCaseFile.find(query)
      .populate("PatientId", "Name PatientId")
      .populate("DoctorId", "AssetName")
      .populate("HospitalId", "AssetName")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ Date: -1 })
      .lean();

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: Number(page),
        limit: Number(limit),
        filters: {
          search,
          PatientId,
          TreatmentType,
          FromDate,
          ToDate,
        },
        list: __deepClone(list),
      })
    );
  } catch (error) {
    console.error("Patient Case File List Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Get Patient Case File By ID
exports.getPatientCaseFileById = async (req, res) => {
  try {
    const { id } = req.params;

    const caseFile = await PatientCaseFile.findById(id)
      .populate("PatientId", "Name PatientId")
      .populate("DoctorId", "AssetName")
      .populate("HospitalId", "AssetName")
      .lean();

    if (!caseFile) {
      return res.json(__requestResponse("404", "Patient Case File not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, caseFile));
  } catch (error) {
    console.error("Get Patient Case File Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Delete Patient Case File
exports.deletePatientCaseFile = async (req, res) => {
  try {
    const { id } = req.params;

    // Get old value for audit log
    const oldValue = await PatientCaseFile.findById(id).lean();

    if (!oldValue) {
      return res.json(__requestResponse("404", "Patient Case File not found"));
    }

    if (oldValue.IsDeleted) {
      return res.json(
        __requestResponse("400", "Patient Case File already deleted")
      );
    }

    // Soft delete
    const caseFile = await PatientCaseFile.findByIdAndUpdate(
      id,
      { IsDeleted: true },
      { new: true }
    );

    // Create audit log for deletion
    await __CreateAuditLog(
      "patient_case_file",
      "DELETE",
      null,
      oldValue,
      caseFile.toObject(),
      id
    );

    return res.json(
      __requestResponse("200", "Patient Case File deleted successfully")
    );
  } catch (error) {
    console.error("Delete Patient Case File Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};
