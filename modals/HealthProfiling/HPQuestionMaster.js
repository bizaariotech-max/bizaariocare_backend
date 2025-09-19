const mongoose = require("mongoose");
const { Schema } = mongoose;

const _SchemaDesign = new Schema(
    {
        HPQuestionCategory: {
            type: String,
            enum: ["Survey", "Investigation"],
        },
        HPGroup: {
            type: mongoose.SchemaTypes.ObjectId,
            // ref:""
            // (drop-down Health Profiling Group Master)
        },
        QuestionOrder: Number,
        LogicalGroup: String,
        InvestigationType: {
            type: mongoose.SchemaTypes.ObjectId,
            // ref:""
            //  (Investigation Type Master)
        },
        QuestionType: {
            type: mongoose.SchemaTypes.ObjectId,
            // ref:""
            // (drop-down Question Type Master)
        },
        HPQuestion: String,
        OptionValues: [String],
        SelectionType: {
            type: String,
            enum: ["Single", "Multiple"],
        },
        InputType: {
            type: mongoose.SchemaTypes.ObjectId,
            // ref:""
            // (drop-down Input Type Master)
        },
        ValidityMinValue: String,
        ValidityMaxValue: String,
        ResponseUnit: String,
        NormalValueMinimum: String,
        NormalValueMaximum: String,
        WeightageValueMinimum: String,
        WeightageValueMaximum: String,
        SOSValueMinimum: String,
        SOSValueMaximum: String,
        IsActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("hp_question_master", _SchemaDesign);
