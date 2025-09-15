const mongoose = require("mongoose");
const { Schema } = mongoose;

// PATIENT MASTER SCHEMA
const PatientMasterSchema = new Schema(
  {
    // SYSTEM GENERATED FIELDS
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

    // PATIENT PERSONAL INFORMATION
    Name: {
      type: String,
      required: true,
      trim: true,
    },

    Age: {
      type: Number,
    },

    DateOfBirth: {
      type: Date,
    },

    Gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },

    Nationality: {
      type: String,
      required: true,
      trim: true,
    },

    // REFERRING DOCTOR INFORMATION
    ReferringDoctorId: {
      type: Schema.Types.ObjectId,
      ref: "asset_master",
    },

    // CONTACT INFORMATION
    PhoneNumber: {
      type: String,
    //   required: true,
    },

    EmailAddress: {
      type: String,
      trim: true,
      lowercase: true,
    },

    // STATUS AND METADATA
    IsActive: {
      type: Boolean,
      default: true,
    },

    IsDeleted: {
      type: Boolean,
      default: false,
    },

    // AUDIT TRAIL
    CreatedBy: {
      type: Schema.Types.ObjectId,
      ref: "login_master",
    },

    UpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: "login_master",
    },
  },
  {
    timestamps: true,
  }
);

// INDEXES FOR PERFORMANCE
PatientMasterSchema.index({ PatientId: 1 }, { unique: true });
PatientMasterSchema.index({ Name: 1 });
PatientMasterSchema.index({ PhoneNumber: 1 });
PatientMasterSchema.index({ EmailAddress: 1 });
PatientMasterSchema.index({ ReferringDoctorId: 1 });
PatientMasterSchema.index({ IsActive: 1, IsDeleted: 1 });

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

// METHODS
PatientMasterSchema.methods.getContactInfo = function () {
  return {
    phone: this.PhoneNumber,
    email: this.EmailAddress || "Not provided",
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

// STATIC METHODS
PatientMasterSchema.statics.findByPatientId = function (patientId) {
  return this.findOne({ PatientId: patientId, IsDeleted: false });
};

PatientMasterSchema.statics.findByDoctor = function (doctorId) {
  return this.find({
    ReferringDoctorId: doctorId,
    IsDeleted: false,
    IsActive: true,
  }).sort({ createdAt: -1 });
};

PatientMasterSchema.statics.searchPatients = function (searchTerm) {
  const regex = new RegExp(searchTerm, "i");
  return this.find({
    $or: [
      { Name: regex },
      { PatientId: regex },
      { PhoneNumber: regex },
      { EmailAddress: regex },
    ],
    IsDeleted: false,
  }).sort({ Name: 1 });
};

module.exports = mongoose.model("patient_master", PatientMasterSchema);
