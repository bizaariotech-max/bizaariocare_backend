const express = require("express");
const router = express.Router();

const {
  test,
  getPatientReferral,
  getPatientReferralsByPatientId,
  getPatientReferralsByCaseFileId,
  createPatientReferral,

  // Reason for Referral
  updateReasonForReferral,
  addDoctorRemark,
  updateDoctorRemark,
  deleteDoctorRemark,

  // Second Opinion
  updateSecondOpinionQuestions,
  getSecondOpinionQuestions,
  // updateSecondOpinionQuestions,
  // addSecondOpinionQuestion,
  // updateSecondOpinionQuestion,
  // deleteSecondOpinionQuestion,

  // Proposed Surgery
  updateProposedSurgery,
  getProposedSurgery,

  // Pre-Surgical Considerations
  updatePreSurgicalConsiderations,
  getPreSurgicalConsiderations,

  // Doctor/Hospital Selection
  updateDoctorHospitalSelection,
  getDoctorHospitalSelection,

  // Referral Response
  addReferralResponse,

  // Status Update
  updateReferralStatus,

  // Search and Analytics
  getReferralsByReferringDoctor,
  getReferralsByReferredDoctor,
  getPendingReferrals,
  getUrgentReferrals,
  getOverdueReferrals,
  getReferralsBySpecialty,
  getReferralsByCity,

  // Lookup Helpers
  getLookupsByType,
  getCities,
  getDoctorsBySpecialtyAndCity,

  // Delete
  deletePatientReferral,
} = require("../../controllers/Patient/patientReferral.Controller");

const {
  validateCreatePatientReferral,
  validateReasonForReferral,
  validateDoctorRemark,
  // validateSecondOpinionQuestions,
  // validateSecondOpinionQuestion,
  validateSecondOpinionQuestions,
  validateProposedSurgery,
  validatePreSurgicalConsiderations,
  validateDoctorHospitalSelection,
  validateReferralResponse,
  validateStatusUpdate,
  validatePatientIdParam,
  validateReferralIdParam,
  validateObjectIdParam,
  validateDeleteRequest,
  validatePatientAndCaseFileIdParams,
  validateCaseFileIdParam,
} = require("../../middlewares/patientReferral.middleware");

// Test Route
router.get("/test", test);

// ==================== MAIN REFERRAL ROUTES ====================

// Get Patient Referral by ID
router.get(
  "/getPatientReferral/:referralId",
  validateReferralIdParam,
  getPatientReferral
);

// Get Patient Referrals by Patient ID (with optional Case File ID)
// Get patient referrals by patient ID
router.get(
  "/getPatientReferralsByPatientId/:patientId",
  validatePatientIdParam,
  getPatientReferralsByPatientId
);

// Get patient referrals by case file ID
router.get(
  "/getPatientReferralsByCaseFileId/:caseFileId",
  validateCaseFileIdParam,
  getPatientReferralsByCaseFileId
);

// Create New Patient Referral
router.post(
  "/createPatientReferral",
  validateCreatePatientReferral,
  createPatientReferral
);

// ==================== REASON FOR REFERRAL ROUTES ====================

// Update Reason for Referral
router.put(
  "/updateReasonForReferral/:referralId",
  validateReferralIdParam,
  validateReasonForReferral,
  updateReasonForReferral
);

// Add Doctor Remark
router.post(
  "/addDoctorRemark/:referralId",
  validateReferralIdParam,
  validateDoctorRemark,
  addDoctorRemark
);

// Update Doctor Remark
router.put(
  "/updateDoctorRemark/:referralId/:remarkId",
  validateReferralIdParam,
  validateObjectIdParam("remarkId"),
  validateDoctorRemark,
  updateDoctorRemark
);

// Delete Doctor Remark
router.delete(
  "/deleteDoctorRemark/:referralId/:remarkId",
  validateReferralIdParam,
  validateObjectIdParam("remarkId"),
  validateDeleteRequest,
  deleteDoctorRemark
);

//*==================== SECOND OPINION ROUTES ====================
// GET Second Opinion Questions
router.get(
  "/getSecondOpinionQuestions/:referralId",
  validateReferralIdParam,
  getSecondOpinionQuestions
);

// *new
router.put(
  "/updateSecondOpinionQuestions/:referralId",
  validateReferralIdParam,
  validateSecondOpinionQuestions,
  updateSecondOpinionQuestions
);
// *new

// // Update Second Opinion Questions
// router.put("/updateSecondOpinionQuestions/:referralId", 
//   validateReferralIdParam,
//   validateSecondOpinionQuestions,
//   updateSecondOpinionQuestions
// );

