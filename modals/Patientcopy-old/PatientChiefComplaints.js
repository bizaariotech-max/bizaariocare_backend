const mongoose = require("mongoose");
const { Schema } = mongoose;

// PATIENT CHIEF COMPLAINTS SCHEMA - Separate collection for scalability
const PatientChiefComplaintsSchema = new Schema(
  {
    // PATIENT REFERENCE
    PatientId: {
      type: Schema.Types.ObjectId,
      ref: "patient_master",
      required: true,
      index: true,
    },

    // CHIEF COMPLAINT DATA (Exactly matching original structure)
    // a. Symptom Class (Multiple Selection) - lookup_type: "SYMPTOM_CLASS"
    SymptomClass: [
      {
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },
    ],

    // b. Complaint (Single Selection - filtered by Symptom Class) - lookup_type: "SYMPTOM"
    Complaint: {
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
    },

    // c. Duration (Months)
    Duration: {
      type: Number,
      min: 0,
    },

    // d. Severity Grade (5 color grades)
    SeverityGrade: {
      type: Number,
      min: 1,
      max: 5,
      enum: [1, 2, 3, 4, 5],
    },

    // e. Aggravating Factors (Multiple Selection) - lookup_type: "AGGRAVATING_FACTOR"
    AggravatingFactors: [
      {
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },
    ],

    // f. Current Medications (Autocomplete) - lookup_type: "PHARMACEUTICAL_SALT"
    CurrentMedications: {
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
    },

    // g. Dosage (Autocomplete) - lookup_type: "DOSAGE"
    Dosage: {
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
    },

    // h. Frequency (Single Selection) - lookup_type: "MEDICINE_FREQUENCY"
    Frequency: {
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
    },

    // i. Current Therapies (Autocomplete) - lookup_type: "THERAPY"
    CurrentTherapies: {
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
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
PatientChiefComplaintsSchema.index({ PatientId: 1, CreatedAt: -1 });
PatientChiefComplaintsSchema.index({ SeverityGrade: 1 });
PatientChiefComplaintsSchema.index({ Complaint: 1 });
PatientChiefComplaintsSchema.index({ IsActive: 1, IsDeleted: 1 });

// STATIC METHODS
PatientChiefComplaintsSchema.statics.findByPatientId = function (patientId, limit = 100) {
  return this.find({ 
    PatientId: patientId, 
    IsActive: true, 
    IsDeleted: false 
  })
  .sort({ CreatedAt: -1 })
  .limit(limit)
  .populate("SymptomClass", "lookup_value")
  .populate("Complaint", "lookup_value")
  .populate("AggravatingFactors", "lookup_value")
  .populate("CurrentMedications", "lookup_value")
  .populate("Dosage", "lookup_value")
  .populate("Frequency", "lookup_value")
  .populate("CurrentTherapies", "lookup_value");
};

PatientChiefComplaintsSchema.statics.findSevereComplaints = function (patientId) {
  return this.find({ 
    PatientId: patientId,
    SeverityGrade: { $gte: 4 },
    IsActive: true, 
    IsDeleted: false 
  })
  .sort({ SeverityGrade: -1, CreatedAt: -1 })
  .populate("Complaint", "lookup_value");
};

module.exports = mongoose.model("patient_chief_complaints", PatientChiefComplaintsSchema);