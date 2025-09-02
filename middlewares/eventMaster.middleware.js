const Joi = require("joi");
const mongoose = require("mongoose");
const { __requestResponse } = require("../utils/constant");
const { __SOME_ERROR } = require("../utils/variable");

// Helper function for ObjectId validation
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
  }).empty(''); // This converts empty strings to undefined/null

  if (isRequired) {
    return schema.required().messages({
      "any.required": "This field is required",
      "string.empty": "This field cannot be empty",
      "any.invalid": "Invalid ObjectId format",
    });
  } else {
    return schema.allow(null).optional();
  }
};

// Event Schedule Schema
const eventScheduleSchema = Joi.object({
  Date: Joi.date().allow(null).optional(),
  StartTime: Joi.string().allow("", null).optional(),
  EndTime: Joi.string().allow("", null).optional(),
  NoOfSlots: Joi.number().integer().min(0).allow(null).optional()
});

// EventMaster Save Schema
const eventMasterSchema = Joi.object({
  _id: objectIdField(false),
  AssetId: objectIdField(false),
  StationId: objectIdField(false),
  EventTypeId: objectIdField(false),
  EventTitle: Joi.string().allow("", null).optional(),
  EventVenue: Joi.string().allow("", null).optional(),
  EventSchedule: Joi.array().items(eventScheduleSchema).default([]),
  RegistrationCurrency: objectIdField(false),
  RegistrationFee: Joi.string().allow("", null).optional(),
  EventPoster: Joi.array().items(Joi.string()).default([]),
  EventAdvertisement: Joi.array().items(Joi.string()).default([])
});

// EventMaster List Schema
const eventMasterListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow("", null).optional(),
  AssetId: objectIdField(false),
  StationId: objectIdField(false),
  EventTypeId: objectIdField(false)
});

// Validation Middleware
const validateEventMaster = (req, res, next) => {
  const { error } = eventMasterSchema.validate(req.body);
  if (error) {
    return res.json(
      // __requestResponse(__SOME_ERROR, error.details[0].message)
      __requestResponse("400", {
        errorType: "Validation Error",
        error: error.details.map((d) => d.message).join(". "),
      })
    );
  }
  next();
};

const validateEventMasterList = (req, res, next) => {
  const { error } = eventMasterListSchema.validate(req.body);
  if (error) {
    return res.json(
      // __requestResponse(__SOME_ERROR, error.details[0].message)
      __requestResponse("400", {
        errorType: "Validation Error",
        error: error.details.map((d) => d.message).join(". "),
      })
    );
  }
  next();
};

module.exports = {
  validateEventMaster,
  validateEventMasterList
};