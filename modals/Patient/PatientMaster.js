const mongoose = require("mongoose");
const { Schema } = mongoose;

// PATIENT MASTER SCHEMA

//  Medicine Schema (Add More supported)
const MedicineSchema = new Schema({
  MedicineName: {
    // lookup_type: "MEDICINE"
    type: Schema.Types.ObjectId,
    ref: "admin_lookups",
  },
  Dosage: {
    // lookup_type: "DOSAGE"
    type: Schema.Types.ObjectId,
    ref: "admin_lookups",
  },
  DurationInDays: {
    // Duration (Days)
    type: Number,
    min: 0,
  },
});

// Medicines Prescribed with Recovery Cycle
const MedicinesPrescribedSchema = new Schema(
  {
    Medicines: [MedicineSchema],
    RecoveryCycle: {
      // Recovery Cycle (Number) Drop Down
      Value: {
        type: Number,
        min: 0,
      },
      Unit: {
        // lookup_type: "DURATION_UNIT" (Days, Weeks, Months)
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },
    },
    PrescriptionUrls: [
      {
        // Upload Prescriptions (multiple)
        type: String,
        trim: true,
      },
    ],
  },
  { _id: false }
);

//  Therapy(ies) (Add More supported)
const TherapySchema = new Schema({
  TherapyName: {
    // lookup_type: "THERAPY"
    type: Schema.Types.ObjectId,
    ref: "admin_lookups",
  },
  // PatientResponse: {
  //   // lookup_type: "PATIENT_RESPONSE" (One Response for each therapy)
  //   type: Schema.Types.ObjectId,
  //   ref: "admin_lookups",
  // },
  PatientResponse: {
    type: String,
    // enum: ["Excellent", "Good", "Fair", "Poor", "No Improvement"],
  },
});

