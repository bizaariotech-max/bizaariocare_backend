const express = require("express");
const router = express.Router();
const {
  // Main medical history
  saveMedicalHistory,
  medicalHistoryList,
  getMedicalHistoryById,
  deleteMedicalHistory,
  deleteSectionItem,

  // Chief Complaints
  addChiefComplaint,
  editChiefComplaint,
  addChiefComplaints,
  editChiefComplaints,
  listChiefComplaints,

  // Clinical Diagnoses
  addClinicalDiagnosis,
  editClinicalDiagnosis,
  addClinicalDiagnoses,
  editClinicalDiagnoses,
  listClinicalDiagnoses,

  // Therapies
  addTherapy,
  editTherapy,
  addTherapies,
  editTherapies,
  listTherapies,

  // Medicines Prescribed
  addMedicinesPrescribed,
  editMedicinesPrescribed,
  listMedicinesPrescribed,
  addMedicine,
  editMedicine,
  deleteMedicine,
} = require("../../controllers/Patient/medicalHistory2.Controller");

const {
  // Main medical history validators
  validateMedicalHistory,
  validateMedicalHistoryList,

  // Chief Complaints validators
  validateChiefComplaintsAdd,
  validateChiefComplaintsEdit,
  validateChiefComplaintsAddMultiple,
  validateChiefComplaintsEditMultiple,
  validateChiefComplaintsList,

  // Clinical Diagnoses validators
  validateClinicalDiagnosesAdd,
  validateClinicalDiagnosesEdit,
  validateClinicalDiagnosesAddMultiple,
  validateClinicalDiagnosesEditMultiple,
  validateClinicalDiagnosesList,

  // Therapies validators
  validateTherapiesAdd,
  validateTherapiesEdit,
  validateTherapiesAddMultiple,
  validateTherapiesEditMultiple,
  validateTherapiesList,

  // Medicines Prescribed validators
  validateMedicinesPrescribedAdd,
  validateMedicinesPrescribedEdit,
  validateMedicinesPrescribedList,
  validateAddMedicine,
  validateEditMedicine,
} = require("../../middlewares/medicalHistory2.middleware");

// ===================
// MAIN MEDICAL HISTORY ROUTES
// ===================
router.post("/save", validateMedicalHistory, saveMedicalHistory);
router.get("/list", validateMedicalHistoryList, medicalHistoryList);
router.get("/:id", getMedicalHistoryById);
router.delete("/:id", deleteMedicalHistory);

// ===================
// CHIEF COMPLAINTS SECTION
// ===================
// Single operations
router.post(
  "/chief-complaints/add",
  validateChiefComplaintsAdd,
  addChiefComplaint
);
router.put(
  "/chief-complaints/edit",
  validateChiefComplaintsEdit,
  editChiefComplaint
);

// Multiple operations
router.post(
  "/chief-complaints/add-multiple",
  validateChiefComplaintsAddMultiple,
  addChiefComplaints
);
router.put(
  "/chief-complaints/edit-multiple",
  validateChiefComplaintsEditMultiple,
  editChiefComplaints
);

// List
router.get(
  "/chief-complaints/list",
  validateChiefComplaintsList,
  listChiefComplaints
);

// ===================
// CLINICAL DIAGNOSES SECTION
// ===================
// Single operations
router.post(
  "/clinical-diagnoses/add",
  validateClinicalDiagnosesAdd,
  addClinicalDiagnosis
);
router.put(
  "/clinical-diagnoses/edit",
  validateClinicalDiagnosesEdit,
  editClinicalDiagnosis
);

// Multiple operations
router.post(
  "/clinical-diagnoses/add-multiple",
  validateClinicalDiagnosesAddMultiple,
  addClinicalDiagnoses
);
router.put(
  "/clinical-diagnoses/edit-multiple",
  validateClinicalDiagnosesEditMultiple,
  editClinicalDiagnoses
);

// List
router.get(
  "/clinical-diagnoses/list",
  validateClinicalDiagnosesList,
  listClinicalDiagnoses
);

// ===================
// THERAPIES SECTION
// ===================
// Single operations
router.post("/therapies/add", validateTherapiesAdd, addTherapy);
router.put("/therapies/edit", validateTherapiesEdit, editTherapy);

// Multiple operations
router.post(
  "/therapies/add-multiple",
  validateTherapiesAddMultiple,
  addTherapies
);
router.put(
  "/therapies/edit-multiple",
  validateTherapiesEditMultiple,
  editTherapies
);

// List
router.get("/therapies/list", validateTherapiesList, listTherapies);

// ===================
// MEDICINES PRESCRIBED SECTION
// ===================
// Complete medicines prescribed operations
router.post(
  "/medicines-prescribed/add",
  validateMedicinesPrescribedAdd,
  addMedicinesPrescribed
);
router.put(
  "/medicines-prescribed/edit",
  validateMedicinesPrescribedEdit,
  editMedicinesPrescribed
);
router.get(
  "/medicines-prescribed/list",
  validateMedicinesPrescribedList,
  listMedicinesPrescribed
);

// Individual medicine operations
router.post(
  "/medicines-prescribed/add-medicine",
  validateAddMedicine,
  addMedicine
);
router.put(
  "/medicines-prescribed/edit-medicine",
  validateEditMedicine,
  editMedicine
);
router.delete(
  "/medicines-prescribed/:CaseFileId/medicine/:medicineId",
  deleteMedicine
);

// ===================
// DELETE SECTION ITEMS
// ===================
router.delete("/section/:CaseFileId/:sectionName/:itemId", deleteSectionItem);

module.exports = router;
