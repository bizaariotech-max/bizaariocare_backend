const mongoose = require("mongoose");

// SYMPTOM MASTER SCHEMA
const SymptomMasterSchema = new mongoose.Schema(
  {
    // -------------------------
    // Core Fields
    // -------------------------
    SymptomClassTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin_lookups", // References symptom class from admin_lookups
    },
    SymptomName: {
      type: String,
      trim: true,
    },
    SymptomExplanation: {
      type: String,
      trim: true,
    },
    
    // -------------------------
    // Additional Fields for Medical Context
    // -------------------------
    SymptomCode: {
      type: String, // For medical coding systems like ICD-10
      trim: true,
    },
    Severity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin_lookups", // Mild, Moderate, Severe
    },
    CommonExamples: [{
      type: String, // Array of common patient descriptions
    }],
    RelatedSymptoms: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "symptom_master", // Self-referencing for related symptoms
    }],
    
    // -------------------------
    // Metadata Fields
    // -------------------------
    SortOrder: {
      type: Number,
      default: 0,
    },
    IsCommon: {
      type: Boolean,
      default: false, // Flag for commonly reported symptoms
    },
    RequiresUrgentCare: {
      type: Boolean,
      default: false, // Flag for symptoms requiring immediate attention
    },
    
    // -------------------------
    // System Fields
    // -------------------------
    IsActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
SymptomMasterSchema.index({ SymptomClassId: 1, IsActive: 1 });
SymptomMasterSchema.index({ SymptomName: 1 });
SymptomMasterSchema.index({ IsCommon: 1, IsActive: 1 });
SymptomMasterSchema.index({ RequiresUrgentCare: 1, IsActive: 1 });

module.exports = mongoose.model("symptom_master", SymptomMasterSchema);