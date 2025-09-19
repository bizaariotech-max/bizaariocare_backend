const mongoose = require("mongoose");
const { Schema } = mongoose;

const _SchemaDesign = new Schema(
    {
        AssetId: {
            type: mongoose.SchemaTypes.ObjectId,
            // ref:""
            // (Health Auditor)
        },
        AssetId: {
            type: mongoose.SchemaTypes.ObjectId,
            // ref:""
            //  (Responder/ Driver)
        },

        HPQuestion: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "hp_question_master",
        },
        UserResponse: String,
        InvestigationResult: String,
        UploadResult: String,
        UploadInterpretation: String,
        AbnormalitiesFound: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                // ref:""
                //   (Abnormality Master)
            },
        ],

        MeasurementValue: String,
        DateAndTime: String,
        GeoLocation: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number] }, // [lng, lat]
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("hp_user_response", _SchemaDesign);
