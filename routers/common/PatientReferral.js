const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PatientReferralSchema = new Schema({
  // ==================== PATIENT REFERRAL TYPE ====================
  ReferralFor: {
    type: String,
    enum: ['SECOND_OPINION', 'MEDICAL_TOURISM', 'GENERAL_REFERRAL']
  },

  // ==================== PATIENT REFERENCE ====================
  PatientId: {
    type: Schema.Types.ObjectId,
    ref: 'PatientMaster' // Reference to Patient Master for dropdown selection
  },

  // ==================== REASON FOR REFERRAL ====================
  ReasonForReferral: {
    Reason: {
      type: Schema.Types.ObjectId,
      ref: 'ReasonForReferralMaster'
    },
    DoctorsRemarks: [{
      Remark: {
        type: String
      },
      CreatedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },

  // ==================== CHIEF COMPLAINTS ====================
  ChiefComplaints: [{
    SymptomClass: [{
      type: Schema.Types.ObjectId,
      ref: 'SymptomClassMaster'
    }],
    Complaint: {
      type: Schema.Types.ObjectId,
      ref: 'SymptomMaster'
    },
    DurationMonths: {
      type: Number
    },
    SeverityGrade: {
      type: Number,
      min: 1,
      max: 5
    },
    AggravatingFactors: [{
      type: Schema.Types.ObjectId,
      ref: 'AggravatingFactorMaster'
    }],
    CurrentMedications: {
      type: Schema.Types.ObjectId,
      ref: 'PharmaceuticalSaltMaster'
    },
    Dosage: {
      type: Schema.Types.ObjectId,
      ref: 'DosageMaster'
    },
    Frequency: {
      type: Schema.Types.ObjectId,
      ref: 'MedicineFrequencyMaster'
    },
    CurrentTherapies: {
      type: Schema.Types.ObjectId,
      ref: 'TherapyMaster'
    }
  }],

  // ==================== MEDICAL SUMMARY ====================
  MedicalSummary: {
    PastIllness: [{
      type: Schema.Types.ObjectId,
      ref: 'DiseaseMaster'
    }],
    PastSurgeries: [{
      type: Schema.Types.ObjectId,
      ref: 'ProcedureMaster'
    }],
    PastAccidentsTrauma: [{
      type: Schema.Types.ObjectId,
      ref: 'TraumaMaster'
    }],
    KnownAllergies: [{
      type: Schema.Types.ObjectId,
      ref: 'AllergyMaster'
    }],
    PastMedications: [{
      Medicines: {
        type: Schema.Types.ObjectId,
        ref: 'SaltMaster'
      },
      Dosage: {
        type: Schema.Types.ObjectId,
        ref: 'DosageMaster'
      },
      Frequency: {
        type: Schema.Types.ObjectId,
        ref: 'MedicineFrequencyMaster'
      },
      Therapies: {
        type: Schema.Types.ObjectId,
        ref: 'TherapyMaster'
      }
    }],
    OccupationalProfile: [{
      type: Schema.Types.ObjectId,
      ref: 'OccupationMaster'
    }],
    HabitsLifestyles: [{
      type: Schema.Types.ObjectId,
      ref: 'HabitsMaster'
    }],
    FamilyHistory: [{
      type: Schema.Types.ObjectId,
      ref: 'DiseaseMaster'
    }]
  },

  // ==================== CLINICAL FINDINGS ====================
  ClinicalFindings: {
    Symptoms: {
      type: Schema.Types.ObjectId,
      ref: 'SymptomMaster'
    },
    DurationMonths: {
      type: Number
    },
    SeverityGrade: {
      type: Number,
      min: 1,
      max: 5
    },
    AggravatingFactors: [{
      type: Schema.Types.ObjectId,
      ref: 'AggravatingFactorMaster'
    }]
  },

  // ==================== VITALS/PHYSICAL EXAMINATIONS ====================
  VitalsPhysicalExaminations: [{
    Parameter: {
      type: Schema.Types.ObjectId,
      ref: 'InvestigationMaster' // where Investigation_CategoryId = "VITAL_PARAMETER"
    },
    Value: {
      type: Number
    },
    Abnormalities: [{
      type: String // From Abnormalities column in InvestigationMaster
    }]
  }],

  // ==================== DIAGNOSTICS/INVESTIGATIONS ====================
  DiagnosticsInvestigations: [{
    InvestigationCategory: {
      type: String // From Investigation_CategoryId in InvestigationMaster
    },
    Investigation: {
      type: Schema.Types.ObjectId,
      ref: 'InvestigationMaster'
    },
    Value: {
      type: Number
    },
    Abnormalities: [{
      type: String // From Abnormalities column in InvestigationMaster
    }],
    InvestigationReportUpload: {
      type: String // File path or URL
    },
    InterpretationUpload: {
      type: String // File path or URL
    },
    GoogleDriveUrl: {
      type: String
    }
  }],

  // ==================== DIAGNOSIS ====================
  Diagnosis: [{
    CurrentDiagnosis: {
      type: Schema.Types.ObjectId,
      ref: 'DiagnosisMaster'
    },
    TypeOfDiagnosis: {
      type: Schema.Types.ObjectId,
      ref: 'DiagnosisTypeMaster'
    },
    ClinicalNote: {
      type: String
    }
  }],

  // ==================== TREATMENT TO DATE ====================
  TreatmentToDate: {
    Medicines: [{
      Medicine: {
        type: Schema.Types.ObjectId,
        ref: 'SaltMaster'
      },
      Dosage: {
        type: Schema.Types.ObjectId,
        ref: 'DosageMaster'
      },
      Frequency: {
        type: Schema.Types.ObjectId,
        ref: 'MedicineFrequencyMaster'
      }
    }],
    SurgeryProcedure: [{
      type: Schema.Types.ObjectId,
      ref: 'ProcedureMaster'
    }],
    Therapy: [{
      type: Schema.Types.ObjectId,
      ref: 'TherapyMaster'
    }],
    LifestyleInterventions: [{
      type: Schema.Types.ObjectId,
      ref: 'LifestyleInterventionMaster'
    }],
    PatientsResponse: {
      type: String
    },
    ClinicalNote: {
      type: String
    }
  },

  // ==================== SECOND OPINION SPECIFIC FIELDS ====================
  SecondOpinionFields: {
    SpecificQuestions: [{
      SecondOpinionQuery: {
        type: Schema.Types.ObjectId,
        ref: 'SecondOpinionQueryMaster'
      },
      Question: {
        type: String
      }
    }],
    AdditionalInformation: {
      type: String
    }
  },

  // ==================== MEDICAL TOURISM SPECIFIC FIELDS ====================
  MedicalTourismFields: {
    ProposedSurgery: {
      SurgeryProcedure: [{
        type: Schema.Types.ObjectId,
        ref: 'ProcedureMaster'
      }],
      DoctorsNote: {
        type: String
      }
    },
    PreSurgicalConsiderations: {
      Comorbidities: [{
        type: Schema.Types.ObjectId,
        ref: 'ComorbidityMaster'
      }],
      DefineComorbidities: {
        type: String
      },
      RiskFactors: [{
        type: Schema.Types.ObjectId,
        ref: 'RiskFactorMaster'
      }],
      DefineRiskFactors: {
        type: String
      },
      PatientsConcern: [{
        type: Schema.Types.ObjectId,
        ref: 'PatientConcernMaster'
      }],
      LogisticalConsiderations: [{
        type: Schema.Types.ObjectId,
        ref: 'LogisticalConsiderationMaster'
      }]
    }
  },

  // ==================== DOCTOR/HOSPITAL SELECTION ====================
  DoctorHospitalSelection: {
    SelectedCity: {
      type: Schema.Types.ObjectId,
      ref: 'StationMaster' // where StationType = "CITY" and ParentStationId = "India"
    },
    SelectedMedicalSpecialty: {
      type: Schema.Types.ObjectId,
      ref: 'MedicalSpecialityMaster'
    },
    ReferredDoctors: [{
      type: Schema.Types.ObjectId,
      ref: 'AssetMaster' // Array of selected doctor IDs
    }],
    DateTime: {
      type: Date,
      default: Date.now
    },
    Geolocation: {
      Latitude: {
        type: Number
      },
      Longitude: {
        type: Number
      },
      Address: {
        type: String
      }
    }
  },

  // ==================== AUDIT FIELDS ====================
  CreatedAt: {
    type: Date,
    default: Date.now
  },
  UpdatedAt: {
    type: Date,
    default: Date.now
  },
  CreatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'AssetMaster'
  },
  UpdatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'AssetMaster'
  },
  IsActive: {
    type: Boolean,
    default: true
  },
  IsDeleted: {
    type: Boolean,
    default: false
  }
});

// Update the UpdatedAt field before saving
PatientReferralSchema.pre('save', function(next) {
  this.UpdatedAt = Date.now();
  next();
});

// Update the UpdatedAt field before updating
PatientReferralSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  this.set({ UpdatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('PatientReferral', PatientReferralSchema);