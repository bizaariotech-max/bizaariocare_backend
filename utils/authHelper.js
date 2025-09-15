const bcrypt = require("bcryptjs");
const LoginMaster = require("../models/LoginMaster");
const AssetUserMaster = require("../models/AssetUserMaster");
const ZatraMaster = require("../models/ZatraMaster");
const ZatraLogin = require("../models/ZatraLogin");
const e = require("express");

/**
 * Generate a strong password.
 * @param {number} length
 * @returns {string}
 */
const generateStrongPassword = (length = 12) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

/**
 * Create login credentials for a given asset with encrypted password.
 * @param {object} options - Object containing asset info.
 * @param {ObjectId} options.assetId - Asset ID
 * @param {ObjectId} options.assetTypeId - Asset Type ID
 * @param {string} options.assetName - Name of the asset
 * @param {string} options.mobileNo - Mobile number (used as login)
 * @param {boolean} [options.isAdmin=false] - Is admin login
 * @returns {object} created login record
 */

// for login master table
// const createAssetLogin_old = async ({
//   assetId,
//   assetTypeId,
//   assetName,
//   mobileNo,
//   password,
//   isAdmin = false,
// }) => {
//   if (!mobileNo || !assetId || !assetTypeId || !assetName) {
//     throw new Error("Missing required fields to create login");
//   }

//   // const plainPassword = generateStrongPassword(12);
//   // const hashedPassword = await bcrypt.hash(plainPassword, 10);

//   // for development only
//   // let plainPassword = 123456;

//   const loginData = {
//     AssetTypeId: assetTypeId,
//     AssetId: assetId,
//     UserName: assetName,
//     LoginId: mobileNo,
//     IsFirstLogin: true,
//     // Pwd: hashedPassword,
//     Pwd: password,
//     IsAdmin: isAdmin,
//   };

//   const created = await LoginMaster.create(loginData);

//   return {
//     ...created.toObject(),
//     plainPassword,
//   };
// };

// const updateAssetLogin = async ({
//   assetId,
//   mobileNo,
//   password,
//   assetTypeId,
//   assetName,
// }) => {
//   if (!assetId) {
//     throw new Error("Asset ID is required to update login credentials");
//   }

//   // Prepare update object
//   const updateFields = {};
//   if (assetTypeId) updateFields.AssetTypeId = assetTypeId;
//   if (assetId) updateFields.AssetId = assetId;
//   if (mobileNo) updateFields.LoginId = mobileNo;
//   if (assetName) updateFields.UserName = assetName;
//   if (password) {
//     // const hashedPassword = await bcrypt.hash(password, 10);
//     updateFields.Pwd = password; // Replace with `hashedPassword` in prod
//   }

//   // Perform update
//   const updated = await LoginMaster.findOneAndUpdate(
//     { AssetId: assetId },
//     { $set: updateFields },
//     { new: true }
//   );

//   if (!updated) {
//     throw new Error("Login record not found for the given asset");
//   }

//   return updated;
// };

const createAssetLogin = async ({ assetId, Name, Phone, Password }) => {
  if (!Phone || !assetId) {
    throw new Error("Missing required fields to create login");
  }

  // const plainPassword = generateStrongPassword(12);
  // const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // for development only
  // let plainPassword = 123456;

  const loginData = {
    // AssetTypeId: assetTypeId,
    AssetId: assetId,
    Name: Name,
    // UserName: assetName,
    Phone: Phone,
    // IsFirstLogin: true,
    // Pwd: hashedPassword,
    Password: Password,
    // IsAdmin: isAdmin,
  };

  const created = await AssetUserMaster.create(loginData);

  return {
    ...created.toObject(),
    // plainPassword,
  };
};

