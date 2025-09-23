const mongoose = require("mongoose");
const { Schema } = mongoose;

// PATIENT MEDICAL SUMMARY SCHEMA - Separate collection for scalability
const PatientMedicalSummarySchema = new Schema(
  {
    // PATIENT REFERENCE
    PatientId: {
      type: Schema.Types.ObjectId,
      ref: "patient_master",
      required: true,
      unique: true,  // One medical summary per patient
      index: true,
    },

    // 3. MEDICAL SUMMARY (Exactly matching original structure)
    // a. Past Illness (Multiple Selection) - lookup_type: "DISEASE"
    PastIllness: [
      {
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },
    ],

    // b. Past Surgeries (Multiple Selection) - lookup_type: "PROCEDURE"
    PastSurgeries: [
      {
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },
    ],

    // c. Past Accidents/Trauma (Multiple Selection) - lookup_type: "TRAUMA"
    PastAccidentsTrauma: [
      {
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },
    ],

    // d. Known Allergies (Multiple Selection) - lookup_type: "ALLERGY"
    KnownAllergies: [
      {
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },
    ],

    // e. Past Medications (Multiple with Add More)
    PastMedications: [
      {
        // i. Medicines (Autocomplete) - lookup_type: "SALT"
        Medicines: {
          type: Schema.Types.ObjectId,
          ref: "admin_lookups",
        },

        // ii. Dosage (Autocomplete) - lookup_type: "DOSAGE"
        Dosage: {
          type: Schema.Types.ObjectId,
          ref: "admin_lookups",
        },

        // iii. Frequency (Single Selection) - lookup_type: "MEDICINE_FREQUENCY"
        Frequency: {
          type: Schema.Types.ObjectId,
          ref: "admin_lookups",
        },

        // iv. Therapies (Autocomplete) - lookup_type: "THERAPY"
        Therapies: {
          type: Schema.Types.ObjectId,
          ref: "admin_lookups",
        },

        CreatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // f. Occupational Profile (Multiple Selection) - lookup_type: "OCCUPATION"
    OccupationalProfile: [
      {
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },
    ],

    // g. Habits & Lifestyles (Multiple Selection) - lookup_type: "HABITS"
    HabitsLifestyles: [
      {
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },
    ],

    // h. Family History (Multiple Selection) - lookup_type: "DISEASE"
    FamilyHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },
    ],

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
PatientMedicalSummarySchema.index({ PatientId: 1 });
PatientMedicalSummarySchema.index({ IsActive: 1, IsDeleted: 1 });
PatientMedicalSummarySchema.index({ "PastIllness": 1 });
PatientMedicalSummarySchema.index({ "KnownAllergies": 1 });

// STATIC METHODS
PatientMedicalSummarySchema.statics.findByPatientId = function (patientId) {
  return this.findOne({ 
    PatientId: patientId, 
    IsActive: true, 
    IsDeleted: false 
  })
  .populate("PastIllness", "lookup_value")
  .populate("PastSurgeries", "lookup_value")
  .populate("PastAccidentsTrauma", "lookup_value")
  .populate("KnownAllergies", "lookup_value")
  .populate("PastMedications.Medicines", "lookup_value")
  .populate("PastMedications.Dosage", "lookup_value")
  .populate("PastMedications.Frequency", "lookup_value")
  .populate("PastMedications.Therapies", "lookup_value")
  .populate("OccupationalProfile", "lookup_value")
  .populate("HabitsLifestyles", "lookup_value")
  .populate("FamilyHistory", "lookup_value");
};

PatientMedicalSummarySchema.statics.findOrCreate = async function (patientId, createdBy) {
  let summary = await this.findOne({ PatientId: patientId });
  
  if (!summary) {
    summary = await this.create({
      PatientId: patientId,
      CreatedBy: createdBy,
      PastIllness: [],
      PastSurgeries: [],
      PastAccidentsTrauma: [],
      KnownAllergies: [],
      PastMedications: [],
      OccupationalProfile: [],
      HabitsLifestyles: [],
      FamilyHistory: []
    });
  }
  
  return summary;
};

// METHODS
PatientMedicalSummarySchema.methods.addPastMedication = function (medicationData) {
  this.PastMedications.push(medicationData);
  return this.save();
};

PatientMedicalSummarySchema.methods.hasAllergies = function () {
  return this.KnownAllergies && this.KnownAllergies.length > 0;
};

PatientMedicalSummarySchema.methods.getAllergyCount = function () {
  return this.KnownAllergies ? this.KnownAllergies.length : 0;
};

module.exports = mongoose.model("patient_medical_summary", PatientMedicalSummarySchema);