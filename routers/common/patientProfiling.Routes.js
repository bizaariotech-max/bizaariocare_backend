const express = require("express");
const router = express.Router();

const {
  test,
  getPatientProfiling,
  createPatientProfiling,
  
  // Chief Complaints
  addChiefComplaint,
  updateChiefComplaint,
  deleteChiefComplaint,
  
  // Medical Summary
  updateMedicalSummary,
  addPastMedication,
  
  // Clinical Findings
  addClinicalFinding,
  updateClinicalFinding,
  deleteClinicalFinding,
  
  // Vitals/Physical Examinations
  addVitalExamination,
  updateVitalExamination,
  deleteVitalExamination,
  
  // Diagnostics/Investigations
  addInvestigation,
  updateInvestigation,
  deleteInvestigation,
  
  // Diagnosis
  addDiagnosis,
  updateDiagnosis,
  deleteDiagnosis,
  
  // Treatment to Date
  updateTreatmentToDate,
  addTreatmentMedicine,
  
  // Search and Analytics
  searchBySymptom,
  searchByDiagnosis,
  searchByMedication,
  
  // Lookup Helpers
  getLookupsByType,
  getInvestigationsByCategory,
  getVitalParameters
} = require("../../controllers/common/patientProfiling.Controller");

const {
  validateCreatePatientProfiling,
  validateChiefComplaint,
  validateMedicalSummary,
  validatePastMedication,
  validateClinicalFinding,
  validateVitalExamination,
  validateInvestigation,
  validateDiagnosis,
  validateTreatmentToDate,
  validateTreatmentMedicine,
  validatePatientIdParam,
  validateObjectIdParam,
  validateDeleteRequest
} = require("../../middlewares/patientProfiling.middleware");

// Test Route
router.get("/test", test);

// ==================== MAIN PROFILING ROUTES ====================

// Get Complete Patient Profiling by Patient ID
router.get("/getPatientProfiling/:patientId", 
  validatePatientIdParam, 
  getPatientProfiling
);

// Create New Patient Profiling
router.post("/createPatientProfiling", 
  validateCreatePatientProfiling, 
  createPatientProfiling
);

// ==================== CHIEF COMPLAINTS ROUTES ====================

// Add Chief Complaint
router.post("/addChiefComplaint/:patientId", 
  validatePatientIdParam,
  validateChiefComplaint,
  addChiefComplaint
);

// Update Chief Complaint
router.put("/updateChiefComplaint/:patientId/:complaintId", 
  validatePatientIdParam,
  validateObjectIdParam('complaintId'),
  validateChiefComplaint,
  updateChiefComplaint
);

// Delete Chief Complaint
router.delete("/deleteChiefComplaint/:patientId/:complaintId", 
  validatePatientIdParam,
  validateObjectIdParam('complaintId'),
  validateDeleteRequest,
  deleteChiefComplaint
);

// ==================== MEDICAL SUMMARY ROUTES ====================

// Update Medical Summary
router.put("/updateMedicalSummary/:patientId", 
  validatePatientIdParam,
  validateMedicalSummary,
  updateMedicalSummary
);

// Add Past Medication
router.post("/addPastMedication/:patientId", 
  validatePatientIdParam,
  validatePastMedication,
  addPastMedication
);

// ==================== CLINICAL FINDINGS ROUTES ====================

// Add Clinical Finding
router.post("/addClinicalFinding/:patientId", 
  validatePatientIdParam,
  validateClinicalFinding,
  addClinicalFinding
);

// Update Clinical Finding
router.put("/updateClinicalFinding/:patientId/:findingId", 
  validatePatientIdParam,
  validateObjectIdParam('findingId'),
  validateClinicalFinding,
  updateClinicalFinding
);

// Delete Clinical Finding
router.delete("/deleteClinicalFinding/:patientId/:findingId", 
  validatePatientIdParam,
  validateObjectIdParam('findingId'),
  validateDeleteRequest,
  deleteClinicalFinding
);

// ==================== VITALS/PHYSICAL EXAMINATIONS ROUTES ====================

// Add Vital/Physical Examination
router.post("/addVitalExamination/:patientId", 
  validatePatientIdParam,
  validateVitalExamination,
  addVitalExamination
);

// Update Vital/Physical Examination
router.put("/updateVitalExamination/:patientId/:vitalId", 
  validatePatientIdParam,
  validateObjectIdParam('vitalId'),
  validateVitalExamination,
  updateVitalExamination
);

// Delete Vital/Physical Examination
router.delete("/deleteVitalExamination/:patientId/:vitalId", 
  validatePatientIdParam,
  validateObjectIdParam('vitalId'),
  validateDeleteRequest,
  deleteVitalExamination
);

// ==================== DIAGNOSTICS/INVESTIGATIONS ROUTES ====================

// Add Investigation
router.post("/addInvestigation/:patientId", 
  validatePatientIdParam,
  validateInvestigation,
  addInvestigation
);

// Update Investigation
router.put("/updateInvestigation/:patientId/:investigationId", 
  validatePatientIdParam,
  validateObjectIdParam('investigationId'),
  validateInvestigation,
  updateInvestigation
);

// Delete Investigation
router.delete("/deleteInvestigation/:patientId/:investigationId", 
  validatePatientIdParam,
  validateObjectIdParam('investigationId'),
  validateDeleteRequest,
  deleteInvestigation
);

// ==================== DIAGNOSIS ROUTES ====================

// Add Diagnosis
router.post("/addDiagnosis/:patientId", 
  validatePatientIdParam,
  validateDiagnosis,
  addDiagnosis
);

// Update Diagnosis
router.put("/updateDiagnosis/:patientId/:diagnosisId", 
  validatePatientIdParam,
  validateObjectIdParam('diagnosisId'),
  validateDiagnosis,
  updateDiagnosis
);

// Delete Diagnosis
router.delete("/deleteDiagnosis/:patientId/:diagnosisId", 
  validatePatientIdParam,
  validateObjectIdParam('diagnosisId'),
  validateDeleteRequest,
  deleteDiagnosis
);

// ==================== TREATMENT TO DATE ROUTES ====================

// Update Treatment to Date
router.put("/updateTreatmentToDate/:patientId", 
  validatePatientIdParam,
  validateTreatmentToDate,
  updateTreatmentToDate
);

// Add Treatment Medicine
router.post("/addTreatmentMedicine/:patientId", 
  validatePatientIdParam,
  validateTreatmentMedicine,
  addTreatmentMedicine
);

// ==================== SEARCH AND ANALYTICS ROUTES ====================

// Search Patients by Symptom
router.get("/searchBySymptom/:symptomId", 
  validateObjectIdParam('symptomId'),
  searchBySymptom
);

// Search Patients by Diagnosis
router.get("/searchByDiagnosis/:diagnosisId", 
  validateObjectIdParam('diagnosisId'),
  searchByDiagnosis
);

// Search Patients by Medication
router.get("/searchByMedication/:medicationId", 
  validateObjectIdParam('medicationId'),
  searchByMedication
);

// ==================== LOOKUP HELPER ROUTES ====================

// Get Lookups by Type
router.get("/getLookupsByType/:lookupType", getLookupsByType);

// Get Investigations by Category
router.get("/getInvestigationsByCategory/:categoryId", 
  validateObjectIdParam('categoryId'),
  getInvestigationsByCategory
);

// Get Vital Parameters
router.get("/getVitalParameters", getVitalParameters);

module.exports = router;