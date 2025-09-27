const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Form 1 - Doctor/Hospital Information
const DoctorHospitalInfoSchema = new Schema({
  Date: {
    type: Date
  },
  DoctorName: {
    type: String,
    trim: true
  },
  DoctorNumber: {
    type: String,
    trim: true
  },
  HospitalName: {
    type: String,
    trim: true
  },
  HospitalLocation: {
    type: String,
    trim: true
  },
  MedicalSpeciality: { // lookup_type: "MEDICAL_SPECIALITY"
    type: Schema.Types.ObjectId,
    ref: "admin_lookups"
  }
}, { _id: false });

// Form 2 - Chief Complaints (Add More supported)
const ChiefComplaintSchema = new Schema({
  Symptoms: [
    {
      // lookup_type: "SYMPTOM"
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
    },
  ],
  Duration: {
    Value: {
      type: Number,
      min: 0,
    },
    Unit: {
      // lookup_type: "DURATION_UNIT"
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
    },
  },
  // SeverityGrade: { // lookup_type: "SEVERITY_GRADE"
  //   type: Schema.Types.ObjectId,
  //   ref: "admin_lookups"
  // },
  SeverityGrade: {
    type: String,
    enum: [1, 2, 3, 4, 5, 6],
    required: true,
  },

  AggravatingFactors: [
    {
      // lookup_type: "AGGRAVATING_FACTOR"
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
    },
  ],
});

// Form 3 - Clinical Diagnosis (Add More supported)
const ClinicalDiagnosisSchema = new Schema({
  Date: {
    type: Date,
  },
  InvestigationCategory: {
    // lookup_type: "INVESTIGATION_CATEGORY"
    type: Schema.Types.ObjectId,
    ref: "admin_lookups",
  },
  Investigation: {
    // lookup_type: "INVESTIGATION"
    type: Schema.Types.ObjectId,
    ref: "admin_lookups",
  },
  Abnormalities: [
    {
      // lookup_type: "ABNORMALITY"
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
    },
  ],
  ReportUrl: {
    // Upload Report
    type: String,
    trim: true,
  },
  InterpretationUrl: {
    // Upload Interpretation
    type: String,
    trim: true,
  },
});

// Form 4a - Medicine Schema (Add More supported)
const MedicineSchema = new Schema({
  MedicineName: {
    // lookup_type: "MEDICINE"
    type: Schema.Types.ObjectId,
    ref: "admin_lookups",
  },
  Dosage: {
    // lookup_type: "DOSAGE"
    type: Schema.Types.ObjectId,
    ref: "admin_lookups",
  },
  DurationInDays: {
    // Duration (Days)
    type: Number,
    min: 0,
  },
});

// Form 4b - Medicines Prescribed with Recovery Cycle
const MedicinesPrescribedSchema = new Schema(
  {
    Medicines: [MedicineSchema],
    RecoveryCycle: {
      // Recovery Cycle (Number) Drop Down
      Value: {
        type: Number,
        min: 0,
      },
      Unit: {
        // lookup_type: "DURATION_UNIT" (Days, Weeks, Months)
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },
    },
    PrescriptionUrls: [
      {
        // Upload Prescriptions (multiple)
        type: String,
        trim: true,
      },
    ],
  },
  { _id: false }
);

// Form 5 - Therapy(ies) (Add More supported)
const TherapySchema = new Schema({
  TherapyName: {
    // lookup_type: "THERAPY"
    type: Schema.Types.ObjectId,
    ref: "admin_lookups",
  },
  // PatientResponse: {
  //   // lookup_type: "PATIENT_RESPONSE" (One Response for each therapy)
  //   type: Schema.Types.ObjectId,
  //   ref: "admin_lookups",
  // },
  PatientResponse: {
    type: String,
    // enum: ["Excellent", "Good", "Fair", "Poor", "No Improvement"],
  },
});

