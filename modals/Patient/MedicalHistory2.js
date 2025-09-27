const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// // Doctor/Hospital Info Schema
// const DoctorHospitalInfoSchema = new Schema(
//   {
//     Date: Date,
//     DoctorName: { type: String, trim: true },
//     DoctorNumber: { type: String, trim: true },
//     HospitalName: { type: String, trim: true },
//     HospitalLocation: { type: String, trim: true },
//     MedicalSpeciality: { type: Schema.Types.ObjectId, ref: "admin_lookups" },
//   },
//   {
//     _id: true,
//     timestamps: true,
//   }
// );

// Duration Schema
const DurationSchema = new Schema(
  {
    Value: Number,
    Unit: { type: Schema.Types.ObjectId, ref: "admin_lookups" },
  },
  {
    // _id: true,
    // timestamps: true,
  }
);

// Chief Complaint Schema
const ChiefComplaintSchema = new Schema(
  {
    Symptoms: [{ type: Schema.Types.ObjectId, ref: "admin_lookups" }],
    Duration: DurationSchema,
    SeverityGrade: { type: Number, enum: [1, 2, 3, 4, 5, 6], required: true },
    AggravatingFactors: [{ type: Schema.Types.ObjectId, ref: "admin_lookups" }],
  },
  {
    _id: true,
    timestamps: true,
  }
);

// Clinical Diagnosis Schema
const ClinicalDiagnosisSchema = new Schema(
  {
    Date: Date,
    InvestigationCategory: {
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
    },
    Investigation: { type: Schema.Types.ObjectId, ref: "admin_lookups" },
    Abnormalities: [{ type: Schema.Types.ObjectId, ref: "admin_lookups" }],
    ReportUrl: { type: String, trim: true },
    InterpretationUrl: { type: String, trim: true },
  },
  {
    _id: true,
    timestamps: true,
  }
);

// Medicine Schema
const MedicineSchema = new Schema(
  {
    MedicineName: { type: Schema.Types.ObjectId, ref: "admin_lookups" },
    Dosage: { type: Schema.Types.ObjectId, ref: "admin_lookups" },
    DurationInDays: { type: Number, min: 0 },
  },
  {
    _id: true,
    timestamps: true,
  }
);

// Medicines Prescribed Schema
const MedicinesPrescribedSchema = new Schema(
  {
    Medicines: [MedicineSchema],
    RecoveryCycle: DurationSchema,
    PrescriptionUrls: [{ type: String, trim: true }],
  },
  {
    _id: true,
    timestamps: true,
  }
);

// Therapy Schema
const TherapySchema = new Schema(
  {
    TherapyName: { type: Schema.Types.ObjectId, ref: "admin_lookups" },
    PatientResponse: {
      // type: Schema.Types.ObjectId,
      // ref: "admin_lookups",
      type: String,
      // enum: ["Good", "Average", "Poor"],
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

// Surgery/Procedure Schema
const SurgeryProcedureSchema = new Schema(
  {
    Date: Date,
    HospitalClinicName: { type: String, trim: true },
    SurgeonName: { type: String, trim: true },
    SurgeonNumber: { type: String, trim: true },
    MedicalSpeciality: { type: Schema.Types.ObjectId, ref: "admin_lookups" },
    SurgeryProcedureName: { type: Schema.Types.ObjectId, ref: "admin_lookups" },
    AnaesthesiaType: { type: String, enum: ["General", "Local"] },
    BloodTransfusionNeeded: { type: Boolean, default: false },
    RecoveryCycle: DurationSchema,
    PostSurgeryComplications: [{ type: Schema.Types.ObjectId, ref: "admin_lookups" }],
    DischargeSummaryUrlNote: { type: String, trim: true },
  },
  {
    _id: true,
    timestamps: true,
  }
);

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
      type: Schema.Types.ObjectId,
      ref: "patient_master",
      required: true,
      index: true,
    },
    // DoctorHospitalInfo: DoctorHospitalInfoSchema,
    ChiefComplaints: [ChiefComplaintSchema],
    ClinicalDiagnoses: [ClinicalDiagnosisSchema],
    MedicinesPrescribed: MedicinesPrescribedSchema,
    Therapies: [TherapySchema],
    SurgeriesProcedures: [SurgeryProcedureSchema],
    Status: {
      type: String,
      enum: ["Active", "Ongoing", "In-Treatment", "Monitoring", "Chronic", "Resolved", "Cured", "Past"],
      default: "Active",
    },
    Notes: { type: String, trim: true },
    IsActive: { type: Boolean, default: true },
    IsDeleted: { type: Boolean, default: false },
    CreatedBy: { type: Schema.Types.ObjectId, ref: "asset_master",
      //  required: true
       },
    UpdatedBy: { type: Schema.Types.ObjectId, ref: "asset_master" },
  },
  { timestamps: true }
);

