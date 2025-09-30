const mongoose = require("mongoose");
const { Schema } = mongoose;

// PATIENT REFERRAL SCHEMA
const PatientReferralSchema = new Schema(
  {
    // 1. PATIENT ID
    PatientId: {
      type: Schema.Types.ObjectId,
      ref: "patient_master",
      index: true,
      required: true,
    },
    CaseFileId: {
      type: Schema.Types.ObjectId,
      ref: "patient_case_file",
      // required: true,
      index: true,
    },

    // 2. REFERRING DOCTOR (logged in Doctor)
    ReferringDoctor: {
      type: Schema.Types.ObjectId,
      ref: "asset_master",
      index: true,
    },

    // 3. REASON FOR REFERRAL
    ReasonForReferral: {
      // a. Drop-down (REASON FOR REFERRAL Master) - lookup_type: "REASON_FOR_REFERRAL"
      ReasonType: {
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },

      // b. Doctor's Remarks with add more
      DoctorRemarks: [
        {
          Remark: {
            type: String,
            trim: true,
          },
          CreatedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },

    // 4. MEDICAL SPECIALTY (Single Selection) - lookup_type: "MEDICAL_SPECIALTY"
    MedicalSpecialty: {
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
    },

    // 5. REFERRED CITY (STATION MASTER where Org Unit Type = City and Parent Station ID = "India")
    ReferredCity: {
      type: Schema.Types.ObjectId,
      ref: "station_master",
    },

    // 6. REFERRED DOCTOR (CARD VIEW with Multiple Selection)
    ReferredDoctors: [
      {
        type: Schema.Types.ObjectId,
        ref: "asset_master",
      },
    ],

    // 7. DATE & TIME
    ReferralDateTime: {
      type: Date,
      default: Date.now,
    },

    // 8. SPECIFIC QUESTIONS FOR SECOND OPINION (Conditional Fields)
    SecondOpinionQuestions: {
      // a. Second Opinion Query (Multiple Selection) - lookup_type: "SECOND_OPINION_QUERY"
      SecondOpinionQueries: [
        {
          type: Schema.Types.ObjectId,
          ref: "admin_lookups",
        },
      ],

      // b. Question
      Questions: [
        {
          Question: {
            type: String,
            trim: true,
          },
          CreatedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },

    // 9. ADDITIONAL INFORMATION (Text Area)
    AdditionalInformation: {
      type: String,
      trim: true,
    },

    // 10. PROPOSED SURGERY (For Medical Tourism)
    ProposedSurgery: {
      // a. Surgery/Procedure (Multiple Selection) - lookup_type: "PROCEDURE"
      SurgeryProcedures: [
        {
          type: Schema.Types.ObjectId,
          ref: "admin_lookups",
        },
      ],

      // b. Doctor's Note (Text Area)
      DoctorNote: {
        type: String,
        trim: true,
      },
    },

    // 11. PRE-SURGICAL CONSIDERATIONS (For Medical Tourism)
    PreSurgicalConsiderations: {
      // a. Comorbidities (Multiple Selection) - lookup_type: "COMORBIDITY"
      Comorbidities: [
        {
          type: Schema.Types.ObjectId,
          ref: "admin_lookups",
        },
      ],

      // b. Define Comorbidity(ies) (Text Area)
      ComorbidityDefinition: {
        type: String,
        trim: true,
      },

      // c. Risk Factors (Multiple Selection) - lookup_type: "RISK_FACTOR"
      RiskFactors: [
        {
          type: Schema.Types.ObjectId,
          ref: "admin_lookups",
        },
      ],

      // d. Define Risk Factor(s) (Text Area)
      RiskFactorDefinition: {
        type: String,
        trim: true,
      },

      // e. Patient's Concern (Multiple Selection) - lookup_type: "PATIENT_CONCERN"
      PatientConcerns: [
        {
          type: Schema.Types.ObjectId,
          ref: "admin_lookups",
        },
      ],

      // f. Logistical Considerations (Multiple Selection) - lookup_type: "LOGISTICAL_CONSIDERATION"
      LogisticalConsiderations: [
        {
          type: Schema.Types.ObjectId,
          ref: "admin_lookups",
        },
      ],
    },

    // DOCTOR/HOSPITAL SELECTION FIELDS
    DoctorHospitalSelection: {
      // 1. Select City (Single Selection) - STATION MASTER where STATION TYPE = "CITY"
      SelectedCity: {
        type: Schema.Types.ObjectId,
        ref: "station_master",
      },

      // 2. Select Medical Specialty (Single Selection) - lookup_type: "MEDICAL_SPECIALTY"
      SelectedMedicalSpecialty: {
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },

      // 3-4. REFERRED DOCTOR (Array – ASSET IDs of Selected Doctors)
      SelectedDoctors: [
        {
          type: Schema.Types.ObjectId,
          ref: "asset_master",
        },
      ],

      // 5. Date and Time (Current Date and Time)
      SelectionDateTime: {
        type: Date,
        default: Date.now,
      },

      // 6. Geolocation (Current Geolocation)
      // Geolocation: {
      //   latitude: {
      //     type: Number,
      //     min: -90,
      //     max: 90,
      //   },
      //   longitude: {
      //     type: Number,
      //     min: -180,
      //     max: 180,
      //   },
      //   address: {
      //     type: String,
      //     trim: true,
      //   },
      //   accuracy: {
      //     type: Number,
      //   },
      //   // city: { type: String },
      //   // state: { type: String },
      //   // country: { type: String, default: "India" }
      // },

      //  // GeoJSON for geospatial queries (PRIMARY)
      Geolocation: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: false,
        },
      },
    },

    // REFERRAL TYPE (to determine which conditional fields to show)
    ReferralType: {
      type: String,
      enum: ["GENERAL", "SECOND_OPINION", "MEDICAL_TOURISM"],
      default: "GENERAL",
    },

    // REFERRAL STATUS
    ReferralStatus: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },

    // PRIORITY LEVEL
    PriorityLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },

    // RESPONSE FROM REFERRED DOCTOR
    ReferralResponse: {
      RespondedBy: {
        type: Schema.Types.ObjectId,
        ref: "asset_master",
      },
      ResponseDate: {
        type: Date,
      },
      ResponseMessage: {
        type: String,
        trim: true,
      },
      AcceptanceStatus: {
        type: String,
        enum: ["ACCEPTED", "REJECTED", "COUNTER_PROPOSAL"],
      },
      ProposedDateTime: {
        type: Date,
      },
    },

    //* SYSTEM FIELDS
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
PatientReferralSchema.index({ PatientId: 1 });
PatientReferralSchema.index({ ReferringDoctor: 1 });
PatientReferralSchema.index({ ReferredDoctors: 1 });
PatientReferralSchema.index({ ReferralStatus: 1 });
PatientReferralSchema.index({ ReferralType: 1 });
PatientReferralSchema.index({ PriorityLevel: 1 });
PatientReferralSchema.index({ ReferralDateTime: -1 });
PatientReferralSchema.index({ MedicalSpecialty: 1 });
PatientReferralSchema.index({ ReferredCity: 1 });
PatientReferralSchema.index({ IsActive: 1, IsDeleted: 1 });
PatientReferralSchema.index({ CreatedBy: 1 });

// Compound indexes for common queries
PatientReferralSchema.index({ 
  ReferralStatus: 1, 
  ReferralDateTime: -1 
});
PatientReferralSchema.index({ 
  ReferringDoctor: 1, 
  ReferralStatus: 1 
});
PatientReferralSchema.index({ 
  ReferredDoctors: 1, 
  ReferralStatus: 1 
});

// VIRTUAL FIELDS
PatientReferralSchema.virtual("TotalReferredDoctors").get(function () {
  return this.ReferredDoctors ? this.ReferredDoctors.length : 0;
});

PatientReferralSchema.virtual("TotalDoctorRemarks").get(function () {
  return this.ReasonForReferral && this.ReasonForReferral.DoctorRemarks 
    ? this.ReasonForReferral.DoctorRemarks.length : 0;
});

PatientReferralSchema.virtual("IsUrgent").get(function () {
  return this.PriorityLevel === "URGENT";
});

PatientReferralSchema.virtual("DaysSinceReferral").get(function () {
  if (!this.ReferralDateTime) return 0;
  const diffTime = Math.abs(new Date() - this.ReferralDateTime);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// METHODS
PatientReferralSchema.methods.addDoctorRemark = function (remark) {
  if (!this.ReasonForReferral) {
    this.ReasonForReferral = { DoctorRemarks: [] };
  }
  if (!this.ReasonForReferral.DoctorRemarks) {
    this.ReasonForReferral.DoctorRemarks = [];
  }
  this.ReasonForReferral.DoctorRemarks.push({
    Remark: remark,
    CreatedAt: new Date()
  });
  return this.save();
};

PatientReferralSchema.methods.addSecondOpinionQuestion = function (question) {
  if (!this.SecondOpinionQuestions) {
    this.SecondOpinionQuestions = { Questions: [] };
  }
  if (!this.SecondOpinionQuestions.Questions) {
    this.SecondOpinionQuestions.Questions = [];
  }
  this.SecondOpinionQuestions.Questions.push({
    Question: question,
    CreatedAt: new Date()
  });
  return this.save();
};

PatientReferralSchema.methods.updateReferralStatus = function (status, respondedBy, responseMessage) {
  this.ReferralStatus = status;
  if (respondedBy) {
    this.ReferralResponse = {
      RespondedBy: respondedBy,
      ResponseDate: new Date(),
      ResponseMessage: responseMessage,
      AcceptanceStatus: status === "ACCEPTED" ? "ACCEPTED" : "REJECTED"
    };
  }
  return this.save();
};

PatientReferralSchema.methods.isOverdue = function (days = 7) {
  if (this.ReferralStatus !== "PENDING") return false;
  return this.DaysSinceReferral > days;
};

// STATIC METHODS
PatientReferralSchema.statics.findByPatientId = function (patientId) {
  return this.find({ PatientId: patientId, IsActive: true, IsDeleted: false })
    .populate("PatientId", "Name PatientId PhoneNumber")
    .populate("ReferringDoctor", "Name Specialization")
    .populate("ReferredDoctors", "Name Specialization")
    .populate("ReasonForReferral.ReasonType", "lookup_value")
    .populate("MedicalSpecialty", "lookup_value")
    .populate("ReferredCity", "StationName")
    .populate("SecondOpinionQuestions.SecondOpinionQueries", "lookup_value")
    .populate("ProposedSurgery.SurgeryProcedures", "lookup_value")
    .populate("PreSurgicalConsiderations.Comorbidities", "lookup_value")
    .populate("PreSurgicalConsiderations.RiskFactors", "lookup_value")
    .populate("PreSurgicalConsiderations.PatientConcerns", "lookup_value")
    .populate("PreSurgicalConsiderations.LogisticalConsiderations", "lookup_value")
    .populate("DoctorHospitalSelection.SelectedCity", "StationName")
    .populate("DoctorHospitalSelection.SelectedMedicalSpecialty", "lookup_value")
    .populate("DoctorHospitalSelection.SelectedDoctors", "Name Specialization")
    .populate("ReferralResponse.RespondedBy", "Name")
    .populate("CreatedBy", "Name")
    .populate("UpdatedBy", "Name")
    .sort({ ReferralDateTime: -1 });
};

PatientReferralSchema.statics.findByReferringDoctor = function (doctorId) {
  return this.find({ 
    ReferringDoctor: doctorId, 
    IsActive: true, 
    IsDeleted: false 
  })
    .populate("PatientId", "Name PatientId")
    .populate("ReferredDoctors", "Name Specialization")
    .populate("MedicalSpecialty", "lookup_value")
    .sort({ ReferralDateTime: -1 });
};

PatientReferralSchema.statics.findByReferredDoctor = function (doctorId) {
  return this.find({ 
    ReferredDoctors: doctorId, 
    IsActive: true, 
    IsDeleted: false 
  })
    .populate("PatientId", "Name PatientId")
    .populate("ReferringDoctor", "Name Specialization")
    .populate("MedicalSpecialty", "lookup_value")
    .sort({ ReferralDateTime: -1 });
};

PatientReferralSchema.statics.findPendingReferrals = function () {
  return this.find({ 
    ReferralStatus: "PENDING", 
    IsActive: true, 
    IsDeleted: false 
  })
    .populate("PatientId", "Name PatientId")
    .populate("ReferringDoctor", "Name")
    .populate("ReferredDoctors", "Name")
    .sort({ PriorityLevel: 1, ReferralDateTime: 1 });
};

PatientReferralSchema.statics.findUrgentReferrals = function () {
  return this.find({ 
    PriorityLevel: "URGENT", 
    ReferralStatus: "PENDING",
    IsActive: true, 
    IsDeleted: false 
  })
    .populate("PatientId", "Name PatientId")
    .populate("ReferringDoctor", "Name")
    .populate("ReferredDoctors", "Name")
    .sort({ ReferralDateTime: 1 });
};

PatientReferralSchema.statics.findOverdueReferrals = function (days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.find({ 
    ReferralStatus: "PENDING",
    ReferralDateTime: { $lt: cutoffDate },
    IsActive: true, 
    IsDeleted: false 
  })
    .populate("PatientId", "Name PatientId")
    .populate("ReferringDoctor", "Name")
    .populate("ReferredDoctors", "Name")
    .sort({ ReferralDateTime: 1 });
};

PatientReferralSchema.statics.findBySpecialty = function (specialtyId) {
  return this.find({ 
    MedicalSpecialty: specialtyId, 
    IsActive: true, 
    IsDeleted: false 
  })
    .populate("PatientId", "Name PatientId")
    .populate("ReferringDoctor", "Name")
    .populate("ReferredDoctors", "Name")
    .sort({ ReferralDateTime: -1 });
};

PatientReferralSchema.statics.findByCity = function (cityId) {
  return this.find({ 
    ReferredCity: cityId, 
    IsActive: true, 
    IsDeleted: false 
  })
    .populate("PatientId", "Name PatientId")
    .populate("ReferringDoctor", "Name")
    .populate("ReferredDoctors", "Name")
    .sort({ ReferralDateTime: -1 });
};

// Helper static method to get lookup data by type
PatientReferralSchema.statics.getLookupsByType = function (lookupType) {
  const AdminLookups = mongoose.model("admin_lookups");
  return AdminLookups.find({
    lookup_type: lookupType,
    is_active: true
  }).sort({ sort_order: 1, lookup_value: 1 });
};

// PRE-SAVE MIDDLEWARE
PatientReferralSchema.pre("save", function (next) {
  if (this.isNew) {
    this.CreatedAt = new Date();
  }
  this.UpdatedAt = new Date();
  next();
});

// PRE-UPDATE MIDDLEWARE
PatientReferralSchema.pre(["updateOne", "findOneAndUpdate"], function (next) {
  this.set({ UpdatedAt: new Date() });
  next();
});

module.exports = mongoose.model("patient_referral", PatientReferralSchema);