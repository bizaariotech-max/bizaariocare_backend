const Joi = require("joi");
const mongoose = require("mongoose");
const { __requestResponse } = require("../utils/constant");
const PatientCaseFile = require("../modals/Patient/PatientCaseFile");
const Patient = require("../modals/Patient/PatientMaster");

// Helper for ObjectId validation
const objectId = (field, required = true) =>
  Joi.string()
    .custom((value, helpers) => {
      if (!value && !required) return value;
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid", { field });
      }
      return value;
    })
    [required ? "required" : "optional"]()
    .messages({
      "any.required": `${field} is required`,
      "any.invalid": `Invalid ${field} format`,
      "string.empty": `${field} cannot be empty`,
      "string.base": `${field} must be a string`,
    });

// Duration Schema
const durationSchema = Joi.object({
  Value: Joi.number().min(0).required().messages({
    "number.base": "Duration Value must be a number",
    "number.min": "Duration Value must be greater than or equal to 0",
  }),
  Unit: objectId("Duration Unit"),
}).required();

// Individual schemas
const chiefComplaintSchema = Joi.object({
  _id: objectId("Chief Complaint ID", false),
  Symptoms: Joi.array().items(objectId("Symptom")).min(1).required().messages({
    "array.base": "Symptoms must be an array",
    "array.min": "At least one Symptom is required",
  }),
  Duration: durationSchema,
  SeverityGrade: Joi.number().valid(1, 2, 3, 4, 5, 6).required().messages({
    "number.base": "SeverityGrade must be a number",
    "any.only": "SeverityGrade must be between 1 and 6",
  }),
  AggravatingFactors: Joi.array()
    .items(objectId("Aggravating Factor"))
    .min(1)
    .required()
    .messages({
      "array.base": "AggravatingFactors must be an array",
      "array.min": "At least one Aggravating Factor is required",
    }),
});

const clinicalDiagnosisSchema = Joi.object({
  _id: objectId("Clinical Diagnosis ID", false),
  Date: Joi.date().optional(),
  InvestigationCategory: objectId("Investigation Category", false),
  Investigation: objectId("Investigation", false),
  Abnormalities: Joi.array().items(objectId("Abnormality", false)).optional(),
  ReportUrl: Joi.string().trim().allow("", null).optional(),
  InterpretationUrl: Joi.string().trim().allow("", null).optional(),
});

const medicineSchema = Joi.object({
  _id: objectId("Medicine ID", false),
  MedicineName: objectId("Medicine Name", false),
  Dosage: objectId("Dosage", false),
  DurationInDays: Joi.number().min(0).optional().messages({
    "number.base": "DurationInDays must be a number",
    "number.min": "DurationInDays must be greater than or equal to 0",
  }),
});

const medicinesPrescribedSchema = Joi.object({
  Medicines: Joi.array().items(medicineSchema).min(1).required().messages({
    "array.base": "Medicines must be an array",
    "array.min": "At least one Medicine is required",
  }),
  RecoveryCycle: Joi.object({
    Value: Joi.number().min(0).optional(),
    Unit: objectId("Recovery Unit", false),
  }).optional(),
  PrescriptionUrls: Joi.array()
    .items(Joi.string().trim().allow("", null))
    .optional(),
});

const therapySchema = Joi.object({
  _id: objectId("Therapy ID", false),
  TherapyName: objectId("Therapy Name", false),
  PatientResponse: objectId("Patient Response", false),
});

