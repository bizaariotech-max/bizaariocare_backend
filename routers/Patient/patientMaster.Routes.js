const express = require("express");
const router = express.Router();

const {
  test,
  SavePatient,
  patientList,
  getPatientById,
  getPatientByPatientId,
  deletePatient,
  getPatientsByLocation,
  searchPatients,
  getPatientsByVerificationStatus,
  updateVerificationStatus,
  getPatientByPhoneNumber,
  getPatientDetailsByQRScan,
  addFamilyHistory,
  removeFamilyHistory,
  listFamilyHistory,
  addHabitLifestyle,
  listHabitLifestyle,
  removeHabitLifestyle,
  addAllergy,
  removeAllergy,
  listAllergies,
  addPastAccidentsTrauma,
  removePastAccidentsTrauma,
  listPastAccidentsTrauma,
} = require("../../controllers/Patient/patientMaster.Controller");

const {
  validateSavePatient,
  validatePatientList,
} = require("../../middlewares/patientMaster.middleware");

// Test Route
router.get("/test", test);

// Save Patient (Add/Edit)
router.post("/savePatient", validateSavePatient, SavePatient);

// Patient List with filters and pagination
router.get("/patientList", validatePatientList, patientList);
router.post("/patientList", validatePatientList, patientList);

// Get Patient by MongoDB ID
router.get("/getPatient/:id", getPatientById);

// Get Patient by PatientId
router.get("/getPatientByPatientId/:patientId", getPatientByPatientId);

// Delete Patient (Soft Delete)
router.delete("/deletePatient/:id", deletePatient);

// Get Patients by Location (Country and/or State)
router.get("/getPatientsByLocation/:countryId", getPatientsByLocation);
router.get("/getPatientsByLocation/:countryId/:stateId", getPatientsByLocation);

// Search Patients
router.get("/searchPatients/:searchTerm", searchPatients);

// Get Patients by Verification Status
router.get(
  "/getPatientsByVerificationStatus/:isVerified",
  getPatientsByVerificationStatus
);

// Update Patient Verification Status
router.put("/updateVerificationStatus/:id", updateVerificationStatus);

//getPatientByPhoneNumber
router.get("/getPatientbyphonenumber/:PhoneNumber", getPatientByPhoneNumber);

// new apis

// ==================== FAMILY HISTORY ROUTES ====================
router.post("/patient/family-history/add", addFamilyHistory);
router.post("/patient/family-history/remove", removeFamilyHistory);
router.get("/patient/family-history/list", listFamilyHistory);

// ==================== HABIT LIFESTYLE ROUTES ====================
router.post("/patient/habit-lifestyle/add", addHabitLifestyle);
router.post("/patient/habit-lifestyle/remove", removeHabitLifestyle);
router.get("/patient/habit-lifestyle/list", listHabitLifestyle);

// ==================== ALLERGIES ROUTES ====================
router.post("/patient/allergy/add", addAllergy);
router.post("/patient/allergy/remove", removeAllergy);
router.get("/patient/allergy/list", listAllergies);

// ==================== PAST ACCIDENTS TRAUMA ROUTES ====================
router.post("/patient/past-accidents-trauma/add", addPastAccidentsTrauma);
router.post("/patient/past-accidents-trauma/remove", removePastAccidentsTrauma);
router.get("/patient/past-accidents-trauma/list", listPastAccidentsTrauma);




// QR
//  NO AUTHENTICATION REQUIRED (Public)
// router.get("/patient-details/:id", getPatientDetailsByQRScan); // will implement later


module.exports = router;
