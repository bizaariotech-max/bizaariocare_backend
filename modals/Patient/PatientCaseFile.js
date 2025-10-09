const mongoose = require("mongoose");
const { Schema } = mongoose;

// PatientCaseFile SCHEMA
// Medical Case File ID (Auto Generate), Patient ID, Treatment Type,
//  Asset ID(Doctor), Doctor Name, Asset ID (Hospital), Hospital Name, Date

const PatientCaseFile = new Schema(
  {
    CaseFileId: {
      type: String,
      unique: true,
      required: true,
      default: function () {
        // Generate Case File ID in format: CF-YYYYMMDD-XXXX
        const date = new Date();
        const dateStr =
          date.getFullYear().toString() +
          (date.getMonth() + 1).toString().padStart(2, "0") +
          date.getDate().toString().padStart(2, "0");
        const random = Math.floor(Math.random() * 9999)
          .toString()
          .padStart(4, "0");
        return `CF-${dateStr}-${random}`;
      },
    },
    // *Parent case file id for nested case files
    ParentCaseFileId: {
      type: Schema.Types.ObjectId,
      ref: "patient_case_file",
    },
    PatientId: {
      type: Schema.Types.ObjectId,
      ref: "patient_master",
      required: true,
    },
    TreatmentType: {
      type: String,
      enum: [
        "Surgery/ Procedure Record",
        "General (Non-surgical) Hospitalisation Record",
        "Maternity Record",
        "Day care Visit Record",
        "OPD Visit Record",
      ],
      // required: true,
    },
    MedicalSpeciality: {
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
    },
    Disease: [
      {
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },
    ],
    Accident: [
      {
        type: Schema.Types.ObjectId,
        ref: "admin_lookups",
      },
    ],
    DoctorId: { type: Schema.Types.ObjectId, ref: "asset_master" },
    DoctorName: { type: String, trim: true },
    HospitalId: { type: Schema.Types.ObjectId, ref: "asset_master" },
    HospitalName: { type: String, trim: true },
    Date: { type: Date },
    Notes: { type: String, trim: true },
    // Status: {
    //   type: String,
    //   enum: ["Ongoing", "Past", "Resolved"],
    //   default: "Ongoing",
    // },
    CreatedBy: {
      type: Schema.Types.ObjectId,
      ref: "asset_master",
      // required: true,
    },
    // UpdatedBy: { type: Schema.Types.ObjectId, ref: "asset_master" },
    IsActive: { type: Boolean, default: true },
    IsDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("patient_case_file", PatientCaseFile);
