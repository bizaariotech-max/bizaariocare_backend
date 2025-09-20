const Joi = require("joi");
const { __requestResponse } = require("../utils/constant");

// Helper function for ObjectId validation
const objectIdField = (required = false) => {
  let schema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);
  return required ? schema.required() : schema.optional().allow("", null);
};

// Helper function for enum validation
const enumField = (values, required = false) => {
  let schema = Joi.string().valid(...values);
  return required ? schema.required() : schema.optional();
};

// Helper function for geolocation validation
const geolocationSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  address: Joi.string().trim().optional().allow(""),
  accuracy: Joi.number().optional()
});

// ==================== MAIN REFERRAL VALIDATIONS ====================

// Create Patient Referral Validation
const createPatientReferralSchema = Joi.object({
  PatientId: objectIdField(true).messages({
    "any.required": "Patient ID is required"
  }),
  ReferringDoctor: objectIdField(true).messages({
    "any.required": "Referring doctor is required"
  }),
  MedicalSpecialty: objectIdField().optional(),
  ReferredCity: objectIdField().optional(),
  ReferredDoctors: Joi.array().items(objectIdField()).optional(),
  ReferralDateTime: Joi.date().optional(),
  ReferralType: enumField(["GENERAL", "SECOND_OPINION", "MEDICAL_TOURISM"]).optional(),
  PriorityLevel: enumField(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  AdditionalInformation: Joi.string().trim().optional().allow(""),
  CreatedBy: objectIdField(true).messages({
    "any.required": "Created by is required"
  })
});

// ==================== REASON FOR REFERRAL VALIDATIONS ====================

// Reason for Referral Validation
const reasonForReferralSchema = Joi.object({
  ReasonType: objectIdField().optional(),
  UpdatedBy: objectIdField(true).messages({
    "any.required": "Updated by is required"
  })
});

// Doctor Remark Validation
const doctorRemarkSchema = Joi.object({
  Remark: Joi.string().trim().required().messages({
    "any.required": "Remark is required",
    "string.empty": "Remark cannot be empty"
  }),
  UpdatedBy: objectIdField(true).messages({
    "any.required": "Updated by is required"
  })
});

// ==================== SECOND OPINION VALIDATIONS ====================

// Second Opinion Questions Validation
const secondOpinionQuestionsSchema = Joi.object({
  SecondOpinionQueries: Joi.array().items(objectIdField()).optional(),
  UpdatedBy: objectIdField(true).messages({
    "any.required": "Updated by is required"
  })
});

// Second Opinion Question Validation
const secondOpinionQuestionSchema = Joi.object({
  Question: Joi.string().trim().required().messages({
    "any.required": "Question is required",
    "string.empty": "Question cannot be empty"
  }),
  UpdatedBy: objectIdField(true).messages({
    "any.required": "Updated by is required"
  })
});

// ==================== PROPOSED SURGERY VALIDATIONS ====================

// Proposed Surgery Validation
const proposedSurgerySchema = Joi.object({
  SurgeryProcedures: Joi.array().items(objectIdField()).optional(),
  DoctorNote: Joi.string().trim().optional().allow(""),
  UpdatedBy: objectIdField(true).messages({
    "any.required": "Updated by is required"
  })
});

// ==================== PRE-SURGICAL CONSIDERATIONS VALIDATIONS ====================

// Pre-Surgical Considerations Validation
const preSurgicalConsiderationsSchema = Joi.object({
  Comorbidities: Joi.array().items(objectIdField()).optional(),
  ComorbidityDefinition: Joi.string().trim().optional().allow(""),
  RiskFactors: Joi.array().items(objectIdField()).optional(),
  RiskFactorDefinition: Joi.string().trim().optional().allow(""),
  PatientConcerns: Joi.array().items(objectIdField()).optional(),
  LogisticalConsiderations: Joi.array().items(objectIdField()).optional(),
  UpdatedBy: objectIdField(true).messages({
    "any.required": "Updated by is required"
  })
});

// ==================== DOCTOR/HOSPITAL SELECTION VALIDATIONS ====================

// Doctor Hospital Selection Validation
const doctorHospitalSelectionSchema = Joi.object({
  SelectedCity: objectIdField().optional(),
  SelectedMedicalSpecialty: objectIdField().optional(),
  SelectedDoctors: Joi.array().items(objectIdField()).optional(),
  SelectionDateTime: Joi.date().optional(),
  Geolocation: geolocationSchema.optional(),
  UpdatedBy: objectIdField(true).messages({
    "any.required": "Updated by is required"
  })
});

// ==================== REFERRAL RESPONSE VALIDATIONS ====================

// Referral Response Validation
const referralResponseSchema = Joi.object({
  ResponseMessage: Joi.string().trim().optional().allow(""),
  AcceptanceStatus: enumField(["ACCEPTED", "REJECTED", "COUNTER_PROPOSAL"]).required().messages({
    "any.required": "Acceptance status is required"
  }),
  ProposedDateTime: Joi.date().optional(),
  RespondedBy: objectIdField(true).messages({
    "any.required": "Responded by is required"
  })
});

// ==================== STATUS UPDATE VALIDATIONS ====================

// Status Update Validation
const statusUpdateSchema = Joi.object({
  ReferralStatus: enumField(["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"]).required().messages({
    "any.required": "Referral status is required"
  }),
  PriorityLevel: enumField(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  UpdatedBy: objectIdField(true).messages({
    "any.required": "Updated by is required"
  })
});

// ==================== PARAMETER VALIDATIONS ====================

// Patient ID Parameter Validation
const patientIdParamSchema = Joi.object({
  patientId: objectIdField(true).messages({
    "any.required": "Patient ID parameter is required"
  })
});

// Referral ID Parameter Validation
const referralIdParamSchema = Joi.object({
  referralId: objectIdField(true).messages({
    "any.required": "Referral ID parameter is required"
  })
});

// Object ID Parameter Validation
const objectIdParamSchema = (paramName) => Joi.object({
  [paramName]: objectIdField(true).messages({
    "any.required": `${paramName} parameter is required`
  })
});

// Delete Request Validation
const deleteRequestSchema = Joi.object({
  UpdatedBy: objectIdField(true).messages({
    "any.required": "Updated by is required"
  })
});

// ==================== MIDDLEWARE FUNCTIONS ====================

// Create Patient Referral Validation Middleware
exports.validateCreatePatientReferral = (req, res, next) => {
  const { error } = createPatientReferralSchema.validate(req.body);
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json(__requestResponse("400", { 
      errorType: "Validation Error", 
      error: errorMessages 
    }));
  }
  next();
};

// Reason for Referral Validation Middleware
exports.validateReasonForReferral = (req, res, next) => {
  const { error } = reasonForReferralSchema.validate(req.body);
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json(__requestResponse("400", { 
      errorType: "Validation Error", 
      error: errorMessages 
    }));
  }
  next();
};

