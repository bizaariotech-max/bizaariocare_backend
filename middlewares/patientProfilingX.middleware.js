const Joi = require("joi");
const { __requestResponse } = require("../utils/constant");

// Helper function for ObjectId validation
const objectIdField = (required = false) => {
  let schema = Joi.string().regex(/^[0-9a-fA-F]{24}$/);
  return required ? schema.required() : schema.optional().allow("", null);
};

// Helper function for severity grade validation
const severityGradeField = () => {
  return Joi.number().integer().min(1).max(5).required().messages({
    "number.min": "Severity grade must be between 1 and 5",
    "number.max": "Severity grade must be between 1 and 5",
    "any.required": "Severity grade is required"
  });
};

// ==================== MAIN PROFILING VALIDATIONS ====================

// Create Patient Profiling Validation
const createPatientProfilingSchema = Joi.object({
  PatientId: objectIdField(true).messages({
    "any.required": "Patient ID is required"
  }),
  CreatedBy: objectIdField(true).messages({
    "any.required": "Created by is required"
  })
});

// ==================== CHIEF COMPLAINTS VALIDATIONS ====================

// Chief Complaint Validation
const chiefComplaintSchema = Joi.object({
  SymptomClass: Joi.array().items(objectIdField()).optional(),
  Complaint: objectIdField().messages({
    "any.required": "Complaint is required"
  }),
  Duration: Joi.number().min(0).optional().messages({
    "number.min": "Duration cannot be negative"
  }),
  SeverityGrade: severityGradeField().optional(),
  AggravatingFactors: Joi.array().items(objectIdField()).optional(),
  CurrentMedications: objectIdField(),
  Dosage: objectIdField(),
  Frequency: objectIdField(),
  CurrentTherapies: objectIdField(),
  UpdatedBy: objectIdField(true).messages({
    "any.required": "Updated by is required"
  })
});

// ==================== MEDICAL SUMMARY VALIDATIONS ====================

// Medical Summary Validation
const medicalSummarySchema = Joi.object({
  PastIllness: Joi.array().items(objectIdField()).optional(),
  PastSurgeries: Joi.array().items(objectIdField()).optional(),
  PastAccidentsTrauma: Joi.array().items(objectIdField()).optional(),
  KnownAllergies: Joi.array().items(objectIdField()).optional(),
  OccupationalProfile: Joi.array().items(objectIdField()).optional(),
  HabitsLifestyles: Joi.array().items(objectIdField()).optional(),
  FamilyHistory: Joi.array().items(objectIdField()).optional(),
  UpdatedBy: objectIdField(true).messages({
    "any.required": "Updated by is required"
  })
});

// Past Medication Validation
const pastMedicationSchema = Joi.object({
  Medicines: objectIdField(),
  Dosage: objectIdField(),
  Frequency: objectIdField(),
  Therapies: objectIdField(),
  UpdatedBy: objectIdField(true).messages({
    "any.required": "Updated by is required"
  })
});

// ==================== CLINICAL FINDINGS VALIDATIONS ====================

// Clinical Finding Validation
const clinicalFindingSchema = Joi.object({
  Symptoms: objectIdField().messages({
    "any.required": "Symptoms is required"
  }),
  Duration: Joi.number().min(0).optional().messages({
    "number.min": "Duration cannot be negative"
  }),
  SeverityGrade: severityGradeField().optional(),
  AggravatingFactors: Joi.array().items(objectIdField()).optional(),
  UpdatedBy: objectIdField(true).messages({
    "any.required": "Updated by is required"
  })
});

// ==================== VITALS/PHYSICAL EXAMINATIONS VALIDATIONS ====================

// Vital Examination Validation
const vitalExaminationSchema = Joi.object({
  Parameter: objectIdField(true).messages({
    "any.required": "Parameter is required"
  }),
  Value: Joi.number().optional(),
  Abnormalities: Joi.array().items(Joi.string().trim()).optional(),
  UpdatedBy: objectIdField(true).messages({
    "any.required": "Updated by is required"
  })
});

// ==================== DIAGNOSTICS/INVESTIGATIONS VALIDATIONS ====================

// Investigation Validation
const investigationSchema = Joi.object({
  InvestigationCategory: objectIdField(true).messages({
    "any.required": "Investigation category is required"
  }),
  Investigation: objectIdField(true).messages({
    "any.required": "Investigation is required"
  }),
  Value: Joi.number().optional(),
  Abnormalities: Joi.array().items(Joi.string().trim()).optional(),
  InvestigationReport: Joi.string().trim().optional().allow(""),
  Interpretation: Joi.string().trim().optional().allow(""),
  GoogleDriveURL: Joi.string().uri().optional().allow("").messages({
    "string.uri": "Google Drive URL must be a valid URL"
  }),
  UpdatedBy: objectIdField(true).messages({
    "any.required": "Updated by is required"
  })
});

// ==================== DIAGNOSIS VALIDATIONS ====================

// Diagnosis Validation
const diagnosisSchema = Joi.object({
  CurrentDiagnosis: objectIdField(true).messages({
    "any.required": "Current diagnosis is required"
  }),
  TypeOfDiagnosis: objectIdField().optional(),
  ClinicalNote: Joi.string().trim().optional().allow(""),
  UpdatedBy: objectIdField(true).messages({
    "any.required": "Updated by is required"
  })
});

// ==================== TREATMENT TO DATE VALIDATIONS ====================

