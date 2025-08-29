const Joi = require("joi");
const mongoose = require("mongoose");
const { __requestResponse } = require("../utils/constant");
const LoginMaster = require("../modals/Common/LoginMaster");

const objectIdField = (isRequired = false) => {
  let schema = Joi.string().custom((value, helpers) => {
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

// Create Asset Login validation
const createAssetLoginSchema = Joi.object({
  UserName: Joi.string().required().messages({
    "any.required": "UserName is required",
    "string.empty": "UserName cannot be empty",
  }),
  PhoneNumber: Joi.string().required().messages({
    "any.required": "PhoneNumber is required",
    "string.empty": "PhoneNumber cannot be empty",
  }),
  // Email: Joi.string().email().required().messages({
  //   "any.required": "Email is required",
  //   "string.empty": "Email cannot be empty",
  //   "string.email": "Email must be valid",
  // }),
  Email: Joi.string().email().optional().allow("", null).messages({
    "string.email": "Email must be valid",
  }),
  EntityTypeId: objectIdField(true).messages({
    "any.required": "EntityTypeId is required",
  }),
  Entity: objectIdField(true).messages({
    "any.required": "Entity (Asset) is required",
  }),
});

// Asset Login validation
const assetLoginSchema = Joi.object({
  Email: Joi.string().email().optional(),
  PhoneNumber: Joi.string().optional(),
  Password: Joi.string().required().messages({
    "any.required": "Password is required",
    "string.empty": "Password cannot be empty",
  }),
}).or('Email', 'PhoneNumber').messages({
  'object.missing': 'Either Email or PhoneNumber is required'
});

// Change Password validation
const changePasswordSchema = Joi.object({
  userId: objectIdField(true).messages({
    "any.required": "User ID is required",
  }),
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required",
    "string.empty": "Current password cannot be empty",
  }),
  newPassword: Joi.string().min(6).required().messages({
    "any.required": "New password is required",
    "string.empty": "New password cannot be empty",
    "string.min": "New password must be at least 6 characters long",
  }),
});

// Forgot Password Send OTP validation
const forgotPasswordSendOTPSchema = Joi.object({
  Email: Joi.string().email().optional(),
  PhoneNumber: Joi.string().optional(),
}).or('Email', 'PhoneNumber').messages({
  'object.missing': 'Either Email or PhoneNumber is required'
});

// Forgot Password Verify OTP validation
const forgotPasswordVerifyOTPSchema = Joi.object({
  userId: objectIdField(true).messages({
    "any.required": "User ID is required",
  }),
  otp: Joi.string().length(6).required().messages({
    "any.required": "OTP is required",
    "string.empty": "OTP cannot be empty",
    "string.length": "OTP must be 6 digits",
  }),
});

// Reset Password validation
const resetPasswordSchema = Joi.object({
  resetToken: Joi.string().required().messages({
    "any.required": "Reset token is required",
    "string.empty": "Reset token cannot be empty",
  }),
  newPassword: Joi.string().min(6).required().messages({
    "any.required": "New password is required",
    "string.empty": "New password cannot be empty",
    "string.min": "New password must be at least 6 characters long",
  }),
});

// Check Username Availability validation
const checkUsernameSchema = Joi.object({
  UserName: Joi.string().required().messages({
    "any.required": "UserName is required",
    "string.empty": "UserName cannot be empty",
  }),
});

// Middleware to check username uniqueness
const checkUsernameUniqueness = async (req, res, next) => {
  try {
    const { UserName } = req.body;
    
    if (UserName) {
      const existingUser = await LoginMaster.findOne({ UserName: UserName });
      
      if (existingUser) {
        return res.json(
          __requestResponse("400", {
            errorType: "Validation Error",
            error: "Username already exists. Please choose a different username.",
          })
        );
      }
    }
    
    next();
  } catch (error) {
    return res.json(
      __requestResponse("500", {
        errorType: "Server Error",
        error: "Error checking username uniqueness",
      })
    );
  }
};


const validateCreateAssetLogin = async (req, res, next) => {
  const { error } = createAssetLoginSchema.validate(req.body, {
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
  // next();

  // Check username uniqueness after basic validation
  await checkUsernameUniqueness(req, res, next);
};

// const validateCreateAssetLoginxx = (req, res, next) => {
//   const { error } = createAssetLoginSchema.validate(req.body, {
//     abortEarly: false,
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

const validateAssetLogin = (req, res, next) => {
  const { error } = assetLoginSchema.validate(req.body, {
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

const validateChangePassword = (req, res, next) => {
  const { error } = changePasswordSchema.validate(req.body, {
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

const validateForgotPasswordSendOTP = (req, res, next) => {
  const { error } = forgotPasswordSendOTPSchema.validate(req.body, {
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

const validateForgotPasswordVerifyOTP = (req, res, next) => {
  const { error } = forgotPasswordVerifyOTPSchema.validate(req.body, {
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

const validateResetPassword = (req, res, next) => {
  const { error } = resetPasswordSchema.validate(req.body, {
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

const validateCheckUsername = (req, res, next) => {
  const { error } = checkUsernameSchema.validate(req.body, {
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
  validateCreateAssetLogin,
  validateAssetLogin,
  validateChangePassword,
  validateForgotPasswordSendOTP,
  validateForgotPasswordVerifyOTP,
  validateResetPassword,
  validateCheckUsername,
  checkUsernameUniqueness,
};