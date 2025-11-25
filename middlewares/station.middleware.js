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
      "any.required": "This ObjectId field is required",
      "string.empty": "This field cannot be empty",
      "any.invalid": "Invalid ObjectId format",
    });
  } else {
    return schema.allow("", null).optional();
  }
};

// const objectIdField = () =>
//   Joi.string()
//     .allow(null)
//     .custom((value, helpers) => {
//       if (value === null) return value;
//       if (!mongoose.Types.ObjectId.isValid(value)) {
//         return helpers.error("any.invalid");
//       }
//       return value;
//     }, "ObjectId Validation");

// Common reusable ObjectId validation
// const objectIdField = (isRequired = false) => {
//   let schema = Joi.string()
//     .custom((value, helpers) => {
//       if (value && !mongoose.Types.ObjectId.isValid(value)) {
//         return helpers.error("any.invalid");
//       }
//       return value;
//     })
//     .allow("", null);

//   return isRequired
//     ? schema.required().messages({
//         "any.required": "This field is required",
//         "string.empty": "This field cannot be empty",
//         "any.invalid": "Invalid ObjectId format",
//       })
//     : schema.optional();
// };

// const objectIdFieldx = (isRequired = false) => {
//   let schema = Joi.string().custom((value, helpers) => {
//     if (value && !mongoose.Types.ObjectId.isValid(value)) {
//       return helpers.error("any.invalid");
//     }
//     return value;
//   });

//   if (isRequired) {
//     return schema.required().messages({
//       "any.required": "This field is required",
//       "string.empty": "This field cannot be empty",
//       "any.invalid": "Invalid ObjectId format",
//     });
//   } else {
//     return schema.allow("", null).optional();
//   }
// };

// Validation schema
const stationValidationSchema = Joi.object({
  _id: objectIdField(false),

  ParentStationId: objectIdField(false),

  OrgUnitLevel: objectIdField(true).messages({
    "any.required": "OrgUnitLevel is required",
    "string.empty": "OrgUnitLevel cannot be empty",
  }),

  StationName: Joi.string().required().messages({
    "any.required": "StationName is required",
    "string.empty": "StationName cannot be empty",
  }),

  // CountryGroupId: objectIdField(true).messages({
  //   "any.required": "CountryGroupId is required",
  //   "string.empty": "CountryGroupId cannot be empty",
  // }),
  CountryGroupId: objectIdField(false),

  // ISDCode: Joi.string().required().messages({
  //   "any.required": "ISDCode is required",
  //   "string.empty": "ISDCode cannot be empty",
  // }),
  // CountryGroupId: Joi.array()
  // .items(objectIdField(false))
  // .allow(null)
  // .optional()
  // .messages({
  //   "array.base": "CountryGroupId must be an array",
  // }),
  ISDCode: objectIdField(false),
  Currency: objectIdField(false),
  // ISDCode: Joi.string().allow(null, "").optional(),
  // Currency: Joi.string().allow(null, "").optional(),

  StationAdmins: Joi.array()
    .items(
      Joi.object({
        Name: Joi.string().required().messages({
          "any.required": "Admin Name is required",
          "string.empty": "Admin Name cannot be empty",
        }),
        MobileNumber: Joi.string().required().messages({
          "any.required": "Mobile Number is required",
          "string.empty": "Mobile Number cannot be empty",
        }),
        // Email: Joi.string().email().required().messages({
        //   "any.required": "Email is required",
        //   "string.empty": "Email cannot be empty",
        //   "string.email": "Email must be valid",
        // }),
        Email: Joi.string().email().allow(null).optional().messages({
          "string.email": "Email must be valid",
        }),
        Password: Joi.string().required().messages({
          "any.required": "Password is required",
          "string.empty": "Password cannot be empty",
        }),
      })
    )
    .allow(null)
    .optional(),

  CensusYear: Joi.number().allow("", null).optional(),
  PopulationMale: Joi.number().allow("", null).optional(),
  PopulationFemale: Joi.number().allow("", null).optional(),
  TotalPopulation: Joi.number().allow("", null).optional(),
  LiteracyRate: Joi.number().min(0).max(100).allow("", null).optional(),
  AreaSQKM: Joi.number().allow("", null).optional(),
  IsActive: Joi.boolean().allow("", null).optional(),
});

const validateSaveStation = (req, res, next) => {
  const { error } = stationValidationSchema.validate(req.body, {
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
  validateSaveStation,
};