// Treatment to Date Validation
const treatmentToDateSchema = Joi.object({
  SurgeryProcedure: Joi.array().items(objectIdField()).optional(),
  Therapy: Joi.array().items(objectIdField()).optional(),
  LifestyleInterventions: Joi.array().items(objectIdField()).optional(),
  PatientResponse: Joi.string().trim().optional().allow(""),
  ClinicalNote: Joi.string().trim().optional().allow(""),
  UpdatedBy: objectIdField(true).messages({
    "any.required": "Updated by is required"
  })
});

// Treatment Medicine Validation
const treatmentMedicineSchema = Joi.object({
  Medicine: objectIdField(true).messages({
    "any.required": "Medicine is required"
  }),
  Dosage: objectIdField().optional(),
  Frequency: objectIdField().optional(),
  UpdatedBy: objectIdField(true).messages({
    "any.required": "Updated by is required"
  })
});

// ==================== MIDDLEWARE FUNCTIONS ====================

// Validate Create Patient Profiling
exports.validateCreatePatientProfiling = (req, res, next) => {
  const { error } = createPatientProfilingSchema.validate(req.body);
  if (error) {
    return res.json(__requestResponse("400", {
      errorType: "Validation Error",
      error: error.details.map((d) => d.message).join(". ")
    }));
  }
  next();
};

// Validate Chief Complaint
exports.validateChiefComplaint = (req, res, next) => {
  const { error } = chiefComplaintSchema.validate(req.body);
  if (error) {
    return res.json(__requestResponse("400", {
      errorType: "Validation Error",
      error: error.details.map((d) => d.message).join(". ")
    }));
  }
  next();
};

// Validate Medical Summary
exports.validateMedicalSummary = (req, res, next) => {
  const { error } = medicalSummarySchema.validate(req.body);
  if (error) {
    return res.json(__requestResponse("400", {
      errorType: "Validation Error",
      error: error.details.map((d) => d.message).join(". ")
    }));
  }
  next();
};

// Validate Past Medication
exports.validatePastMedication = (req, res, next) => {
  const { error } = pastMedicationSchema.validate(req.body);
  if (error) {
    return res.json(__requestResponse("400", {
      errorType: "Validation Error",
      error: error.details.map((d) => d.message).join(". ")
    }));
  }
  next();
};

// Validate Clinical Finding
exports.validateClinicalFinding = (req, res, next) => {
  const { error } = clinicalFindingSchema.validate(req.body);
  if (error) {
    return res.json(__requestResponse("400", {
      errorType: "Validation Error",
      error: error.details.map((d) => d.message).join(". ")
    }));
  }
  next();
};

// Validate Vital Examination
exports.validateVitalExamination = (req, res, next) => {
  const { error } = vitalExaminationSchema.validate(req.body);
  if (error) {
    return res.json(__requestResponse("400", {
      errorType: "Validation Error",
      error: error.details.map((d) => d.message).join(". ")
    }));
  }
  next();
};

// Validate Investigation
exports.validateInvestigation = (req, res, next) => {
  const { error } = investigationSchema.validate(req.body);
  if (error) {
    return res.json(__requestResponse("400", {
      errorType: "Validation Error",
      error: error.details.map((d) => d.message).join(". ")
    }));
  }
  next();
};

// Validate Diagnosis
exports.validateDiagnosis = (req, res, next) => {
  const { error } = diagnosisSchema.validate(req.body);
  if (error) {
    return res.json(__requestResponse("400", {
      errorType: "Validation Error",
      error: error.details.map((d) => d.message).join(". ")
    }));
  }
  next();
};

// Validate Treatment to Date
exports.validateTreatmentToDate = (req, res, next) => {
  const { error } = treatmentToDateSchema.validate(req.body);
  if (error) {
    return res.json(__requestResponse("400", {
      errorType: "Validation Error",
      error: error.details.map((d) => d.message).join(". ")
    }));
  }
  next();
};

// Validate Treatment Medicine
exports.validateTreatmentMedicine = (req, res, next) => {
  const { error } = treatmentMedicineSchema.validate(req.body);
  if (error) {
    return res.json(__requestResponse("400", {
      errorType: "Validation Error",
      error: error.details.map((d) => d.message).join(". ")
    }));
  }
  next();
};

// Validate Patient ID Parameter
exports.validatePatientIdParam = (req, res, next) => {
  const { patientId } = req.params;
  
  if (!patientId || !/^[0-9a-fA-F]{24}$/.test(patientId)) {
    return res.json(__requestResponse("400", {
      errorType: "Validation Error",
      error: "Invalid Patient ID format"
    }));
  }
  next();
};

// Validate ObjectId Parameter
exports.validateObjectIdParam = (paramName) => {
  return (req, res, next) => {
    const paramValue = req.params[paramName];
    
    if (!paramValue || !/^[0-9a-fA-F]{24}$/.test(paramValue)) {
      return res.json(__requestResponse("400", {
        errorType: "Validation Error",
        error: `Invalid ${paramName} format`
      }));
    }
    next();
  };
};

// Validate Delete Request (requires UpdatedBy in body)
exports.validateDeleteRequest = (req, res, next) => {
  const { UpdatedBy } = req.body;
  
  if (!UpdatedBy || !/^[0-9a-fA-F]{24}$/.test(UpdatedBy)) {
    return res.json(__requestResponse("400", {
      errorType: "Validation Error",
      error: "Valid UpdatedBy field is required for delete operations"
    }));
  }
  next();
};