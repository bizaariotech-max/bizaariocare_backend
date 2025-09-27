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
  listChiefComplaints,

  // Clinical Diagnoses
  addClinicalDiagnosis,
  editClinicalDiagnosis,
  listClinicalDiagnoses,

  // Medicines Prescribed
  addMedicinesPrescribed,
  editMedicinesPrescribed,
  listMedicinesPrescribed,
  addMedicine,
  editMedicine,
  deleteMedicine,

  // Therapies
  addTherapy,
  editTherapy,
  listTherapies,
} = require("../../controllers/Patient/medicalHistory2.Controller");

const {
  // Main medical history validators
  validateMedicalHistory,
  validateMedicalHistoryList,

  // Chief Complaints validators
  validateChiefComplaintsAdd,
  validateChiefComplaintsEdit,
  validateChiefComplaintsList,

  // Clinical Diagnoses validators
  validateClinicalDiagnosesAdd,
  validateClinicalDiagnosesEdit,
  validateClinicalDiagnosesList,

  // Medicines Prescribed validators
  validateMedicinesPrescribedAdd,
  validateMedicinesPrescribedEdit,
  validateMedicinesPrescribedList,
  validateAddMedicine,
  validateEditMedicine,

  // Therapies validators
  validateTherapiesAdd,
  validateTherapiesEdit,
  validateTherapiesList,
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
router.get(
  "/chief-complaints/list",
  validateChiefComplaintsList,
  listChiefComplaints
);

// ===================
// CLINICAL DIAGNOSES SECTION
// ===================
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
router.get(
  "/clinical-diagnoses/list",
  validateClinicalDiagnosesList,
  listClinicalDiagnoses
);

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
// THERAPIES SECTION
// ===================
router.post("/therapies/add", validateTherapiesAdd, addTherapy);
router.put("/therapies/edit", validateTherapiesEdit, editTherapy);
router.get("/therapies/list", validateTherapiesList, listTherapies);

// ===================
// DELETE SECTION ITEMS
// ===================
router.delete("/section/:CaseFileId/:sectionName/:itemId", deleteSectionItem);

module.exports = router;
