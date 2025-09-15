const express = require("express");
const router = express.Router();

const {
  test,
  SavePatient,
  patientList,
  getPatientById,
  getPatientByPatientId,
  deletePatient,
  getPatientsByDoctor,
  searchPatients,
} = require("../../controllers/common/patientMaster.Controller");

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

// Get Patients by Doctor
router.get("/getPatientsByDoctor/:doctorId", getPatientsByDoctor);

// Search Patients
router.get("/searchPatients/:searchTerm", searchPatients);

module.exports = router;