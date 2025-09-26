const Joi = require("joi");
const { __requestResponse } = require("../utils/constant");
const mongoose = require("mongoose");
const Patient = require("../modals/Patient/PatientMaster");

// Reusable ObjectId validator component
const createObjectIdValidator = (fieldName, isRequired = true) => {
  let schema = Joi.string().custom((value, helpers) => {
    if (!value && !isRequired) return value;
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  });

  if (isRequired) {
    schema = schema.required();
  } else {
    schema = schema.allow(null, "");
  }

  return schema.messages({
    "any.required": `${fieldName} is required`,
    "any.invalid": `Invalid ${fieldName} ObjectId format`,
    "string.empty": `${fieldName} cannot be empty`,
  });
};

// Schema for Duration
const durationSchema = Joi.object({
  Value: Joi.number().min(0),
  Unit: createObjectIdValidator("Unit"),
});

// Schema for Doctor/Hospital Info
const doctorHospitalInfoSchema = Joi.object({
  Date: Joi.date(),
  DoctorName: Joi.string().trim(),
  DoctorNumber: Joi.string().trim(),
  HospitalName: Joi.string().trim(),
  HospitalLocation: Joi.string().trim(),
  MedicalSpeciality: createObjectIdValidator("Medical Speciality"),
});

// Schema for Chief Complaints
const chiefComplaintSchema = Joi.object({
  Symptoms: Joi.array().items(createObjectIdValidator("Symptom")),
  Duration: durationSchema,
  // SeverityGrade: createObjectIdValidator("Severity Grade"),
  SeverityGrade: Joi.string().valid(1, 2, 3, 4, 5, 6).required().messages({
    "any.required": "SeverityGrade is required",
    "any.only": "SeverityGrade must be one of 1, 2, 3, 4, 5, 6",
  }),
  AggravatingFactors: Joi.array().items(
    createObjectIdValidator("Aggravating Factor")
  ),
});

// Schema for Clinical Diagnosis
const clinicalDiagnosisSchema = Joi.object({
  Date: Joi.date(),
  InvestigationCategory: createObjectIdValidator("Investigation Category"),
  // InvestigationCategory: createObjectIdValidator(
  //   "Investigation Category",
  //   false
  // ), // Made optional

  Investigation: createObjectIdValidator("Investigation"),
  Abnormalities: Joi.array().items(createObjectIdValidator("Abnormality")),
  ReportUrl: Joi.string().trim(),
  InterpretationUrl: Joi.string().trim(),
});

// Schema for Medicine
const medicineSchema = Joi.object({
  MedicineName: createObjectIdValidator("Medicine Name"),
  Dosage: createObjectIdValidator("Dosage"),
  DurationInDays: Joi.number().min(0),
});

// Schema for Medicines Prescribed
const medicinesPrescribedSchema = Joi.object({
  Medicines: Joi.array().items(medicineSchema).optional(),
  RecoveryCycle: durationSchema.optional(),
  PrescriptionUrls: Joi.array().items(Joi.string().trim()),
});

// Schema for Therapy
const therapySchema = Joi.object({
  TherapyName: createObjectIdValidator("Therapy Name"),
  // PatientResponse: createObjectIdValidator("Patient Response"),
  PatientResponse: Joi.string().trim(),
});

// Schema for Recovery Cycle
const recoveryCycleSchema = Joi.object({
  Value: Joi.number().min(0),
  Unit: createObjectIdValidator("Recovery Unit"),
});

// Schema for Surgery/Procedure
const surgeryProcedureSchema = Joi.object({
  Date: Joi.date(),
  HospitalClinicName: Joi.string().trim(),
  SurgeonName: Joi.string().trim(),
  SurgeonNumber: Joi.string().trim(),
  MedicalSpeciality: createObjectIdValidator("Medical Speciality"),
  SurgeryProcedureName: createObjectIdValidator("Surgery/Procedure Name"),
  AnaesthesiaType: Joi.string().valid("General", "Local").required().messages({
    "any.required": "AnaesthesiaType is required",
    "any.only": "AnaesthesiaType must be either General or Local",
  }),
  BloodTransfusionNeeded: Joi.boolean().default(false),
  RecoveryCycle: recoveryCycleSchema.optional(),
  PostSurgeryComplications: Joi.array().items(
    createObjectIdValidator("Post Surgery Complication")
  ),
  DischargeSummaryUrlNote: Joi.string().trim().allow("", null),
});

// Main Medical History Schema
const medicalHistorySchema = Joi.object({
  _id: createObjectIdValidator("_id", false),
  PatientId: createObjectIdValidator("Patient ID"),
  DoctorHospitalInfo: doctorHospitalInfoSchema.optional(),
  ChiefComplaints: Joi.array().items(chiefComplaintSchema).optional(),
  ClinicalDiagnoses: Joi.array().items(clinicalDiagnosisSchema).optional(),
  MedicinesPrescribed: medicinesPrescribedSchema.optional(),
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
    .default("Active"),
  Notes: Joi.string().trim(),
  IsActive: Joi.boolean().default(true),
  IsDeleted: Joi.boolean().default(false),
  CreatedBy: createObjectIdValidator("Created By"),
  UpdatedBy: createObjectIdValidator("Updated By", false),
});

// Status Update Schema
const statusUpdateSchema = Joi.object({
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
    .required(),
  UpdatedBy: createObjectIdValidator("Updated By"),
});

// Validation Middlewares
exports.validateMedicalHistoryStatus = (req, res, next) => {
  const { error } = statusUpdateSchema.validate(req.body);
  if (error) {
    return res.json(
      __requestResponse("400", {
        errorType: "Validation Error",
        error: error.details
          .map((d) => d.message)
          .join(". ")
          .replace(/['"]/g, ""),
      })
    );
  }
  next();
};

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
          error: error.details
            .map((d) => d.message)
            .join(". ")
            .replace(/['"]/g, ""),
        })
      );
    }

    const patientExists = await Patient.findById(req.body.PatientId);
    if (!patientExists) {
      return res.json(
        __requestResponse("404", {
          errorType: "Not Found",
          error: "Patient does not exist",
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
