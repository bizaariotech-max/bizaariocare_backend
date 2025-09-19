const express = require("express");
const router = express.Router();
const hpQuestionController = require("../../controllers/HealthProfilling/hpQuestionMaster.Controller");

// Test Route
router.get("/test", hpQuestionController.test);

// HP Question CRUD Operations
router.post("/AddEditHpQuestion", hpQuestionController.AddEditHpQuestion);
router.post("/GetHpQuestion", hpQuestionController.GetHpQuestion);
router.get("/GetHpQuestion/:HPQuestionId", hpQuestionController.GetHpQuestionById);
router.post("/DeleteHpQuestion", hpQuestionController.DeleteHpQuestion);
router.post("/SoftDeleteHpQuestion", hpQuestionController.SoftDeleteHpQuestion);

// Additional Routes
router.get("/GetHpQuestionsByCategory/:HPQuestionCategory", hpQuestionController.GetHpQuestionsByCategory);
router.post("/UpdateQuestionOrder", hpQuestionController.UpdateQuestionOrder);

module.exports = router;