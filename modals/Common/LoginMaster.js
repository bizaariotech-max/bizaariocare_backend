const mongoose = require("mongoose");
const { Schema } = mongoose;
// asset login master
const _SchemaDesign = new Schema(
  {
    ParentUserId: { type: mongoose.SchemaTypes.ObjectId, ref: "asset_master" }, //parent asset id
    EntityTypeId: { type: mongoose.SchemaTypes.ObjectId, ref: "admin_lookups" }, // asset type id or station id
    Entity: { type: mongoose.SchemaTypes.ObjectId, ref: "asset_master" }, // Asset Id
    UserName: String,
    PhoneNumber: String,
    Email: String,
    Password: String,
    IsPhoneVerified: Boolean,
    IsEmailVerified: Boolean,
    // CreatedOn: {
    //   type: Date,
    //   default: Date.now,
    // },
    IsActive: { type: Boolean, default: true },


    // CreatedBy: { type: mongoose.SchemaTypes.ObjectId, ref: "asset_master" },
    // ModifiedOn: {
    //   type: Date,
    //   default: Date.now,
    // },
    // ModifiedBy: { type: mongoose.SchemaTypes.ObjectId, ref: "asset_master" },

    // for production
    // // OTP fields for password reset
    // resetOTP: String,
    // resetOTPExpiry: Date,
    // // Additional important fields
    // FirstName: String,// do not use this - we have asset name
    // LastName: String,
    // ProfilePicture: String,
    // IsActive: { type: Boolean, default: true },
    // LastLoginDate: Date,
    // LoginAttempts: { type: Number, default: 0 },
    // AccountLocked: { type: Boolean, default: false },
    // AccountLockedUntil: Date,
    // Role: {
    //   type: String,
    //   enum: ["admin", "user", "asset_admin", "super_admin"],
    //   default: "user",
    // },
    // Permissions: [String],
    // TwoFactorEnabled: { type: Boolean, default: false },
    // TwoFactorSecret: String,
    // EmailVerificationToken: String,
    // EmailVerificationExpiry: Date,
    // PhoneVerificationOTP: String,
    // PhoneVerificationExpiry: Date,
    // PasswordResetToken: String,
    // PasswordResetExpiry: Date,
    // LastPasswordChange: Date,
    // PasswordHistory: [String], // Store last 5 password hashes
    // DeviceTokens: [String], // For push notifications
    // PreferredLanguage: { type: String, default: "en" },
    // TimeZone: String,
    // NotificationSettings: {
    //   email: { type: Boolean, default: true },
    //   sms: { type: Boolean, default: true },
    //   push: { type: Boolean, default: true },
    // },
  },
  {
    timestamps: true,
  }
);
// Index for better performance
_SchemaDesign.index({ Email: 1 });
_SchemaDesign.index({ PhoneNumber: 1 });
_SchemaDesign.index({ UserName: 1 });
_SchemaDesign.index({ EntityTypeId: 1 });
_SchemaDesign.index({ Entity: 1 });
// _SchemaDesign.index({ resetOTP: 1 });
// _SchemaDesign.index({ resetOTPExpiry: 1 });


module.exports = mongoose.model("login_master", _SchemaDesign);