const PatientMasterSchema = new Schema(
  {
    // 1. PATIENT ID (Country Specific)
    PatientId: {
      type: String,
      unique: true,
      required: true,
      default: function () {
        // Generate Patient ID in format: PAT-YYYYMMDD-XXXX
        const date = new Date();
        const dateStr =
          date.getFullYear().toString() +
          (date.getMonth() + 1).toString().padStart(2, "0") +
          date.getDate().toString().padStart(2, "0");
        const random = Math.floor(Math.random() * 9999)
          .toString()
          .padStart(4, "0");
        return `PAT-${dateStr}-${random}`;
      },
    },
    // // 2. PHONE NUMBER (without ISD code)
    // PhoneNumber: {
    //   type: String,
    //   required: [true, "Phone number is required"],
    //   unique: true,
    //   trim: true,
    //   validate: {
    //     validator: function (v) {
    //       // Validate exactly 10 digits
    //       return /^[0-9]{10}$/.test(v);
    //     },
    //     message: (props) =>
    //       `${props.value} is not a valid 10-digit phone number`,
    //   },
    //   // validate: {
    //   //   validator: function (v) {
    //   //     // Validate phone number format (only digits)
    //   //     return /^[0-9]{5,15}$/.test(v);
    //   //   },
    //   //   message: "Phone number must contain only digits (5-15 digits)",
    //   // },
    // },

    PhoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      validate: [
        {
          validator: function (v) {
            return /^[0-9]{10}$/.test(v);
          },
          message: (props) =>
            `${props.value} is not a valid 10-digit phone number`,
        },
      ],
    },

    ISDCode: {
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
      required: true,
    },

    // 3. IS VERIFIED (Yes/No)
    IsVerified: {
      type: Boolean,
      default: false,
    },

    // 4. NAME
    Name: {
      type: String,
      required: true,
      trim: true,
    },

    // 5. AGE/DOB
    Age: {
      type: Number,
    },

    DateOfBirth: {
      type: Date,
    },

    // 6. GENDER (Male/Female/Other)
    Gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },

    // 7. NATIONALITY (STATION MASTER where ORG UNIT LEVEL = "Country")
    Nationality: {
      type: Schema.Types.ObjectId,
      ref: "station_master",
      // ref: "admin_lookups",
      required: true,
    },

    // 8. COUNTRY OF RESIDENCE (STATION MASTER where ORG UNIT LEVEL = "Country")
    CountryOfResidence: {
      type: Schema.Types.ObjectId,
      ref: "station_master",
      // ref: "admin_lookups",
      required: true,
    },

    // 9. ADDRESS LINE 1
    AddressLine1: {
      type: String,
      required: true,
      trim: true,
    },

    // 10. ADDRESS LINE 2
    AddressLine2: {
      type: String,
      trim: true,
    },

    // 11. STATE (STATION MASTER)
    State: {
      type: Schema.Types.ObjectId,
      ref: "station_master",
    },

    // // 12. CITY
    // City: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },

    // 12. CITY
    City: {
      type: Schema.Types.ObjectId,
      ref: "station_master",
    },

    // 13. POSTAL CODE
    PostalCode: {
      type: String,
      trim: true,
    },

    // 14. INSURANCE PROVIDER (Drop-Down ADMIN LOOKUPS)
    InsuranceProvider: {
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
    },

    // 15. INSURANCE POLICY NUMBER
    InsurancePolicyNumber: {
      type: String,
      trim: true,
    },

    // 16. VALID UPTO (Date)
    InsuranceValidUpto: {
      type: Date,
    },

    // 17. EMAIL ADDRESS (optional)
    EmailAddress: {
      type: String,
      trim: true,
      lowercase: true,
    },

    // 18. SECONDARY CONTACT NAME
    SecondaryContactName: {
      type: String,
      trim: true,
    },
    // 19. SECONDARY CONTACT NUMBER (without ISD code)
    SecondaryContactNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          // Allow empty/null or valid format (only digits)
          if (!v || v === "") return true;
          return /^[0-9]{5,15}$/.test(v);
        },
        message:
          "Secondary contact number must contain only digits (5-15 digits)",
      },
    },

    SecondaryISDCode: {
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
    },

    // // 19. SECONDARY CONTACT NUMBER (also with ISD code)
    // SecondaryContactNumber: {
    //   type: String,
    //   trim: true,
    //   validate: {
    //     validator: function(v) {
    //       // Allow empty/null or valid international format
    //       if (!v || v === '') return true;
    //       return /^\+[1-9]\d{1,14}$/.test(v);
    //     },
    //     message: 'Secondary contact number must be in international format (e.g., +91838383930)'
    //   }
    // },

    // 20. RELATIONSHIP (Drop-Down ADMIN LOOKUPS)
    Relationship: {
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
    },

    // 21. RECORD CREATED BY (Logged In ASSET ID)
    CreatedBy: {
      type: Schema.Types.ObjectId,
      ref: "asset_master",
      required: true,
    },
    // 22. BLOOD GROUP (A+, A-, B+, B-, AB+, AB-, O+, O-)
    BloodGroup: {
      type: String,
      trim: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    // new field
    ProfilePic: {
      type: String,
      default: "",
    },

    //* New fields
    // Pre-Existing Disease (s)
    // Current Medications
    // Current Therapies
    //     Family History
    // 	Habit & Lifestyle
    // 	Allergies
    // Past Accident’s Trauma

    PreExistingDisease: [
      {
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },
    ],

    // Medicines Prescribed with Recovery Cycle
    //   MedicinesPrescribedSchema: {
    // Medicines: [{
    //   MedicineName: {
    //     // lookup_type: "MEDICINE"
    //     type: Schema.Types.ObjectId,
    //     ref: "admin_lookups",
    //   },
    //   Dosage: {
    //     // lookup_type: "DOSAGE"
    //     type: Schema.Types.ObjectId,
    //     ref: "admin_lookups",
    //   },
    //   DurationInDays: {
    //     // Duration (Days)
    //     type: Number,
    //     min: 0,
    //   },
    // }],
    // RecoveryCycle: {
    //   // Recovery Cycle (Number) Drop Down
    //   Value: {
    //     type: Number,
    //     min: 0,
    //   },
    //   Unit: {
    //     // lookup_type: "DURATION_UNIT" (Days, Weeks, Months)
    //     type: Schema.Types.ObjectId,
    //     ref: "admin_lookups",
    //   },
    // },
    // PrescriptionUrls: [
    //   {
    //     // Upload Prescriptions (multiple)
    //     type: String,
    //     trim: true,
    //   },
    // ],
    //    },

    //   CurrentTherapies: [{
    //     TherapyName: {
    //       // lookup_type: "THERAPY"
    //       type: Schema.Types.ObjectId,
    //       ref: "admin_lookups",
    //     },
    //     // PatientResponse: {
    //     //   // lookup_type: "PATIENT_RESPONSE" (One Response for each therapy)
    //     //   type: Schema.Types.ObjectId,
    //     //   ref: "admin_lookups",
    //     // },
    //     PatientResponse: {
    //       type: String,
    //       // enum: ["Excellent", "Good", "Fair", "Poor", "No Improvement"],
    //     },
    //   }],

    CurrentMedications: {
     
      type: MedicinesPrescribedSchema,
    },

    CurrentTherapies: [
      {
      //  (multiple with Add More)
        type: TherapySchema,
      },
    ],

    FamilyHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "admin_lookups", // is genetic family history -yes
      },
    ],

    HabitLifestyle: [
      {
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },
    ],
    Allergies: [
      {
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },
    ],
    PastAccidentsTrauma: [
      {
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },
    ],

    QRCode: {
      type: String,
    },
    // SYSTEM FIELDS
    IsActive: {
      type: Boolean,
      default: true,
    },

    IsDeleted: {
      type: Boolean,
      default: false,
    },

    UpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: "asset_master",
    },
  },
  {
    timestamps: true,
  }
);

