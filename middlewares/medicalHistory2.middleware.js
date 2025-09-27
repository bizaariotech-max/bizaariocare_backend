const Joi = require("joi");
const mongoose = require("mongoose");
const { __requestResponse } = require("../utils/constant");
const PatientCaseFile = require("../modals/Patient/PatientCaseFile");
const Patient = require("../modals/Patient/PatientMaster");

// 1. Add array validation helpers
const validateArrayItems = (items, type) => {
  if (!Array.isArray(items)) return false;
  return items.every((item) => mongoose.Types.ObjectId.isValid(item));
};

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

// Chief Complaint Schema
const chiefComplaintSchema = Joi.object({
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

// // Section schemas
// const doctorHospitalInfoSchema = Joi.object({
//   Date: Joi.date().optional(),
//   DoctorName: Joi.string().trim().allow("", null).optional(),
//   DoctorNumber: Joi.string().trim().allow("", null).optional(),
//   HospitalName: Joi.string().trim().allow("", null).optional(),
//   HospitalLocation: Joi.string().trim().allow("", null).optional(),
//   MedicalSpeciality: objectId("MedicalSpeciality", false),
// }).optional();

const clinicalDiagnosisSchema = Joi.object({
  Date: Joi.date().optional(),
  InvestigationCategory: objectId("Investigation Category", false),
  Investigation: objectId("Investigation", false),
  Abnormalities: Joi.array().items(objectId("Abnormality", false)).optional(),
  ReportUrl: Joi.string().trim().allow("", null).optional(),
  InterpretationUrl: Joi.string().trim().allow("", null).optional(),
}).optional();

const medicineSchema = Joi.object({
  MedicineName: objectId("Medicine Name", false),
  Dosage: objectId("Dosage", false),
  DurationInDays: Joi.number().min(0).optional(),
}).optional();

const medicinesPrescribedSchema = Joi.object({
  Medicines: Joi.array().items(medicineSchema).optional(),
  RecoveryCycle: Joi.object({
    Value: Joi.number().min(0).optional(),
    Unit: objectId("Recovery Unit", false),
  }).optional(),
  PrescriptionUrls: Joi.array()
    .items(Joi.string().trim().allow("", null))
    .optional(),
}).optional();

const therapySchema = Joi.object({
  TherapyName: objectId("Therapy Name", false),
  PatientResponse: objectId("Patient Response", false),
}).optional();

const surgeryProcedureSchema = Joi.object({
  Date: Joi.date().optional(),
  HospitalClinicName: Joi.string().trim().allow("", null).optional(),
  SurgeonName: Joi.string().trim().allow("", null).optional(),
  SurgeonNumber: Joi.string().trim().allow("", null).optional(),
  MedicalSpeciality: objectId("MedicalSpeciality", false),
  SurgeryProcedureName: objectId("SurgeryProcedureName", false),
  AnaesthesiaType: Joi.string().valid("General", "Local").optional(),
  BloodTransfusionNeeded: Joi.boolean().optional(),
  RecoveryCycle: Joi.object({
    Value: Joi.number().min(0).optional(),
    Unit: objectId("Recovery Unit", false),
  }).optional(),
  PostSurgeryComplications: Joi.array()
    .items(objectId("Post Surgery Complication", false))
    .optional(),
  DischargeSummaryUrlNote: Joi.string().trim().allow("", null).optional(),
}).optional();

// Main validation schema
const medicalHistorySchema = Joi.object({
  _id: objectId("_id", false),
  CaseFileId: objectId("CaseFileId"),
  PatientId: objectId("PatientId"),
  // DoctorHospitalInfo: doctorHospitalInfoSchema,
  ChiefComplaints: Joi.array().items(chiefComplaintSchema).optional(),
  ClinicalDiagnoses: Joi.array().items(clinicalDiagnosisSchema).optional(),
  MedicinesPrescribed: medicinesPrescribedSchema,
  Therapies: Joi.array().items(therapySchema).optional(),
  SurgeriesProcedures: Joi.array().items(surgeryProcedureSchema).optional(),
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

// Section-specific validation schemas with CaseFileId
const sectionUpdateSchema = (sectionName, schema) =>
  Joi.object({
    CaseFileId: objectId("CaseFileId", true),
    [sectionName]: schema,
  });

// // Validation middleware for each section
// exports.validateDoctorHospitalInfo = (req, res, next) => {
//   const { error } = sectionUpdateSchema(
//     "DoctorHospitalInfo",
//     doctorHospitalInfoSchema
//   ).validate(req.body, {
//     abortEarly: false,
//     allowUnknown: false,
//   });
//   if (error) {
//     return res.json(
//       __requestResponse("400", {
//         errorType: "Validation Error",
//         error: error.details.map((d) => d.message).join(". "),
//       })
//     );
//   }
//   next();
// };

// Validation middleware for chief complaints update

// Validation middleware for chief complaints
exports.validateChiefComplaints = (req, res, next) => {
  const schema = Joi.object({
    CaseFileId: objectId("CaseFileId"),
    _id: objectId("_id", false),
    ChiefComplaints: Joi.array()
      .items(chiefComplaintSchema)
      .min(1)
      .required()
      .messages({
        "array.base": "ChiefComplaints must be an array",
        "array.min": "At least one Chief Complaint is required",
      }),
  });

  const { error } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
  });

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

exports.validateClinicalDiagnoses = (req, res, next) => {
  const { error } = sectionUpdateSchema(
    "ClinicalDiagnoses",
    Joi.array().items(clinicalDiagnosisSchema).required()
  ).validate(req.body, {
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
  next();
};

exports.validateMedicinesPrescribed = (req, res, next) => {
  const { error } = sectionUpdateSchema(
    "MedicinesPrescribed",
    medicinesPrescribedSchema
  ).validate(req.body, {
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
  next();
};

exports.validateTherapies = (req, res, next) => {
  const { error } = sectionUpdateSchema(
    "Therapies",
    Joi.array().items(therapySchema).required()
  ).validate(req.body, {
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
  next();
};

exports.validateSurgeriesProcedures = (req, res, next) => {
  const { error } = sectionUpdateSchema(
    "SurgeriesProcedures",
    Joi.array().items(surgeryProcedureSchema).required()
  ).validate(req.body, {
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
  next();
};

// Main medical history validation (existing)
exports.validateMedicalHistory = async (req, res, next) => {
  try {
    // First validate the schema
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

    // Then check if CaseFileId exists
    const caseFile = await PatientCaseFile.findById(req.body.CaseFileId);
    if (!caseFile) {
      return res.json(
        __requestResponse("404", {
          errorType: "Not Found",
          error: "Case File does not exist",
        })
      );
    }

    // Check if PatientId exists
    const patient = await Patient.findById(req.body.PatientId);
    if (!patient) {
      return res.json(
        __requestResponse("404", {
          errorType: "Not Found",
          error: "Patient does not exist",
        })
      );
    }

    // Check if PatientId matches CaseFile's PatientId
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

// Also update section update validations to check CaseFileId
const validateSection = async (req, res, next, schema) => {
  try {
    const { error } = schema.validate(req.body, {
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

    // Check if CaseFileId exists
    const caseFile = await PatientCaseFile.findById(req.body.CaseFileId);
    if (!caseFile) {
      return res.json(
        __requestResponse("404", {
          errorType: "Not Found",
          error: "Case File does not exist",
        })
      );
    }

    next();
  } catch (err) {
    return res.json(
      __requestResponse("500", {
        errorType: "Server Error",
        error: "Error validating section",
      })
    );
  }
};

// Update section validators to use the new validateSection function
exports.validateDoctorHospitalInfo = (req, res, next) => {
  validateSection(
    req,
    res,
    next,
    sectionUpdateSchema("DoctorHospitalInfo", doctorHospitalInfoSchema)
  );
};

exports.validateChiefComplaints = (req, res, next) => {
  validateSection(
    req,
    res,
    next,
    sectionUpdateSchema(
      "ChiefComplaints",
      Joi.array().items(chiefComplaintSchema).required()
    )
  );
};

exports.validateClinicalDiagnoses = (req, res, next) => {
  validateSection(
    req,
    res,
    next,
    sectionUpdateSchema(
      "ClinicalDiagnoses",
      Joi.array().items(clinicalDiagnosisSchema).required()
    )
  );
};

exports.validateMedicinesPrescribed = (req, res, next) => {
  validateSection(
    req,
    res,
    next,
    sectionUpdateSchema("MedicinesPrescribed", medicinesPrescribedSchema)
  );
};

exports.validateTherapies = (req, res, next) => {
  validateSection(
    req,
    res,
    next,
    sectionUpdateSchema(
      "Therapies",
      Joi.array().items(therapySchema).required()
    )
  );
};

exports.validateSurgeriesProcedures = (req, res, next) => {
  validateSection(
    req,
    res,
    next,
    sectionUpdateSchema(
      "SurgeriesProcedures",
      Joi.array().items(surgeryProcedureSchema).required()
    )
  );
};
