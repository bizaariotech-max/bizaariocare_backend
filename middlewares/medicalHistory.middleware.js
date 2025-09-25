const Joi = require("joi");
const { __requestResponse } = require("../utils/constant");
const mongoose = require("mongoose");

// // Validation for ObjectId
// const objectIdField = Joi.string().custom((value, helpers) => {
//   if (!value) return value;
//   if (!mongoose.Types.ObjectId.isValid(value)) {
//     return helpers.error("any.invalid");
//   }
//   return value;
// });

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

// Validation for Medical History Status
exports.validateMedicalHistoryStatus = (req, res, next) => {
  const schema = Joi.object({
    Status: Joi.string()
      .valid(
        "Active",
        "Ongoing",
        "In-Treatment", // treatment to date
        "Monitoring",
        "Chronic",
        "Resolved",
        "Cured",
        "Past" //past ilness
      )
      .required(),
    UpdatedBy: objectIdField(true).messages({
      "any.required": "UpdatedBy is required",
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.json(
      // __requestResponse("400", error.details[0].message.replace(/['"]/g, ""))
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

// Validation for Medical History
exports.validateMedicalHistory = (req, res, next) => {
  // Schema for Duration
  const durationSchema = Joi.object({
    Value: Joi.number().min(0),
    Unit: objectIdField(true).messages({
      "any.required": "Unit is required",
    }),
  });

  // Schema for Doctor/Hospital Info
  const doctorHospitalInfoSchema = Joi.object({
    Date: Joi.date(),
    DoctorName: Joi.string().trim(),
    DoctorNumber: Joi.string().trim(),
    HospitalName: Joi.string().trim(),
    HospitalLocation: Joi.string().trim(),
    MedicalSpeciality: objectIdField(true).messages({
      "any.required": "MedicalSpeciality is required",
    }),
  });

  // Schema for Chief Complaints
  const chiefComplaintSchema = Joi.object({
    Symptoms: Joi.array().items(
      objectIdField(true).messages({
        "any.required": "Unit is required",
      })
    ),
    Duration: durationSchema,
    SeverityGrade: objectIdField(true).messages({
      "any.required": "SeverityGrade is required",
    }),
    AggravatingFactors: Joi.array().items(
      objectIdField(true).messages({
        "any.required": "AggravatingFactors is required",
      })
    ),
  });

  // Schema for Clinical Diagnosis
  const clinicalDiagnosisSchema = Joi.object({
    Date: Joi.date(),
    InvestigationCategory: objectIdField(true).messages({
      "any.required": "InvestigationCategory is required",
    }),
    Investigation: objectIdField(true).messages({
      "any.required": "Investigation is required",
    }),
    Abnormalities: Joi.array().items(
      objectIdField(true).messages({
        "any.required": "Abnormalities is required",
      })
    ),
    ReportUrl: Joi.string().trim(),
    InterpretationUrl: Joi.string().trim(),
  });

  // Schema for Medicine
  const medicineSchema = Joi.object({
    MedicineName: objectIdField(true).messages({
      "any.required": "MedicineName is required",
    }),
    Dosage: objectIdField(true).messages({
      "any.required": "Dosage is required",
    }),
    DurationInDays: Joi.number().min(0),
  });

  // Schema for Medicines Prescribed
  const medicinesPrescribedSchema = Joi.object({
    Medicines: Joi.array().items(medicineSchema),
    RecoveryCycle: durationSchema,
    PrescriptionUrls: Joi.array().items(Joi.string().trim()),
  });

  // Schema for Therapy
  const therapySchema = Joi.object({
    TherapyName: objectIdField(true).messages({
      "any.required": "TherapyName is required",
    }),
    PatientResponse: objectIdField(true).messages({
      "any.required": "PatientResponse is required",
    }),
  });

  // Schema for Recovery Cycle
  const recoveryCycleSchema = Joi.object({
    Value: Joi.number().min(0),
    Unit: objectIdField(true).messages({
      "any.required": "Unit is required",
    }),
  });

  // Schema for Surgery/Procedure
  const surgeryProcedureSchema = Joi.object({
    Date: Joi.date(),
    HospitalClinicName: Joi.string().trim(),
    SurgeonName: Joi.string().trim(),
    SurgeonNumber: Joi.string().trim(),
    MedicalSpeciality: objectIdField(true).messages({
      "any.required": "MedicalSpeciality is required",
    }),
    SurgeryProcedureName: objectIdField(true).messages({
      "any.required": "SurgeryProcedureName is required",
    }),
    AnaesthesiaType: objectIdField(true).messages({
      "any.required": "AnaesthesiaType is required",
    }),
    BloodTransfusionNeeded: Joi.boolean().default(false),
    RecoveryCycle: recoveryCycleSchema,
    PostSurgeryComplications: Joi.array().items(
      objectIdField(true).messages({
        "any.required": "PostSurgery Complications is required",
      })
    ),
    // SurgeryReportUrls: Joi.array().items(Joi.string().trim())
    DischargeSummaryUrlNote: Joi.string().trim().allow("", null),
  });

  // Main schema for Medical History
  const schema = Joi.object({
    // _id: Joi.string(),
    _id: objectIdField(false),
    PatientId: objectIdField(true).messages({
      "any.required": "PatientId is required",
    }),
    // DoctorHospitalInfo: doctorHospitalInfoSchema,
    // ChiefComplaints: Joi.array().items(chiefComplaintSchema),
    // ClinicalDiagnoses: Joi.array().items(clinicalDiagnosisSchema),
    // MedicinesPrescribed: medicinesPrescribedSchema,
    // Therapies: Joi.array().items(therapySchema),
    // SurgeriesProcedures: Joi.array().items(surgeryProcedureSchema),
    DoctorHospitalInfo: doctorHospitalInfoSchema.optional(), // optional
    ChiefComplaints: Joi.array().items(chiefComplaintSchema).optional(), //optional
    ClinicalDiagnoses: Joi.array().items(clinicalDiagnosisSchema).optional(), //  optional
    MedicinesPrescribed: medicinesPrescribedSchema.optional(), // optional
    Therapies: Joi.array().items(therapySchema).optional(), //  optional
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
        "Past" //past ilness
      )
      .default("Active"),
    Notes: Joi.string().trim(),
    IsActive: Joi.boolean().default(true),
    IsDeleted: Joi.boolean().default(false),
    CreatedBy: objectIdField(true).messages({
      "any.required": "CreatedBy is required",
    }),
    UpdatedBy: objectIdField(false),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.json(
      // __requestResponse("400", error.details[0].message.replace(/['"]/g, ""))
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
