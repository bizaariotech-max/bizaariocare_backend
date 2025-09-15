const express = require("express");
const router = express.Router();
const {
  test,
  SaveInvestigation,
  investigationList,
  getInvestigationById,
  deleteInvestigation,
} = require("../../controllers/common/investigationMaster.Controller");
const { validateSaveInvestigation } = require("../../middlewares/investigationMaster.middleware");

// Test Route
router.get("/test", test);

// Save Investigation (Add/Edit)
router.post("/SaveInvestigation", validateSaveInvestigation, SaveInvestigation);

// Investigation List (supports both GET and POST)
router.post("/investigationList", investigationList);
router.get("/investigationList", investigationList);

// Get Investigation by ID
router.get("/getInvestigation/:id", getInvestigationById);

// Delete Investigation
router.delete("/deleteInvestigation/:id", deleteInvestigation);

module.exports = router;