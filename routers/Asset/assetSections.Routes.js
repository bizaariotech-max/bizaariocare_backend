const express = require("express");
const router = express.Router();

const {
  updateIncorporationDetails,
  getIncorporationDetails,
  updateVerificationDetails,
  getVerificationDetails,
  updateHospitalSize,
  getHospitalSize,
  updateAddress,
  getAddress,
  updateAssetProfile,
  getAssetProfile,
  updateMedicalSpecialties,
  getMedicalSpecialties,
  updateSocialMedia,
  getSocialMedia,
  addTreatmentPackage,
  updateTreatmentPackage,
  deleteTreatmentPackage,
  getTreatmentPackages,
  updateBankDetails,
  getBankDetails,
  addFeeCharge,
  updateFeeCharge,
  deleteFeeCharge,
  getFeesAndCharges,
  addOPDSchedule,
  updateOPDSchedule,
  deleteOPDSchedule,
  getOPDSchedule,
  updateOnlineClinic,
  getOnlineClinic,
  updateContactInfo,
  getContactInfo,
  addAssetMapping,
  removeAssetMapping,
  getAssetMapping,
} = require("../../controllers/Asset/assetSections.Controller");

const {
  validateIncorporationDetails,
  validateVerificationDetails,
  validateHospitalSize,
  validateAddress,
  validateAssetProfile,
  validateMedicalSpecialties,
  validateSocialMedia,
  validateTreatmentPackage,
  validateBankDetails,
  validateFeeCharge,
  validateOPDSchedule,
  validateOnlineClinic,
  validateContactInfo,
  validateAssetMapping,
} = require("../../middlewares/assetSections.middleware");

// -------------------------
// Section 3: Incorporation Details
// -------------------------
router.put("/incorporation-details/:AssetId", validateIncorporationDetails, updateIncorporationDetails);
router.get("/incorporation-details/:AssetId", getIncorporationDetails);

// -------------------------
// Section 4: Verification Details
// -------------------------
router.put("/verification-details/:AssetId", validateVerificationDetails, updateVerificationDetails);
router.get("/verification-details/:AssetId", getVerificationDetails);

// -------------------------
// Section 5: Hospital Size
// -------------------------
router.put("/hospital-size/:AssetId", validateHospitalSize, updateHospitalSize);
router.get("/hospital-size/:AssetId", getHospitalSize);

// -------------------------
// Section 6: Address
// -------------------------
router.put("/address/:AssetId", validateAddress, updateAddress);
router.get("/address/:AssetId", getAddress);

// -------------------------
// Section 7: Asset Profile
// -------------------------
router.put("/profile/:AssetId", validateAssetProfile, updateAssetProfile);
router.get("/profile/:AssetId", getAssetProfile);

// -------------------------
// Section 8: Medical Specialties
// -------------------------
router.put("/medical-specialties/:AssetId", validateMedicalSpecialties, updateMedicalSpecialties);
router.get("/medical-specialties/:AssetId", getMedicalSpecialties);

// -------------------------
// Section 9: Social Media
// -------------------------
router.put("/social-media/:AssetId", validateSocialMedia, updateSocialMedia);
router.get("/social-media/:AssetId", getSocialMedia);

// -------------------------
// Section 10: Treatment Package
// -------------------------
router.post("/treatment-packages/:AssetId", validateTreatmentPackage, addTreatmentPackage);
router.put("/treatment-packages/:AssetId/:PackageId", validateTreatmentPackage, updateTreatmentPackage);
router.delete("/treatment-packages/:AssetId/:PackageId", deleteTreatmentPackage);
router.get("/treatment-packages/:AssetId", getTreatmentPackages);

// -------------------------
// Section 11: Bank Details
// -------------------------
router.put("/bank-details/:AssetId", validateBankDetails, updateBankDetails);
router.get("/bank-details/:AssetId", getBankDetails);

// -------------------------
// Section 12: Fees and Charges
// -------------------------
router.post("/fees-charges/:AssetId", validateFeeCharge, addFeeCharge);
router.put("/fees-charges/:AssetId/:FeeId", validateFeeCharge, updateFeeCharge);
router.delete("/fees-charges/:AssetId/:FeeId", deleteFeeCharge);
router.get("/fees-charges/:AssetId", getFeesAndCharges);

// -------------------------
// Section 13: OPD Schedule
// -------------------------
router.post("/opd-schedule/:AssetId", validateOPDSchedule, addOPDSchedule);
router.put("/opd-schedule/:AssetId/:ScheduleId", validateOPDSchedule, updateOPDSchedule);
router.delete("/opd-schedule/:AssetId/:ScheduleId", deleteOPDSchedule);
router.get("/opd-schedule/:AssetId", getOPDSchedule);

// -------------------------
// Section 14: Online Clinic
// -------------------------
router.put("/online-clinic/:AssetId", validateOnlineClinic, updateOnlineClinic);
router.get("/online-clinic/:AssetId", getOnlineClinic);

// -------------------------
// Section 15: Contact Info
// -------------------------
router.put("/contact-info/:AssetId", validateContactInfo, updateContactInfo);
router.get("/contact-info/:AssetId", getContactInfo);

// -------------------------
// Section 16: Asset Mapping
// -------------------------
router.post("/asset-mapping/:AssetId", validateAssetMapping, addAssetMapping);
router.delete("/asset-mapping/:AssetId/:MappingId", removeAssetMapping);
router.get("/asset-mapping/:AssetId", getAssetMapping);

module.exports = router;