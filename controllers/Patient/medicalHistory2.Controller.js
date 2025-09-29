const MedicalHistory = require("../../modals/Patient/MedicalHistory2");
const PatientCaseFile = require("../../modals/Patient/PatientCaseFile");
const { __requestResponse, __deepClone } = require("../../utils/constant");
const { __SUCCESS, __SOME_ERROR } = require("../../utils/variable");
const { __CreateAuditLog } = require("../../utils/auditlog");
const mongoose = require("mongoose");

// Helper function to get or create medical history
const getOrCreateMedicalHistory = async (
  CaseFileId,
  PatientId,
  CreatedBy,
  session
) => {
  let medicalHistory = await MedicalHistory.findOne({
    CaseFileId,
    IsDeleted: false,
  }).session(session);

  if (!medicalHistory) {
    medicalHistory = await MedicalHistory.create(
      [
        {
          CaseFileId,
          PatientId,
          Status: "Active",
          IsActive: true,
          CreatedBy,
          ChiefComplaints: [],
          ClinicalDiagnoses: [],
          MedicinesPrescribed: {
            Medicines: [],
            RecoveryCycle: { Value: 0, Unit: null },
            PrescriptionUrls: [],
          },
          Therapies: [],
          SurgeriesProcedures: [],
        },
      ],
      { session }
    );
    medicalHistory = medicalHistory[0];

    await __CreateAuditLog(
      "medical_history",
      "CREATE",
      null,
      null,
      medicalHistory.toObject(),
      medicalHistory._id
    );
  }
  return medicalHistory;
};

// Population configurations for each section
const populateConfigs = {
  ChiefComplaints: [
    { path: "ChiefComplaints.Symptoms", select: "lookup_value" },
    { path: "ChiefComplaints.Duration.Unit", select: "lookup_value" },
    { path: "ChiefComplaints.AggravatingFactors", select: "lookup_value" },
  ],
  ClinicalDiagnoses: [
    { path: "ClinicalDiagnoses.InvestigationCategory", select: "lookup_value" },
    { path: "ClinicalDiagnoses.Investigation", select: "lookup_value" },
    { path: "ClinicalDiagnoses.Abnormalities", select: "lookup_value" },
  ],
  MedicinesPrescribed: [
    {
      path: "MedicinesPrescribed.Medicines.MedicineName",
      select: "lookup_value",
    },
    { path: "MedicinesPrescribed.Medicines.Dosage", select: "lookup_value" },
    { path: "MedicinesPrescribed.RecoveryCycle.Unit", select: "lookup_value" },
  ],
  Therapies: [{ path: "Therapies.TherapyName", select: "lookup_value" }],
  SurgeriesProcedures: [
    { path: "SurgeryProcedure.MedicalSpeciality", select: "lookup_value" },
    { path: "SurgeryProcedure.SurgeryProcedureName", select: "lookup_value" },
    { path: "SurgeryProcedure.RecoveryCycle.Unit", select: "lookup_value" },
    {
      path: "SurgeryProcedure.PostSurgeryComplications",
      select: "lookup_value",
    },
  ],
};

// ===================
// CHIEF COMPLAINTS
// ===================

