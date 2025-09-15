const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const investigationMasterSchema = new Schema(
  {
    Investigation_CategoryId: {
      type: Schema.Types.ObjectId,
      ref: "admin_lookups",
    },

    InvestigationName: {
      type: String,
      trim: true,
    },

    ResponseUnit: {
      type: String,
      trim: true,
    },

    Validity_Min_Value: {
      type: Number,
    },

    Validity_Max_Value: {
      type: Number,
    },

    Normal_Value_Minimum: {
      type: Number,
    },

    Normal_Value_Maximum: {
      type: Number,
    },

    Weightage_Value_Minimum: {
      type: Number,
    },

    Weightage_Value_Maximum: {
      type: Number,
    },

    SOS_Value_Minimum: {
      type: Number,
    },

    SOS_Value_Maximum: {
      type: Number,
    },

    Abnormalities: [String],
  },
  {
    timestamps: true,
    // versionKey: false
  }
);

// Indexes for performance
investigationMasterSchema.index({ Investigation_CategoryId: 1 });
investigationMasterSchema.index({ Investigation_Name: 1 });
investigationMasterSchema.index({ Investigation_Name: "text" });

module.exports = mongoose.model(
  "InvestigationMaster",
  investigationMasterSchema
);