// Section-specific validation schemas
const sectionSchemas = {
  ChiefComplaints: {
    // Single operations
    add: Joi.object({
      CaseFileId: objectId("CaseFileId"),
      ChiefComplaint: chiefComplaintSchema.required(),
      CreatedBy: objectId("CreatedBy"),
    }),
    edit: Joi.object({
      _id: objectId("Chief Complaint ID"),
      CaseFileId: objectId("CaseFileId"),
      ChiefComplaint: chiefComplaintSchema.required(),
      UpdatedBy: objectId("UpdatedBy"),
    }),

    // Multiple operations
    addMultiple: Joi.object({
      CaseFileId: objectId("CaseFileId"),
      ChiefComplaints: Joi.array()
        .items(chiefComplaintSchema)
        .min(1)
        .required()
        .messages({
          "array.base": "ChiefComplaints must be an array",
          "array.min": "At least one Chief Complaint is required",
        }),
      CreatedBy: objectId("CreatedBy"),
    }),
    editMultiple: Joi.object({
      CaseFileId: objectId("CaseFileId"),
      ChiefComplaints: Joi.array()
        .items(chiefComplaintSchema)
        .min(1)
        .required()
        .messages({
          "array.base": "ChiefComplaints must be an array",
          "array.min": "At least one Chief Complaint is required",
        }),
      UpdatedBy: objectId("UpdatedBy"),
    }),

    list: Joi.object({
      CaseFileId: objectId("CaseFileId", false),
      PatientId: objectId("PatientId", false),
      page: Joi.number().min(1).optional(),
      limit: Joi.number().min(1).max(100).optional(),
      search: Joi.string().trim().allow("").optional(),
    }),
  },

  ClinicalDiagnoses: {
    // Single operations
    add: Joi.object({
      CaseFileId: objectId("CaseFileId"),
      ClinicalDiagnosis: clinicalDiagnosisSchema.required(),
      CreatedBy: objectId("CreatedBy"),
    }),
    edit: Joi.object({
      _id: objectId("Clinical Diagnosis ID"),
      CaseFileId: objectId("CaseFileId"),
      ClinicalDiagnosis: clinicalDiagnosisSchema.required(),
      UpdatedBy: objectId("UpdatedBy"),
    }),

    // Multiple operations
    addMultiple: Joi.object({
      CaseFileId: objectId("CaseFileId"),
      ClinicalDiagnoses: Joi.array()
        .items(clinicalDiagnosisSchema)
        .min(1)
        .required()
        .messages({
          "array.base": "ClinicalDiagnoses must be an array",
          "array.min": "At least one Clinical Diagnosis is required",
        }),
      CreatedBy: objectId("CreatedBy"),
    }),
    editMultiple: Joi.object({
      CaseFileId: objectId("CaseFileId"),
      ClinicalDiagnoses: Joi.array()
        .items(clinicalDiagnosisSchema)
        .min(1)
        .required()
        .messages({
          "array.base": "ClinicalDiagnoses must be an array",
          "array.min": "At least one Clinical Diagnosis is required",
        }),
      UpdatedBy: objectId("UpdatedBy"),
    }),

    list: Joi.object({
      CaseFileId: objectId("CaseFileId", false),
      PatientId: objectId("PatientId", false),
      page: Joi.number().min(1).optional(),
      limit: Joi.number().min(1).max(100).optional(),
      search: Joi.string().trim().allow("").optional(),
    }),
  },

  Therapies: {
    // Single operations
    add: Joi.object({
      CaseFileId: objectId("CaseFileId"),
      Therapy: therapySchema.required(),
      CreatedBy: objectId("CreatedBy"),
    }),
    edit: Joi.object({
      _id: objectId("Therapy ID"),
      CaseFileId: objectId("CaseFileId"),
      Therapy: therapySchema.required(),
      UpdatedBy: objectId("UpdatedBy"),
    }),

    // Multiple operations
    addMultiple: Joi.object({
      CaseFileId: objectId("CaseFileId"),
      Therapies: Joi.array().items(therapySchema).min(1).required().messages({
        "array.base": "Therapies must be an array",
        "array.min": "At least one Therapy is required",
      }),
      CreatedBy: objectId("CreatedBy"),
    }),
    editMultiple: Joi.object({
      CaseFileId: objectId("CaseFileId"),
      Therapies: Joi.array().items(therapySchema).min(1).required().messages({
        "array.base": "Therapies must be an array",
        "array.min": "At least one Therapy is required",
      }),
      UpdatedBy: objectId("UpdatedBy"),
    }),

    list: Joi.object({
      CaseFileId: objectId("CaseFileId", false),
      PatientId: objectId("PatientId", false),
      page: Joi.number().min(1).optional(),
      limit: Joi.number().min(1).max(100).optional(),
      search: Joi.string().trim().allow("").optional(),
    }),
  },

  MedicinesPrescribed: {
    add: Joi.object({
      CaseFileId: objectId("CaseFileId"),
      MedicinesPrescribed: medicinesPrescribedSchema.required(),
      CreatedBy: objectId("CreatedBy"),
    }),
    edit: Joi.object({
      CaseFileId: objectId("CaseFileId"),
      MedicinesPrescribed: medicinesPrescribedSchema.required(),
      UpdatedBy: objectId("UpdatedBy"),
    }),
    list: Joi.object({
      CaseFileId: objectId("CaseFileId", false),
      PatientId: objectId("PatientId", false),
      page: Joi.number().min(1).optional(),
      limit: Joi.number().min(1).max(100).optional(),
      search: Joi.string().trim().allow("").optional(),
      expandMedicines: Joi.string().valid("true", "false").optional(),
    }),
    addMedicine: Joi.object({
      CaseFileId: objectId("CaseFileId"),
      Medicine: medicineSchema.required(),
      CreatedBy: objectId("CreatedBy"),
    }),
    editMedicine: Joi.object({
      _id: objectId("Medicine ID"),
      CaseFileId: objectId("CaseFileId"),
      Medicine: medicineSchema.required(),
      UpdatedBy: objectId("UpdatedBy"),
    }),
  },
};

