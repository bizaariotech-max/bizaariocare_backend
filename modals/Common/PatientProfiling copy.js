const mongoose = require("mongoose");
const { Schema } = mongoose;

// Severity color codes matching Figma design
const SEVERITY_COLORS = {
  1: '#107C42',  // Minimal - Dark Green
  2: '#92D14F',  // Mild - Light Green  
  3: '#FEFF99',  // Moderate - Yellow
  4: '#FFC001',  // Severe - Orange
  5: '#C00000'   // Critical - Red
};

// PATIENT PROFILING SCHEMA - Health Assessment Report
const PatientProfilingSchema = new Schema(
  {
    // REPORT METADATA
    ReportNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    
    AssessmentDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    
    ReportType: {
      type: String,
      enum: ['initial_assessment', 'follow_up', 'comprehensive', 'emergency'],
      default: 'comprehensive'
    },
    
    ReportStatus: {
      type: String,
      enum: ['draft', 'completed', 'reviewed', 'approved', 'archived'],
      default: 'draft',
      index: true
    },
    
    // 1. PATIENT ID & PROFILE
    PatientId: {
      type: Schema.Types.ObjectId,
      ref: "patient_master",
      index: true,
    },
    
    // Extended Patient Profile Information
    PatientProfile: {
      // Personal Information
      Nationality: {
        type: String,
        trim: true
      },
      CountryOfResidence: {
        type: String,
        trim: true  
      },
      BloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
      },
      ProfileImage: {
        type: String,
        trim: true
      },
      EmergencyContact: {
        Name: String,
        Phone: String,
        Relationship: String
      },
      InsuranceDetails: {
        Provider: String,
        PolicyNumber: String,
        ValidUntil: Date
      }
    },

    // 2. CHIEF COMPLAINTS (Multiple with Add more) - Enhanced with tracking
    ChiefComplaints: [
      {
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
        
        // Complaint Text (for free text entry)
        ComplaintText: {
          type: String,
          trim: true
        },

        // c. Duration (with unit)
        Duration: {
          type: Number,
          min: 0,
        },
        
        DurationUnit: {
          type: String,
          enum: ['hours', 'days', 'weeks', 'months', 'years'],
          default: 'days'
        },
        
        OnsetDate: {
          type: Date
        },

        // d. Severity Grade (5 color grades with color mapping)
        SeverityGrade: {
          type: Number,
          min: 1,
          max: 5,
          enum: [1, 2, 3, 4, 5],
        },
        
        // Status tracking
        Status: {
          type: String,
          enum: ['active', 'resolved', 'monitoring', 'referred'],
          default: 'active'
        },

        // e. Aggravating Factors (Multiple Selection) - lookup_type: "AGGRAVATING_FACTOR"
        AggravatingFactors: [
          {
            type: Schema.Types.ObjectId,
            ref: "admin_lookups",
          },
        ],
        
        // Relieving Factors
        RelievingFactors: [{
          type: String,
          trim: true
        }],
        
        // Associated Symptoms
        AssociatedSymptoms: [{
          type: String,
          trim: true  
        }],
        
        // Location and Radiation
        LocationDetails: {
          type: String,
          trim: true
        },
        
        RadiationPattern: {
          type: String,
          trim: true
        },

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
        
        // Clinical Outcome/Patient Response
        PatientResponse: {
          type: String,
          enum: ['excellent', 'good', 'satisfactory', 'poor', 'adverse_reaction', 'no_response', 'not_evaluated'],
          default: 'not_evaluated'
        },

        // i. Current Therapies (Autocomplete) - lookup_type: "THERAPY"
        CurrentTherapies: {
          type: Schema.Types.ObjectId,
          ref: "admin_lookups",
        },
        
        // Tracking Information
        AddedBy: {
          type: Schema.Types.ObjectId,
          ref: "asset_master",
        },
        
        Doctor: {
          type: Schema.Types.ObjectId,
          ref: "doctor",
        },
        
        Hospital: {
          type: Schema.Types.ObjectId,
          ref: "hospital",
        },

        CreatedAt: {
          type: Date,
          default: Date.now,
        },
        
        ResolvedAt: {
          type: Date
        }
      },
    ],

    // 3. MEDICAL SUMMARY - Enhanced with detailed tracking
    MedicalSummary: {
      // a. Past Illness (Enhanced with details)
      PastIllness: [
        {
          Illness: {
            type: Schema.Types.ObjectId,
            ref: "admin_lookups",
          },
          IllnessName: {
            type: String,
            trim: true
          },
          DiagnosisDate: {
            type: Date
          },
          RecoveryDate: {
            type: Date  
          },
          Severity: {
            type: String,
            enum: ['mild', 'moderate', 'severe', 'life_threatening']
          },
          TreatmentOutcome: {
            type: String,
            enum: ['fully_recovered', 'partially_recovered', 'ongoing_management', 'chronic_condition', 'complications_developed']
          },
          Status: {
            type: String,
            enum: ['resolved', 'ongoing', 'recurrent', 'in_remission'],
            default: 'resolved'
          },
          Complications: [String],
          ICDCode: String,
          AddedBy: {
            type: Schema.Types.ObjectId,
            ref: "asset_master"
          },
          AddedDate: {
            type: Date,
            default: Date.now
          }
        },
      ],

      // b. Past Surgeries (Enhanced with details)
      PastSurgeries: [
        {
          Surgery: {
            type: Schema.Types.ObjectId,
            ref: "admin_lookups",
          },
          SurgeryName: {
            type: String,
            trim: true
          },
          SurgeryDate: {
            type: Date
          },
          Indication: {
            type: String,
            trim: true
          },
          SurgeryType: {
            type: String,
            enum: ['elective', 'emergency', 'urgent', 'scheduled']
          },
          AnesthesiaType: {
            type: String,
            enum: ['general', 'regional', 'local', 'spinal', 'epidural', 'sedation']
          },
          Outcome: {
            type: String,
            enum: ['successful', 'successful_with_complications', 'partially_successful', 'unsuccessful']
          },
          Complications: [String],
          Hospital: {
            type: Schema.Types.ObjectId,
            ref: "hospital"
          },
          Surgeon: String,
          CPTCode: String,
          AddedBy: {
            type: Schema.Types.ObjectId,
            ref: "asset_master"
          },
          AddedDate: {
            type: Date,
            default: Date.now
          }
        },
      ],

      // c. Past Accidents/Trauma (Multiple Selection) - lookup_type: "TRAUMA"
      PastAccidentsTrauma: [
        {
          type: Schema.Types.ObjectId,
          ref: "admin_lookups",
        },
      ],

      // d. Known Allergies (Enhanced with severity and reactions)
      KnownAllergies: [
        {
          Allergen: {
            type: Schema.Types.ObjectId,
            ref: "admin_lookups",
          },
          AllergenName: {
            type: String,
            trim: true
          },
          AllergyType: {
            type: String,
            enum: ['drug', 'food', 'environmental', 'contact', 'insect', 'latex', 'pet', 'seasonal', 'other']
          },
          Severity: {
            type: String,
            enum: ['mild', 'moderate', 'severe', 'life_threatening'],
            required: true
          },
          ReactionTypes: [String],
          VerificationStatus: {
            type: String,
            enum: ['unconfirmed', 'confirmed', 'suspected', 'refuted'],
            default: 'confirmed'
          },
          FirstObserved: Date,
          LastReaction: Date,
          ManagementStrategies: [String],
          RequiresEpipen: {
            type: Boolean,
            default: false
          },
          AddedBy: {
            type: Schema.Types.ObjectId,
            ref: "asset_master"
          },
          AddedDate: {
            type: Date,
            default: Date.now
          }
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
    },

    // 4. CLINICAL FINDINGS
    ClinicalFindings: [
      {
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
      },
    ],

    // 5. VITALS/PHYSICAL EXAMINATIONS (Multiple with Add More)
    VitalsPhysicalExaminations: [
      {
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
      },
    ],

    // 6. DIAGNOSTICS/INVESTIGATIONS (Multiple with Add More)
    DiagnosticsInvestigations: [
      {
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
      },
    ],

    // 7. DIAGNOSIS (Multiple with Add More)
    Diagnosis: [
      {
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
      },
    ],

    // 8. TREATMENT TO DATE
    TreatmentToDate: {
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

// INDEXES
PatientProfilingSchema.index({ PatientId: 1 });
PatientProfilingSchema.index({ IsActive: 1, IsDeleted: 1 });
PatientProfilingSchema.index({ CreatedBy: 1 });
PatientProfilingSchema.index({ "ChiefComplaints.SymptomClass": 1 });
PatientProfilingSchema.index({ "ChiefComplaints.Complaint": 1 });
PatientProfilingSchema.index({ "MedicalSummary.PastIllness": 1 });
PatientProfilingSchema.index({ "ClinicalFindings.Symptoms": 1 });
PatientProfilingSchema.index({ "Diagnosis.CurrentDiagnosis": 1 });
PatientProfilingSchema.index({ "TreatmentToDate.Medicines.Medicine": 1 });

// VIRTUAL FIELDS
PatientProfilingSchema.virtual("TotalComplaints").get(function () {
  return this.ChiefComplaints ? this.ChiefComplaints.length : 0;
});

PatientProfilingSchema.virtual("TotalDiagnoses").get(function () {
  return this.Diagnosis ? this.Diagnosis.length : 0;
});

PatientProfilingSchema.virtual("TotalInvestigations").get(function () {
  return this.DiagnosticsInvestigations ? this.DiagnosticsInvestigations.length : 0;
});

// METHODS
PatientProfilingSchema.methods.getLatestDiagnosis = function () {
  if (!this.Diagnosis || this.Diagnosis.length === 0) return null;
  return this.Diagnosis.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt))[0];
};

PatientProfilingSchema.methods.getCurrentMedications = function () {
  if (!this.TreatmentToDate || !this.TreatmentToDate.Medicines) return [];
  return this.TreatmentToDate.Medicines;
};

PatientProfilingSchema.methods.getActiveClinicalFindings = function () {
  if (!this.ClinicalFindings) return [];
  return this.ClinicalFindings.filter(finding => finding.SeverityGrade >= 3);
};

// STATIC METHODS
PatientProfilingSchema.statics.findByPatientId = function (patientId) {
  return this.findOne({ PatientId: patientId, IsActive: true, IsDeleted: false })
    .populate("PatientId", "Name PatientId PhoneNumber")
    .populate("ChiefComplaints.SymptomClass", "lookup_value")
    .populate("ChiefComplaints.Complaint", "lookup_value")
    .populate("ChiefComplaints.AggravatingFactors", "lookup_value")
    .populate("ChiefComplaints.CurrentMedications", "lookup_value")
    .populate("ChiefComplaints.Dosage", "lookup_value")
    .populate("ChiefComplaints.Frequency", "lookup_value")
    .populate("ChiefComplaints.CurrentTherapies", "lookup_value")
    .populate("MedicalSummary.PastIllness", "lookup_value")
    .populate("MedicalSummary.PastSurgeries", "lookup_value")
    .populate("MedicalSummary.PastAccidentsTrauma", "lookup_value")
    .populate("MedicalSummary.KnownAllergies", "lookup_value")
    .populate("MedicalSummary.PastMedications.Medicines", "lookup_value")
    .populate("MedicalSummary.PastMedications.Dosage", "lookup_value")
    .populate("MedicalSummary.PastMedications.Frequency", "lookup_value")
    .populate("MedicalSummary.PastMedications.Therapies", "lookup_value")
    .populate("MedicalSummary.OccupationalProfile", "lookup_value")
    .populate("MedicalSummary.HabitsLifestyles", "lookup_value")
    .populate("MedicalSummary.FamilyHistory", "lookup_value")
    .populate("ClinicalFindings.Symptoms", "lookup_value")
    .populate("ClinicalFindings.AggravatingFactors", "lookup_value")
    .populate("VitalsPhysicalExaminations.Parameter", "InvestigationName")
    .populate("DiagnosticsInvestigations.InvestigationCategory", "lookup_value")
    .populate("DiagnosticsInvestigations.Investigation", "InvestigationName")
    .populate("Diagnosis.CurrentDiagnosis", "lookup_value")
    .populate("Diagnosis.TypeOfDiagnosis", "lookup_value")
    .populate("TreatmentToDate.Medicines.Medicine", "lookup_value")
    .populate("TreatmentToDate.Medicines.Dosage", "lookup_value")
    .populate("TreatmentToDate.Medicines.Frequency", "lookup_value")
    .populate("TreatmentToDate.SurgeryProcedure", "lookup_value")
    .populate("TreatmentToDate.Therapy", "lookup_value")
    .populate("TreatmentToDate.LifestyleInterventions", "lookup_value")
    .populate("CreatedBy", "Name")
    .populate("UpdatedBy", "Name");
};

PatientProfilingSchema.statics.searchBySymptom = function (symptomId) {
  return this.find({
    $or: [
      { "ChiefComplaints.Complaint": symptomId },
      { "ClinicalFindings.Symptoms": symptomId }
    ],
    IsActive: true,
    IsDeleted: false
  }).populate("PatientId", "Name PatientId");
};

PatientProfilingSchema.statics.findByDiagnosis = function (diagnosisId) {
  return this.find({
    "Diagnosis.CurrentDiagnosis": diagnosisId,
    IsActive: true,
    IsDeleted: false
  }).populate("PatientId", "Name PatientId");
};

PatientProfilingSchema.statics.findByMedication = function (medicationId) {
  return this.find({
    $or: [
      { "ChiefComplaints.CurrentMedications": medicationId },
      { "TreatmentToDate.Medicines.Medicine": medicationId }
    ],
    IsActive: true,
    IsDeleted: false
  }).populate("PatientId", "Name PatientId");
};

// Helper static method to get lookup data by type
PatientProfilingSchema.statics.getLookupsByType = function (lookupType) {
  const AdminLookups = mongoose.model("admin_lookups");
  return AdminLookups.find({
    lookup_type: lookupType,
    is_active: true
  }).sort({ sort_order: 1, lookup_value: 1 });
};

// PRE-SAVE MIDDLEWARE
PatientProfilingSchema.pre("save", function (next) {
  if (this.isNew) {
    this.CreatedAt = new Date();
  }
  this.UpdatedAt = new Date();
  next();
});

// PRE-UPDATE MIDDLEWARE
PatientProfilingSchema.pre(["updateOne", "findOneAndUpdate"], function (next) {
  this.set({ UpdatedAt: new Date() });
  next();
});

module.exports = mongoose.model("patient_profiling", PatientProfilingSchema);