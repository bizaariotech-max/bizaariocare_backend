const mongoose = require("mongoose");
const { Schema } = mongoose;

// PATIENT CLINICAL FINDINGS SCHEMA - Separate collection for scalability
const PatientClinicalFindingsSchema = new Schema(
  {
    // PATIENT REFERENCE
    PatientId: {
      type: Schema.Types.ObjectId,
      ref: "patient_master",
      required: true,
      index: true,
    },

    // 4. CLINICAL FINDINGS (Exactly matching original structure)
    // a. Symptoms (Single Selection) - lookup_type: "SYMPTOM"
    Symptoms: {
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
    },

    // b. Duration (Months)
    Duration: {
      type: Number,
      min: 0,
    },

    // c. Severity Grade (5 color grades)
    SeverityGrade: {
      type: Number,
      min: 1,
      max: 5,
      enum: [1, 2, 3, 4, 5],
    },

    // d. Aggravating Factors (Multiple Selection) - lookup_type: "AGGRAVATING_FACTOR"
    AggravatingFactors: [
      {
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },
    ],

    CreatedAt: {
      type: Date,
      default: Date.now,
    },

    // SYSTEM FIELDS
    CreatedBy: {
      type: Schema.Types.ObjectId,
      ref: "asset_master",
    },

    UpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: "asset_master",
    },

    IsActive: {
      type: Boolean,
      default: true,
    },

    IsDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// INDEXES FOR PERFORMANCE
PatientClinicalFindingsSchema.index({ PatientId: 1, CreatedAt: -1 });
PatientClinicalFindingsSchema.index({ SeverityGrade: 1 });
PatientClinicalFindingsSchema.index({ Symptoms: 1 });
PatientClinicalFindingsSchema.index({ IsActive: 1, IsDeleted: 1 });

// STATIC METHODS
PatientClinicalFindingsSchema.statics.findByPatientId = function (patientId, limit = 100) {
  return this.find({ 
    PatientId: patientId, 
    IsActive: true, 
    IsDeleted: false 
  })
  .sort({ CreatedAt: -1 })
  .limit(limit)
  .populate("Symptoms", "lookup_value")
  .populate("AggravatingFactors", "lookup_value");
};

PatientClinicalFindingsSchema.statics.findActiveFindings = function (patientId) {
  return this.find({ 
    PatientId: patientId,
    SeverityGrade: { $gte: 3 },
    IsActive: true, 
    IsDeleted: false 
  })
  .sort({ SeverityGrade: -1, CreatedAt: -1 })
  .populate("Symptoms", "lookup_value");
};

PatientClinicalFindingsSchema.statics.searchBySymptom = function (symptomId) {
  return this.find({
    Symptoms: symptomId,
    IsActive: true,
    IsDeleted: false
  }).populate("PatientId", "Name PatientId");
};

module.exports = mongoose.model("patient_clinical_findings", PatientClinicalFindingsSchema);