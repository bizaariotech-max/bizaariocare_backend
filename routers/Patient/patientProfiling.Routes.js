const express = require("express");
const router = express.Router();

const {
  test,
  
  // Dashboard
  getPatientDashboard,
  
  // Chief Complaints
  getChiefComplaintsList,
  addChiefComplaint,
  updateChiefComplaint,
  deleteChiefComplaint,
  
  // Medical Summary
  getMedicalSummary,
  updateMedicalSummary,
  addPastMedication,
  
  // Clinical Findings
  getClinicalFindingsList,
  addClinicalFinding,
  
  // Vitals/Physical Examinations
  getVitalsList,
  addVital,
  
  // Diagnostics/Investigations
  getInvestigationsList,
  addInvestigation,
  
  // Diagnosis
  getDiagnosisList,
  addDiagnosis,
  getLatestDiagnosis,
  
  // Treatment
  getTreatment,
  updateTreatment,
  addTreatmentMedicine,
  
  // Search
  searchBySymptom,
  searchByDiagnosis,
  searchByMedication
} = require("../../controllers/Patient/patientProfiling.Controller");

const {
  validatePatientIdParam,
  validateObjectIdParam,
  validateChiefComplaint,
  validateMedicalSummary,
  validatePastMedication,
  validateClinicalFinding,
  validateVital,
  validateInvestigation,
  validateDiagnosis,
  validateTreatment,
  validateTreatmentMedicine,
  validateDeleteRequest
} = require("../../middlewares/patientProfiling.middleware");

// Test Route
router.get("/test", test);

// ==================== DASHBOARD ROUTE ====================

// Get Complete Patient Dashboard with all data
router.get("/dashboard/:patientId", 
  validatePatientIdParam, 
  getPatientDashboard
);

// ==================== CHIEF COMPLAINTS ROUTES ====================

// Get Chief Complaints List with filters
// Query params: ?severityGrade=4&limit=50
router.get("/chief-complaints/:patientId", 
  validatePatientIdParam, 
  getChiefComplaintsList
);

// Add Chief Complaint
router.post("/chief-complaints/:patientId", 
  validatePatientIdParam,
  validateChiefComplaint,
  addChiefComplaint
);

// Update Chief Complaint
router.put("/chief-complaints/:complaintId", 
  validateObjectIdParam('complaintId'),
  validateChiefComplaint,
  updateChiefComplaint
);

// Delete Chief Complaint (Soft Delete)
router.delete("/chief-complaints/:complaintId", 
  validateObjectIdParam('complaintId'),
  validateDeleteRequest,
  deleteChiefComplaint
);

// ==================== MEDICAL SUMMARY ROUTES ====================

// Get Medical Summary
router.get("/medical-summary/:patientId", 
  validatePatientIdParam, 
  getMedicalSummary
);

// Update Medical Summary
router.put("/medical-summary/:patientId", 
  validatePatientIdParam,
  validateMedicalSummary,
  updateMedicalSummary
);

// Add Past Medication
router.post("/medical-summary/medication/:patientId", 
  validatePatientIdParam,
  validatePastMedication,
  addPastMedication
);

// ==================== CLINICAL FINDINGS ROUTES ====================

// Get Clinical Findings List with filters
// Query params: ?severityGrade=3&limit=50
router.get("/clinical-findings/:patientId", 
  validatePatientIdParam, 
  getClinicalFindingsList
);

// Add Clinical Finding
router.post("/clinical-findings/:patientId", 
  validatePatientIdParam,
  validateClinicalFinding,
  addClinicalFinding
);

// ==================== VITALS/PHYSICAL EXAMINATIONS ROUTES ====================

// Get Vitals List with filters
// Query params: ?parameterId=xxx&abnormalOnly=true&limit=100
router.get("/vitals/:patientId", 
  validatePatientIdParam, 
  getVitalsList
);

// Add Vital
router.post("/vitals/:patientId", 
  validatePatientIdParam,
  validateVital,
  addVital
);

// ==================== DIAGNOSTICS/INVESTIGATIONS ROUTES ====================

// Get Investigations List with filters
// Query params: ?categoryId=xxx&abnormalOnly=true&withReportsOnly=true&limit=100
router.get("/investigations/:patientId", 
  validatePatientIdParam, 
  getInvestigationsList
);

// Add Investigation
router.post("/investigations/:patientId", 
  validatePatientIdParam,
  validateInvestigation,
  addInvestigation
);

// ==================== DIAGNOSIS ROUTES ====================

// Get Diagnosis List
// Query params: ?limit=50
router.get("/diagnosis/:patientId", 
  validatePatientIdParam, 
  getDiagnosisList
);

// Add Diagnosis
router.post("/diagnosis/:patientId", 
  validatePatientIdParam,
  validateDiagnosis,
  addDiagnosis
);

// Get Latest Diagnosis
router.get("/diagnosis/latest/:patientId", 
  validatePatientIdParam, 
  getLatestDiagnosis
);

// ==================== TREATMENT ROUTES ====================

// Get Treatment
router.get("/treatment/:patientId", 
  validatePatientIdParam, 
  getTreatment
);

// Update Treatment
router.put("/treatment/:patientId", 
  validatePatientIdParam,
  validateTreatment,
  updateTreatment
);

// Add Treatment Medicine
router.post("/treatment/medicine/:patientId", 
  validatePatientIdParam,
  validateTreatmentMedicine,
  addTreatmentMedicine
);

// ==================== SEARCH ROUTES ====================

// Search by Symptom
router.get("/search/symptom/:symptomId", 
  validateObjectIdParam('symptomId'),
  searchBySymptom
);

// Search by Diagnosis
router.get("/search/diagnosis/:diagnosisId", 
  validateObjectIdParam('diagnosisId'),
  searchByDiagnosis
);

// Search by Medication
router.get("/search/medication/:medicationId", 
  validateObjectIdParam('medicationId'),
  searchByMedication
);

module.exports = router;