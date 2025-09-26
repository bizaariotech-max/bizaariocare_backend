const express = require("express");
const router = express.Router();
const { validatePatientCaseFile } = require("../../middlewares/patientCaseFile.middleware");
const {
  savePatientCaseFile,
  patientCaseFileList,
  getPatientCaseFileById,
  deletePatientCaseFile
} = require("../../controllers/Patient/patientCaseFile.Controller");

// Routes
router.post("/savePatientCaseFile", validatePatientCaseFile, savePatientCaseFile);
router.get("/listPatientCaseFile", patientCaseFileList);
router.get("/GetPatientCaseFile/:id", getPatientCaseFileById);
router.delete("/DeletePatientCaseFile/:id", deletePatientCaseFile);

module.exports = router;
