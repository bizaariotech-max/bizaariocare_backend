const MedicalHistory = require("../../modals/Patient/MedicalHistory2");
const PatientCaseFile = require("../../modals/Patient/PatientCaseFile");
const { __requestResponse } = require("../../utils/constant");
const { __SUCCESS, __SOME_ERROR } = require("../../utils/variable");
const { __deepClone } = require("../../utils/constant");
const { __CreateAuditLog } = require("../../utils/auditlog");
const mongoose = require("mongoose");

// Save Medical History
exports.saveMedicalHistory = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { _id, CaseFileId } = req.body;
    let oldValue = null;

    // Check CaseFile exists
    const caseFile = await PatientCaseFile.findById(CaseFileId);
    if (!caseFile) {
      return res.json(__requestResponse("404", "Case File not found"));
    }

    let medicalHistory;
    if (_id) {
      // Get old value for audit log
      oldValue = await MedicalHistory.findById(_id).lean();
      if (!oldValue) {
        return res.json(__requestResponse("404", "Medical History not found"));
      }

      medicalHistory = await MedicalHistory.findByIdAndUpdate(_id, req.body, {
        new: true,
        session,
      });

      // Create audit log for update
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

      // Create audit log for creation
      await __CreateAuditLog(
        "medical_history",
        "CREATE",
        null,
        null,
        medicalHistory[0].toObject(),
        medicalHistory[0]._id
      );
    }

    await session.commitTransaction();
    session.endSession();

    // Populate references
    medicalHistory = await MedicalHistory.findById(
      _id ? medicalHistory._id : medicalHistory[0]._id
    )
      .populate("CaseFileId")
      .populate("PatientId")
      .populate("ChiefComplaints.Symptoms", "lookup_value")
      .populate("ChiefComplaints.Duration.Unit", "lookup_value")
      .populate("ClinicalDiagnoses.InvestigationCategory", "lookup_value")
      .populate("ClinicalDiagnoses.Investigation", "lookup_value")
      .populate("ClinicalDiagnoses.Abnormalities", "lookup_value")
      .populate("MedicinesPrescribed.Medicines.MedicineName", "lookup_value")
      .populate("MedicinesPrescribed.Medicines.Dosage", "lookup_value")
      .populate("Therapies.TherapyName", "lookup_value")
      .populate("CreatedBy", "Name")
      .populate("UpdatedBy", "Name");

    return res.json(__requestResponse("200", __SUCCESS, medicalHistory));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Medical History List with filters
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

    const query = { IsDeleted: false };

    // Apply filters
    if (CaseFileId) query.CaseFileId = CaseFileId;
    if (PatientId) query.PatientId = PatientId;
    if (Status) query.Status = Status;

    // Date range filter
    if (FromDate || ToDate) {
      query.createdAt = {};
      if (FromDate) query.createdAt.$gte = new Date(FromDate);
      if (ToDate) query.createdAt.$lte = new Date(ToDate);
    }

    // Search in symptoms and diagnoses
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { "ChiefComplaints.Symptoms.lookup_value": regex },
        { "ClinicalDiagnoses.Investigation.lookup_value": regex },
        { Notes: regex },
      ];
    }

    const total = await MedicalHistory.countDocuments(query);

    const list = await MedicalHistory.find(query)
      .populate("CaseFileId")
      .populate("PatientId")
      .populate("ChiefComplaints.Symptoms", "lookup_value")
      .populate("ChiefComplaints.Duration.Unit", "lookup_value")
      .populate("ClinicalDiagnoses.InvestigationCategory", "lookup_value")
      .populate("ClinicalDiagnoses.Investigation", "lookup_value")
      .populate("CreatedBy", "Name")
      .populate("UpdatedBy", "Name")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: Number(page),
        limit: Number(limit),
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

// Update section with array handling
exports.updateChiefComplaintsxxx = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, ChiefComplaints, _id } = req.body;

    // Get old value for audit
    const oldValue = await MedicalHistory.findOne({
      CaseFileId,
      IsDeleted: false,
    }).lean();

    if (!oldValue) {
      return res.json(__requestResponse("404", "Medical History not found"));
    }

    // If updating existing complaint
    if (_id) {
      const mh = await MedicalHistory.findOneAndUpdate(
        {
          CaseFileId,
          IsDeleted: false,
          "ChiefComplaints._id": _id,
        },
        {
          $set: { "ChiefComplaints.$": ChiefComplaints },
        },
        {
          new: true,
          session,
        }
      );

      await __CreateAuditLog(
        "medical_history",
        "UPDATE_SECTION",// "ChiefComplaints",
        null,
        oldValue,
        mh.toObject(),
        mh._id
      );

      await session.commitTransaction();
      session.endSession();

      return res.json(__requestResponse("200", __SUCCESS, mh));
    }

    // Adding new complaints
    const mh = await MedicalHistory.findOneAndUpdate(
      { CaseFileId, IsDeleted: false },
      { $push: { ChiefComplaints: { $each: ChiefComplaints } } },
      { new: true, session }
    );

    await __CreateAuditLog(
      "medical_history",
      "ADD_SECTION",  // "ChiefComplaints",
      null,
      oldValue,
      mh.toObject(),
      mh._id
    );

    await session.commitTransaction();
    session.endSession();

    return res.json(__requestResponse("200", __SUCCESS, mh));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

