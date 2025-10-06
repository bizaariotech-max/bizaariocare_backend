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
  // Pre-existing Disease
  addPreExistingDisease,
  removePreExistingDisease,
  listPreExistingDisease,
  // Current Medications
  addCurrentMedications,
  removeCurrentMedications,
  listCurrentMedications,
  // Current Therapies
  addCurrentTherapy,
  updateCurrentTherapy,
  removeCurrentTherapy,
  listCurrentTherapies,
  // Family History
  addFamilyHistory,
  removeFamilyHistory,
  listFamilyHistory,
  // Habit Lifestyle
  addHabitLifestyle,
  removeHabitLifestyle,
  listHabitLifestyle,
  // Allergies
  addAllergy,
  removeAllergy,
  listAllergies,
  // Past Accidents Trauma
  addPastAccidentsTrauma,
  removePastAccidentsTrauma,
  listPastAccidentsTrauma,
  editCurrentMedications,
  addMedicine,
  editMedicine,
  deleteMedicine,
  addCurrentTherapies,
  editCurrentTherapies,
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

// ==================== PRE-EXISTING DISEASE ROUTES ====================
router.post("/patient/pre-existing-disease/add", addPreExistingDisease);
router.post("/patient/pre-existing-disease/remove", removePreExistingDisease);
router.get("/patient/pre-existing-disease/list", listPreExistingDisease);

// ==================== CURRENT MEDICATIONS ROUTES ====================
router.post("/patient/current-medications/add", addCurrentMedications);
router.post("/patient/current-medications/edit", editCurrentMedications);
router.post("/patient/current-medications/remove", removeCurrentMedications);
router.get("/patient/current-medications/list", listCurrentMedications);

// Individual Medicine Management
router.post("/patient/current-medications/medicine/add", addMedicine);
router.post("/patient/current-medications/medicine/edit", editMedicine);
router.post("/patient/current-medications/medicine/delete", deleteMedicine);

// ==================== CURRENT THERAPIES ROUTES ====================
router.post("/patient/current-therapy/add-single", addCurrentTherapy);
router.post("/patient/current-therapy/add", addCurrentTherapies);
router.post("/patient/current-therapy/edit", editCurrentTherapies);

router.put("/patient/current-therapy/update", updateCurrentTherapy);
router.post("/patient/current-therapy/remove", removeCurrentTherapy);
router.get("/patient/current-therapies/list", listCurrentTherapies);


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
