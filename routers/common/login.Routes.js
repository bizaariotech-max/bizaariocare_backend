const express = require("express");
const router = express.Router();

const {
  test,
  createAssetLogin,
  assetLogin,
  changePassword,
  forgotPasswordSendOTP,
  forgotPasswordVerifyOTP,
  resetPassword,
  getUserList,
  getUserById,
  deleteUser,
  checkUsernameAvailability,
} = require("../../controllers/common/login.controller");

const {
  validateCreateAssetLogin,
  validateAssetLogin,
  validateChangePassword,
  validateForgotPasswordSendOTP,
  validateForgotPasswordVerifyOTP,
  validateResetPassword,
  validateCheckUsername,
} = require("../../middlewares/login.middleware");

// Test Route
router.get("/test", test);

// Username Availability Check
router.post("/CheckUsernameAvailability", validateCheckUsername, checkUsernameAvailability);

// Admin Routes - Create Asset Login
router.post("/CreateAssetLogin", validateCreateAssetLogin, createAssetLogin);

// Asset Login Routes
router.post("/AssetLogin", validateAssetLogin, assetLogin);

// Password Management Routes
router.post("/ChangePassword", validateChangePassword, changePassword);

// Forgot Password Routes
router.post("/ForgotPasswordSendOTP", validateForgotPasswordSendOTP, forgotPasswordSendOTP);
router.post("/ForgotPasswordVerifyOTP", validateForgotPasswordVerifyOTP, forgotPasswordVerifyOTP);
router.post("/ResetPassword", validateResetPassword, resetPassword);

// Admin User Management Routes
router.post("/UserList", getUserList);
router.get("/UserList", getUserList);
router.get("/GetUser/:id", getUserById);
router.delete("/DeleteUser/:id", deleteUser);

module.exports = router;