// Add indexes for better query performance
MedicalHistorySchema.index({ CaseFileId: 1, IsDeleted: 1 });
MedicalHistorySchema.index({ PatientId: 1, IsDeleted: 1 });


// Add virtual properties
MedicalHistorySchema.virtual("IsPastIllness").get(function () {
  return ["Resolved", "Cured", "Past"].includes(this.Status);
});

MedicalHistorySchema.virtual("IsPresentIllness").get(function () {
  return ["Active", "Ongoing", "In-Treatment", "Monitoring", "Chronic"].includes(this.Status);
});

// Add additional indexes
MedicalHistorySchema.index({ PatientId: 1, Status: 1 });
MedicalHistorySchema.index({ PatientId: 1, createdAt: -1 });
// MedicalHistorySchema.index({ "DoctorHospitalInfo.Date": -1 });
MedicalHistorySchema.index({ Status: 1 });

// Add static methods
MedicalHistorySchema.statics.findByPatient = function (patientId, includeDeleted = false) {
  const query = { PatientId: patientId };
  if (!includeDeleted) query.IsDeleted = false;
  
  return this.find(query)
    // .populate("DoctorHospitalInfo.MedicalSpeciality", "lookup_value")
    .populate("ChiefComplaints.Symptoms", "lookup_value")
    .populate("ChiefComplaints.Duration.Unit", "lookup_value")
    .populate("ClinicalDiagnoses.InvestigationCategory", "lookup_value")
    .populate("ClinicalDiagnoses.Investigation", "lookup_value")
    .populate("MedicinesPrescribed.Medicines.MedicineName", "lookup_value")
    .populate("MedicinesPrescribed.Medicines.Dosage", "lookup_value")
    .populate("Therapies.TherapyName", "lookup_value")
    .populate("PatientId", "Name PatientId PhoneNumber")
    .populate("CreatedBy", "Name")
    .populate("UpdatedBy", "Name")
    .sort({ createdAt: -1 });
};

// Add method to update status
MedicalHistorySchema.methods.updateStatus = function (newStatus) {
  this.Status = newStatus;
  return this.save();
};

// Add patient summary aggregation
MedicalHistorySchema.statics.getPatientMedicalSummary = function (patientId) {
  return this.aggregate([
    {
      $match: {
        PatientId: mongoose.Types.ObjectId(patientId),
        IsDeleted: false,
      }
    },
    {
      $group: {
        _id: "$PatientId",
        totalRecords: { $sum: 1 },
        activeIllnesses: {
          $sum: {
            $cond: [
              { $in: ["$Status", ["Active", "Ongoing", "In-Treatment", "Monitoring"]] },
              1,
              0
            ]
          }
        },
        chronicConditions: {
          $sum: { $cond: [{ $eq: ["$Status", "Chronic"] }, 1, 0] }
        },
        resolvedIllnesses: {
          $sum: { $cond: [{ $in: ["$Status", ["Resolved", "Cured"]] }, 1, 0] }
        },
        totalSurgeries: {
          $sum: { $size: { $ifNull: ["$SurgeriesProcedures", []] } }
        },
        latestVisit: { $max: "$DoctorHospitalInfo.Date" }
      }
    }
  ]);
};

// Enable virtuals in JSON
MedicalHistorySchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.id;
    return ret;
  }
});

module.exports = mongoose.model("medical_history2", MedicalHistorySchema);
