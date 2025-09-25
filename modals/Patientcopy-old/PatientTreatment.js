const mongoose = require("mongoose");
const { Schema } = mongoose;

// PATIENT TREATMENT SCHEMA - Separate collection for scalability
const PatientTreatmentSchema = new Schema(
  {
    // PATIENT REFERENCE
    PatientId: {
      type: Schema.Types.ObjectId,
      ref: "patient_master",
      required: true,
      unique: true,  // One treatment record per patient
      index: true,
    },

    // 8. TREATMENT TO DATE (Exactly matching original structure)
    // a-d. Medicines (Multiple with Add More)
    Medicines: [
      {
        // a. Medicines (Autocomplete) - lookup_type: "SALT"
        Medicine: {
          type: Schema.Types.ObjectId,
          ref: "admin_lookups",
        },

        // b. Dosage (Autocomplete) - lookup_type: "DOSAGE"
        Dosage: {
          type: Schema.Types.ObjectId,
          ref: "admin_lookups",
        },

        // c. Frequency (Single Selection) - lookup_type: "MEDICINE_FREQUENCY"
        Frequency: {
          type: Schema.Types.ObjectId,
          ref: "admin_lookups",
        },

        CreatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // e. Surgery/Procedure (Multiple Selection - Autocomplete) - lookup_type: "PROCEDURE"
    SurgeryProcedure: [
      {
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },
    ],

    // f. Therapy (Multiple Selection - Autocomplete) - lookup_type: "THERAPY"
    Therapy: [
      {
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },
    ],

    // g. Lifestyle Interventions (Multiple Selection - Autocomplete) - lookup_type: "LIFESTYLE_INTERVENTION"
    LifestyleInterventions: [
      {
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },
    ],

    // h. Patient's Response
    PatientResponse: {
      type: String,
      trim: true,
    },

    // i. Clinical Note
    ClinicalNote: {
      type: String,
      trim: true,
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
PatientTreatmentSchema.index({ PatientId: 1 });
PatientTreatmentSchema.index({ IsActive: 1, IsDeleted: 1 });
PatientTreatmentSchema.index({ "Medicines.Medicine": 1 });

// STATIC METHODS
PatientTreatmentSchema.statics.findByPatientId = function (patientId) {
  return this.findOne({ 
    PatientId: patientId, 
    IsActive: true, 
    IsDeleted: false 
  })
  .populate("Medicines.Medicine", "lookup_value")
  .populate("Medicines.Dosage", "lookup_value")
  .populate("Medicines.Frequency", "lookup_value")
  .populate("SurgeryProcedure", "lookup_value")
  .populate("Therapy", "lookup_value")
  .populate("LifestyleInterventions", "lookup_value");
};

PatientTreatmentSchema.statics.findOrCreate = async function (patientId, createdBy) {
  let treatment = await this.findOne({ PatientId: patientId });
  
  if (!treatment) {
    treatment = await this.create({
      PatientId: patientId,
      CreatedBy: createdBy,
      Medicines: [],
      SurgeryProcedure: [],
      Therapy: [],
      LifestyleInterventions: []
    });
  }
  
  return treatment;
};

PatientTreatmentSchema.statics.findByMedication = function (medicationId) {
  return this.find({
    "Medicines.Medicine": medicationId,
    IsActive: true,
    IsDeleted: false
  }).populate("PatientId", "Name PatientId");
};

// METHODS
PatientTreatmentSchema.methods.addMedicine = function (medicineData) {
  this.Medicines.push(medicineData);
  return this.save();
};

PatientTreatmentSchema.methods.removeMedicine = function (medicineId) {
  this.Medicines = this.Medicines.filter(
    m => m.Medicine.toString() !== medicineId.toString()
  );
  return this.save();
};

PatientTreatmentSchema.methods.getCurrentMedications = function () {
  // Return only recent medications (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.Medicines.filter(m => 
    m.CreatedAt > thirtyDaysAgo
  );
};

PatientTreatmentSchema.methods.hasActiveTreatment = function () {
  return (this.Medicines && this.Medicines.length > 0) ||
         (this.Therapy && this.Therapy.length > 0) ||
         (this.SurgeryProcedure && this.SurgeryProcedure.length > 0);
};

module.exports = mongoose.model("patient_treatment", PatientTreatmentSchema);