const mongoose = require("mongoose");
const { Schema } = mongoose;

// PATIENT DIAGNOSTICS/INVESTIGATIONS SCHEMA - Separate collection for scalability
const PatientInvestigationsSchema = new Schema(
  {
    // PATIENT REFERENCE
    PatientId: {
      type: Schema.Types.ObjectId,
      ref: "patient_master",
      required: true,
      index: true,
    },

    // 6. DIAGNOSTICS/INVESTIGATIONS (Exactly matching original structure)
    // a. Investigation Category (Radio Button) - lookup_type: "INVESTIGATION_CATEGORY"
    InvestigationCategory: {
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
    },

    // b. Investigation (Single Selection - filtered by Investigation Category)
    Investigation: {
      type: Schema.Types.ObjectId,
      ref: "investigation_master",
    },

    // c. Value (Numerical Value)
    Value: {
      type: Number,
    },

    // d. Abnormalities (Multiple Selection)
    Abnormalities: [
      {
        type: String,
        trim: true,
      },
    ],

    // e. Upload (Investigation Report)
    InvestigationReport: {
      type: String,
      trim: true,
    },

    // f. Upload (Interpretation)
    Interpretation: {
      type: String,
      trim: true,
    },

    // g. URL (Google Drive Link)
    GoogleDriveURL: {
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
PatientInvestigationsSchema.index({ PatientId: 1, CreatedAt: -1 });
PatientInvestigationsSchema.index({ InvestigationCategory: 1 });
PatientInvestigationsSchema.index({ Investigation: 1 });
PatientInvestigationsSchema.index({ IsActive: 1, IsDeleted: 1 });

// STATIC METHODS
PatientInvestigationsSchema.statics.findByPatientId = function (patientId, limit = 200) {
  return this.find({ 
    PatientId: patientId, 
    IsActive: true, 
    IsDeleted: false 
  })
  .sort({ CreatedAt: -1 })
  .limit(limit)
  .populate("InvestigationCategory", "lookup_value")
  .populate("Investigation", "InvestigationName");
};

PatientInvestigationsSchema.statics.findByCategory = function (patientId, categoryId) {
  return this.find({ 
    PatientId: patientId,
    InvestigationCategory: categoryId, 
    IsActive: true, 
    IsDeleted: false 
  })
  .sort({ CreatedAt: -1 })
  .populate("Investigation", "InvestigationName");
};

PatientInvestigationsSchema.statics.findAbnormalInvestigations = function (patientId) {
  return this.find({ 
    PatientId: patientId,
    'Abnormalities.0': { $exists: true },
    IsActive: true, 
    IsDeleted: false 
  })
  .sort({ CreatedAt: -1 })
  .populate("InvestigationCategory", "lookup_value")
  .populate("Investigation", "InvestigationName");
};

PatientInvestigationsSchema.statics.findWithReports = function (patientId) {
  return this.find({ 
    PatientId: patientId,
    $or: [
      { InvestigationReport: { $exists: true, $ne: "" } },
      { GoogleDriveURL: { $exists: true, $ne: "" } }
    ],
    IsActive: true, 
    IsDeleted: false 
  })
  .sort({ CreatedAt: -1 })
  .populate("Investigation", "InvestigationName");
};

// METHODS
PatientInvestigationsSchema.methods.hasReport = function () {
  return !!(this.InvestigationReport || this.GoogleDriveURL);
};

PatientInvestigationsSchema.methods.isAbnormal = function () {
  return this.Abnormalities && this.Abnormalities.length > 0;
};

module.exports = mongoose.model("patient_investigations", PatientInvestigationsSchema);