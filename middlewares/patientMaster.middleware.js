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

  // 1. Patient ID (Auto-generated, not validated in input)
  PatientId: Joi.string().optional(),
ProfilePic : Joi.string().allow("",null).optional(),
  // 2. Phone Number with ISD Code (Format: +91838383930)
  PhoneNumber: Joi.string()
    .pattern(/^\+[1-9]\d{1,14}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be in international format (e.g., +91838383930) with country code",
      "any.required": "Phone number is required"
    }),

  // ISDCode field removed as it's now part of PhoneNumber

  // 3. Is Verified
  IsVerified: Joi.boolean().optional().default(false),

  // 4. Name
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

  // 5. Age/DOB
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

  // 6. Gender
  Gender: Joi.string()
    .valid('Male', 'Female', 'Other')
    .required()
    .messages({
      "any.only": "Gender must be Male, Female, or Other",
      "any.required": "Gender is required"
    }),

  // 7. Nationality (Station Master - Country)
  Nationality: objectIdField(true).messages({
    "any.required": "Nationality is required"
  }),

  // 8. Country of Residence (Station Master - Country)
  CountryOfResidence: objectIdField(true).messages({
    "any.required": "Country of residence is required"
  }),

  // 9. Address Line 1
  AddressLine1: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .required()
    .messages({
      "string.empty": "Address Line 1 is required",
      "string.min": "Address Line 1 cannot be empty",
      "string.max": "Address Line 1 cannot exceed 200 characters",
      "any.required": "Address Line 1 is required"
    }),

  // 10. Address Line 2
  AddressLine2: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow("", null)
    .messages({
      "string.max": "Address Line 2 cannot exceed 200 characters"
    }),

  // 11. State (Station Master)
  State: objectIdField(false),

  // 12. City
  City: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      "string.empty": "City is required",
      "string.min": "City cannot be empty",
      "string.max": "City cannot exceed 100 characters",
      "any.required": "City is required"
    }),

  // 13. Postal Code
  PostalCode: Joi.string()
    .trim()
    .pattern(/^[A-Za-z0-9\s-]{3,10}$/)
    .optional()
    .allow("", null)
    .messages({
      "string.pattern.base": "Postal code must be 3-10 characters (letters, numbers, spaces, hyphens allowed)"
    }),

  // 14. Insurance Provider (Admin Lookups)
  InsuranceProvider: objectIdField(false),

  // 15. Insurance Policy Number
  InsurancePolicyNumber: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow("", null)
    .messages({
      "string.max": "Insurance policy number cannot exceed 50 characters"
    }),

  // 16. Insurance Valid Upto
  InsuranceValidUpto: Joi.date()
    .min('now')
    .optional()
    .allow(null)
    .messages({
      "date.min": "Insurance validity date cannot be in the past"
    }),

  // 17. Email Address (optional)
  EmailAddress: Joi.string()
    .email()
    .trim()
    .lowercase()
    .optional()
    .allow("", null)
    .messages({
      "string.email": "Please enter a valid email address"
    }),

  // 18. Secondary Contact Name
  SecondaryContactName: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow("", null)
    .messages({
      "string.max": "Secondary contact name cannot exceed 100 characters"
    }),

  // 19. Secondary Contact Number (also with ISD code)
  SecondaryContactNumber: Joi.string()
    .pattern(/^\+[1-9]\d{1,14}$/)
    .optional()
    .allow("", null)
    .messages({
      "string.pattern.base": "Secondary contact number must be in international format (e.g., +91838383930) with country code"
    }),

  // 20. Relationship (Admin Lookups)
  Relationship: objectIdField(false),

  // 21. Record Created By (Asset Master)
  CreatedBy: objectIdField(true).messages({
    "any.required": "Created by is required"
  }),

  // System Fields
  IsActive: Joi.boolean().optional().default(true),
  IsDeleted: Joi.boolean().optional().default(false),
  UpdatedBy: objectIdField(false)
});

// Validation for patient list/search
const patientListValidationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().trim().optional().allow(""),
  Gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
  Nationality: objectIdField(false),
  CountryOfResidence: objectIdField(false),
  State: objectIdField(false),
  City: Joi.string().trim().optional(),
  IsVerified: Joi.boolean().optional(),
  IsActive: Joi.boolean().optional(),
  InsuranceProvider: objectIdField(false)
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