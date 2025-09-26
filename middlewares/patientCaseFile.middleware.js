const Joi = require("joi");
const { __requestResponse } = require("../utils/constant");
const mongoose = require("mongoose");
const PatientMaster = require("../modals/Patient/PatientMaster");

// Validation Schema
const patientCaseFileSchema = Joi.object({
  _id: Joi.string()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .allow(null, "")
    .optional(),

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
      "any.invalid": "Invalid Patient ID format",
    }),

  TreatmentType: Joi.string()
    .valid(
      "Surgery/ Procedure Record",
      "General (Non-surgical) Hospitalisation Record",
      "Maternity Record",
      "Day care Visit Record",
      "OPD Visit Record"
    )
    .required()
    .messages({
      "any.required": "Treatment Type is required",
      "any.only": "Invalid Treatment Type",
    }),

  DoctorId: Joi.string()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .allow(null, "")
    .optional(),

  DoctorName: Joi.string().trim().allow("", null).optional(),

  HospitalId: Joi.string()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .allow(null, "")
    .optional(),

  HospitalName: Joi.string().trim().allow("", null).optional(),
  Date: Joi.date().optional(),
  Notes: Joi.string().trim().allow("", null).optional(),
  IsActive: Joi.boolean().default(true),
  IsDeleted: Joi.boolean().default(false),
});

// Validation Middleware
exports.validatePatientCaseFile = async (req, res, next) => {
  try {
    const { error } = patientCaseFileSchema.validate(req.body, {
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
    const patientExists = await PatientMaster.findById(req.body.PatientId);
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
        error: "Error validating patient case file",
      })
    );
  }
};