// Form 6 - Surgery/Procedure (Add More supported)
const SurgeryProcedureSchema = new Schema({
  Date: {
    type: Date,
  },
  HospitalClinicName: {
    // Hospital/Clinic Name
    type: String,
    trim: true,
  },
  SurgeonName: {
    type: String,
    trim: true,
  },
  SurgeonNumber: {
    type: String,
    trim: true,
  },
  MedicalSpeciality: {
    // lookup_type: "SURGICAL_SPECIALITY"
    type: Schema.Types.ObjectId,
    ref: "admin_lookups",
  },
  SurgeryProcedureName: {
    // lookup_type: "PROCEDURE"
    type: Schema.Types.ObjectId,
    ref: "admin_lookups",
  },
  BloodTransfusionNeeded: {
    // Was a Blood Transfusion Needed? Yes/No
    type: Boolean,
    default: false,
  },
  // AnaesthesiaType: { // lookup_type: "ANAESTHESIA_TYPE" (General/Local)
  //   type: Schema.Types.ObjectId,
  //   ref: "admin_lookups"
  // },
  AnaesthesiaType: {
    type: String,
    enum: [
      "General", // General Anaesthesia
      "Local", // Local Anaesthesia
    ],
  },
  RecoveryCycle: {
    Value: {
      type: Number,
      min: 0,
    },
    Unit: {
      // lookup_type: "DURATION_UNIT"
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
    },
  },
  PostSurgeryComplications: [
    {
      // lookup_type: "POST_SURGERY_COMPLICATION" (Bubble)
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
    },
  ],
  DischargeSummaryUrlNote: {
    // Upload Discharge Summary/Note
    type: String,
    trim: true,
  },
});

