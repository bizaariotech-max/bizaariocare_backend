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

// ContentMaster Save Schema
const contentMasterSchema = Joi.object({
  _id: objectIdField(false),
  AssetId: objectIdField(false),
  ContentTypeId: objectIdField(false),
  ContentTitle: Joi.string().allow("", null).optional(),
  GrantingBody: Joi.string().allow("", null).optional(),
  Date: Joi.date().allow(null).optional(),
  ContentPriority: Joi.string().allow("", null).optional(),
  ValidUpto: Joi.date().allow(null).optional(),
  ContentImage: Joi.string().allow("", null).optional(),
  ShortDescription: Joi.string().allow("", null).optional(),
  LongDescription: Joi.string().allow("", null).optional(),
  MetaTags: Joi.array().items(Joi.string()).default([]),
  PictureGallery: Joi.array().items(Joi.string()).default([]),
  VideoGallery: Joi.array().items(Joi.string()).default([]),
  References: Joi.array().items(Joi.string()).default([])
});

// ContentMaster List Schema
const contentMasterListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow("", null).optional(),
  AssetId: objectIdField(false),
  ContentTypeId: objectIdField(false),
  ContentPriority: Joi.string().allow("", null).optional()
});

// Validation Middleware
const validateContentMaster = (req, res, next) => {
  const { error } = contentMasterSchema.validate(req.body);
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

const validateContentMasterList = (req, res, next) => {
  const { error } = contentMasterListSchema.validate(req.body);
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
  validateContentMaster,
  validateContentMasterList
};