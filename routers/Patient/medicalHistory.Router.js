const express = require("express");
const router = express.Router();
const { 
  test, 
  saveMedicalHistory, 
  medicalHistoryList, 
  getMedicalHistoryById, 
  getMedicalHistoryByPatientId, 
  deleteMedicalHistory,
  updateMedicalHistoryStatus
} = require("../../controllers/Patient/medicalHistory.Controller");
const { validateMedicalHistory, validateMedicalHistoryStatus } = require("../../middlewares/medicalHistory.middleware");

// Test route
router.get("/test", test);

// Create/Update Medical History
router.post("/saveMedicalHistory",
  //  validateMedicalHistory,
    saveMedicalHistory);

// Get Medical History List with filters and pagination
router.post("/listMedicalHistory", medicalHistoryList);
router.get("/listMedicalHistory", medicalHistoryList);

// Get Medical History by ID
router.get("/getMedicalHistorybyId/:id", getMedicalHistoryById);

// Get Medical History by Patient ID
router.get("/getMedicalHistoryPatientId/patient/:patientId", getMedicalHistoryByPatientId);

// Delete Medical History (Soft Delete)
router.delete("/deleteMedicalHistory/:id", deleteMedicalHistory);

// Update Medical History Status
router.patch("/updateMedicalHistory/:id/status", validateMedicalHistoryStatus, updateMedicalHistoryStatus);

module.exports = router;