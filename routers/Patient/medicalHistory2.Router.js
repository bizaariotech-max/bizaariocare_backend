const express = require("express");
const router = express.Router();
const {
  saveMedicalHistory,
  medicalHistoryList,
  getMedicalHistoryById,
  deleteMedicalHistory,
  // updateDoctorHospitalInfo,
  updateChiefComplaints,
  updateClinicalDiagnoses,
  updateMedicinesPrescribed,
  updateTherapies,
  updateSurgeriesProcedures,
  deleteChiefComplaint,
} = require("../../controllers/Patient/medicalHistory2.Controller");

const {
  validateMedicalHistory,
  validateDoctorHospitalInfo,
  validateChiefComplaints,
  validateClinicalDiagnoses,
  validateMedicinesPrescribed,
  validateTherapies,
  validateSurgeriesProcedures,
} = require("../../middlewares/medicalHistory2.middleware");

// Base CRUD routes
router.post("/save", validateMedicalHistory, saveMedicalHistory);
router.get("/list", medicalHistoryList);
router.get("/:id", getMedicalHistoryById);
router.delete("/:id", deleteMedicalHistory);

// // Section update routes
// router.put(
//   "/doctor-hospital-info",
//   validateDoctorHospitalInfo,
//   updateDoctorHospitalInfo
// );

router.put(
  "/chief-complaints",
  validateChiefComplaints,
  updateChiefComplaints
);

router.put(
  "/clinical-diagnoses",
  validateClinicalDiagnoses,
  updateClinicalDiagnoses
);

router.put(
  "/medicines-prescribed",
  validateMedicinesPrescribed,
  updateMedicinesPrescribed
);

router.put("/therapies", validateTherapies, updateTherapies);

router.put(
  "/surgeries-procedures",
  validateSurgeriesProcedures,
  updateSurgeriesProcedures
);

// Delete section items
router.delete(
  "/chief-complaints/:CaseFileId/:complaintId",
  deleteChiefComplaint
);

module.exports = router;