// Doctor Remark Validation Middleware
exports.validateDoctorRemark = (req, res, next) => {
  const { error } = doctorRemarkSchema.validate(req.body);
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json(__requestResponse("400", { 
      errorType: "Validation Error", 
      error: errorMessages 
    }));
  }
  next();
};

// Second Opinion Questions Validation Middleware
exports.validateSecondOpinionQuestions = (req, res, next) => {
  const { error } = secondOpinionQuestionsSchema.validate(req.body);
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json(__requestResponse("400", { 
      errorType: "Validation Error", 
      error: errorMessages 
    }));
  }
  next();
};

// Second Opinion Question Validation Middleware
exports.validateSecondOpinionQuestion = (req, res, next) => {
  const { error } = secondOpinionQuestionSchema.validate(req.body);
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json(__requestResponse("400", { 
      errorType: "Validation Error", 
      error: errorMessages 
    }));
  }
  next();
};

// Proposed Surgery Validation Middleware
exports.validateProposedSurgery = (req, res, next) => {
  const { error } = proposedSurgerySchema.validate(req.body);
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json(__requestResponse("400", { 
      errorType: "Validation Error", 
      error: errorMessages 
    }));
  }
  next();
};

// Pre-Surgical Considerations Validation Middleware
exports.validatePreSurgicalConsiderations = (req, res, next) => {
  const { error } = preSurgicalConsiderationsSchema.validate(req.body);
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json(__requestResponse("400", { 
      errorType: "Validation Error", 
      error: errorMessages 
    }));
  }
  next();
};

// Doctor Hospital Selection Validation Middleware
exports.validateDoctorHospitalSelection = (req, res, next) => {
  const { error } = doctorHospitalSelectionSchema.validate(req.body);
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json(__requestResponse("400", { 
      errorType: "Validation Error", 
      error: errorMessages 
    }));
  }
  next();
};

// Referral Response Validation Middleware
exports.validateReferralResponse = (req, res, next) => {
  const { error } = referralResponseSchema.validate(req.body);
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json(__requestResponse("400", { 
      errorType: "Validation Error", 
      error: errorMessages 
    }));
  }
  next();
};

// Status Update Validation Middleware
exports.validateStatusUpdate = (req, res, next) => {
  const { error } = statusUpdateSchema.validate(req.body);
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json(__requestResponse("400", { 
      errorType: "Validation Error", 
      error: errorMessages 
    }));
  }
  next();
};

// Parameter Validation Middlewares
exports.validatePatientIdParam = (req, res, next) => {
  const { error } = patientIdParamSchema.validate(req.params);
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json(__requestResponse("400", { 
      errorType: "Validation Error", 
      error: errorMessages 
    }));
  }
  next();
};

exports.validateReferralIdParam = (req, res, next) => {
  const { error } = referralIdParamSchema.validate(req.params);
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json(__requestResponse("400", { 
      errorType: "Validation Error", 
      error: errorMessages 
    }));
  }
  next();
};

exports.validateObjectIdParam = (paramName) => {
  return (req, res, next) => {
    const { error } = objectIdParamSchema(paramName).validate(req.params);
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json(__requestResponse("400", { 
        errorType: "Validation Error", 
        error: errorMessages 
      }));
    }
    next();
  };
};

exports.validateDeleteRequest = (req, res, next) => {
  const { error } = deleteRequestSchema.validate(req.body);
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json(__requestResponse("400", { 
      errorType: "Validation Error", 
      error: errorMessages 
    }));
  }
  next();
};