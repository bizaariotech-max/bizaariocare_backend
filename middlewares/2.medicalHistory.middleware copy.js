const Joi = require("joi");
const { __requestResponse } = require("../utils/constant");
const mongoose = require("mongoose");
const Patient = require("../modals/Patient/PatientMaster");

// Schema for Duration
const durationSchema = Joi.object({
  Value: Joi.number().min(0),
  Unit: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .required()
    .messages({
      "any.required": "Unit is required",
      "any.invalid": "Invalid Unit ObjectId format",
    }),
});

// Schema for Doctor/Hospital Info
const doctorHospitalInfoSchema = Joi.object({
  Date: Joi.date(),
  DoctorName: Joi.string().trim(),
  DoctorNumber: Joi.string().trim(),
  HospitalName: Joi.string().trim(),
  HospitalLocation: Joi.string().trim(),
  MedicalSpeciality: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .required()
    .messages({
      "any.required": "Medical Speciality is required",
      "any.invalid": "Invalid Medical Speciality ObjectId format",
    }),
});

// Schema for Chief Complaints
const chiefComplaintSchema = Joi.object({
  Symptoms: Joi.array().items(
    Joi.string()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      })
      .required()
      .messages({
        "any.required": "Symptom is required",
        "any.invalid": "Invalid Symptom ObjectId format",
      })
  ),
  Duration: durationSchema,
  // SeverityGrade: Joi.string()
  //   .custom((value, helpers) => {
  //     if (!mongoose.Types.ObjectId.isValid(value)) {
  //       return helpers.error("any.invalid");
  //     }
  //     return value;
  //   })
  //   .required()
  //   .messages({
  //     "any.required": "Severity Grade is required",
  //     "any.invalid": "Invalid Severity Grade ObjectId format",
  //   }),
  SeverityGrade: Joi.string().valid(1, 2, 3, 4, 5, 6).required().messages({
    "any.required": "SeverityGrade is required",
    "any.only": "SeverityGrade must be one of 1, 2, 3, 4, 5, 6",
  }),
  AggravatingFactors: Joi.array().items(
    Joi.string()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      })
      .required()
      .messages({
        "any.required": "Aggravating Factor is required",
        "any.invalid": "Invalid Aggravating Factor ObjectId format",
      })
  ),
});

// Schema for Clinical Diagnosis
const clinicalDiagnosisSchema = Joi.object({
  Date: Joi.date(),
  InvestigationCategory: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .required()
    .messages({
      "any.required": "Investigation Category is required",
      "any.invalid": "Invalid Investigation Category ObjectId format",
    }),
  Investigation: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .required()
    .messages({
      "any.required": "Investigation is required",
      "any.invalid": "Invalid Investigation ObjectId format",
    }),
  Abnormalities: Joi.array().items(
    Joi.string()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      })
      .required()
      .messages({
        "any.required": "Abnormality is required",
        "any.invalid": "Invalid Abnormality ObjectId format",
      })
  ),
  ReportUrl: Joi.string().trim(),
  InterpretationUrl: Joi.string().trim(),
});
// Schema for Medicine
const medicineSchema = Joi.object({
  MedicineName: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .required()
    .messages({
      "any.required": "MedicineName is required",
      "any.invalid": "Invalid MedicineName ObjectId format",
    }),
  Dosage: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .required()
    .messages({
      "any.required": "Dosage is required",
      "any.invalid": "Invalid Dosage ObjectId format",
    }),
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
  TherapyName: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .required()
    .messages({
      "any.required": "TherapyName is required",
      "any.invalid": "Invalid TherapyName ObjectId format",
    }),
  PatientResponse: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .required()
    .messages({
      "any.required": "PatientResponse is required",
      "any.invalid": "Invalid PatientResponse ObjectId format",
    }),
});

// Schema for Recovery Cycle
const recoveryCycleSchema = Joi.object({
  Value: Joi.number().min(0),
  Unit: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .required()
    .messages({
      "any.required": "Unit is required",
      "any.invalid": "Invalid Unit ObjectId format",
    }),
});

// Schema for Surgery/Procedure
const surgeryProcedureSchema = Joi.object({
  Date: Joi.date(),
  HospitalClinicName: Joi.string().trim(),
  SurgeonName: Joi.string().trim(),
  SurgeonNumber: Joi.string().trim(),
  MedicalSpeciality: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .required()
    .messages({
      "any.required": "MedicalSpeciality is required",
      "any.invalid": "Invalid MedicalSpeciality ObjectId format",
    }),
  SurgeryProcedureName: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .required()
    .messages({
      "any.required": "SurgeryProcedureName is required",
      "any.invalid": "Invalid SurgeryProcedureName ObjectId format",
    }),
  AnaesthesiaType: Joi.string().valid("General", "Local").required().messages({
    "any.required": "AnaesthesiaType is required",
    "any.only": "AnaesthesiaType must be either General or Local",
  }),
  BloodTransfusionNeeded: Joi.boolean().default(false),
  RecoveryCycle: recoveryCycleSchema.optional(),
  PostSurgeryComplications: Joi.array().items(
    Joi.string()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      })
      .required()
      .messages({
        "any.required": "PostSurgery Complications is required",
        "any.invalid": "Invalid PostSurgery Complications ObjectId format",
      })
  ),
  DischargeSummaryUrlNote: Joi.string().trim().allow("", null),
});

// Main schema for Medical History
const schema = Joi.object({
  _id: Joi.string()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .allow(null, "")
    .optional()
    .messages({
      "any.invalid": "Invalid _id ObjectId format",
    }),

  PatientId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .required()
    .messages({
      "any.required": "Patient ID is required",
      "any.invalid": "Invalid Patient ID ObjectId format",
    }),

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

  CreatedBy: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .required()
    .messages({
      "any.required": "Created By is required",
      "any.invalid": "Invalid Created By ObjectId format",
    }),

  UpdatedBy: Joi.string()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .allow(null, "")
    .optional()
    .messages({
      "any.invalid": "Invalid Updated By ObjectId format",
    }),
});

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
    UpdatedBy: Joi.string()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      })
      .required()
      .messages({
        "any.required": "UpdatedBy is required",
        "any.invalid": "Invalid UpdatedBy ObjectId format",
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

// Validation middleware
exports.validateMedicalHistory = async (req, res, next) => {
  try {
    const { error } = schema.validate(req.body);
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