const createZatraLogin = async ({
  ZatraId,
  UserId,
  RoleId,
  FullName,
  MobileNumber,
  Password,
  ValidFrom,
  ValidUpto,
}) => {
  console.warn(
    ZatraId,
    UserId,
    RoleId,
    FullName,
    MobileNumber,
    Password,
    ValidFrom,
    ValidUpto
  );
  if (!ZatraId || !RoleId || !UserId || !MobileNumber) {
    throw new Error("Missing required fields to create login");
  }
  console.warn("Creating Zatra login for UserId:", UserId, "RoleId:", RoleId);
  // Use given password or fallback to mobile number
  const plainPassword = Password || MobileNumber?.toString() || "123456";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // 🔹 Check if login already exists for this User & Zatra
  let existing = await ZatraLogin.findOne({ UserId, ZatraId });

  if (existing) {
    // update existing login
    // existing.ZatraId = ZatraId;
    // existing.UserId = UserId;
    existing.RoleId = RoleId;
    existing.FullName = FullName;
    existing.MobileNumber = MobileNumber;
    existing.Password = hashedPassword;
    existing.Blocked = false;
    existing.ValidFrom = existing.ValidFrom || new Date();
    existing.ValidUpto = ValidUpto || null;

    await existing.save();
    console.log(
      `✅ Updated existing login (ID: ${existing._id}) for UserId: ${UserId} | Plain Password: ${plainPassword}`
    );
    return existing.toObject();
  }

  // 🔹 Create new login record
  const loginData = {
    ZatraId: ZatraId,
    UserId,
    RoleId,
    FullName,
    MobileNumber,
    Password: hashedPassword,
    // UserAuthorityLevel: "Admin",
    // ValidFrom: new Date(),
    ValidFrom: ValidFrom || new Date(),
    ValidUpto: ValidUpto || null,
    Blocked: false,
  };

  const created = await ZatraLogin.create(loginData);
  console.log(
    `✅ Created new login (ID: ${created._id}) for UserId: ${UserId} | Plain Password: ${plainPassword}`
  );
  return created.toObject();
};

const createZatraLogin2 = async ({
  ZatraId,
  UserId,
  RoleId,
  FullName,
  MobileNumber,
  Password,
  ValidFrom,
  ValidUpto,
}) => {
  if (!ZatraId || !RoleId || !UserId || !MobileNumber) {
    throw new Error("Missing required fields to create login");
  }

  console.log(
    `🔹 Creating Zatra login → UserId: ${UserId}, RoleId: ${RoleId}, ZatraId: ${ZatraId}`
  );

  // Use given password or fallback
  const plainPassword = Password || MobileNumber?.toString() || "123456";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // 🔹 Check if login already exists for this User & Zatra
  let existing = await ZatraLogin.findOne({ UserId, ZatraId });

  if (existing) {
    // update existing login
    existing.RoleId = RoleId;
    existing.FullName = FullName;
    existing.MobileNumber = MobileNumber;
    existing.Password = hashedPassword;
    existing.Blocked = false;
    existing.ValidFrom = existing.ValidFrom || new Date();
    existing.ValidUpto = ValidUpto || null;

    await existing.save();

    console.log(
      `✅ Updated existing login (ID: ${existing._id}) for UserId: ${UserId} | Plain Password: ${plainPassword}`
    );

    return { ...existing.toObject(), plainPassword };
  }

  // 🔹 Create new login record
  const loginData = {
    ZatraId,
    UserId,
    RoleId,
    FullName,
    MobileNumber,
    Password: hashedPassword,
    ValidFrom: ValidFrom || new Date(),
    ValidUpto: ValidUpto || null,
    Blocked: false,
  };

  const created = await ZatraLogin.create(loginData);

  console.log(
    `✅ Created new login (ID: ${created._id}) for UserId: ${UserId} | Plain Password: ${plainPassword}`
  );

  return { ...created.toObject(), plainPassword };
};


module.exports = {
  generateStrongPassword,
  createAssetLogin,
  createZatraLogin,
  // updateAssetLogin,
};
