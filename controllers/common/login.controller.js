const Login = require("../../modals/Common/LoginMaster");
const { __requestResponse } = require("../../utils/constant");
const {
  __SUCCESS,
  __SOME_ERROR,
  __NO_LOOKUP_LIST,
} = require("../../utils/variable");
const { __deepClone } = require("../../utils/constant");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
// const { __CreateAuditLog } = require("../../utils/auditlog");
// const { sendEmail } = require("../../utils/mailer");
// const { sendSMS } = require("../../utils/sms");

// Generate random password (6 characters: mix of numbers and letters)
const generatePassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Generate OTP (6 digits)
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

//  Test Controller
exports.test = async (req, res) => {
  return res.send("Login API Working 🚀");
};

//  Create Asset Login (Admin creates login for assets)
exports.createAssetLogin = async (req, res) => {
  try {
    const {
      Email,
      PhoneNumber,
      UserName,
      EntityTypeId,
      Entity,
      ParentUserId,
      IsPhoneVerified,
      IsEmailVerified,
    } = req.body;

    // Check if user already exists
    const existingUser = await Login.findOne({
      $or: [{ Email }, { PhoneNumber }],
    });

    if (existingUser) {
      return res.json(
        __requestResponse(
          "400",
          "User already exists with this email or phone number"
        )
      );
    }

    // Generate system password
    const systemPassword = generatePassword();
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(systemPassword, saltRounds);

    // Create new asset login
    const newUser = new Login({
      UserName,
      PhoneNumber,
      Email,
      ParentUserId,
      EntityTypeId,
      Entity,
      Password: hashedPassword,
      IsPhoneVerified: IsPhoneVerified || false,
      IsEmailVerified: IsEmailVerified || false,
    });
    
    await newUser.save();
    // await __CreateAuditLog(req, "Asset Login Created", newUser._id);

    // In development: return password in response
    // In production: send via email and SMS
    const isDevelopment = process.env.NODE_ENV === "development";

    let responseData = {
      UserId: newUser._id,
      UserName: newUser.UserName,
      Email: newUser.Email,
      PhoneNumber: newUser.PhoneNumber,
      message: "Asset login created successfully",
    };

    if (isDevelopment) {
      responseData.systemPassword = systemPassword;
      responseData.note = "Password shown for development only";
    } else {
      // Send password via email and SMS in production
      // await sendEmail(Email, "Your Login Credentials", `Your password is: ${systemPassword}`);
      // await sendSMS(PhoneNumber, `Your login password is: ${systemPassword}`);
      responseData.message += ". Password sent to your email and phone.";
    }

    return res.json(__requestResponse("200", __SUCCESS, responseData));
  } catch (error) {
    console.error("Create Asset Login Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

//  Check Username Availability
exports.checkUsernameAvailability = async (req, res) => {
  try {
    const { UserName } = req.body;

    // Check if username exists
    const existingUser = await Login.findOne({ UserName: UserName });

    if (existingUser) {
      return res.json(
        __requestResponse("200", {
          available: false,
          message: "Username is already taken",
          UserName: UserName,
        })
      );
    }

    return res.json(
      __requestResponse("200", {
        available: true,
        message: "Username is available",
        UserName: UserName,
      })
    );
  } catch (error) {
    console.error("Error checking username availability:", error);
    return res.json(
      __requestResponse("500", {
        errorType: "Server Error",
        error: "Internal server error while checking username availability",
      })
    );
  }
};

//  Asset Login (for doctors, hospitals, etc.)
exports.assetLogin = async (req, res) => {
  try {
    const { Email, PhoneNumber, Password } = req.body;

    // Find user by email or phone
    const user = await Login.findOne({
      $or: [{ Email }, { PhoneNumber }],
    })
      .populate("EntityTypeId", "lookup_value")
      .populate("Entity", "AssetName AddressLine1 ContactName");

    if (!user) {
      return res.json(__requestResponse("404", "User not found"));
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(Password, user.Password);
    if (!isPasswordValid) {
      return res.json(__requestResponse("401", "Invalid credentials"));
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.Email,
        phoneNumber: user.PhoneNumber,
        entityType: user.EntityTypeId,
        entity: user.Entity,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.Password;

    return res.json(
      __requestResponse("200", __SUCCESS, {
        user: userResponse,
        token,
        expiresIn: "24h",
      })
    );
  } catch (error) {
    console.error("Asset Login Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

//  Change Password (from user panel)
exports.changePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    const user = await Login.findById(userId);
    if (!user) {
      return res.json(__requestResponse("404", "User not found"));
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.Password
    );
    if (!isCurrentPasswordValid) {
      return res.json(
        __requestResponse("401", "Current password is incorrect")
      );
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await Login.findByIdAndUpdate(userId, { Password: hashedNewPassword });
    // await __CreateAuditLog(req, "Password Changed", userId);

    return res.json(__requestResponse("200", "Password changed successfully"));
  } catch (error) {
    console.error("Change Password Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

//  Forgot Password - Send OTP
exports.forgotPasswordSendOTP = async (req, res) => {
  try {
    const { Email, PhoneNumber } = req.body;

    const user = await Login.findOne({
      $or: [{ Email }, { PhoneNumber }],
    });

    if (!user) {
      return res.json(__requestResponse("404", "User not found"));
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in user document (you might want to create a separate OTP collection)
    await Login.findByIdAndUpdate(user._id, {
      resetOTP: otp,
      resetOTPExpiry: otpExpiry,
    });

    // Send OTP via email and SMS
    // await sendEmail(user.Email, "Password Reset OTP", `Your OTP is: ${otp}. Valid for 10 minutes.`);
    // await sendSMS(user.PhoneNumber, `Your password reset OTP is: ${otp}. Valid for 10 minutes.`);

    return res.json(
      __requestResponse("200", "OTP sent to your email and phone number", {
        userId: user._id,
        // For development only
        ...(process.env.NODE_ENV === "development" && { otp }),
      })
    );
  } catch (error) {
    console.error("Forgot Password Send OTP Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

//  Forgot Password - Verify OTP
exports.forgotPasswordVerifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await Login.findById(userId);
    if (!user) {
      return res.json(__requestResponse("404", "User not found"));
    }

    // Check if OTP is valid and not expired
    if (!user.resetOTP || user.resetOTP !== otp) {
      return res.json(__requestResponse("400", "Invalid OTP"));
    }

    if (!user.resetOTPExpiry || user.resetOTPExpiry < new Date()) {
      return res.json(__requestResponse("400", "OTP has expired"));
    }

    // Generate temporary token for password reset
    const resetToken = jwt.sign(
      { userId: user._id, purpose: "password-reset" },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "15m" }
    );

    // Clear OTP
    await Login.findByIdAndUpdate(userId, {
      $unset: { resetOTP: 1, resetOTPExpiry: 1 },
    });

    return res.json(
      __requestResponse("200", "OTP verified successfully", {
        resetToken,
        message: "You can now reset your password",
      })
    );
  } catch (error) {
    console.error("Forgot Password Verify OTP Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

//  Reset Password (after OTP verification)
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(
        resetToken,
        process.env.JWT_SECRET || "your-secret-key"
      );
    } catch (err) {
      return res.json(
        __requestResponse("401", "Invalid or expired reset token")
      );
    }

    if (decoded.purpose !== "password-reset") {
      return res.json(__requestResponse("401", "Invalid reset token"));
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await Login.findByIdAndUpdate(decoded.userId, { Password: hashedPassword });
    // await __CreateAuditLog(req, "Password Reset", decoded.userId);

    return res.json(__requestResponse("200", "Password reset successfully"));
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

//  Get User List (Admin only)
exports.getUserList = async (req, res) => {
  try {
    const requestData = req.body || req.query || {};
    const { page = 1, limit = 10, search = "" } = requestData;

    const query = {};
    if (search) {
      query.$or = [
        { UserName: { $regex: search, $options: "i" } },
        { Email: { $regex: search, $options: "i" } },
        { PhoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Login.countDocuments(query);
    const list = await Login.find(query)
      .select("-Password -resetOTP -resetOTPExpiry")
      .populate("EntityTypeId", "lookup_value")
      .populate("Entity", "AssetName")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: Number(page),
        limit: Number(limit),
        list: __deepClone(list),
      })
    );
  } catch (error) {
    console.error("Get User List Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

//  Get User By ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await Login.findById(id)
      .select("-Password -resetOTP -resetOTPExpiry")
      .populate("EntityTypeId", "lookup_value")
      .populate("Entity", "AssetName AddressLine1 ContactName");

    if (!user) {
      return res.json(__requestResponse("404", "User not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, user));
  } catch (error) {
    console.error("Get User Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

//  Delete User (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await Login.findByIdAndDelete(id);
    if (!user) {
      return res.json(__requestResponse("404", "User not found"));
    }

    // await __CreateAuditLog(req, "User Deleted", id);
    return res.json(__requestResponse("200", "User deleted successfully"));
  } catch (error) {
    console.error("Delete User Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};