// Main Medical History Schema
const MedicalHistorySchema = new Schema(
  {
    CaseFileId: {
      type: Schema.Types.ObjectId,
      ref: "patient_case_file",
      required: true,
      index: true,
    },
    PatientId: {
      // Patient ID
      type: Schema.Types.ObjectId,
      ref: "patient_master",
      index: true,
    },

    DoctorHospitalInfo: {
      // Form 1
      type: DoctorHospitalInfoSchema,
    },

    ChiefComplaints: [
      {
        // Form 2 (multiple with Add More)
        type: ChiefComplaintSchema,
      },
    ],

    ClinicalDiagnoses: [
      {
        // Form 3 (multiple with Add More)
        type: ClinicalDiagnosisSchema,
      },
    ],

    MedicinesPrescribed: {
      // Form 4
      type: MedicinesPrescribedSchema,
    },

    Therapies: [
      {
        // Form 5 (multiple with Add More)
        type: TherapySchema,
      },
    ],

    SurgeriesProcedures: [
      {
        // Form 6 (multiple with Add More)
        type: SurgeryProcedureSchema,
      },
    ],

    // Status to track current state of illness
    // Present illnesses: Active, Ongoing, In-Treatment, Monitoring, Chronic
    // Past illnesses: Resolved, Cured
    Status: {
      type: String,
      enum: [
        "Active", // Currently active illness
        "Ongoing", // Continuing treatment -current
        "In-Treatment", // Under active treatment - Treatment To Date
        "Monitoring", // Under observation
        "Chronic", // Long-term condition
        "Resolved", // Illness has been resolved
        "Cured", // Completely cured
        "Past", // Past Illness
      ],
      default: "Active",
      index: true,
    },

    Notes: {
      type: String,
      trim: true,
    },

    // // Date when illness/condition started
    // OnsetDate: {
    //   type: Date,
    // },

    // // Date when illness was resolved (populated when Status changes to Resolved/Cured)
    // ResolutionDate: {
    //   type: Date,
    // },

    // // Additional tracking
    // LastFollowUpDate: {
    //   type: Date,
    // },

    // NextFollowUpDate: {
    //   type: Date,
    // },

    IsDeleted: {
      type: Boolean,
      default: false,
    },
    DeletedAt: {
      type: Date,
    },
    DeletedBy: {
      type: Schema.Types.ObjectId,
      ref: "asset_master",
    },
    CreatedBy: {
      type: Schema.Types.ObjectId,
      ref: "asset_master",
    },
    UpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: "asset_master",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Virtual to check if illness is past or present
MedicalHistorySchema.virtual("IsPastIllness").get(function () {
  return ["Resolved", "Cured", "Past"].includes(this.Status);
});

MedicalHistorySchema.virtual("IsPresentIllness").get(function () {
  return [
    "Active",
    "Ongoing",
    "In-Treatment",
    "Monitoring",
    "Chronic",
  ].includes(this.Status);
});

// Indexes for better query performance
MedicalHistorySchema.index({ PatientId: 1, Status: 1 });
MedicalHistorySchema.index({ PatientId: 1, createdAt: -1 });
MedicalHistorySchema.index({ PatientId: 1, IsDeleted: 1 });
MedicalHistorySchema.index({ "DoctorHospitalInfo.Date": -1 });
MedicalHistorySchema.index({ Status: 1 });

// Static method to find by patient with all lookups populated
MedicalHistorySchema.statics.findByPatient = function (
  patientId,
  includeDeleted = false
) {
  const query = { PatientId: patientId };
  if (!includeDeleted) {
    query.IsDeleted = false;
  }
  return (
    this.find(query)
      .populate("DoctorHospitalInfo.MedicalSpeciality", "lookup_value")
      .populate("ChiefComplaints.Symptoms", "lookup_value")
      .populate("ChiefComplaints.Duration.Unit", "lookup_value")
      .populate("ChiefComplaints.SeverityGrade", "lookup_value")
      .populate("ChiefComplaints.AggravatingFactors", "lookup_value")
      .populate("ClinicalDiagnoses.InvestigationCategory", "lookup_value")
      .populate("ClinicalDiagnoses.Investigation", "lookup_value")
      .populate("ClinicalDiagnoses.Abnormalities", "lookup_value")
      .populate("MedicinesPrescribed.Medicines.MedicineName", "lookup_value")
      .populate("MedicinesPrescribed.Medicines.Dosage", "lookup_value")
      .populate("MedicinesPrescribed.RecoveryCycle.Unit", "lookup_value")
      .populate("Therapies.TherapyName", "lookup_value")
      // .populate("Therapies.PatientResponse", "lookup_value")
      .populate("SurgeriesProcedures.MedicalSpeciality", "lookup_value")
      .populate("SurgeriesProcedures.SurgeryProcedureName", "lookup_value")
      // .populate('SurgeriesProcedures.AnaesthesiaType', 'lookup_value')
      .populate("SurgeriesProcedures.RecoveryCycle.Unit", "lookup_value")
      .populate("SurgeriesProcedures.PostSurgeryComplications", "lookup_value")
      .populate("PatientId", "Name PatientId PhoneNumber")
      .populate("CreatedBy", "Name")
      .populate("UpdatedBy", "Name")
      .sort({ createdAt: -1 })
  );
};

// Method to update status
MedicalHistorySchema.methods.updateStatus = function (newStatus) {
  this.Status = newStatus;
  return this.save();
};

// Static method to find past illnesses (resolved/cured)
MedicalHistorySchema.statics.findPastIllnesses = function (patientId) {
  return this.find({
    PatientId: patientId,
    Status: { $in: ["Resolved", "Cured"] },
    IsDeleted: false,
  })
    .populate("DoctorHospitalInfo.MedicalSpeciality", "lookup_value")
    .populate("ChiefComplaints.Symptoms", "lookup_value")
    .populate("ChiefComplaints.SeverityGrade", "lookup_value")
    .populate("ClinicalDiagnoses.InvestigationCategory", "lookup_value")
    .populate("ClinicalDiagnoses.Investigation", "lookup_value")
    .populate("MedicinesPrescribed.Medicines.MedicineName", "lookup_value")
    .populate("Therapies.TherapyName", "lookup_value")
    .populate("SurgeriesProcedures.SurgeryProcedureName", "lookup_value")
    .sort({ "DoctorHospitalInfo.Date": -1 });
};

// Static method to find present/active illnesses
MedicalHistorySchema.statics.findPresentIllnesses = function (patientId) {
  return this.find({
    PatientId: patientId,
    Status: {
      $in: ["Active", "Ongoing", "In-Treatment", "Monitoring", "Chronic"],
    },
    IsDeleted: false,
  })
    .populate("DoctorHospitalInfo.MedicalSpeciality", "lookup_value")
    .populate("ChiefComplaints.Symptoms", "lookup_value")
    .populate("ChiefComplaints.SeverityGrade", "lookup_value")
    .populate("ClinicalDiagnoses.InvestigationCategory", "lookup_value")
    .populate("ClinicalDiagnoses.Investigation", "lookup_value")
    .populate("MedicinesPrescribed.Medicines.MedicineName", "lookup_value")
    .populate("Therapies.TherapyName", "lookup_value")
    .populate("SurgeriesProcedures.SurgeryProcedureName", "lookup_value")
    .sort({ "DoctorHospitalInfo.Date": -1 });
};

// Static method to find chronic conditions
MedicalHistorySchema.statics.findChronicConditions = function (patientId) {
  return this.find({
    PatientId: patientId,
    Status: "Chronic",
    IsDeleted: false,
  })
    .populate("ChiefComplaints.Symptoms", "lookup_value")
    .populate("MedicinesPrescribed.Medicines.MedicineName", "lookup_value")
    .sort({ createdAt: -1 });
};

// Helper static method to get lookup data by type
MedicalHistorySchema.statics.getLookupsByType = function (lookupType) {
  const AdminLookups = mongoose.model("admin_lookups");
  return AdminLookups.find({
    lookup_type: lookupType,
    is_active: true,
  }).sort({ sort_order: 1, lookup_value: 1 });
};

// Static method to find by symptom
MedicalHistorySchema.statics.findBySymptom = function (symptomId) {
  return this.find({
    "ChiefComplaints.Symptoms": symptomId,
    IsDeleted: false,
  })
    .populate("PatientId", "Name PatientId")
    .populate("ChiefComplaints.Symptoms", "lookup_value");
};

// Static method to find by medication
MedicalHistorySchema.statics.findByMedication = function (medicationId) {
  return this.find({
    "MedicinesPrescribed.Medicines.MedicineName": medicationId,
    IsDeleted: false,
  })
    .populate("PatientId", "Name PatientId")
    .populate("MedicinesPrescribed.Medicines.MedicineName", "lookup_value");
};

// Static method to find by surgery/procedure
MedicalHistorySchema.statics.findBySurgery = function (procedureId) {
  return this.find({
    "SurgeriesProcedures.SurgeryProcedureName": procedureId,
    IsDeleted: false,
  })
    .populate("PatientId", "Name PatientId")
    .populate("SurgeriesProcedures.SurgeryProcedureName", "lookup_value");
};

// Static method to get all medical history summary for a patient
MedicalHistorySchema.statics.getPatientMedicalSummary = function (patientId) {
  return this.aggregate([
    {
      $match: {
        PatientId: mongoose.Types.ObjectId(patientId),
        IsDeleted: false,
      },
    },
    {
      $group: {
        _id: "$PatientId",
        totalRecords: { $sum: 1 },
        activeIllnesses: {
          $sum: {
            $cond: [
              {
                $in: [
                  "$Status",
                  ["Active", "Ongoing", "In-Treatment", "Monitoring"],
                ],
              },
              1,
              0,
            ],
          },
        },
        chronicConditions: {
          $sum: {
            $cond: [{ $eq: ["$Status", "Chronic"] }, 1, 0],
          },
        },
        resolvedIllnesses: {
          $sum: {
            $cond: [{ $in: ["$Status", ["Resolved", "Cured"]] }, 1, 0],
          },
        },
        totalSurgeries: {
          $sum: { $size: { $ifNull: ["$SurgeriesProcedures", []] } },
        },
        latestVisit: { $max: "$DoctorHospitalInfo.Date" },
      },
    },
  ]);
};

// Ensure virtuals are included in JSON
MedicalHistorySchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.id;
    return ret;
  },
});

module.exports = mongoose.model("medical_history", MedicalHistorySchema);