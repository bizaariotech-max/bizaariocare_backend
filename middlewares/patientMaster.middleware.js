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

// Validation schema for PatientMaster
const patientMasterValidationSchema = Joi.object({
  _id: objectIdField(false),

  // Patient Personal Information
  Name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      "string.empty": "Patient name is required",
      "string.min": "Patient name cannot be empty",
      "string.max": "Name cannot exceed 100 characters",
      "any.required": "Patient name is required"
    }),

  Age: Joi.number()
    .integer()
    .min(0)
    .max(150)
    .optional()
    .allow(null)
    .messages({
      "number.min": "Age cannot be negative",
      "number.max": "Age cannot exceed 150 years",
      "number.integer": "Age must be a whole number"
    }),

  DateOfBirth: Joi.date()
    .max('now')
    .optional()
    .allow(null)
    .messages({
      "date.max": "Date of birth cannot be in the future"
    }),

  Gender: Joi.string()
    .valid('Male', 'Female', 'Other')
    .required()
    .messages({
      "any.only": "Gender must be Male, Female, or Other",
      "any.required": "Gender is required"
    }),

  Nationality: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      "string.empty": "Nationality is required",
      "string.min": "Nationality cannot be empty",
      "string.max": "Nationality cannot exceed 50 characters",
      "any.required": "Nationality is required"
    }),

  // Referring Doctor Information
  ReferringDoctorId: objectIdField(false),

  // Contact Information
  PhoneNumber: Joi.string()
    .pattern(/^\+[1-9]\d{1,14}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must include valid ISD code (e.g., +91xxxxxxxxxx)",
      "any.required": "Phone number is required"
    }),

  EmailAddress: Joi.string()
    .email()
    .trim()
    .lowercase()
    .optional()
    .allow("", null)
    .messages({
      "string.email": "Please enter a valid email address"
    }),

  // Status and Metadata
  IsActive: Joi.boolean().optional().default(true),
  IsDeleted: Joi.boolean().optional().default(false),

  // Audit Trail
  CreatedBy: objectIdField(false),
  UpdatedBy: objectIdField(false)
});

// Validation for patient list/search
const patientListValidationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().trim().optional().allow(""),
  Gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
  Nationality: Joi.string().trim().optional(),
  ReferringDoctorId: objectIdField(false),
  IsActive: Joi.boolean().optional()
});

const validateSavePatient = (req, res, next) => {
  const { error } = patientMasterValidationSchema.validate(req.body, {
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

const validatePatientList = (req, res, next) => {
  // Handle both req.body and req.query
  const requestData = req.body || req.query || {};
  
  const { error } = patientListValidationSchema.validate(requestData, {
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
  validateSavePatient,
  validatePatientList,
};