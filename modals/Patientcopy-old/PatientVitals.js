const mongoose = require("mongoose");
const { Schema } = mongoose;

// PATIENT VITALS/PHYSICAL EXAMINATIONS SCHEMA - Separate collection for scalability
const PatientVitalsSchema = new Schema(
  {
    // PATIENT REFERENCE
    PatientId: {
      type: Schema.Types.ObjectId,
      ref: "patient_master",
      required: true,
      index: true,
    },

    // 5. VITALS/PHYSICAL EXAMINATIONS (Exactly matching original structure)
    // a. Parameter (Single Selection - Investigation Category = "VITAL PARAMETER")
    Parameter: {
      type: Schema.Types.ObjectId,
      ref: "investigation_master",
    },

    // b. Value (Numerical Value)
    Value: {
      type: Number,
    },

    // c. Abnormalities (Multiple Selection from Investigation Master)
    Abnormalities: [
      {
        type: String,
        trim: true,
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
PatientVitalsSchema.index({ PatientId: 1, CreatedAt: -1 });
PatientVitalsSchema.index({ Parameter: 1 });
PatientVitalsSchema.index({ IsActive: 1, IsDeleted: 1 });

// STATIC METHODS
PatientVitalsSchema.statics.findByPatientId = function (patientId, limit = 200) {
  return this.find({ 
    PatientId: patientId, 
    IsActive: true, 
    IsDeleted: false 
  })
  .sort({ CreatedAt: -1 })
  .limit(limit)
  .populate("Parameter", "InvestigationName");
};

PatientVitalsSchema.statics.findLatestVitals = function (patientId, limit = 10) {
  return this.find({ 
    PatientId: patientId, 
    IsActive: true, 
    IsDeleted: false 
  })
  .sort({ CreatedAt: -1 })
  .limit(limit)
  .populate("Parameter", "InvestigationName");
};

PatientVitalsSchema.statics.findAbnormalVitals = function (patientId) {
  return this.find({ 
    PatientId: patientId,
    'Abnormalities.0': { $exists: true },
    IsActive: true, 
    IsDeleted: false 
  })
  .sort({ CreatedAt: -1 })
  .populate("Parameter", "InvestigationName");
};

PatientVitalsSchema.statics.findByParameter = function (patientId, parameterId, limit = 50) {
  return this.find({ 
    PatientId: patientId,
    Parameter: parameterId,
    IsActive: true, 
    IsDeleted: false 
  })
  .sort({ CreatedAt: -1 })
  .limit(limit);
};

// METHODS
PatientVitalsSchema.methods.isAbnormal = function () {
  return this.Abnormalities && this.Abnormalities.length > 0;
};

module.exports = mongoose.model("patient_vitals", PatientVitalsSchema);