exports.updateChiefComplaints = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, ChiefComplaints } = req.body;

    // Find or create medical history
    let medicalHistory = await MedicalHistory.findOne({
      CaseFileId,
      IsDeleted: false,
    });

    const caseFile = await PatientCaseFile.findById(CaseFileId);
    if (!caseFile) {
      return res.json(__requestResponse("404", "Case File not found"));
    }

    if (!medicalHistory) {
      // Create new medical history if not exists
      medicalHistory = await MedicalHistory.create(
        [
          {
            CaseFileId,
            PatientId: caseFile.PatientId,
            Status: "Active",
            // CreatedBy: req.user._id,
            // CreatedBy: req.body.CreatedBy,
            IsActive: true,
            ChiefComplaints: ChiefComplaints,
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
    } else {
      // Update existing medical history
      const oldValue = medicalHistory.toObject();

      medicalHistory = await MedicalHistory.findByIdAndUpdate(
        medicalHistory._id,
        {
          $push: {
            ChiefComplaints: {
              $each: ChiefComplaints,
            },
          },
          // UpdatedBy: req.user._id,
        },
        { new: true, session }
      );

      await __CreateAuditLog(
        "medical_history",
        "UPDATE_SECTION",
        // "ChiefComplaints",
        null,
        oldValue,
        medicalHistory.toObject(),
        medicalHistory._id
      );
    }

    await session.commitTransaction();
    session.endSession();

    // Populate and return
    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate("ChiefComplaints.Symptoms", "lookup_value")
      .populate("ChiefComplaints.Duration.Unit", "lookup_value")
      .populate("ChiefComplaints.AggravatingFactors", "lookup_value");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Update Clinical Diagnoses
exports.updateClinicalDiagnoses = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, ClinicalDiagnoses, _id } = req.body;

    const oldValue = await MedicalHistory.findOne({
      CaseFileId,
      IsDeleted: false,
    }).lean();

    if (!oldValue) {
      return res.json(__requestResponse("404", "Medical History not found"));
    }

    let medicalHistory;
    if (_id) {
      medicalHistory = await MedicalHistory.findOneAndUpdate(
        {
          CaseFileId,
          IsDeleted: false,
          "ClinicalDiagnoses._id": _id,
        },
        {
          $set: { "ClinicalDiagnoses.$": ClinicalDiagnoses },
        },
        {
          new: true,
          session,
        }
      );
    } else {
      medicalHistory = await MedicalHistory.findOneAndUpdate(
        { CaseFileId, IsDeleted: false },
        { $push: { ClinicalDiagnoses: ClinicalDiagnoses } },
        { new: true, session }
      );
    }

    await __CreateAuditLog(
      "medical_history",
      _id ? "UPDATE_SECTION" : "ADD_SECTION",
      "ClinicalDiagnoses",
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    // Populate and return
    medicalHistory = await MedicalHistory.findById(medicalHistory._id)
      .populate("ClinicalDiagnoses.InvestigationCategory", "lookup_value")
      .populate("ClinicalDiagnoses.Investigation", "lookup_value")
      .populate("ClinicalDiagnoses.Abnormalities", "lookup_value");

    return res.json(__requestResponse("200", __SUCCESS, medicalHistory));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Update Medicines Prescribed
exports.updateMedicinesPrescribed = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, MedicinesPrescribed } = req.body;

    const oldValue = await MedicalHistory.findOne({
      CaseFileId,
      IsDeleted: false,
    }).lean();

    if (!oldValue) {
      return res.json(__requestResponse("404", "Medical History not found"));
    }

    const medicalHistory = await MedicalHistory.findOneAndUpdate(
      { CaseFileId, IsDeleted: false },
      { $set: { MedicinesPrescribed } },
      { new: true, session }
    );

    await __CreateAuditLog(
      "medical_history",
      "UPDATE_SECTION",
      "MedicinesPrescribed",
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    // Populate and return
    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate("MedicinesPrescribed.Medicines.MedicineName", "lookup_value")
      .populate("MedicinesPrescribed.Medicines.Dosage", "lookup_value")
      .populate("MedicinesPrescribed.RecoveryCycle.Unit", "lookup_value");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Update Therapies
exports.updateTherapies = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, Therapies, _id } = req.body;

    const oldValue = await MedicalHistory.findOne({
      CaseFileId,
      IsDeleted: false,
    }).lean();

    if (!oldValue) {
      return res.json(__requestResponse("404", "Medical History not found"));
    }

    let medicalHistory;
    if (_id) {
      medicalHistory = await MedicalHistory.findOneAndUpdate(
        {
          CaseFileId,
          IsDeleted: false,
          "Therapies._id": _id,
        },
        {
          $set: { "Therapies.$": Therapies },
        },
        {
          new: true,
          session,
        }
      );
    } else {
      medicalHistory = await MedicalHistory.findOneAndUpdate(
        { CaseFileId, IsDeleted: false },
        { $push: { Therapies: Therapies } },
        { new: true, session }
      );
    }

    await __CreateAuditLog(
      "medical_history",
      _id ? "UPDATE_SECTION" : "ADD_SECTION",
      "Therapies",
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    // Populate and return
    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate("Therapies.TherapyName", "lookup_value")
      .populate("Therapies.PatientResponse", "lookup_value");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Update Surgeries/Procedures
exports.updateSurgeriesProcedures = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, SurgeriesProcedures, _id } = req.body;

    const oldValue = await MedicalHistory.findOne({
      CaseFileId,
      IsDeleted: false,
    }).lean();

    if (!oldValue) {
      return res.json(__requestResponse("404", "Medical History not found"));
    }

    let medicalHistory;
    if (_id) {
      medicalHistory = await MedicalHistory.findOneAndUpdate(
        {
          CaseFileId,
          IsDeleted: false,
          "SurgeriesProcedures._id": _id,
        },
        {
          $set: { "SurgeriesProcedures.$": SurgeriesProcedures },
        },
        {
          new: true,
          session,
        }
      );
    } else {
      medicalHistory = await MedicalHistory.findOneAndUpdate(
        { CaseFileId, IsDeleted: false },
        { $push: { SurgeriesProcedures: SurgeriesProcedures } },
        { new: true, session }
      );
    }

    await __CreateAuditLog(
      "medical_history",
      _id ? "UPDATE_SECTION" : "ADD_SECTION",
      "SurgeriesProcedures",
      oldValue,
      medicalHistory.toObject(),
      medicalHistory._id
    );

    await session.commitTransaction();
    session.endSession();

    // Populate and return
    const populated = await MedicalHistory.findById(medicalHistory._id)
      .populate("SurgeriesProcedures.MedicalSpeciality", "lookup_value")
      .populate("SurgeriesProcedures.SurgeryProcedureName", "lookup_value")
      .populate("SurgeriesProcedures.RecoveryCycle.Unit", "lookup_value")
      .populate("SurgeriesProcedures.PostSurgeryComplications", "lookup_value");

    return res.json(__requestResponse("200", __SUCCESS, populated));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Delete section items
exports.deleteChiefComplaint = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { CaseFileId, itemId } = req.params;

    const oldValue = await MedicalHistory.findOne({
      CaseFileId,
      IsDeleted: false,
    }).lean();

    if (!oldValue) {
      return res.json(__requestResponse("404", "Medical History not found"));
    }

    const medicalHistory = await MedicalHistory.findOneAndUpdate(
      { CaseFileId, IsDeleted: false },
      { $pull: { ChiefComplaints: { _id: itemId } } },
      { new: true, session }
    );

    await __CreateAuditLog(
      "medical_history",
      "DELETE_SECTION_ITEM",
      "ChiefComplaints",
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

// Get Medical History by ID
exports.getMedicalHistoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const medicalHistory = await MedicalHistory.findOne({
      _id: id,
      IsDeleted: false,
    }).populate([
      {
        path: "CaseFileId",
        select: "PatientId CaseFileNumber Date",
      },
      {
        path: "PatientId",
        select: "Name PatientId PhoneNumber Email",
      },
      {
        path: "ChiefComplaints.Symptoms",
        select: "lookup_value",
      },
      {
        path: "ChiefComplaints.Duration.Unit",
        select: "lookup_value",
      },
      {
        path: "ClinicalDiagnoses.InvestigationCategory",
        select: "lookup_value",
      },
      {
        path: "ClinicalDiagnoses.Investigation",
        select: "lookup_value",
      },
      {
        path: "ClinicalDiagnoses.Abnormalities",
        select: "lookup_value",
      },
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
      {
        path: "Therapies.TherapyName",
        select: "lookup_value",
      },
      {
        path: "Therapies.PatientResponse",
        select: "lookup_value",
      },
      {
        path: "SurgeriesProcedures.MedicalSpeciality",
        select: "lookup_value",
      },
      {
        path: "SurgeriesProcedures.SurgeryProcedureName",
        select: "lookup_value",
      },
      {
        path: "SurgeriesProcedures.PostSurgeryComplications",
        select: "lookup_value",
      },
      {
        path: "CreatedBy",
        select: "Name Email",
      },
      {
        path: "UpdatedBy",
        select: "Name Email",
      },
    ]);

    if (!medicalHistory) {
      return res.json(__requestResponse("404", "Medical History not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, medicalHistory));
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Delete Medical History (Soft Delete)
exports.deleteMedicalHistory = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { id } = req.params;

    // Get old value for audit log
    const oldValue = await MedicalHistory.findById(id).lean();

    if (!oldValue) {
      return res.json(__requestResponse("404", "Medical History not found"));
    }

    // Soft delete
    const medicalHistory = await MedicalHistory.findByIdAndUpdate(
      id,
      {
        IsDeleted: true,
        UpdatedBy: req.user._id, // Assuming you have user in request
      },
      {
        new: true,
        session,
      }
    );

    // Create audit log
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

    return res.json(__requestResponse("200", "Medical History deleted successfully"));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};
