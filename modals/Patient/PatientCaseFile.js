const mongoose = require("mongoose");
const { Schema } = mongoose;

// PatientCaseFile SCHEMA
// Medical Case File ID (Auto Generate), Patient ID, Treatment Type,
//  Asset ID(Doctor), Doctor Name, Asset ID (Hospital), Hospital Name, Date

const PatientCaseFile = new Schema(
  {
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
    DoctorId: { type: Schema.Types.ObjectId, ref: "asset_master" },
    DoctorName: { type: String, trim: true },
    HospitalId: { type: Schema.Types.ObjectId, ref: "asset_master" },
    HospitalName: { type: String, trim: true },
    Date: { type: Date },
    Notes: { type: String, trim: true },
    Status: {
      type: String,
      enum: ["Ongoing", "Past", "Resolved"],
      default: "Ongoing",
    },
    // CreatedBy: {
    //   type: Schema.Types.ObjectId,
    //   ref: "asset_master",
    //   required: true,
    // },
    // UpdatedBy: { type: Schema.Types.ObjectId, ref: "asset_master" },
    IsActive: { type: Boolean, default: true },
    IsDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("patient_case_file", PatientCaseFile);
