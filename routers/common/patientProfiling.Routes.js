// const express = require("express");
// const router = express.Router();

// const {
//   test,
//   getPatientProfiling,
//   createPatientProfiling,
  
//   // Chief Complaints
//   addChiefComplaint,
//   updateChiefComplaint,
//   deleteChiefComplaint,
//   getChiefComplaintsList,
  
//   // Medical Summary
//   updateMedicalSummary,
//   addPastMedication,
//   getMedicalSummaryList,
//   getPastMedicationsList,
  
//   // Clinical Findings
//   addClinicalFinding,
//   updateClinicalFinding,
//   deleteClinicalFinding,
//   getClinicalFindingsList,
  
//   // Vitals/Physical Examinations
//   addVitalExamination,
//   updateVitalExamination,
//   deleteVitalExamination,
//   getVitalsExaminationsList,
  
//   // Diagnostics/Investigations
//   addInvestigation,
//   updateInvestigation,
//   deleteInvestigation,
//   getInvestigationsList,
  
//   // Diagnosis
//   addDiagnosis,
//   updateDiagnosis,
//   deleteDiagnosis,
//   getDiagnosisList,
  
//   // Treatment to Date
//   updateTreatmentToDate,
//   addTreatmentMedicine,
//   getTreatmentToDateList,
//   getTreatmentMedicinesList,
  
//   // Search and Analytics
//   searchBySymptom,
//   searchByDiagnosis,
//   searchByMedication,
  
//   // Lookup Helpers
//   getLookupsByType,
//   getInvestigationsByCategory,
//   getVitalParameters,
//   checkDocumentSize,
//   // getPatientArchivedData,
//   // archiveOldData
// } = require("../../controllers/common/patientProfiling.Controller");

// const {
//   validateCreatePatientProfiling,
//   validateChiefComplaint,
//   validateMedicalSummary,
//   validatePastMedication,
//   validateClinicalFinding,
//   validateVitalExamination,
//   validateInvestigation,
//   validateDiagnosis,
//   validateTreatmentToDate,
//   validateTreatmentMedicine,
//   validatePatientIdParam,
//   validateObjectIdParam,
//   validateDeleteRequest
// } = require("../../middlewares/patientProfiling.middleware");

// // Test Route
// router.get("/test", test);

// // ==================== MAIN PROFILING ROUTES ====================

// // Get Complete Patient Profiling by Patient ID
// router.get("/getPatientProfiling/:patientId", 
//   validatePatientIdParam, 
//   getPatientProfiling
// );

// // Create New Patient Profiling
// router.post("/createPatientProfiling", 
//   validateCreatePatientProfiling, 
//   createPatientProfiling
// );

// // ==================== CHIEF COMPLAINTS ROUTES ====================

// // Get Chief Complaints List
// router.get("/getChiefComplaintsList/:patientId", 
//   validatePatientIdParam, 
//   getChiefComplaintsList
// );

// // Add Chief Complaint
// router.post("/addChiefComplaint/:patientId", 
//   validatePatientIdParam,
//   validateChiefComplaint,
//   addChiefComplaint
// );

// // Update Chief Complaint
// router.put("/updateChiefComplaint/:patientId/:complaintId", 
//   validatePatientIdParam,
//   validateObjectIdParam('complaintId'),
//   validateChiefComplaint,
//   updateChiefComplaint
// );

// // Delete Chief Complaint
// router.delete("/deleteChiefComplaint/:patientId/:complaintId", 
//   validatePatientIdParam,
//   validateObjectIdParam('complaintId'),
//   validateDeleteRequest,
//   deleteChiefComplaint
// );

// // ==================== MEDICAL SUMMARY ROUTES ====================

// // Get Medical Summary
// router.get("/getMedicalSummaryList/:patientId", 
//   validatePatientIdParam, 
//   getMedicalSummaryList
// );

// // Get Past Medications List
// router.get("/getPastMedicationsList/:patientId", 
//   validatePatientIdParam, 
//   getPastMedicationsList
// );

// // Update Medical Summary
// router.put("/updateMedicalSummary/:patientId", 
//   validatePatientIdParam,
//   validateMedicalSummary,
//   updateMedicalSummary
// );

// // Add Past Medication
// router.post("/addPastMedication/:patientId", 
//   validatePatientIdParam,
//   validatePastMedication,
//   addPastMedication
// );

// // ==================== CLINICAL FINDINGS ROUTES ====================

// // Get Clinical Findings List
// router.get("/getClinicalFindingsList/:patientId", 
//   validatePatientIdParam, 
//   getClinicalFindingsList
// );

// // Add Clinical Finding
// router.post("/addClinicalFinding/:patientId", 
//   validatePatientIdParam,
//   validateClinicalFinding,
//   addClinicalFinding
// );

// // Update Clinical Finding
// router.put("/updateClinicalFinding/:patientId/:findingId", 
//   validatePatientIdParam,
//   validateObjectIdParam('findingId'),
//   validateClinicalFinding,
//   updateClinicalFinding
// );