// INDEXES FOR PERFORMANCE
PatientMasterSchema.index({ PatientId: 1 }, { unique: true });
// PatientMasterSchema.index({ PhoneNumber: 1 });
PatientMasterSchema.index({ Name: 1 });
PatientMasterSchema.index({ EmailAddress: 1 });
PatientMasterSchema.index({ IsActive: 1, IsDeleted: 1 });
PatientMasterSchema.index({ CreatedBy: 1 });
PatientMasterSchema.index({ Nationality: 1 });
PatientMasterSchema.index({ CountryOfResidence: 1 });
PatientMasterSchema.index({ State: 1 });
PatientMasterSchema.index({ IsVerified: 1 });
PatientMasterSchema.index({ City: 1 });
PatientMasterSchema.index({ InsuranceProvider: 1 });

// *Phone no. duplicacy

// Update the compound unique index for PhoneNumber
PatientMasterSchema.index(
  {
    PhoneNumber: 1,
    IsDeleted: 1,
  },
  {
    unique: true,
    partialFilterExpression: { IsDeleted: false },
    collation: { locale: "en", strength: 2 },
  }
);

// Update the error handler for duplicate phone numbers
PatientMasterSchema.post(
  ["save", "updateOne", "findOneAndUpdate"],
  function (error, doc, next) {
    if (error.code === 11000) {
      if (error.keyPattern.PhoneNumber) {
        next(
          new Error("Phone number already exists for another active patient")
        );
      } else {
        next(new Error("Duplicate key error"));
      }
    } else {
      next(error);
    }
  }
);

// Add pre-validate middleware to ensure phone number format
PatientMasterSchema.pre("validate", async function (next) {
  if (this.isModified("PhoneNumber")) {
    // Check if phone number exists for another active patient
    const existingPatient = await this.constructor.findOne({
      PhoneNumber: this.PhoneNumber,
      IsDeleted: false,
      _id: { $ne: this._id },
    });

    if (existingPatient) {
      next(new Error("Phone number already exists for another active patient"));
    }
  }
  next();
});

// *end Phone

