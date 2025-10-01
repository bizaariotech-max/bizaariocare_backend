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

// QR
//  NO AUTHENTICATION REQUIRED (Public)
// router.get("/patient-details/:id", getPatientDetailsByQRScan); // will implement later


module.exports = router;
