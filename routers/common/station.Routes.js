const express = require("express");
const router = express.Router();

const {
  test,
  saveStation,
  stationList,
  getStationById,
  deleteStation,
} = require("../../controllers/common/station.Controller");

const { validateSaveStation } = require("../../middlewares/station.middleware");

// Test Route
router.get("/test", test);

// Save Station (Add/Edit)
router.post("/SaveStation", validateSaveStation, saveStation);

//  Station List
router.post("/StationList", stationList);

// Get Station By ID
router.get("/GetStation/:id", getStationById);

// Delete Station
router.delete("/DeleteStation/:id", deleteStation);

module.exports = router;
