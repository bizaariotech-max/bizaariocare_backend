const mongoose = require("mongoose");
const { Schema } = mongoose;

// PATIENT DIAGNOSIS SCHEMA - Separate collection for scalability
const PatientDiagnosisSchema = new Schema(
  {
    // PATIENT REFERENCE
    PatientId: {
      type: Schema.Types.ObjectId,
      ref: "patient_master",
      required: true,
      index: true,
    },

    // 7. DIAGNOSIS (Exactly matching original structure)
    // a. Current Diagnosis (Single Selection) - lookup_type: "DIAGNOSIS"
    CurrentDiagnosis: {
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
    },

    // b. Type of Diagnosis (Single Selection) - lookup_type: "DIAGNOSIS_TYPE"
    TypeOfDiagnosis: {
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
    },

    // c. Clinical Note (Input)
    ClinicalNote: {
      type: String,
      trim: true,
    },

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
PatientDiagnosisSchema.index({ PatientId: 1, CreatedAt: -1 });
PatientDiagnosisSchema.index({ CurrentDiagnosis: 1 });
PatientDiagnosisSchema.index({ TypeOfDiagnosis: 1 });
PatientDiagnosisSchema.index({ IsActive: 1, IsDeleted: 1 });

// STATIC METHODS
PatientDiagnosisSchema.statics.findByPatientId = function (patientId, limit = 100) {
  return this.find({ 
    PatientId: patientId, 
    IsActive: true, 
    IsDeleted: false 
  })
  .sort({ CreatedAt: -1 })
  .limit(limit)
  .populate("CurrentDiagnosis", "lookup_value")
  .populate("TypeOfDiagnosis", "lookup_value");
};

PatientDiagnosisSchema.statics.getLatestDiagnosis = function (patientId) {
  return this.findOne({ 
    PatientId: patientId, 
    IsActive: true, 
    IsDeleted: false 
  })
  .sort({ CreatedAt: -1 })
  .populate("CurrentDiagnosis", "lookup_value")
  .populate("TypeOfDiagnosis", "lookup_value");
};

PatientDiagnosisSchema.statics.findByDiagnosis = function (diagnosisId) {
  return this.find({
    CurrentDiagnosis: diagnosisId,
    IsActive: true,
    IsDeleted: false
  }).populate("PatientId", "Name PatientId");
};

PatientDiagnosisSchema.statics.findByType = function (patientId, typeId) {
  return this.find({ 
    PatientId: patientId,
    TypeOfDiagnosis: typeId,
    IsActive: true, 
    IsDeleted: false 
  })
  .sort({ CreatedAt: -1 })
  .populate("CurrentDiagnosis", "lookup_value");
};

// METHODS
PatientDiagnosisSchema.methods.getDiagnosisAge = function () {
  if (!this.CreatedAt) return 0;
  const days = Math.floor((Date.now() - this.CreatedAt.getTime()) / (1000 * 60 * 60 * 24));
  return days;
};

module.exports = mongoose.model("patient_diagnosis", PatientDiagnosisSchema);