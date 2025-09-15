const PatientMaster = require("../../modals/Common/PatientMaster");
const { __requestResponse } = require("../../utils/constant");
const {
  __SUCCESS,
  __SOME_ERROR,
} = require("../../utils/variable");
const { __deepClone } = require("../../utils/constant");
const { __CreateAuditLog } = require("../../utils/auditlog");

// Test Route
exports.test = async (req, res) => {
  return res.json(__requestResponse("200", "Patient Master API Working"));
};

// Save Patient (Add/Edit in single API)
exports.SavePatient = async (req, res) => {
  try {
    const { _id } = req.body;
    let patient;
    let oldValue = null;
    
    // Remove _id from patientData to avoid MongoDB issues
    const patientData = { ...req.body };
    delete patientData._id;
    
    // Check if _id exists and is not null/empty - if true, update; otherwise, create new
    if (_id && _id !== null && _id !== "") {
      // Get old value for audit log
      oldValue = await PatientMaster.findById(_id).lean();
      
      if (!oldValue) {
        return res.json(__requestResponse("404", "Patient not found"));
      }
      
      // Update existing patient
      patient = await PatientMaster.findByIdAndUpdate(
        _id, 
        patientData, 
        {
          new: true,
          runValidators: true
        }
      )
      .populate("ReferringDoctorId", "DoctorName")
      .populate("CreatedBy", "UserName")
      .populate("UpdatedBy", "UserName");
      
      // Create audit log for update
      await __CreateAuditLog(
        "patient_master", // Collection name
        "UPDATE", // Audit type
        // "PATIENT_UPDATED", // Audit sub type
        null,
        oldValue, // Old value
        patient.toObject(), // New value
        patient._id, // Reference ID
      );
    } else {
      // Create new patient (when _id is null, undefined, or empty string)
      patient = await PatientMaster.create(patientData);
      
      patient = await PatientMaster.findById(patient._id)
        .populate("ReferringDoctorId", "DoctorName")
        .populate("CreatedBy", "UserName")
        .populate("UpdatedBy", "UserName");
      
      // Create audit log for creation
      await __CreateAuditLog(
        "patient_master", // Collection name
        "CREATE", // Audit type
        // "PATIENT_CREATED", // Audit sub type
        null,
        null, // Old value (null for new records)
        patient.toObject(), // New value
        patient._id, // Reference ID
      );
    }

    return res.json(__requestResponse("200", __SUCCESS, patient));
  } catch (error) {
    console.error("Save Patient Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Patient List (with pagination + population + filters)
exports.patientList = async (req, res) => {
  try {
    // Handle both req.body and req.query to support GET and POST requests
    const requestData = req.body || req.query || {};
    const {
      page = 1,
      limit = 10,
      search = "",
      Gender,
      Nationality,
      ReferringDoctorId,
      IsActive,
    } = requestData;

    const query = { IsDeleted: false };

    // Search filter (Patient Name, PatientId, Phone, Email)
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { Name: regex },
        { PatientId: regex },
        { PhoneNumber: regex },
        { EmailAddress: regex }
      ];
    }

    // Gender filter
    if (Gender) {
      query.Gender = Gender;
    }

    // Nationality filter
    if (Nationality) {
      query.Nationality = { $regex: Nationality, $options: "i" };
    }

    // Referring Doctor filter
    if (ReferringDoctorId) {
      query.ReferringDoctorId = ReferringDoctorId;
    }

    // Active status filter
    if (IsActive !== undefined) {
      query.IsActive = IsActive;
    }

    const total = await PatientMaster.countDocuments(query);
    const list = await PatientMaster.find(query)
      .populate("ReferringDoctorId", "DoctorName")
      .populate("CreatedBy", "UserName")
      .populate("UpdatedBy", "UserName")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for read-only operations

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: Number(page),
        limit: Number(limit),
        filters: {
          search,
          Gender,
          Nationality,
          ReferringDoctorId,
          IsActive,
        },
        list: __deepClone(list),
      })
    );
  } catch (error) {
    console.error("Patient List Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Get Patient By ID
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await PatientMaster.findById(id)
      .populate("ReferringDoctorId", "DoctorName")
      .populate("CreatedBy", "UserName")
      .populate("UpdatedBy", "UserName")
      .lean();

    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, patient));
  } catch (error) {
    console.error("Get Patient Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Get Patient By PatientId
exports.getPatientByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const patient = await PatientMaster.findByPatientId(patientId)
      .populate("ReferringDoctorId", "DoctorName")
      .populate("CreatedBy", "UserName")
      .populate("UpdatedBy", "UserName")
      .lean();

    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, patient));
  } catch (error) {
    console.error("Get Patient By PatientId Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Delete Patient (Soft Delete)
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the record before deletion for audit log
    const oldValue = await PatientMaster.findById(id).lean();
    
    if (!oldValue) {
      return res.json(__requestResponse("404", "Patient not found"));
    }
    
    if (oldValue.IsDeleted) {
      return res.json(__requestResponse("400", "Patient already deleted"));
    }
    
    // Soft delete - set IsDeleted to true
    const patient = await PatientMaster.findByIdAndUpdate(
      id,
      { IsDeleted: true, UpdatedBy: req.body.UpdatedBy },
      { new: true }
    );

    // Create audit log for deletion
    await __CreateAuditLog(
      "patient_master", // Collection name
      "DELETE", // Audit type
      "PATIENT_DELETED", // Audit sub type
      oldValue, // Old value
      patient.toObject(), // New value
      id, // Reference ID
    );
    
    return res.json(__requestResponse("200", "Patient deleted successfully"));
  } catch (error) {
    console.error("Delete Patient Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Get Patients by Doctor
exports.getPatientsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const patients = await PatientMaster.findByDoctor(doctorId)
      .populate("ReferringDoctorId", "DoctorName")
      .lean();

    return res.json(__requestResponse("200", __SUCCESS, patients));
  } catch (error) {
    console.error("Get Patients By Doctor Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Search Patients
exports.searchPatients = async (req, res) => {
  try {
    const { searchTerm } = req.params;
    
    const patients = await PatientMaster.searchPatients(searchTerm)
      .populate("ReferringDoctorId", "DoctorName")
      .lean();

    return res.json(__requestResponse("200", __SUCCESS, patients));
  } catch (error) {
    console.error("Search Patients Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};