// // Delete Clinical Finding
// router.delete("/deleteClinicalFinding/:patientId/:findingId", 
//   validatePatientIdParam,
//   validateObjectIdParam('findingId'),
//   validateDeleteRequest,
//   deleteClinicalFinding
// );

// // ==================== VITALS/PHYSICAL EXAMINATIONS ROUTES ====================

// // Get Vitals/Physical Examinations List
// router.get("/getVitalsExaminationsList/:patientId", 
//   validatePatientIdParam, 
//   getVitalsExaminationsList
// );

// // Add Vital/Physical Examination
// router.post("/addVitalExamination/:patientId", 
//   validatePatientIdParam,
//   validateVitalExamination,
//   addVitalExamination
// );

// // Update Vital/Physical Examination
// router.put("/updateVitalExamination/:patientId/:vitalId", 
//   validatePatientIdParam,
//   validateObjectIdParam('vitalId'),
//   validateVitalExamination,
//   updateVitalExamination
// );

// // Delete Vital/Physical Examination
// router.delete("/deleteVitalExamination/:patientId/:vitalId", 
//   validatePatientIdParam,
//   validateObjectIdParam('vitalId'),
//   validateDeleteRequest,
//   deleteVitalExamination
// );

// // ==================== DIAGNOSTICS/INVESTIGATIONS ROUTES ====================

// // Get Investigations List
// router.get("/getInvestigationsList/:patientId", 
//   validatePatientIdParam, 
//   getInvestigationsList
// );


// // Add Investigation
// router.post("/addInvestigation/:patientId", 
//   validatePatientIdParam,
//   validateInvestigation,
//   addInvestigation
// );

// // Update Investigation
// router.put("/updateInvestigation/:patientId/:investigationId", 
//   validatePatientIdParam,
//   validateObjectIdParam('investigationId'),
//   validateInvestigation,
//   updateInvestigation
// );

// // Delete Investigation
// router.delete("/deleteInvestigation/:patientId/:investigationId", 
//   validatePatientIdParam,
//   validateObjectIdParam('investigationId'),
//   validateDeleteRequest,
//   deleteInvestigation
// );

// // ==================== DIAGNOSIS ROUTES ====================

// // Get Diagnosis List
// router.get("/getDiagnosisList/:patientId", 
//   validatePatientIdParam, 
//   getDiagnosisList
// );


// // Add Diagnosis
// router.post("/addDiagnosis/:patientId", 
//   validatePatientIdParam,
//   validateDiagnosis,
//   addDiagnosis
// );

// // Update Diagnosis
// router.put("/updateDiagnosis/:patientId/:diagnosisId", 
//   validatePatientIdParam,
//   validateObjectIdParam('diagnosisId'),
//   validateDiagnosis,
//   updateDiagnosis
// );

// // Delete Diagnosis
// router.delete("/deleteDiagnosis/:patientId/:diagnosisId", 
//   validatePatientIdParam,
//   validateObjectIdParam('diagnosisId'),
//   validateDeleteRequest,
//   deleteDiagnosis
// );

// // ==================== TREATMENT TO DATE ROUTES ====================

// // Get Treatment to Date
// router.get("/getTreatmentToDateList/:patientId", 
//   validatePatientIdParam, 
//   getTreatmentToDateList
// );


// // Update Treatment to Date
// router.put("/updateTreatmentToDate/:patientId", 
//   validatePatientIdParam,
//   validateTreatmentToDate,
//   updateTreatmentToDate
// );

// // Get Treatment Medicines List
// router.get("/getTreatmentMedicinesList/:patientId", 
//   validatePatientIdParam, 
//   getTreatmentMedicinesList
// );


// // Add Treatment Medicine
// router.post("/addTreatmentMedicine/:patientId", 
//   validatePatientIdParam,
//   validateTreatmentMedicine,
//   addTreatmentMedicine
// );

// // ==================== SEARCH AND ANALYTICS ROUTES ====================

// // Search Patients by Symptom
// router.get("/searchBySymptom/:symptomId", 
//   validateObjectIdParam('symptomId'),
//   searchBySymptom
// );

// // Search Patients by Diagnosis
// router.get("/searchByDiagnosis/:diagnosisId", 
//   validateObjectIdParam('diagnosisId'),
//   searchByDiagnosis
// );

// // Search Patients by Medication
// router.get("/searchByMedication/:medicationId", 
//   validateObjectIdParam('medicationId'),
//   searchByMedication
// );

// // ==================== LOOKUP HELPER ROUTES ====================

// // Get Lookups by Type
// router.get("/getLookupsByType/:lookupType", getLookupsByType);

// // Get Investigations by Category
// router.get("/getInvestigationsByCategory/:categoryId", 
//   validateObjectIdParam('categoryId'),
//   getInvestigationsByCategory
// );

// // Get Vital Parameters
// router.get("/getVitalParameters", getVitalParameters);

// // Add these routes to your existing routes file

// // Document size monitoring
// router.get("/size/:patientId",checkDocumentSize);

// // // Archive management
// // router.post("/archive/:patientId", archiveOldData);
// // router.get("/archive/:patientId", getPatientArchivedData)


// module.exports = router;