// Add single chief complaint
exports.addChiefComplaint = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, ChiefComplaint, CreatedBy } = req.body;

    const medicalHistory = await getOrCreateMedicalHistory(
      CaseFileId,
      req.caseFile.PatientId,
      CreatedBy,
      session
    );

    const oldValue = medicalHistory.toObject();
    medicalHistory.ChiefComplaints.push(ChiefComplaint);
    medicalHistory.UpdatedBy = CreatedBy;
    await medicalHistory.save({ session });

    await __CreateAuditLog(
      "medical_history",
      "ADD_CHIEF_COMPLAINT",
      null,
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate(populateConfigs.ChiefComplaints)
      .populate("CaseFileId", "CaseFileNumber Date")
      .populate("PatientId", "Name PatientId");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Add multiple chief complaints
exports.addChiefComplaints = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, ChiefComplaints, CreatedBy } = req.body;

    const medicalHistory = await getOrCreateMedicalHistory(
      CaseFileId,
      req.caseFile.PatientId,
      CreatedBy,
      session
    );

    const oldValue = medicalHistory.toObject();
    ChiefComplaints.forEach((complaint) => {
      medicalHistory.ChiefComplaints.push(complaint);
    });

    medicalHistory.UpdatedBy = CreatedBy;
    await medicalHistory.save({ session });

    await __CreateAuditLog(
      "medical_history",
      "ADD_CHIEF_COMPLAINTS",
      null,
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate(populateConfigs.ChiefComplaints)
      .populate("CaseFileId", "CaseFileNumber Date")
      .populate("PatientId", "Name PatientId");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Edit single chief complaint
exports.editChiefComplaint = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { _id, CaseFileId, ChiefComplaint, UpdatedBy } = req.body;

    const medicalHistory = await MedicalHistory.findOne({
      CaseFileId,
      IsDeleted: false,
    }).session(session);

    if (!medicalHistory) {
      await session.abortTransaction();
      session.endSession();
      return res.json(__requestResponse("404", "Medical History not found"));
    }

    const oldValue = medicalHistory.toObject();
    const complaintIndex = medicalHistory.ChiefComplaints.findIndex(
      (complaint) => complaint._id.toString() === _id.toString()
    );

    if (complaintIndex === -1) {
      await session.abortTransaction();
      session.endSession();
      return res.json(__requestResponse("404", "Chief Complaint not found"));
    }

    medicalHistory.ChiefComplaints[complaintIndex] = {
      ...medicalHistory.ChiefComplaints[complaintIndex].toObject(),
      ...ChiefComplaint,
      _id: _id,
    };
    medicalHistory.UpdatedBy = UpdatedBy;
    await medicalHistory.save({ session });

    await __CreateAuditLog(
      "medical_history",
      "EDIT_CHIEF_COMPLAINT",
      null,
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate(populateConfigs.ChiefComplaints)
      .populate("CaseFileId", "CaseFileNumber Date")
      .populate("PatientId", "Name PatientId");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Edit multiple chief complaints (replace all)
exports.editChiefComplaints = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, ChiefComplaints, UpdatedBy } = req.body;

    const medicalHistory = await MedicalHistory.findOne({
      CaseFileId,
      IsDeleted: false,
    }).session(session);

    if (!medicalHistory) {
      await session.abortTransaction();
      session.endSession();
      return res.json(__requestResponse("404", "Medical History not found"));
    }

    const oldValue = medicalHistory.toObject();
    medicalHistory.ChiefComplaints = ChiefComplaints;
    medicalHistory.UpdatedBy = UpdatedBy;
    await medicalHistory.save({ session });

    await __CreateAuditLog(
      "medical_history",
      "EDIT_CHIEF_COMPLAINTS",
      null,
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate(populateConfigs.ChiefComplaints)
      .populate("CaseFileId", "CaseFileNumber Date")
      .populate("PatientId", "Name PatientId");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.listChiefComplaintsxx = async (req, res) => {
  try {
    const { CaseFileId, PatientId, page = 1, limit = 10, search } = req.query;

    const query = { IsDeleted: false };
    if (CaseFileId) query.CaseFileId = CaseFileId;
    if (PatientId) query.PatientId = PatientId;

    let pipeline = [
      { $match: query },
      {
        $unwind: {
          path: "$ChiefComplaints",
          preserveNullAndEmptyArrays: false,
        },
      },
    ];

    if (search) {
      pipeline.push({
        $lookup: {
          from: "admin_lookups",
          localField: "ChiefComplaints.Symptoms",
          foreignField: "_id",
          as: "symptomDetails",
        },
      });
      pipeline.push({
        $match: {
          "symptomDetails.lookup_value": { $regex: search, $options: "i" },
        },
      });
    }

    pipeline.push(
      { $skip: (page - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "patient_case_files",
          localField: "CaseFileId",
          foreignField: "_id",
          as: "CaseFile",
        },
      },
      {
        $lookup: {
          from: "patient_masters",
          localField: "PatientId",
          foreignField: "_id",
          as: "Patient",
        },
      }
    );

    const results = await MedicalHistory.aggregate(pipeline);
    const populatedResults = await MedicalHistory.populate(
      results,
      populateConfigs.ChiefComplaints
    );

    const total = await MedicalHistory.aggregate([
      { $match: query },
      { $unwind: "$ChiefComplaints" },
      { $count: "total" },
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total: total[0]?.total || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((total[0]?.total || 0) / limit),
        list: __deepClone(populatedResults),
      })
    );
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.listChiefComplaintsxxx = async (req, res) => {
  try {
    const { CaseFileId, PatientId, page = 1, limit = 10, search } = req.query;

    const query = { IsDeleted: false };
    if (CaseFileId) query.CaseFileId = CaseFileId;
    if (PatientId) query.PatientId = PatientId;

    let pipeline = [
      { $match: query },
      {
        $unwind: {
          path: "$ChiefComplaints",
          preserveNullAndEmptyArrays: false,
        },
      },
    ];

    if (search) {
      pipeline.push({
        $lookup: {
          from: "admin_lookups",
          localField: "ChiefComplaints.Symptoms",
          foreignField: "_id",
          as: "symptomDetails",
        },
      });
      pipeline.push({
        $match: {
          "symptomDetails.lookup_value": { $regex: search, $options: "i" },
        },
      });
    }

    // Add all lookups with field selection
    pipeline.push(
      // Lookup Symptoms - only _id and lookup_value
      {
        $lookup: {
          from: "admin_lookups",
          localField: "ChiefComplaints.Symptoms",
          foreignField: "_id",
          as: "symptoms",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      // Lookup Duration Unit - only _id and lookup_value
      {
        $lookup: {
          from: "admin_lookups",
          localField: "ChiefComplaints.Duration.Unit",
          foreignField: "_id",
          as: "durationUnit",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      // Lookup Aggravating Factors - only _id and lookup_value
      {
        $lookup: {
          from: "admin_lookups",
          localField: "ChiefComplaints.AggravatingFactors",
          foreignField: "_id",
          as: "aggravatingFactors",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      // Lookup Case File
      {
        $lookup: {
          from: "patient_case_files",
          localField: "CaseFileId",
          foreignField: "_id",
          as: "CaseFile",
        },
      },
      // Lookup Patient
      {
        $lookup: {
          from: "patient_masters",
          localField: "PatientId",
          foreignField: "_id",
          as: "Patient",
        },
      },
      // Final projection with populated data
      {
        $project: {
          _id: "$ChiefComplaints._id",
          medicalHistoryId: "$_id",
          CaseFileId: 1,
          PatientId: 1,
          ChiefComplaint: {
            _id: "$ChiefComplaints._id",
            Symptoms: "$symptoms",
            Duration: {
              Value: "$ChiefComplaints.Duration.Value",
              Unit: { $arrayElemAt: ["$durationUnit", 0] },
              _id: "$ChiefComplaints.Duration._id",
            },
            SeverityGrade: "$ChiefComplaints.SeverityGrade",
            AggravatingFactors: "$aggravatingFactors",
            createdAt: "$ChiefComplaints.createdAt",
            updatedAt: "$ChiefComplaints.updatedAt",
          },
          createdAt: "$ChiefComplaints.createdAt",
          updatedAt: "$ChiefComplaints.updatedAt",
          CaseFile: 1,
          Patient: 1,
        },
      },

      // ADD SORTING HERE - Latest first (descending order)
      {
        $sort: {
          "ChiefComplaint.createdAt": -1, // Primary sort: Latest records first
          "ChiefComplaint.updatedAt": -1, // Secondary sort: Recently updated first
        },
      },

      { $skip: (page - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    );

    const results = await MedicalHistory.aggregate(pipeline);

    const total = await MedicalHistory.aggregate([
      { $match: query },
      { $unwind: "$ChiefComplaints" },
      { $count: "total" },
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total: total[0]?.total || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((total[0]?.total || 0) / limit),
        list: __deepClone(results),
      })
    );
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.listChiefComplaints = async (req, res) => {
  try {
    const { CaseFileId, PatientId, page = 1, limit = 10, search } = req.query;

    const query = { IsDeleted: false };
    if (CaseFileId) query.CaseFileId = CaseFileId;
    if (PatientId) query.PatientId = PatientId;

    let pipeline = [
      { $match: query },
      {
        $unwind: {
          path: "$ChiefComplaints",
          preserveNullAndEmptyArrays: false,
        },
      },
    ];

    if (search) {
      pipeline.push({
        $lookup: {
          from: "admin_lookups",
          localField: "ChiefComplaints.Symptoms",
          foreignField: "_id",
          as: "symptomDetails",
        },
      });
      pipeline.push({
        $match: {
          "symptomDetails.lookup_value": { $regex: search, $options: "i" },
        },
      });
    }

    // Add all lookups with field selection
    pipeline.push(
      // Lookup Symptoms - only _id and lookup_value
      {
        $lookup: {
          from: "admin_lookups",
          localField: "ChiefComplaints.Symptoms",
          foreignField: "_id",
          as: "symptoms",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      // Lookup Duration Unit - only _id and lookup_value
      {
        $lookup: {
          from: "admin_lookups",
          localField: "ChiefComplaints.Duration.Unit",
          foreignField: "_id",
          as: "durationUnit",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      // Lookup Aggravating Factors - only _id and lookup_value
      {
        $lookup: {
          from: "admin_lookups",
          localField: "ChiefComplaints.AggravatingFactors",
          foreignField: "_id",
          as: "aggravatingFactors",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      // Lookup Case File - only essential fields
      {
        $lookup: {
          from: "patient_case_files",
          localField: "CaseFileId",
          foreignField: "_id",
          as: "CaseFile",
          pipeline: [
            {
              $project: {
                _id: 1,
                TreatmentType: 1,
                Date: 1,
                CaseFileNumber: 1,
              },
            },
          ],
        },
      },
      // Lookup Patient - only essential fields
      {
        $lookup: {
          from: "patient_masters",
          localField: "PatientId",
          foreignField: "_id",
          as: "Patient",
          pipeline: [
            { $project: { _id: 1, Name: 1, PatientId: 1, PhoneNumber: 1 } },
          ],
        },
      },
      // Final projection with populated data
      {
        $project: {
          _id: "$ChiefComplaints._id",
          medicalHistoryId: "$_id",
          CaseFileId: "$CaseFileId",
          PatientId: "$PatientId",
          ChiefComplaint: {
            _id: "$ChiefComplaints._id",
            Symptoms: "$symptoms",
            Duration: {
              Value: "$ChiefComplaints.Duration.Value",
              Unit: { $arrayElemAt: ["$durationUnit", 0] },
              _id: "$ChiefComplaints.Duration._id",
            },
            SeverityGrade: "$ChiefComplaints.SeverityGrade",
            AggravatingFactors: "$aggravatingFactors",
            createdAt: "$ChiefComplaints.createdAt",
            updatedAt: "$ChiefComplaints.updatedAt",
          },
          createdAt: "$ChiefComplaints.createdAt",
          updatedAt: "$ChiefComplaints.updatedAt",
          CaseFile: 1,
          Patient: 1,
        },
      },

      // Sort by latest first
      {
        $sort: {
          "ChiefComplaint.createdAt": -1,
          "ChiefComplaint.updatedAt": -1,
        },
      },

      { $skip: (page - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    );

    const results = await MedicalHistory.aggregate(pipeline);

    const total = await MedicalHistory.aggregate([
      { $match: query },
      { $unwind: "$ChiefComplaints" },
      { $count: "total" },
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total: total[0]?.total || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((total[0]?.total || 0) / limit),
        list: __deepClone(results),
      })
    );
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ===================
// CLINICAL DIAGNOSES
// ===================

// Add single clinical diagnosis
exports.addClinicalDiagnosis = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, ClinicalDiagnosis, CreatedBy } = req.body;

    const medicalHistory = await getOrCreateMedicalHistory(
      CaseFileId,
      req.caseFile.PatientId,
      CreatedBy,
      session
    );

    const oldValue = medicalHistory.toObject();
    medicalHistory.ClinicalDiagnoses.push(ClinicalDiagnosis);
    medicalHistory.UpdatedBy = CreatedBy;
    await medicalHistory.save({ session });

    await __CreateAuditLog(
      "medical_history",
      "ADD_CLINICAL_DIAGNOSIS",
      null,
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate(populateConfigs.ClinicalDiagnoses)
      .populate("CaseFileId", "CaseFileNumber Date")
      .populate("PatientId", "Name PatientId");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Add multiple clinical diagnoses
exports.addClinicalDiagnoses = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, ClinicalDiagnoses, CreatedBy } = req.body;

    const medicalHistory = await getOrCreateMedicalHistory(
      CaseFileId,
      req.caseFile.PatientId,
      CreatedBy,
      session
    );

    const oldValue = medicalHistory.toObject();
    ClinicalDiagnoses.forEach((diagnosis) => {
      medicalHistory.ClinicalDiagnoses.push(diagnosis);
    });

    medicalHistory.UpdatedBy = CreatedBy;
    await medicalHistory.save({ session });

    await __CreateAuditLog(
      "medical_history",
      "ADD_CLINICAL_DIAGNOSES",
      null,
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate(populateConfigs.ClinicalDiagnoses)
      .populate("CaseFileId", "CaseFileNumber Date")
      .populate("PatientId", "Name PatientId");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Edit single clinical diagnosis
exports.editClinicalDiagnosis = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { _id, CaseFileId, ClinicalDiagnosis, UpdatedBy } = req.body;

    const medicalHistory = await MedicalHistory.findOne({
      CaseFileId,
      IsDeleted: false,
    }).session(session);

    if (!medicalHistory) {
      await session.abortTransaction();
      session.endSession();
      return res.json(__requestResponse("404", "Medical History not found"));
    }

    const oldValue = medicalHistory.toObject();
    const diagnosisIndex = medicalHistory.ClinicalDiagnoses.findIndex(
      (diagnosis) => diagnosis._id.toString() === _id.toString()
    );

    if (diagnosisIndex === -1) {
      await session.abortTransaction();
      session.endSession();
      return res.json(__requestResponse("404", "Clinical Diagnosis not found"));
    }

    medicalHistory.ClinicalDiagnoses[diagnosisIndex] = {
      ...medicalHistory.ClinicalDiagnoses[diagnosisIndex].toObject(),
      ...ClinicalDiagnosis,
      _id: _id,
    };
    medicalHistory.UpdatedBy = UpdatedBy;
    await medicalHistory.save({ session });

    await __CreateAuditLog(
      "medical_history",
      "EDIT_CLINICAL_DIAGNOSIS",
      null,
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate(populateConfigs.ClinicalDiagnoses)
      .populate("CaseFileId", "CaseFileNumber Date")
      .populate("PatientId", "Name PatientId");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Edit multiple clinical diagnoses (replace all)
exports.editClinicalDiagnoses = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, ClinicalDiagnoses, UpdatedBy } = req.body;

    const medicalHistory = await MedicalHistory.findOne({
      CaseFileId,
      IsDeleted: false,
    }).session(session);

    if (!medicalHistory) {
      await session.abortTransaction();
      session.endSession();
      return res.json(__requestResponse("404", "Medical History not found"));
    }

    const oldValue = medicalHistory.toObject();
    medicalHistory.ClinicalDiagnoses = ClinicalDiagnoses;
    medicalHistory.UpdatedBy = UpdatedBy;
    await medicalHistory.save({ session });

    await __CreateAuditLog(
      "medical_history",
      "EDIT_CLINICAL_DIAGNOSES",
      null,
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate(populateConfigs.ClinicalDiagnoses)
      .populate("CaseFileId", "CaseFileNumber Date")
      .populate("PatientId", "Name PatientId");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.listClinicalDiagnosesxx = async (req, res) => {
  try {
    const { CaseFileId, PatientId, page = 1, limit = 10, search } = req.query;

    const query = { IsDeleted: false };
    if (CaseFileId) query.CaseFileId = CaseFileId;
    if (PatientId) query.PatientId = PatientId;

    let pipeline = [
      { $match: query },
      {
        $unwind: {
          path: "$ClinicalDiagnoses",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: "$ClinicalDiagnoses._id",
          medicalHistoryId: "$_id",
          CaseFileId: 1,
          PatientId: 1,
          ClinicalDiagnosis: "$ClinicalDiagnoses", // Single clinical diagnosis object
          createdAt: "$ClinicalDiagnoses.createdAt",
          updatedAt: "$ClinicalDiagnoses.updatedAt",
        },
      },
      { $skip: (page - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "patient_case_files",
          localField: "CaseFileId",
          foreignField: "_id",
          as: "CaseFile",
        },
      },
      {
        $lookup: {
          from: "patient_masters",
          localField: "PatientId",
          foreignField: "_id",
          as: "Patient",
        },
      },
    ];

    const results = await MedicalHistory.aggregate(pipeline);

    // Populate clinical diagnosis-specific fields
    const populatedResults = await MedicalHistory.populate(results, [
      {
        path: "ClinicalDiagnosis.InvestigationCategory",
        select: "lookup_value",
      },
      { path: "ClinicalDiagnosis.Investigation", select: "lookup_value" },
      { path: "ClinicalDiagnosis.Abnormalities", select: "lookup_value" },
    ]);

    const total = await MedicalHistory.aggregate([
      { $match: query },
      { $unwind: "$ClinicalDiagnoses" },
      { $count: "total" },
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total: total[0]?.total || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((total[0]?.total || 0) / limit),
        list: __deepClone(populatedResults),
      })
    );
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.listClinicalDiagnoses = async (req, res) => {
  try {
    const { CaseFileId, PatientId, page = 1, limit = 10, search } = req.query;

    const query = { IsDeleted: false };
    if (CaseFileId) query.CaseFileId = CaseFileId;
    if (PatientId) query.PatientId = PatientId;

    let pipeline = [
      { $match: query },
      {
        $unwind: {
          path: "$ClinicalDiagnoses",
          preserveNullAndEmptyArrays: false,
        },
      },
      // Lookup Investigation Category - only _id and lookup_value
      {
        $lookup: {
          from: "admin_lookups",
          localField: "ClinicalDiagnoses.InvestigationCategory",
          foreignField: "_id",
          as: "investigationCategory",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      // Lookup Investigation - only _id and lookup_value
      {
        $lookup: {
          from: "admin_lookups",
          localField: "ClinicalDiagnoses.Investigation",
          foreignField: "_id",
          as: "investigation",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      // Lookup Abnormalities - only _id and lookup_value
      {
        $lookup: {
          from: "admin_lookups",
          localField: "ClinicalDiagnoses.Abnormalities",
          foreignField: "_id",
          as: "abnormalities",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      // Lookup Case File - only essential fields
      {
        $lookup: {
          from: "patient_case_files",
          localField: "CaseFileId",
          foreignField: "_id",
          as: "CaseFile",
          pipeline: [
            {
              $project: {
                _id: 1,
                TreatmentType: 1,
                Date: 1,
                CaseFileNumber: 1,
              },
            },
          ],
        },
      },
      // Lookup Patient - only essential fields
      {
        $lookup: {
          from: "patient_masters",
          localField: "PatientId",
          foreignField: "_id",
          as: "Patient",
          pipeline: [
            { $project: { _id: 1, Name: 1, PatientId: 1, PhoneNumber: 1 } },
          ],
        },
      },
      // Final projection with populated data
      {
        $project: {
          _id: "$ClinicalDiagnoses._id",
          medicalHistoryId: "$_id",
          CaseFileId: "$CaseFileId",
          PatientId: "$PatientId",
          ClinicalDiagnosis: {
            _id: "$ClinicalDiagnoses._id",
            Date: "$ClinicalDiagnoses.Date",
            InvestigationCategory: {
              $arrayElemAt: ["$investigationCategory", 0],
            },
            Investigation: { $arrayElemAt: ["$investigation", 0] },
            Abnormalities: "$abnormalities",
            ReportUrl: "$ClinicalDiagnoses.ReportUrl",
            InterpretationUrl: "$ClinicalDiagnoses.InterpretationUrl",
            createdAt: "$ClinicalDiagnoses.createdAt",
            updatedAt: "$ClinicalDiagnoses.updatedAt",
          },
          createdAt: "$ClinicalDiagnoses.createdAt",
          updatedAt: "$ClinicalDiagnoses.updatedAt",
          CaseFile: 1,
          Patient: 1,
        },
      },

      // Sort by latest first
      {
        $sort: {
          "ClinicalDiagnosis.createdAt": -1,
          "ClinicalDiagnosis.updatedAt": -1,
        },
      },

      { $skip: (page - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ];

    const results = await MedicalHistory.aggregate(pipeline);

    const total = await MedicalHistory.aggregate([
      { $match: query },
      { $unwind: "$ClinicalDiagnoses" },
      { $count: "total" },
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total: total[0]?.total || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((total[0]?.total || 0) / limit),
        list: __deepClone(results),
      })
    );
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ===================
// THERAPIES
// ===================

// Add single therapy
exports.addTherapy = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, Therapy, CreatedBy } = req.body;

    const medicalHistory = await getOrCreateMedicalHistory(
      CaseFileId,
      req.caseFile.PatientId,
      CreatedBy,
      session
    );

    const oldValue = medicalHistory.toObject();
    medicalHistory.Therapies.push(Therapy);
    medicalHistory.UpdatedBy = CreatedBy;
    await medicalHistory.save({ session });

    await __CreateAuditLog(
      "medical_history",
      "ADD_THERAPY",
      null,
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate(populateConfigs.Therapies)
      .populate("CaseFileId", "CaseFileNumber Date")
      .populate("PatientId", "Name PatientId");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Add multiple therapies
exports.addTherapies = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, Therapies, CreatedBy } = req.body;

    const medicalHistory = await getOrCreateMedicalHistory(
      CaseFileId,
      req.caseFile.PatientId,
      CreatedBy,
      session
    );

    const oldValue = medicalHistory.toObject();
    Therapies.forEach((therapy) => {
      medicalHistory.Therapies.push(therapy);
    });

    medicalHistory.UpdatedBy = CreatedBy;
    await medicalHistory.save({ session });

    await __CreateAuditLog(
      "medical_history",
      "ADD_THERAPIES",
      null,
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate(populateConfigs.Therapies)
      .populate("CaseFileId", "CaseFileNumber Date")
      .populate("PatientId", "Name PatientId");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Edit single therapy
exports.editTherapy = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { _id, CaseFileId, Therapy, UpdatedBy } = req.body;

    const medicalHistory = await MedicalHistory.findOne({
      CaseFileId,
      IsDeleted: false,
    }).session(session);

    if (!medicalHistory) {
      await session.abortTransaction();
      session.endSession();
      return res.json(__requestResponse("404", "Medical History not found"));
    }

    const oldValue = medicalHistory.toObject();
    const therapyIndex = medicalHistory.Therapies.findIndex(
      (therapy) => therapy._id.toString() === _id.toString()
    );

    if (therapyIndex === -1) {
      await session.abortTransaction();
      session.endSession();
      return res.json(__requestResponse("404", "Therapy not found"));
    }

    medicalHistory.Therapies[therapyIndex] = {
      ...medicalHistory.Therapies[therapyIndex].toObject(),
      ...Therapy,
      _id: _id,
    };
    medicalHistory.UpdatedBy = UpdatedBy;
    await medicalHistory.save({ session });

    await __CreateAuditLog(
      "medical_history",
      "EDIT_THERAPY",
      null,
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate(populateConfigs.Therapies)
      .populate("CaseFileId", "CaseFileNumber Date")
      .populate("PatientId", "Name PatientId");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Edit multiple therapies (replace all)
exports.editTherapies = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, Therapies, UpdatedBy } = req.body;

    const medicalHistory = await MedicalHistory.findOne({
      CaseFileId,
      IsDeleted: false,
    }).session(session);

    if (!medicalHistory) {
      await session.abortTransaction();
      session.endSession();
      return res.json(__requestResponse("404", "Medical History not found"));
    }

    const oldValue = medicalHistory.toObject();
    medicalHistory.Therapies = Therapies;
    medicalHistory.UpdatedBy = UpdatedBy;
    await medicalHistory.save({ session });

    await __CreateAuditLog(
      "medical_history",
      "EDIT_THERAPIES",
      null,
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate(populateConfigs.Therapies)
      .populate("CaseFileId", "CaseFileNumber Date")
      .populate("PatientId", "Name PatientId");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.listTherapiesxxx = async (req, res) => {
  try {
    const { CaseFileId, PatientId, page = 1, limit = 10, search } = req.query;

    const query = { IsDeleted: false };
    if (CaseFileId) query.CaseFileId = CaseFileId;
    if (PatientId) query.PatientId = PatientId;

    let pipeline = [
      { $match: query },
      { $unwind: { path: "$Therapies", preserveNullAndEmptyArrays: false } },
      {
        $project: {
          _id: "$Therapies._id",
          medicalHistoryId: "$_id",
          CaseFileId: 1,
          PatientId: 1,
          Therapy: "$Therapies", // Single therapy object
          createdAt: "$Therapies.createdAt",
          updatedAt: "$Therapies.updatedAt",
        },
      },
      { $skip: (page - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "patient_case_files",
          localField: "CaseFileId",
          foreignField: "_id",
          as: "CaseFile",
        },
      },
      {
        $lookup: {
          from: "patient_masters",
          localField: "PatientId",
          foreignField: "_id",
          as: "Patient",
        },
      },
    ];

    const results = await MedicalHistory.aggregate(pipeline);

    // Populate therapy-specific fields
    const populatedResults = await MedicalHistory.populate(results, [
      { path: "Therapy.TherapyName", select: "lookup_value" },
      { path: "Therapy.PatientResponse", select: "lookup_value" },
    ]);

    const total = await MedicalHistory.aggregate([
      { $match: query },
      { $unwind: "$Therapies" },
      { $count: "total" },
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total: total[0]?.total || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((total[0]?.total || 0) / limit),
        list: __deepClone(populatedResults),
      })
    );
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.listTherapies = async (req, res) => {
  try {
    const { CaseFileId, PatientId, page = 1, limit = 10, search } = req.query;

    const query = { IsDeleted: false };
    if (CaseFileId) query.CaseFileId = CaseFileId;
    if (PatientId) query.PatientId = PatientId;

    let pipeline = [
      { $match: query },
      {
        $unwind: {
          path: "$Therapies",
          preserveNullAndEmptyArrays: false,
        },
      },
      // Lookup Therapy Name - only _id and lookup_value
      {
        $lookup: {
          from: "admin_lookups",
          localField: "Therapies.TherapyName",
          foreignField: "_id",
          as: "therapyName",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      // Lookup Patient Response - only _id and lookup_value
      {
        $lookup: {
          from: "admin_lookups",
          localField: "Therapies.PatientResponse",
          foreignField: "_id",
          as: "patientResponse",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      // Lookup Case File - only essential fields
      {
        $lookup: {
          from: "patient_case_files",
          localField: "CaseFileId",
          foreignField: "_id",
          as: "CaseFile",
          pipeline: [
            {
              $project: {
                _id: 1,
                TreatmentType: 1,
                Date: 1,
                CaseFileNumber: 1,
              },
            },
          ],
        },
      },
      // Lookup Patient - only essential fields
      {
        $lookup: {
          from: "patient_masters",
          localField: "PatientId",
          foreignField: "_id",
          as: "Patient",
          pipeline: [
            { $project: { _id: 1, Name: 1, PatientId: 1, PhoneNumber: 1 } },
          ],
        },
      },
      // Final projection with populated data
      {
        $project: {
          _id: "$Therapies._id",
          medicalHistoryId: "$_id",
          CaseFileId: "$CaseFileId",
          PatientId: "$PatientId",
          Therapy: {
            _id: "$Therapies._id",
            TherapyName: { $arrayElemAt: ["$therapyName", 0] },
            PatientResponse: { $arrayElemAt: ["$patientResponse", 0] },
            createdAt: "$Therapies.createdAt",
            updatedAt: "$Therapies.updatedAt",
          },
          createdAt: "$Therapies.createdAt",
          updatedAt: "$Therapies.updatedAt",
          CaseFile: 1,
          Patient: 1,
        },
      },

      // Sort by latest first
      {
        $sort: {
          "Therapy.createdAt": -1,
          "Therapy.updatedAt": -1,
        },
      },

      { $skip: (page - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ];

    const results = await MedicalHistory.aggregate(pipeline);

    const total = await MedicalHistory.aggregate([
      { $match: query },
      { $unwind: "$Therapies" },
      { $count: "total" },
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total: total[0]?.total || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((total[0]?.total || 0) / limit),
        list: __deepClone(results),
      })
    );
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ===================
// MEDICINES PRESCRIBED (Keep existing functions)
// ===================

exports.addMedicinesPrescribed = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, MedicinesPrescribed, CreatedBy } = req.body;

    const medicalHistory = await getOrCreateMedicalHistory(
      CaseFileId,
      req.caseFile.PatientId,
      CreatedBy,
      session
    );

    const oldValue = medicalHistory.toObject();
    medicalHistory.MedicinesPrescribed = MedicinesPrescribed;
    medicalHistory.UpdatedBy = CreatedBy;
    await medicalHistory.save({ session });

    await __CreateAuditLog(
      "medical_history",
      "ADD_MEDICINES_PRESCRIBED",
      null,
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate(populateConfigs.MedicinesPrescribed)
      .populate("CaseFileId", "CaseFileNumber Date")
      .populate("PatientId", "Name PatientId");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.editMedicinesPrescribed = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, MedicinesPrescribed, UpdatedBy } = req.body;

    const medicalHistory = await MedicalHistory.findOne({
      CaseFileId,
      IsDeleted: false,
    }).session(session);

    if (!medicalHistory) {
      await session.abortTransaction();
      session.endSession();
      return res.json(__requestResponse("404", "Medical History not found"));
    }

    const oldValue = medicalHistory.toObject();
    medicalHistory.MedicinesPrescribed = MedicinesPrescribed;
    medicalHistory.UpdatedBy = UpdatedBy;
    await medicalHistory.save({ session });

    await __CreateAuditLog(
      "medical_history",
      "EDIT_MEDICINES_PRESCRIBED",
      null,
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate(populateConfigs.MedicinesPrescribed)
      .populate("CaseFileId", "CaseFileNumber Date")
      .populate("PatientId", "Name PatientId");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.addMedicine = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, Medicine, CreatedBy } = req.body;

    const medicalHistory = await getOrCreateMedicalHistory(
      CaseFileId,
      req.caseFile.PatientId,
      CreatedBy,
      session
    );

    const oldValue = medicalHistory.toObject();

    if (!medicalHistory.MedicinesPrescribed) {
      medicalHistory.MedicinesPrescribed = {
        Medicines: [],
        RecoveryCycle: { Value: 0, Unit: null },
        PrescriptionUrls: [],
      };
    }

    medicalHistory.MedicinesPrescribed.Medicines.push(Medicine);
    medicalHistory.UpdatedBy = CreatedBy;
    await medicalHistory.save({ session });

    await __CreateAuditLog(
      "medical_history",
      "ADD_MEDICINE",
      null,
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate(populateConfigs.MedicinesPrescribed)
      .populate("CaseFileId", "CaseFileNumber Date")
      .populate("PatientId", "Name PatientId");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.editMedicine = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { _id, CaseFileId, Medicine, UpdatedBy } = req.body;

    const medicalHistory = await MedicalHistory.findOne({
      CaseFileId,
      IsDeleted: false,
    }).session(session);

    if (!medicalHistory || !medicalHistory.MedicinesPrescribed) {
      await session.abortTransaction();
      session.endSession();
      return res.json(
        __requestResponse(
          "404",
          "Medical History or Medicines Prescribed not found"
        )
      );
    }

    const oldValue = medicalHistory.toObject();
    const medicineIndex =
      medicalHistory.MedicinesPrescribed.Medicines.findIndex(
        (med) => med._id.toString() === _id.toString()
      );

    if (medicineIndex === -1) {
      await session.abortTransaction();
      session.endSession();
      return res.json(__requestResponse("404", "Medicine not found"));
    }

    medicalHistory.MedicinesPrescribed.Medicines[medicineIndex] = {
      ...medicalHistory.MedicinesPrescribed.Medicines[medicineIndex].toObject(),
      ...Medicine,
      _id: _id,
    };
    medicalHistory.UpdatedBy = UpdatedBy;
    await medicalHistory.save({ session });

    await __CreateAuditLog(
      "medical_history",
      "EDIT_MEDICINE",
      null,
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate(populateConfigs.MedicinesPrescribed)
      .populate("CaseFileId", "CaseFileNumber Date")
      .populate("PatientId", "Name PatientId");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.listMedicinesPrescribedxx = async (req, res) => {
  try {
    const { CaseFileId, PatientId, page = 1, limit = 10, search } = req.query;

    const query = { IsDeleted: false };
    if (CaseFileId) query.CaseFileId = CaseFileId;
    if (PatientId) query.PatientId = PatientId;

    let pipeline = [
      { $match: query },
      { $match: { MedicinesPrescribed: { $exists: true, $ne: null } } },
    ];

    if (req.query.expandMedicines === "true") {
      // When expanding medicines, unwind individual medicines
      pipeline.push(
        {
          $unwind: {
            path: "$MedicinesPrescribed.Medicines",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: "$MedicinesPrescribed.Medicines._id",
            medicalHistoryId: "$_id",
            CaseFileId: 1,
            PatientId: 1,
            Medicine: "$MedicinesPrescribed.Medicines", // Individual medicine
            MedicinesPrescribed: {
              RecoveryCycle: "$MedicinesPrescribed.RecoveryCycle",
              PrescriptionUrls: "$MedicinesPrescribed.PrescriptionUrls",
              _id: "$MedicinesPrescribed._id",
            },
            createdAt: "$MedicinesPrescribed.Medicines.createdAt",
            updatedAt: "$MedicinesPrescribed.Medicines.updatedAt",
          },
        }
      );
    } else {
      // When not expanding, show complete MedicinesPrescribed objects
      pipeline.push({
        $project: {
          _id: "$MedicinesPrescribed._id",
          medicalHistoryId: "$_id",
          CaseFileId: 1,
          PatientId: 1,
          MedicinesPrescribed: "$MedicinesPrescribed",
          createdAt: "$MedicinesPrescribed.createdAt",
          updatedAt: "$MedicinesPrescribed.updatedAt",
        },
      });
    }

    pipeline.push(
      { $skip: (page - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "patient_case_files",
          localField: "CaseFileId",
          foreignField: "_id",
          as: "CaseFile",
        },
      },
      {
        $lookup: {
          from: "patient_masters",
          localField: "PatientId",
          foreignField: "_id",
          as: "Patient",
        },
      }
    );

    const results = await MedicalHistory.aggregate(pipeline);

    // Different population based on expand mode
    let populateFields;
    if (req.query.expandMedicines === "true") {
      populateFields = [
        { path: "Medicine.MedicineName", select: "lookup_value" },
        { path: "Medicine.Dosage", select: "lookup_value" },
        {
          path: "MedicinesPrescribed.RecoveryCycle.Unit",
          select: "lookup_value",
        },
      ];
    } else {
      populateFields = [
        {
          path: "MedicinesPrescribed.Medicines.MedicineName",
          select: "lookup_value",
        },
        {
          path: "MedicinesPrescribed.Medicines.Dosage",
          select: "lookup_value",
        },
        {
          path: "MedicinesPrescribed.RecoveryCycle.Unit",
          select: "lookup_value",
        },
      ];
    }

    const populatedResults = await MedicalHistory.populate(
      results,
      populateFields
    );

    // Count total based on expand mode
    let total;
    if (req.query.expandMedicines === "true") {
      // Count individual medicines
      const countPipeline = await MedicalHistory.aggregate([
        { $match: query },
        { $match: { MedicinesPrescribed: { $exists: true, $ne: null } } },
        { $unwind: "$MedicinesPrescribed.Medicines" },
        { $count: "total" },
      ]);
      total = countPipeline[0]?.total || 0;
    } else {
      // Count MedicinesPrescribed objects
      total = await MedicalHistory.countDocuments({
        ...query,
        MedicinesPrescribed: { $exists: true, $ne: null },
      });
    }

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
        expandMedicines: req.query.expandMedicines === "true",
        list: __deepClone(populatedResults),
      })
    );
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.listMedicinesPrescribed = async (req, res) => {
  try {
    const { CaseFileId, PatientId, page = 1, limit = 10, search } = req.query;

    const query = { IsDeleted: false };
    if (CaseFileId) query.CaseFileId = CaseFileId;
    if (PatientId) query.PatientId = PatientId;

    let pipeline = [
      { $match: query },
      { $match: { MedicinesPrescribed: { $exists: true, $ne: null } } },
    ];

    if (req.query.expandMedicines === "true") {
      // When expanding medicines, unwind individual medicines
      pipeline.push(
        {
          $unwind: {
            path: "$MedicinesPrescribed.Medicines",
            preserveNullAndEmptyArrays: true,
          },
        },
        // Lookup Medicine Name - only _id and lookup_value
        {
          $lookup: {
            from: "admin_lookups",
            localField: "MedicinesPrescribed.Medicines.MedicineName",
            foreignField: "_id",
            as: "medicineName",
            pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
          },
        },
        // Lookup Dosage - only _id and lookup_value
        {
          $lookup: {
            from: "admin_lookups",
            localField: "MedicinesPrescribed.Medicines.Dosage",
            foreignField: "_id",
            as: "dosage",
            pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
          },
        },
        // Lookup Recovery Cycle Unit - only _id and lookup_value
        {
          $lookup: {
            from: "admin_lookups",
            localField: "MedicinesPrescribed.RecoveryCycle.Unit",
            foreignField: "_id",
            as: "recoveryCycleUnit",
            pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
          },
        },
        // Lookup Case File - only essential fields
        {
          $lookup: {
            from: "patient_case_files",
            localField: "CaseFileId",
            foreignField: "_id",
            as: "CaseFile",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  TreatmentType: 1,
                  Date: 1,
                  CaseFileNumber: 1,
                },
              },
            ],
          },
        },
        // Lookup Patient - only essential fields
        {
          $lookup: {
            from: "patient_masters",
            localField: "PatientId",
            foreignField: "_id",
            as: "Patient",
            pipeline: [
              { $project: { _id: 1, Name: 1, PatientId: 1, PhoneNumber: 1 } },
            ],
          },
        },
        {
          $project: {
            _id: "$MedicinesPrescribed.Medicines._id",
            medicalHistoryId: "$_id",
            CaseFileId: "$CaseFileId",
            PatientId: "$PatientId",
            Medicine: {
              _id: "$MedicinesPrescribed.Medicines._id",
              MedicineName: { $arrayElemAt: ["$medicineName", 0] },
              Dosage: { $arrayElemAt: ["$dosage", 0] },
              DurationInDays: "$MedicinesPrescribed.Medicines.DurationInDays",
              createdAt: "$MedicinesPrescribed.Medicines.createdAt",
              updatedAt: "$MedicinesPrescribed.Medicines.updatedAt",
            },
            MedicinesPrescribed: {
              RecoveryCycle: {
                Value: "$MedicinesPrescribed.RecoveryCycle.Value",
                Unit: { $arrayElemAt: ["$recoveryCycleUnit", 0] },
                _id: "$MedicinesPrescribed.RecoveryCycle._id",
              },
              PrescriptionUrls: "$MedicinesPrescribed.PrescriptionUrls",
              _id: "$MedicinesPrescribed._id",
            },
            createdAt: "$MedicinesPrescribed.Medicines.createdAt",
            updatedAt: "$MedicinesPrescribed.Medicines.updatedAt",
            CaseFile: 1,
            Patient: 1,
          },
        }
      );
    } else {
      // When not expanding, show complete MedicinesPrescribed objects
      pipeline.push(
        // Lookup Recovery Cycle Unit - only _id and lookup_value
        {
          $lookup: {
            from: "admin_lookups",
            localField: "MedicinesPrescribed.RecoveryCycle.Unit",
            foreignField: "_id",
            as: "recoveryCycleUnit",
            pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
          },
        },
        // Lookup Medicine Names in the array - only _id and lookup_value
        {
          $lookup: {
            from: "admin_lookups",
            localField: "MedicinesPrescribed.Medicines.MedicineName",
            foreignField: "_id",
            as: "medicineNames",
            pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
          },
        },
        // Lookup Dosages in the array - only _id and lookup_value
        {
          $lookup: {
            from: "admin_lookups",
            localField: "MedicinesPrescribed.Medicines.Dosage",
            foreignField: "_id",
            as: "dosages",
            pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
          },
        },
        // Lookup Case File - only essential fields
        {
          $lookup: {
            from: "patient_case_files",
            localField: "CaseFileId",
            foreignField: "_id",
            as: "CaseFile",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  TreatmentType: 1,
                  Date: 1,
                  CaseFileNumber: 1,
                },
              },
            ],
          },
        },
        // Lookup Patient - only essential fields
        {
          $lookup: {
            from: "patient_masters",
            localField: "PatientId",
            foreignField: "_id",
            as: "Patient",
            pipeline: [
              { $project: { _id: 1, Name: 1, PatientId: 1, PhoneNumber: 1 } },
            ],
          },
        },
        {
          $project: {
            _id: "$MedicinesPrescribed._id",
            medicalHistoryId: "$_id",
            CaseFileId: "$CaseFileId",
            PatientId: "$PatientId",
            MedicinesPrescribed: {
              _id: "$MedicinesPrescribed._id",
              Medicines: {
                $map: {
                  input: "$MedicinesPrescribed.Medicines",
                  as: "medicine",
                  in: {
                    _id: "$$medicine._id",
                    MedicineName: {
                      $let: {
                        vars: {
                          foundMedicine: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$medicineNames",
                                  cond: {
                                    $eq: [
                                      "$$this._id",
                                      "$$medicine.MedicineName",
                                    ],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: "$$foundMedicine",
                      },
                    },
                    Dosage: {
                      $let: {
                        vars: {
                          foundDosage: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$dosages",
                                  cond: {
                                    $eq: ["$$this._id", "$$medicine.Dosage"],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: "$$foundDosage",
                      },
                    },
                    DurationInDays: "$$medicine.DurationInDays",
                    createdAt: "$$medicine.createdAt",
                    updatedAt: "$$medicine.updatedAt",
                  },
                },
              },
              RecoveryCycle: {
                Value: "$MedicinesPrescribed.RecoveryCycle.Value",
                Unit: { $arrayElemAt: ["$recoveryCycleUnit", 0] },
                _id: "$MedicinesPrescribed.RecoveryCycle._id",
              },
              PrescriptionUrls: "$MedicinesPrescribed.PrescriptionUrls",
              createdAt: "$MedicinesPrescribed.createdAt",
              updatedAt: "$MedicinesPrescribed.updatedAt",
            },
            createdAt: "$MedicinesPrescribed.createdAt",
            updatedAt: "$MedicinesPrescribed.updatedAt",
            CaseFile: 1,
            Patient: 1,
          },
        }
      );
    }

    // Add sorting
    pipeline.push({
      $sort: {
        createdAt: -1,
        updatedAt: -1,
      },
    });

    pipeline.push(
      { $skip: (page - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    );

    const results = await MedicalHistory.aggregate(pipeline);

    // Count total based on expand mode
    let total;
    if (req.query.expandMedicines === "true") {
      const countPipeline = await MedicalHistory.aggregate([
        { $match: query },
        { $match: { MedicinesPrescribed: { $exists: true, $ne: null } } },
        { $unwind: "$MedicinesPrescribed.Medicines" },
        { $count: "total" },
      ]);
      total = countPipeline[0]?.total || 0;
    } else {
      total = await MedicalHistory.countDocuments({
        ...query,
        MedicinesPrescribed: { $exists: true, $ne: null },
      });
    }

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
        expandMedicines: req.query.expandMedicines === "true",
        list: __deepClone(results),
      })
    );
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.deleteMedicine = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, medicineId } = req.params;

    const medicalHistory = await MedicalHistory.findOne({
      CaseFileId,
      IsDeleted: false,
    }).session(session);

    if (!medicalHistory || !medicalHistory.MedicinesPrescribed) {
      await session.abortTransaction();
      session.endSession();
      return res.json(
        __requestResponse(
          "404",
          "Medical History or Medicines Prescribed not found"
        )
      );
    }

    const oldValue = medicalHistory.toObject();
    medicalHistory.MedicinesPrescribed.Medicines.pull({ _id: medicineId });
    await medicalHistory.save({ session });

    await __CreateAuditLog(
      "medical_history",
      "DELETE_MEDICINE",
      null,
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    return res.json(__requestResponse("200", "Medicine deleted successfully"));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ===================
// SURGERIES/PROCEDURES
// ===================

// Add single surgery/procedure
exports.addSurgeryProcedure = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, SurgeryProcedure, CreatedBy } = req.body;

    const medicalHistory = await getOrCreateMedicalHistory(
      CaseFileId,
      req.caseFile.PatientId,
      CreatedBy,
      session
    );

    const oldValue = medicalHistory.toObject();
    medicalHistory.SurgeriesProcedures.push(SurgeryProcedure);
    medicalHistory.UpdatedBy = CreatedBy;
    await medicalHistory.save({ session });

    await __CreateAuditLog(
      "medical_history",
      "ADD_SURGERY_PROCEDURE",
      null,
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate(populateConfigs.SurgeriesProcedures)
      .populate("CaseFileId", "CaseFileNumber Date")
      .populate("PatientId", "Name PatientId");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Add multiple surgeries/procedures
exports.addSurgeriesProcedures = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, SurgeriesProcedures, CreatedBy } = req.body;

    const medicalHistory = await getOrCreateMedicalHistory(
      CaseFileId,
      req.caseFile.PatientId,
      CreatedBy,
      session
    );

    const oldValue = medicalHistory.toObject();
    SurgeriesProcedures.forEach((surgeryProcedure) => {
      medicalHistory.SurgeriesProcedures.push(surgeryProcedure);
    });

    medicalHistory.UpdatedBy = CreatedBy;
    await medicalHistory.save({ session });

    await __CreateAuditLog(
      "medical_history",
      "ADD_SURGERIES_PROCEDURES",
      null,
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate(populateConfigs.SurgeriesProcedures)
      .populate("CaseFileId", "CaseFileNumber Date")
      .populate("PatientId", "Name PatientId");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Edit single surgery/procedure
exports.editSurgeryProcedure = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { _id, CaseFileId, SurgeryProcedure, UpdatedBy } = req.body;

    const medicalHistory = await MedicalHistory.findOne({
      CaseFileId,
      IsDeleted: false,
    }).session(session);

    if (!medicalHistory) {
      await session.abortTransaction();
      session.endSession();
      return res.json(__requestResponse("404", "Medical History not found"));
    }

    const oldValue = medicalHistory.toObject();
    const surgeryIndex = medicalHistory.SurgeriesProcedures.findIndex(
      (surgery) => surgery._id.toString() === _id.toString()
    );

    if (surgeryIndex === -1) {
      await session.abortTransaction();
      session.endSession();
      return res.json(__requestResponse("404", "Surgery/Procedure not found"));
    }

    medicalHistory.SurgeriesProcedures[surgeryIndex] = {
      ...medicalHistory.SurgeriesProcedures[surgeryIndex].toObject(),
      ...SurgeryProcedure,
      _id: _id,
    };
    medicalHistory.UpdatedBy = UpdatedBy;
    await medicalHistory.save({ session });

    await __CreateAuditLog(
      "medical_history",
      "EDIT_SURGERY_PROCEDURE",
      null,
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate(populateConfigs.SurgeriesProcedures)
      .populate("CaseFileId", "CaseFileNumber Date")
      .populate("PatientId", "Name PatientId");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Edit multiple surgeries/procedures (replace all)
exports.editSurgeriesProcedures = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, SurgeriesProcedures, UpdatedBy } = req.body;

    const medicalHistory = await MedicalHistory.findOne({
      CaseFileId,
      IsDeleted: false,
    }).session(session);

    if (!medicalHistory) {
      await session.abortTransaction();
      session.endSession();
      return res.json(__requestResponse("404", "Medical History not found"));
    }

    const oldValue = medicalHistory.toObject();
    medicalHistory.SurgeriesProcedures = SurgeriesProcedures;
    medicalHistory.UpdatedBy = UpdatedBy;
    await medicalHistory.save({ session });

    await __CreateAuditLog(
      "medical_history",
      "EDIT_SURGERIES_PROCEDURES",
      null,
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate(populateConfigs.SurgeriesProcedures)
      .populate("CaseFileId", "CaseFileNumber Date")
      .populate("PatientId", "Name PatientId");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.listSurgeriesProceduresxx = async (req, res) => {
  try {
    const { CaseFileId, PatientId, page = 1, limit = 10, search } = req.query;

    const query = { IsDeleted: false };
    if (CaseFileId) query.CaseFileId = CaseFileId;
    if (PatientId) query.PatientId = PatientId;

    let pipeline = [
      { $match: query },
      {
        $unwind: {
          path: "$SurgeriesProcedures",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: "$SurgeriesProcedures._id",
          medicalHistoryId: "$_id",
          CaseFileId: 1,
          PatientId: 1,
          SurgeryProcedure: "$SurgeriesProcedures",
          createdAt: "$SurgeriesProcedures.createdAt",
          updatedAt: "$SurgeriesProcedures.updatedAt",
        },
      },
      { $skip: (page - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "patient_case_files",
          localField: "CaseFileId",
          foreignField: "_id",
          as: "CaseFile",
        },
      },
      {
        $lookup: {
          from: "patient_masters",
          localField: "PatientId",
          foreignField: "_id",
          as: "Patient",
        },
      },
    ];

    const results = await MedicalHistory.aggregate(pipeline);
    const populatedResults = await MedicalHistory.populate(
      results,
      populateConfigs.SurgeriesProcedures
    );

    const total = await MedicalHistory.aggregate([
      { $match: query },
      { $unwind: "$SurgeriesProcedures" },
      { $count: "total" },
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total: total[0]?.total || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((total[0]?.total || 0) / limit),
        list: __deepClone(populatedResults),
      })
    );
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.listSurgeriesProcedures = async (req, res) => {
  try {
    const { CaseFileId, PatientId, page = 1, limit = 10, search } = req.query;

    const query = { IsDeleted: false };
    if (CaseFileId) query.CaseFileId = CaseFileId;
    if (PatientId) query.PatientId = PatientId;

    let pipeline = [
      { $match: query },
      {
        $unwind: {
          path: "$SurgeriesProcedures",
          preserveNullAndEmptyArrays: false,
        },
      },
      // Lookup Medical Speciality - only _id and lookup_value
      {
        $lookup: {
          from: "admin_lookups",
          localField: "SurgeriesProcedures.MedicalSpeciality",
          foreignField: "_id",
          as: "medicalSpeciality",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      // Lookup Surgery Procedure Name - only _id and lookup_value
      {
        $lookup: {
          from: "admin_lookups",
          localField: "SurgeriesProcedures.SurgeryProcedureName",
          foreignField: "_id",
          as: "surgeryProcedureName",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      // Lookup Recovery Cycle Unit - only _id and lookup_value
      {
        $lookup: {
          from: "admin_lookups",
          localField: "SurgeriesProcedures.RecoveryCycle.Unit",
          foreignField: "_id",
          as: "recoveryCycleUnit",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      // Lookup Post Surgery Complications - only _id and lookup_value
      {
        $lookup: {
          from: "admin_lookups",
          localField: "SurgeriesProcedures.PostSurgeryComplications",
          foreignField: "_id",
          as: "postSurgeryComplications",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      // Lookup Case File - only essential fields
      {
        $lookup: {
          from: "patient_case_files",
          localField: "CaseFileId",
          foreignField: "_id",
          as: "CaseFile",
          pipeline: [
            {
              $project: {
                _id: 1,
                TreatmentType: 1,
                Date: 1,
                CaseFileNumber: 1,
              },
            },
          ],
        },
      },
      // Lookup Patient - only essential fields
      {
        $lookup: {
          from: "patient_masters",
          localField: "PatientId",
          foreignField: "_id",
          as: "Patient",
          pipeline: [
            { $project: { _id: 1, Name: 1, PatientId: 1, PhoneNumber: 1 } },
          ],
        },
      },
      // Final projection with populated data
      {
        $project: {
          _id: "$SurgeriesProcedures._id",
          medicalHistoryId: "$_id",
          CaseFileId: "$CaseFileId",
          PatientId: "$PatientId",
          SurgeryProcedure: {
            _id: "$SurgeriesProcedures._id",
            Date: "$SurgeriesProcedures.Date",
            HospitalClinicName: "$SurgeriesProcedures.HospitalClinicName",
            SurgeonName: "$SurgeriesProcedures.SurgeonName",
            SurgeonNumber: "$SurgeriesProcedures.SurgeonNumber",
            MedicalSpeciality: { $arrayElemAt: ["$medicalSpeciality", 0] },
            SurgeryProcedureName: {
              $arrayElemAt: ["$surgeryProcedureName", 0],
            },
            AnaesthesiaType: "$SurgeriesProcedures.AnaesthesiaType",
            BloodTransfusionNeeded:
              "$SurgeriesProcedures.BloodTransfusionNeeded",
            RecoveryCycle: {
              Value: "$SurgeriesProcedures.RecoveryCycle.Value",
              Unit: { $arrayElemAt: ["$recoveryCycleUnit", 0] },
              _id: "$SurgeriesProcedures.RecoveryCycle._id",
            },
            PostSurgeryComplications: "$postSurgeryComplications",
            DischargeSummaryUrlNote:
              "$SurgeriesProcedures.DischargeSummaryUrlNote",
            createdAt: "$SurgeriesProcedures.createdAt",
            updatedAt: "$SurgeriesProcedures.updatedAt",
          },
          createdAt: "$SurgeriesProcedures.createdAt",
          updatedAt: "$SurgeriesProcedures.updatedAt",
          CaseFile: 1,
          Patient: 1,
        },
      },

      // Sort by latest first
      {
        $sort: {
          "SurgeryProcedure.createdAt": -1,
          "SurgeryProcedure.updatedAt": -1,
        },
      },

      { $skip: (page - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ];

    const results = await MedicalHistory.aggregate(pipeline);

    const total = await MedicalHistory.aggregate([
      { $match: query },
      { $unwind: "$SurgeriesProcedures" },
      { $count: "total" },
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total: total[0]?.total || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((total[0]?.total || 0) / limit),
        list: __deepClone(results),
      })
    );
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};


// Keep all existing main medical history functions unchanged
exports.saveMedicalHistory = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { _id, CaseFileId } = req.body;
    let oldValue = null;

    const caseFile = await PatientCaseFile.findById(CaseFileId).session(
      session
    );
    if (!caseFile) {
      await session.abortTransaction();
      session.endSession();
      return res.json(__requestResponse("404", "Case File not found"));
    }

    let medicalHistory;
    if (_id) {
      oldValue = await MedicalHistory.findById(_id).session(session).lean();
      if (!oldValue) {
        await session.abortTransaction();
        session.endSession();
        return res.json(__requestResponse("404", "Medical History not found"));
      }

      medicalHistory = await MedicalHistory.findByIdAndUpdate(
        _id,
        { ...req.body, UpdatedBy: req.body.UpdatedBy || req.body.CreatedBy },
        { new: true, session }
      );

      await __CreateAuditLog(
        "medical_history",
        "UPDATE",
        null,
        oldValue,
        medicalHistory.toObject(),
        medicalHistory._id
      );
    } else {
      medicalHistory = await MedicalHistory.create([req.body], { session });
      medicalHistory = medicalHistory[0];

      await __CreateAuditLog(
        "medical_history",
        "CREATE",
        null,
        null,
        medicalHistory.toObject(),
        medicalHistory._id
      );
    }

    await session.commitTransaction();
    session.endSession();

    const populatedHistory = await MedicalHistory.findById(medicalHistory._id)
      .populate("CaseFileId")
      .populate("PatientId")
      .populate(populateConfigs.ChiefComplaints)
      .populate(populateConfigs.ClinicalDiagnoses)
      .populate(populateConfigs.MedicinesPrescribed)
      .populate(populateConfigs.Therapies)
      .populate("CreatedBy", "Name")
      .populate("UpdatedBy", "Name");

    return res.json(__requestResponse("200", __SUCCESS, populatedHistory));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.medicalHistoryListxx = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      CaseFileId,
      PatientId,
      Status,
      FromDate,
      ToDate,
      search,
    } = req.query;

    const query = { IsDeleted: false };

    if (CaseFileId) query.CaseFileId = CaseFileId;
    if (PatientId) query.PatientId = PatientId;
    if (Status) query.Status = Status;

    if (FromDate || ToDate) {
      query.createdAt = {};
      if (FromDate) query.createdAt.$gte = new Date(FromDate);
      if (ToDate) query.createdAt.$lte = new Date(ToDate);
    }

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ Notes: regex }, { Status: regex }];
    }

    const total = await MedicalHistory.countDocuments(query);

    const list = await MedicalHistory.find(query)
      .populate("CaseFileId", "CaseFileNumber Date TreatmentType")
      .populate("PatientId", "Name PatientId PhoneNumber")
      .populate("CreatedBy", "Name")
      .populate("UpdatedBy", "Name")
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
        filters: {
          CaseFileId,
          PatientId,
          Status,
          FromDate,
          ToDate,
          search,
        },
        list: __deepClone(list),
      })
    );
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.medicalHistoryList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      CaseFileId,
      PatientId,
      Status,
      FromDate,
      ToDate,
      search,
    } = req.query;

    // Build base query
    const query = { IsDeleted: false };
    if (CaseFileId) query.CaseFileId = new mongoose.Types.ObjectId(CaseFileId);
    if (PatientId) query.PatientId = new mongoose.Types.ObjectId(PatientId);
    if (Status) query.Status = Status;

    // Date range filter
    if (FromDate || ToDate) {
      query.createdAt = {};
      if (FromDate) query.createdAt.$gte = new Date(FromDate);
      if (ToDate) query.createdAt.$lte = new Date(ToDate);
    }

    // Text search
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ Notes: regex }, { Status: regex }];
    }

    // Get total count first
    const total = await MedicalHistory.countDocuments(query);

    // Build aggregation pipeline
    let pipeline = [
      { $match: query },

      // Join case file data
      {
        $lookup: {
          from: "patient_case_files",
          localField: "CaseFileId",
          foreignField: "_id",
          as: "CaseFileData",
          pipeline: [
            {
              $project: {
                _id: 1,
                CaseFileNumber: 1,
                Date: 1,
                TreatmentType: 1,
              },
            },
          ],
        },
      },

      // Join patient data
      {
        $lookup: {
          from: "patient_masters",
          localField: "PatientId",
          foreignField: "_id",
          as: "PatientData",
          pipeline: [
            { $project: { _id: 1, Name: 1, PatientId: 1, PhoneNumber: 1 } },
          ],
        },
      },

      // Join created by user from asset_masters
      {
        $lookup: {
          from: "asset_masters",
          localField: "CreatedBy",
          foreignField: "_id",
          as: "CreatedByData",
          pipeline: [{ $project: { _id: 1, Name: 1 } }],
        },
      },

      // Join updated by user from asset_masters
      {
        $lookup: {
          from: "asset_masters",
          localField: "UpdatedBy",
          foreignField: "_id",
          as: "UpdatedByData",
          pipeline: [{ $project: { _id: 1, Name: 1 } }],
        },
      },

      // Join lookup data for population
      {
        $lookup: {
          from: "admin_lookups",
          localField: "ChiefComplaints.Symptoms",
          foreignField: "_id",
          as: "symptomLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "ChiefComplaints.Duration.Unit",
          foreignField: "_id",
          as: "durationUnitLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "ChiefComplaints.AggravatingFactors",
          foreignField: "_id",
          as: "aggravatingFactorLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "ClinicalDiagnoses.InvestigationCategory",
          foreignField: "_id",
          as: "investigationCategoryLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "ClinicalDiagnoses.Investigation",
          foreignField: "_id",
          as: "investigationLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "ClinicalDiagnoses.Abnormalities",
          foreignField: "_id",
          as: "abnormalityLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "MedicinesPrescribed.Medicines.MedicineName",
          foreignField: "_id",
          as: "medicineNameLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "MedicinesPrescribed.Medicines.Dosage",
          foreignField: "_id",
          as: "medicineDosageLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "MedicinesPrescribed.RecoveryCycle.Unit",
          foreignField: "_id",
          as: "medicineRecoveryUnitLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "Therapies.TherapyName",
          foreignField: "_id",
          as: "therapyNameLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "SurgeriesProcedures.MedicalSpeciality",
          foreignField: "_id",
          as: "surgerySpecialityLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "SurgeriesProcedures.SurgeryProcedureName",
          foreignField: "_id",
          as: "surgeryProcedureNameLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "SurgeriesProcedures.RecoveryCycle.Unit",
          foreignField: "_id",
          as: "surgeryRecoveryUnitLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "SurgeriesProcedures.PostSurgeryComplications",
          foreignField: "_id",
          as: "surgeryComplicationLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },

      // Project with populated data
      {
        $addFields: {
          CaseFileId: { $arrayElemAt: ["$CaseFileData", 0] },
          PatientId: { $arrayElemAt: ["$PatientData", 0] },
          CreatedBy: { $arrayElemAt: ["$CreatedByData", 0] },
          UpdatedBy: { $arrayElemAt: ["$UpdatedByData", 0] },

          // Populate Chief Complaints
          ChiefComplaints: {
            $map: {
              input: "$ChiefComplaints",
              as: "complaint",
              in: {
                _id: "$$complaint._id",
                Symptoms: {
                  $map: {
                    input: "$$complaint.Symptoms",
                    as: "symptomId",
                    in: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$symptomLookups",
                            cond: { $eq: ["$$this._id", "$$symptomId"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                },
                Duration: {
                  Value: "$$complaint.Duration.Value",
                  Unit: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$durationUnitLookups",
                          cond: {
                            $eq: ["$$this._id", "$$complaint.Duration.Unit"],
                          },
                        },
                      },
                      0,
                    ],
                  },
                  _id: "$$complaint.Duration._id",
                },
                SeverityGrade: "$$complaint.SeverityGrade",
                AggravatingFactors: {
                  $map: {
                    input: "$$complaint.AggravatingFactors",
                    as: "factorId",
                    in: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$aggravatingFactorLookups",
                            cond: { $eq: ["$$this._id", "$$factorId"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                },
                createdAt: "$$complaint.createdAt",
                updatedAt: "$$complaint.updatedAt",
              },
            },
          },

          // Populate Clinical Diagnoses
          ClinicalDiagnoses: {
            $map: {
              input: "$ClinicalDiagnoses",
              as: "diagnosis",
              in: {
                _id: "$$diagnosis._id",
                Date: "$$diagnosis.Date",
                InvestigationCategory: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$investigationCategoryLookups",
                        cond: {
                          $eq: [
                            "$$this._id",
                            "$$diagnosis.InvestigationCategory",
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
                Investigation: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$investigationLookups",
                        cond: {
                          $eq: ["$$this._id", "$$diagnosis.Investigation"],
                        },
                      },
                    },
                    0,
                  ],
                },
                Abnormalities: {
                  $map: {
                    input: "$$diagnosis.Abnormalities",
                    as: "abnormalityId",
                    in: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$abnormalityLookups",
                            cond: { $eq: ["$$this._id", "$$abnormalityId"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                },
                ReportUrl: "$$diagnosis.ReportUrl",
                InterpretationUrl: "$$diagnosis.InterpretationUrl",
                createdAt: "$$diagnosis.createdAt",
                updatedAt: "$$diagnosis.updatedAt",
              },
            },
          },

          // Populate Medicines Prescribed
          MedicinesPrescribed: {
            $cond: {
              if: { $ne: ["$MedicinesPrescribed", null] },
              then: {
                _id: "$MedicinesPrescribed._id",
                Medicines: {
                  $map: {
                    input: "$MedicinesPrescribed.Medicines",
                    as: "medicine",
                    in: {
                      _id: "$$medicine._id",
                      MedicineName: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$medicineNameLookups",
                              cond: {
                                $eq: ["$$this._id", "$$medicine.MedicineName"],
                              },
                            },
                          },
                          0,
                        ],
                      },
                      Dosage: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$medicineDosageLookups",
                              cond: {
                                $eq: ["$$this._id", "$$medicine.Dosage"],
                              },
                            },
                          },
                          0,
                        ],
                      },
                      DurationInDays: "$$medicine.DurationInDays",
                      createdAt: "$$medicine.createdAt",
                      updatedAt: "$$medicine.updatedAt",
                    },
                  },
                },
                RecoveryCycle: {
                  Value: "$MedicinesPrescribed.RecoveryCycle.Value",
                  Unit: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$medicineRecoveryUnitLookups",
                          cond: {
                            $eq: [
                              "$$this._id",
                              "$MedicinesPrescribed.RecoveryCycle.Unit",
                            ],
                          },
                        },
                      },
                      0,
                    ],
                  },
                  _id: "$MedicinesPrescribed.RecoveryCycle._id",
                },
                PrescriptionUrls: "$MedicinesPrescribed.PrescriptionUrls",
                createdAt: "$MedicinesPrescribed.createdAt",
                updatedAt: "$MedicinesPrescribed.updatedAt",
              },
              else: null,
            },
          },

          // Populate Therapies
          Therapies: {
            $map: {
              input: "$Therapies",
              as: "therapy",
              in: {
                _id: "$$therapy._id",
                TherapyName: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$therapyNameLookups",
                        cond: { $eq: ["$$this._id", "$$therapy.TherapyName"] },
                      },
                    },
                    0,
                  ],
                },
                PatientResponse: "$$therapy.PatientResponse",
                createdAt: "$$therapy.createdAt",
                updatedAt: "$$therapy.updatedAt",
              },
            },
          },

          // Populate Surgeries Procedures
          SurgeriesProcedures: {
            $map: {
              input: "$SurgeriesProcedures",
              as: "surgery",
              in: {
                _id: "$$surgery._id",
                Date: "$$surgery.Date",
                HospitalClinicName: "$$surgery.HospitalClinicName",
                SurgeonName: "$$surgery.SurgeonName",
                SurgeonNumber: "$$surgery.SurgeonNumber",
                MedicalSpeciality: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$surgerySpecialityLookups",
                        cond: {
                          $eq: ["$$this._id", "$$surgery.MedicalSpeciality"],
                        },
                      },
                    },
                    0,
                  ],
                },
                SurgeryProcedureName: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$surgeryProcedureNameLookups",
                        cond: {
                          $eq: ["$$this._id", "$$surgery.SurgeryProcedureName"],
                        },
                      },
                    },
                    0,
                  ],
                },
                AnaesthesiaType: "$$surgery.AnaesthesiaType",
                BloodTransfusionNeeded: "$$surgery.BloodTransfusionNeeded",
                RecoveryCycle: {
                  Value: "$$surgery.RecoveryCycle.Value",
                  Unit: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$surgeryRecoveryUnitLookups",
                          cond: {
                            $eq: ["$$this._id", "$$surgery.RecoveryCycle.Unit"],
                          },
                        },
                      },
                      0,
                    ],
                  },
                  _id: "$$surgery.RecoveryCycle._id",
                },
                PostSurgeryComplications: {
                  $map: {
                    input: "$$surgery.PostSurgeryComplications",
                    as: "complicationId",
                    in: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$surgeryComplicationLookups",
                            cond: { $eq: ["$$this._id", "$$complicationId"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                },
                DischargeSummaryUrlNote: "$$surgery.DischargeSummaryUrlNote",
                createdAt: "$$surgery.createdAt",
                updatedAt: "$$surgery.updatedAt",
              },
            },
          },
        },
      },

      // Remove temporary lookup arrays
      {
        $project: {
          CaseFileData: 0,
          PatientData: 0,
          CreatedByData: 0,
          UpdatedByData: 0,
          symptomLookups: 0,
          durationUnitLookups: 0,
          aggravatingFactorLookups: 0,
          investigationCategoryLookups: 0,
          investigationLookups: 0,
          abnormalityLookups: 0,
          medicineNameLookups: 0,
          medicineDosageLookups: 0,
          medicineRecoveryUnitLookups: 0,
          therapyNameLookups: 0,
          surgerySpecialityLookups: 0,
          surgeryProcedureNameLookups: 0,
          surgeryRecoveryUnitLookups: 0,
          surgeryComplicationLookups: 0,
        },
      },

      // Sort by latest first
      { $sort: { createdAt: -1 } },

      // Pagination
      { $skip: (page - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ];

    const results = await MedicalHistory.aggregate(pipeline);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
        filters: {
          CaseFileId,
          PatientId,
          Status,
          FromDate,
          ToDate,
          search,
        },
        list: __deepClone(results),
      })
    );
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.getMedicalHistoryByIdxxx = async (req, res) => {
  try {
    const { id } = req.params;

    const medicalHistory = await MedicalHistory.findOne({
      _id: id,
      IsDeleted: false,
    })
      .populate("CaseFileId")
      .populate("PatientId")
      .populate(populateConfigs.ChiefComplaints)
      .populate(populateConfigs.ClinicalDiagnoses)
      .populate(populateConfigs.MedicinesPrescribed)
      .populate(populateConfigs.Therapies)
      .populate("CreatedBy", "Name Email")
      .populate("UpdatedBy", "Name Email");

    if (!medicalHistory) {
      return res.json(__requestResponse("404", "Medical History not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, medicalHistory));
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.getMedicalHistoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Use the same aggregation approach as the list API
    let pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          IsDeleted: false,
        },
      },

      // Join case file data
      {
        $lookup: {
          from: "patient_case_files",
          localField: "CaseFileId",
          foreignField: "_id",
          as: "CaseFileData",
        },
      },

      // Join patient data
      {
        $lookup: {
          from: "patient_masters",
          localField: "PatientId",
          foreignField: "_id",
          as: "PatientData",
        },
      },

      // Join created by user from asset_masters
      {
        $lookup: {
          from: "asset_masters",
          localField: "CreatedBy",
          foreignField: "_id",
          as: "CreatedByData",
          pipeline: [{ $project: { _id: 1, Name: 1, Email: 1 } }],
        },
      },

      // Join updated by user from asset_masters
      {
        $lookup: {
          from: "asset_masters",
          localField: "UpdatedBy",
          foreignField: "_id",
          as: "UpdatedByData",
          pipeline: [{ $project: { _id: 1, Name: 1, Email: 1 } }],
        },
      },

      // Join all lookup data (same as list API)
      {
        $lookup: {
          from: "admin_lookups",
          localField: "ChiefComplaints.Symptoms",
          foreignField: "_id",
          as: "symptomLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "ChiefComplaints.Duration.Unit",
          foreignField: "_id",
          as: "durationUnitLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "ChiefComplaints.AggravatingFactors",
          foreignField: "_id",
          as: "aggravatingFactorLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "ClinicalDiagnoses.InvestigationCategory",
          foreignField: "_id",
          as: "investigationCategoryLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "ClinicalDiagnoses.Investigation",
          foreignField: "_id",
          as: "investigationLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "ClinicalDiagnoses.Abnormalities",
          foreignField: "_id",
          as: "abnormalityLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "MedicinesPrescribed.Medicines.MedicineName",
          foreignField: "_id",
          as: "medicineNameLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "MedicinesPrescribed.Medicines.Dosage",
          foreignField: "_id",
          as: "medicineDosageLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "MedicinesPrescribed.RecoveryCycle.Unit",
          foreignField: "_id",
          as: "medicineRecoveryUnitLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "Therapies.TherapyName",
          foreignField: "_id",
          as: "therapyNameLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "SurgeriesProcedures.MedicalSpeciality",
          foreignField: "_id",
          as: "surgerySpecialityLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "SurgeriesProcedures.SurgeryProcedureName",
          foreignField: "_id",
          as: "surgeryProcedureNameLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "SurgeriesProcedures.RecoveryCycle.Unit",
          foreignField: "_id",
          as: "surgeryRecoveryUnitLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "SurgeriesProcedures.PostSurgeryComplications",
          foreignField: "_id",
          as: "surgeryComplicationLookups",
          pipeline: [{ $project: { _id: 1, lookup_value: 1 } }],
        },
      },

      // Apply same population logic as list API
      {
        $addFields: {
          CaseFileId: { $arrayElemAt: ["$CaseFileData", 0] },
          PatientId: { $arrayElemAt: ["$PatientData", 0] },
          CreatedBy: { $arrayElemAt: ["$CreatedByData", 0] },
          UpdatedBy: { $arrayElemAt: ["$UpdatedByData", 0] },

          // Same population logic as list API (copy from above)
          ChiefComplaints: {
            $map: {
              input: "$ChiefComplaints",
              as: "complaint",
              in: {
                _id: "$$complaint._id",
                Symptoms: {
                  $map: {
                    input: "$$complaint.Symptoms",
                    as: "symptomId",
                    in: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$symptomLookups",
                            cond: { $eq: ["$$this._id", "$$symptomId"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                },
                Duration: {
                  Value: "$$complaint.Duration.Value",
                  Unit: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$durationUnitLookups",
                          cond: {
                            $eq: ["$$this._id", "$$complaint.Duration.Unit"],
                          },
                        },
                      },
                      0,
                    ],
                  },
                  _id: "$$complaint.Duration._id",
                },
                SeverityGrade: "$$complaint.SeverityGrade",
                AggravatingFactors: {
                  $map: {
                    input: "$$complaint.AggravatingFactors",
                    as: "factorId",
                    in: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$aggravatingFactorLookups",
                            cond: { $eq: ["$$this._id", "$$factorId"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                },
                createdAt: "$$complaint.createdAt",
                updatedAt: "$$complaint.updatedAt",
              },
            },
          },

          // Copy all other population logic from list API...
          ClinicalDiagnoses: {
            $map: {
              input: "$ClinicalDiagnoses",
              as: "diagnosis",
              in: {
                _id: "$$diagnosis._id",
                Date: "$$diagnosis.Date",
                InvestigationCategory: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$investigationCategoryLookups",
                        cond: {
                          $eq: [
                            "$$this._id",
                            "$$diagnosis.InvestigationCategory",
                          ],
                        },
                      },
                    },
                    0,
                  ],
                },
                Investigation: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$investigationLookups",
                        cond: {
                          $eq: ["$$this._id", "$$diagnosis.Investigation"],
                        },
                      },
                    },
                    0,
                  ],
                },
                Abnormalities: {
                  $map: {
                    input: "$$diagnosis.Abnormalities",
                    as: "abnormalityId",
                    in: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$abnormalityLookups",
                            cond: { $eq: ["$$this._id", "$$abnormalityId"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                },
                ReportUrl: "$$diagnosis.ReportUrl",
                InterpretationUrl: "$$diagnosis.InterpretationUrl",
                createdAt: "$$diagnosis.createdAt",
                updatedAt: "$$diagnosis.updatedAt",
              },
            },
          },

          MedicinesPrescribed: {
            $cond: {
              if: { $ne: ["$MedicinesPrescribed", null] },
              then: {
                _id: "$MedicinesPrescribed._id",
                Medicines: {
                  $map: {
                    input: "$MedicinesPrescribed.Medicines",
                    as: "medicine",
                    in: {
                      _id: "$$medicine._id",
                      MedicineName: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$medicineNameLookups",
                              cond: {
                                $eq: ["$$this._id", "$$medicine.MedicineName"],
                              },
                            },
                          },
                          0,
                        ],
                      },
                      Dosage: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$medicineDosageLookups",
                              cond: {
                                $eq: ["$$this._id", "$$medicine.Dosage"],
                              },
                            },
                          },
                          0,
                        ],
                      },
                      DurationInDays: "$$medicine.DurationInDays",
                      createdAt: "$$medicine.createdAt",
                      updatedAt: "$$medicine.updatedAt",
                    },
                  },
                },
                RecoveryCycle: {
                  Value: "$MedicinesPrescribed.RecoveryCycle.Value",
                  Unit: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$medicineRecoveryUnitLookups",
                          cond: {
                            $eq: [
                              "$$this._id",
                              "$MedicinesPrescribed.RecoveryCycle.Unit",
                            ],
                          },
                        },
                      },
                      0,
                    ],
                  },
                  _id: "$MedicinesPrescribed.RecoveryCycle._id",
                },
                PrescriptionUrls: "$MedicinesPrescribed.PrescriptionUrls",
                createdAt: "$MedicinesPrescribed.createdAt",
                updatedAt: "$MedicinesPrescribed.updatedAt",
              },
              else: null,
            },
          },

          Therapies: {
            $map: {
              input: "$Therapies",
              as: "therapy",
              in: {
                _id: "$$therapy._id",
                TherapyName: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$therapyNameLookups",
                        cond: { $eq: ["$$this._id", "$$therapy.TherapyName"] },
                      },
                    },
                    0,
                  ],
                },
                PatientResponse: "$$therapy.PatientResponse",
                createdAt: "$$therapy.createdAt",
                updatedAt: "$$therapy.updatedAt",
              },
            },
          },

          SurgeriesProcedures: {
            $map: {
              input: "$SurgeriesProcedures",
              as: "surgery",
              in: {
                _id: "$$surgery._id",
                Date: "$$surgery.Date",
                HospitalClinicName: "$$surgery.HospitalClinicName",
                SurgeonName: "$$surgery.SurgeonName",
                SurgeonNumber: "$$surgery.SurgeonNumber",
                MedicalSpeciality: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$surgerySpecialityLookups",
                        cond: {
                          $eq: ["$$this._id", "$$surgery.MedicalSpeciality"],
                        },
                      },
                    },
                    0,
                  ],
                },
                SurgeryProcedureName: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$surgeryProcedureNameLookups",
                        cond: {
                          $eq: ["$$this._id", "$$surgery.SurgeryProcedureName"],
                        },
                      },
                    },
                    0,
                  ],
                },
                AnaesthesiaType: "$$surgery.AnaesthesiaType",
                BloodTransfusionNeeded: "$$surgery.BloodTransfusionNeeded",
                RecoveryCycle: {
                  Value: "$$surgery.RecoveryCycle.Value",
                  Unit: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$surgeryRecoveryUnitLookups",
                          cond: {
                            $eq: ["$$this._id", "$$surgery.RecoveryCycle.Unit"],
                          },
                        },
                      },
                      0,
                    ],
                  },
                  _id: "$$surgery.RecoveryCycle._id",
                },
                PostSurgeryComplications: {
                  $map: {
                    input: "$$surgery.PostSurgeryComplications",
                    as: "complicationId",
                    in: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$surgeryComplicationLookups",
                            cond: { $eq: ["$$this._id", "$$complicationId"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                },
                DischargeSummaryUrlNote: "$$surgery.DischargeSummaryUrlNote",
                createdAt: "$$surgery.createdAt",
                updatedAt: "$$surgery.updatedAt",
              },
            },
          },
        },
      },

      // Remove temporary lookup arrays
      {
        $project: {
          CaseFileData: 0,
          PatientData: 0,
          CreatedByData: 0,
          UpdatedByData: 0,
          symptomLookups: 0,
          durationUnitLookups: 0,
          aggravatingFactorLookups: 0,
          investigationCategoryLookups: 0,
          investigationLookups: 0,
          abnormalityLookups: 0,
          medicineNameLookups: 0,
          medicineDosageLookups: 0,
          medicineRecoveryUnitLookups: 0,
          therapyNameLookups: 0,
          surgerySpecialityLookups: 0,
          surgeryProcedureNameLookups: 0,
          surgeryRecoveryUnitLookups: 0,
          surgeryComplicationLookups: 0,
        },
      },
    ];

    const results = await MedicalHistory.aggregate(pipeline);

    if (!results || results.length === 0) {
      return res.json(__requestResponse("404", "Medical History not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, results[0]));
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};



exports.deleteMedicalHistory = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { id } = req.params;

    const oldValue = await MedicalHistory.findById(id).session(session).lean();
    if (!oldValue) {
      await session.abortTransaction();
      session.endSession();
      return res.json(__requestResponse("404", "Medical History not found"));
    }

    const medicalHistory = await MedicalHistory.findByIdAndUpdate(
      id,
      {
        IsDeleted: true,
        UpdatedBy: req.body.UpdatedBy || oldValue.CreatedBy,
      },
      { new: true, session }
    );

    await __CreateAuditLog(
      "medical_history",
      "DELETE",
      null,
      oldValue,
      medicalHistory.toObject(),
      id
    );

    await session.commitTransaction();
    session.endSession();

    return res.json(
      __requestResponse("200", "Medical History deleted successfully")
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.deleteSectionItem = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, sectionName, itemId } = req.params;

    const medicalHistory = await MedicalHistory.findOne({
      CaseFileId,
      IsDeleted: false,
    }).session(session);

    if (!medicalHistory) {
      await session.abortTransaction();
      session.endSession();
      return res.json(__requestResponse("404", "Medical History not found"));
    }

    const oldValue = medicalHistory.toObject();

    if (sectionName === "MedicinesPrescribed") {
      medicalHistory.MedicinesPrescribed = {
        Medicines: [],
        RecoveryCycle: { Value: 0, Unit: null },
        PrescriptionUrls: [],
      };
    } else {
      medicalHistory[sectionName].pull({ _id: itemId });
    }

    await medicalHistory.save({ session });

    await __CreateAuditLog(
      "medical_history",
      "DELETE_SECTION_ITEM",
      sectionName,
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    return res.json(__requestResponse("200", "Item deleted successfully"));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};