// // Add Second Opinion Question
// router.post("/addSecondOpinionQuestion/:referralId", 
//   validateReferralIdParam,
//   validateSecondOpinionQuestion,
//   addSecondOpinionQuestion
// );

// // Update Second Opinion Question
// router.put("/updateSecondOpinionQuestion/:referralId/:questionId", 
//   validateReferralIdParam,
//   validateObjectIdParam('questionId'),
//   validateSecondOpinionQuestion,
//   updateSecondOpinionQuestion
// );

// // Delete Second Opinion Question
// router.delete("/deleteSecondOpinionQuestion/:referralId/:questionId", 
//   validateReferralIdParam,
//   validateObjectIdParam('questionId'),
//   validateDeleteRequest,
//   deleteSecondOpinionQuestion
// );

// ==================== PROPOSED SURGERY ROUTES ====================

// Get Proposed Surgery
router.get("/getProposedSurgery/:referralId", 
  validateReferralIdParam,
  getProposedSurgery
);

// Update Proposed Surgery
router.put("/updateProposedSurgery/:referralId", 
  validateReferralIdParam,
  validateProposedSurgery,
  updateProposedSurgery
);

// ==================== PRE-SURGICAL CONSIDERATIONS ROUTES ====================

// Get Pre-Surgical Considerations
router.get("/getPreSurgicalConsiderations/:referralId", 
  validateReferralIdParam,
  getPreSurgicalConsiderations
);

// Update Pre-Surgical Considerations
router.put("/updatePreSurgicalConsiderations/:referralId", 
  validateReferralIdParam,
  validatePreSurgicalConsiderations,
  updatePreSurgicalConsiderations
);

// ==================== DOCTOR/HOSPITAL SELECTION ROUTES ====================

// Get Doctor Hospital Selection
router.get("/getDoctorHospitalSelection/:referralId", 
  validateReferralIdParam,
  getDoctorHospitalSelection
);

// Update Doctor Hospital Selection
router.put("/updateDoctorHospitalSelection/:referralId", 
  validateReferralIdParam,
  validateDoctorHospitalSelection,
  updateDoctorHospitalSelection
);

// ==================== REFERRAL RESPONSE ROUTES ====================

// Add Referral Response
router.post("/addReferralResponse/:referralId", 
  validateReferralIdParam,
  validateReferralResponse,
  addReferralResponse
);

// ==================== STATUS UPDATE ROUTES ====================

// Update Referral Status
router.put("/updateReferralStatus/:referralId", 
  validateReferralIdParam,
  validateStatusUpdate,
  updateReferralStatus
);

// ==================== SEARCH AND ANALYTICS ROUTES ====================

// Get Referrals by Referring Doctor
router.get("/getReferralsByReferringDoctor/:doctorId", 
  validateObjectIdParam('doctorId'),
  getReferralsByReferringDoctor
);

// Get Referrals by Referred Doctor
router.get("/getReferralsByReferredDoctor/:doctorId", 
  validateObjectIdParam('doctorId'),
  getReferralsByReferredDoctor
);

// Get Pending Referrals
router.get("/getPendingReferrals", getPendingReferrals);

// Get Urgent Referrals
router.get("/getUrgentReferrals", getUrgentReferrals);

// Get Overdue Referrals (with optional days query parameter)
router.get("/getOverdueReferrals", getOverdueReferrals);

// Get Referrals by Specialty
router.get("/getReferralsBySpecialty/:specialtyId", 
  validateObjectIdParam('specialtyId'),
  getReferralsBySpecialty
);

// Get Referrals by City
router.get("/getReferralsByCity/:cityId", 
  validateObjectIdParam('cityId'),
  getReferralsByCity
);

// ==================== LOOKUP HELPER ROUTES ====================

// Get Lookups by Type
router.get("/getLookupsByType/:lookupType", getLookupsByType);

// Get Cities
router.get("/getCities", getCities);

// Get Doctors by Specialty and City
router.get("/getDoctorsBySpecialtyAndCity/:specialtyId/:cityId", 
  validateObjectIdParam('specialtyId'),
  validateObjectIdParam('cityId'),
  getDoctorsBySpecialtyAndCity
);

// ==================== DELETE ROUTES ====================

// Delete Patient Referral (Soft Delete)
router.delete("/deletePatientReferral/:referralId", 
  validateReferralIdParam,
  validateDeleteRequest,
  deletePatientReferral
);

module.exports = router;