// Main medical history validation
const medicalHistorySchema = Joi.object({
  _id: objectId("_id", false),
  CaseFileId: objectId("CaseFileId"),
  PatientId: objectId("PatientId"),
  ChiefComplaints: Joi.array().items(chiefComplaintSchema).optional(),
  ClinicalDiagnoses: Joi.array().items(clinicalDiagnosisSchema).optional(),
  MedicinesPrescribed: medicinesPrescribedSchema.optional(),
  Therapies: Joi.array().items(therapySchema).optional(),
  Status: Joi.string()
    .valid(
      "Active",
      "Ongoing",
      "In-Treatment",
      "Monitoring",
      "Chronic",
      "Resolved",
      "Cured",
      "Past"
    )
    .optional(),
  Notes: Joi.string().trim().allow("", null).optional(),
  IsActive: Joi.boolean().optional(),
  IsDeleted: Joi.boolean().optional(),
  CreatedBy: objectId("CreatedBy"),
  UpdatedBy: objectId("UpdatedBy", false),
});

// Generic validation function
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(
      req.method === "GET" ? req.query : req.body,
      {
        abortEarly: false,
        allowUnknown: false,
      }
    );

    if (error) {
      return res.json(
        __requestResponse("400", {
          errorType: "Validation Error",
          error: error.details
            .map((d) => d.message)
            .filter((value, index, self) => self.indexOf(value) === index)
            .join(". "),
        })
      );
    }
    next();
  };
};

// Case file validation
const validateCaseFile = async (req, res, next) => {
  try {
    const { CaseFileId } = req.method === "GET" ? req.query : req.body;

    if (CaseFileId) {
      const caseFile = await PatientCaseFile.findById(CaseFileId);
      if (!caseFile) {
        return res.json(
          __requestResponse("404", {
            errorType: "Not Found",
            error: "Case File does not exist",
          })
        );
      }
      req.caseFile = caseFile;
    }
    next();
  } catch (err) {
    return res.json(
      __requestResponse("500", {
        errorType: "Server Error",
        error: "Error validating case file",
      })
    );
  }
};

// Main medical history validation
exports.validateMedicalHistory = async (req, res, next) => {
  try {
    const { error } = medicalHistorySchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error) {
      return res.json(
        __requestResponse("400", {
          errorType: "Validation Error",
          error: error.details.map((d) => d.message).join(". "),
        })
      );
    }

    const caseFile = await PatientCaseFile.findById(req.body.CaseFileId);
    if (!caseFile) {
      return res.json(
        __requestResponse("404", {
          errorType: "Not Found",
          error: "Case File does not exist",
        })
      );
    }

    const patient = await Patient.findById(req.body.PatientId);
    if (!patient) {
      return res.json(
        __requestResponse("404", {
          errorType: "Not Found",
          error: "Patient does not exist",
        })
      );
    }

    if (caseFile.PatientId.toString() !== req.body.PatientId) {
      return res.json(
        __requestResponse("400", {
          errorType: "Validation Error",
          error: "PatientId does not match Case File's PatientId",
        })
      );
    }

    next();
  } catch (err) {
    return res.json(
      __requestResponse("500", {
        errorType: "Server Error",
        error: "Error validating medical history",
      })
    );
  }
};

