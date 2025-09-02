const express = require("express");
const router = express.Router();
const {
  test,
  saveContentMaster,
  contentMasterList,
  getContentMaster,
  deleteContentMaster
} = require("../../controllers/common/contentMaster.Controller");
const {
  validateContentMaster,
  validateContentMasterList
} = require("../../middlewares/contentMaster.middleware");

// Test Route
router.get("/test", test);

// Save ContentMaster (Add/Edit)
router.post("/SaveContent", validateContentMaster, saveContentMaster);

// Get ContentMaster List with Pagination
router.post("/ContentList", validateContentMasterList, contentMasterList);

// Get ContentMaster by ID
router.get("/GetContent/:id", getContentMaster);

// Delete ContentMaster
router.delete("/DeleteContent/:id", deleteContentMaster);

module.exports = router;