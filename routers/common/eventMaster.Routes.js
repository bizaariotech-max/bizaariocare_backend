const express = require("express");
const router = express.Router();
const {
  test,
  saveEventMaster,
  eventMasterList,
  getEventMaster,
  deleteEventMaster
} = require("../../controllers/common/eventMaster.Controller");
const {
  validateEventMaster,
  validateEventMasterList
} = require("../../middlewares/eventMaster.middleware");

// Test Route
router.get("/test", test);

// Save EventMaster (Add/Edit)
router.post("/SaveEvent", validateEventMaster, saveEventMaster);

// Get EventMaster List with Pagination
router.post("/EventList", validateEventMasterList, eventMasterList);

// Get EventMaster by ID
router.get("/GetEvent/:id", getEventMaster);

// Delete EventMaster
router.delete("/DeleteEvent/:id", deleteEventMaster);

module.exports = router;