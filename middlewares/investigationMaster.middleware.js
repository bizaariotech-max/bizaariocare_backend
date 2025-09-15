const Joi = require("joi");
const mongoose = require("mongoose");
const { __requestResponse } = require("../utils/constant");

const objectIdField = (isRequired = false) => {
  let schema = Joi.string().custom((value, helpers) => {
    // Convert empty string to null to prevent MongoDB cast errors
    if (value === "") {
      return null;
    }
    if (value && !mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  });

  if (isRequired) {
    return schema.required().messages({
      "any.required": "This field is required",
      "string.empty": "This field cannot be empty",
      "any.invalid": "Invalid ObjectId format",
    });
  } else {
    return schema.allow("", null).optional();
  }
};

// Validation schema for InvestigationMaster
const investigationMasterValidationSchema = Joi.object({
  _id: objectIdField(false),

  Investigation_CategoryId: objectIdField(false),

  InvestigationName: Joi.string().trim().allow("", null).optional(),

  ResponseUnit: Joi.string().trim().allow("", null).optional(),

  Validity_Min_Value: Joi.number().allow("", null).optional(),

  Validity_Max_Value: Joi.number().allow("", null).optional(),

  Normal_Value_Minimum: Joi.number().allow("", null).optional(),

  Normal_Value_Maximum: Joi.number().allow("", null).optional(),

  Weightage_Value_Minimum: Joi.number().allow("", null).optional(),

  Weightage_Value_Maximum: Joi.number().allow("", null).optional(),

  SOS_Value_Minimum: Joi.number().allow("", null).optional(),

  SOS_Value_Maximum: Joi.number().allow("", null).optional(),

  Abnormalities: Joi.array().items(Joi.string()).optional(),
  //   Abnormalities: Joi.array().items(objectIdField(false)).optional()
});

const validateSaveInvestigation = (req, res, next) => {
  const { error } = investigationMasterValidationSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.json(
      __requestResponse("400", {
        errorType: "Validation Error",
        error: error.details.map((d) => d.message).join(". "),
      })
    );
  }
  next();
};

module.exports = {
  validateSaveInvestigation,
};