// Chief Complaints validators
exports.validateChiefComplaintsAdd = [
  validateRequest(sectionSchemas.ChiefComplaints.add),
  validateCaseFile,
];
exports.validateChiefComplaintsEdit = [
  validateRequest(sectionSchemas.ChiefComplaints.edit),
  validateCaseFile,
];
exports.validateChiefComplaintsAddMultiple = [
  validateRequest(sectionSchemas.ChiefComplaints.addMultiple),
  validateCaseFile,
];
exports.validateChiefComplaintsEditMultiple = [
  validateRequest(sectionSchemas.ChiefComplaints.editMultiple),
  validateCaseFile,
];
exports.validateChiefComplaintsList = [
  validateRequest(sectionSchemas.ChiefComplaints.list),
  validateCaseFile,
];

// Clinical Diagnoses validators
exports.validateClinicalDiagnosesAdd = [
  validateRequest(sectionSchemas.ClinicalDiagnoses.add),
  validateCaseFile,
];
exports.validateClinicalDiagnosesEdit = [
  validateRequest(sectionSchemas.ClinicalDiagnoses.edit),
  validateCaseFile,
];
exports.validateClinicalDiagnosesAddMultiple = [
  validateRequest(sectionSchemas.ClinicalDiagnoses.addMultiple),
  validateCaseFile,
];
exports.validateClinicalDiagnosesEditMultiple = [
  validateRequest(sectionSchemas.ClinicalDiagnoses.editMultiple),
  validateCaseFile,
];
exports.validateClinicalDiagnosesList = [
  validateRequest(sectionSchemas.ClinicalDiagnoses.list),
  validateCaseFile,
];

// Therapies validators
exports.validateTherapiesAdd = [
  validateRequest(sectionSchemas.Therapies.add),
  validateCaseFile,
];
exports.validateTherapiesEdit = [
  validateRequest(sectionSchemas.Therapies.edit),
  validateCaseFile,
];
exports.validateTherapiesAddMultiple = [
  validateRequest(sectionSchemas.Therapies.addMultiple),
  validateCaseFile,
];
exports.validateTherapiesEditMultiple = [
  validateRequest(sectionSchemas.Therapies.editMultiple),
  validateCaseFile,
];
exports.validateTherapiesList = [
  validateRequest(sectionSchemas.Therapies.list),
  validateCaseFile,
];

// Medicines Prescribed validators
exports.validateMedicinesPrescribedAdd = [
  validateRequest(sectionSchemas.MedicinesPrescribed.add),
  validateCaseFile,
];
exports.validateMedicinesPrescribedEdit = [
  validateRequest(sectionSchemas.MedicinesPrescribed.edit),
  validateCaseFile,
];
exports.validateMedicinesPrescribedList = [
  validateRequest(sectionSchemas.MedicinesPrescribed.list),
  validateCaseFile,
];
exports.validateAddMedicine = [
  validateRequest(sectionSchemas.MedicinesPrescribed.addMedicine),
  validateCaseFile,
];
exports.validateEditMedicine = [
  validateRequest(sectionSchemas.MedicinesPrescribed.editMedicine),
  validateCaseFile,
];

// Medical history list validation
exports.validateMedicalHistoryList = validateRequest(
  Joi.object({
    CaseFileId: objectId("CaseFileId", false),
    PatientId: objectId("PatientId", false),
    Status: Joi.string()
      .valid(
        "Active",
        "Ongoing",
        "In-Treatment",
        "Monitoring",
        "Chronic",
        "Resolved",
        "Cured",
        "Past"
      )
      .optional(),
    FromDate: Joi.date().optional(),
    ToDate: Joi.date().optional(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(100).optional(),
    search: Joi.string().trim().allow("").optional(),
  })
);