// PRE-SAVE MIDDLEWARE
PatientMasterSchema.pre("save", function (next) {
  // Calculate age from DOB if DOB is provided and age is not
  if (this.DateOfBirth && !this.Age) {
    const today = new Date();
    const birthDate = new Date(this.DateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    this.Age = age;
  }

  next();
});

// PRE-UPDATE MIDDLEWARE
PatientMasterSchema.pre(["updateOne", "findOneAndUpdate"], function (next) {
  // Calculate age from DOB if updating DateOfBirth
  const update = this.getUpdate();
  if (update.DateOfBirth && !update.Age) {
    const today = new Date();
    const birthDate = new Date(update.DateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    this.set({ Age: age });
  }

  next();
});

// VIRTUAL FOR FULL DISPLAY
PatientMasterSchema.virtual("DisplayName").get(function () {
  return `${this.Name} (${this.PatientId})`;
});

PatientMasterSchema.virtual("FullAddress").get(function () {
  let address = this.AddressLine1;
  if (this.AddressLine2) address += `, ${this.AddressLine2}`;
  address += `, ${this.City}`;
  if (this.PostalCode) address += ` - ${this.PostalCode}`;
  return address;
});

// METHODS
PatientMasterSchema.methods.getContactInfo = function () {
  return {
    primary: {
      phone: this.PhoneNumber,
      email: this.EmailAddress || "Not provided",
    },
    secondary: {
      name: this.SecondaryContactName || "Not provided",
      phone: this.SecondaryContactNumber || "Not provided",
    },
  };
};

PatientMasterSchema.methods.getAge = function () {
  if (this.Age) return this.Age;
  if (this.DateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.DateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
  return null;
};

PatientMasterSchema.methods.getInsuranceStatus = function () {
  if (!this.InsuranceProvider || !this.InsuranceValidUpto) {
    return { hasInsurance: false, status: "No Insurance" };
  }

  const today = new Date();
  const validUpto = new Date(this.InsuranceValidUpto);

  return {
    hasInsurance: true,
    status: validUpto > today ? "Active" : "Expired",
    validUpto: this.InsuranceValidUpto,
    policyNumber: this.InsurancePolicyNumber,
  };
};

// STATIC METHODS
PatientMasterSchema.statics.findByPatientId = function (patientId) {
  return this.findOne({ PatientId: patientId, IsDeleted: false })
    .populate("Nationality", "StationName")
    .populate("CountryOfResidence", "StationName")
    .populate("State", "StationName")
    .populate("City", "StationName")
    .populate("InsuranceProvider", "lookup_value")
    .populate("Relationship", "lookup_value")
    .populate("CreatedBy", "AssetName");
  // .populate("ISDCode", "lookup_value");
};

PatientMasterSchema.statics.findByLocation = function (countryId, stateId) {
  const filter = { IsDeleted: false, IsActive: true };
  if (countryId) filter.CountryOfResidence = countryId;
  if (stateId) filter.State = stateId;

  return this.find(filter)
    .populate("Nationality", "StationName")
    .populate("CountryOfResidence", "StationName")
    .populate("State", "StationName")
    .populate("City", "StationName")
    .populate("InsuranceProvider", "lookup_value")
    .populate("Relationship", "lookup_value")
    .sort({ createdAt: -1 });
};

PatientMasterSchema.statics.searchPatients = function (searchTerm) {
  const regex = new RegExp(searchTerm, "i");
  return this.find({
    $or: [
      { Name: regex },
      { PatientId: regex },
      { PhoneNumber: regex },
      { EmailAddress: regex },
      { City: regex },
      { PostalCode: regex },
      { State: regex },
    ],
    IsDeleted: false,
  })
    .populate("Nationality", "StationName")
    .populate("CountryOfResidence", "StationName")
    .populate("State", "StationName")
    .populate("City", "StationName")
    .populate("InsuranceProvider", "lookup_value")
    .populate("Relationship", "lookup_value")
    .sort({ Name: 1 });
};

PatientMasterSchema.statics.findByVerificationStatus = function (isVerified) {
  return this.find({
    IsVerified: isVerified,
    IsDeleted: false,
    IsActive: true,
  })
    .populate("Nationality", "StationName")
    .populate("CountryOfResidence", "StationName")
    .populate("State", "StationName")
    .populate("City", "StationName")
    .populate("InsuranceProvider", "lookup_value")
    .populate("Relationship", "lookup_value")
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model("patient_master", PatientMasterSchema);
