const express = require("express");
const router = express.Router();

const {
  test,
  saveAsset,
  assetList,
  getAssetById,
  deleteAsset,
} = require("../../controllers/Asset/asset.Controller");

const { validateSaveAsset } = require("../../middlewares/asset.middleware");

// Test Route
router.get("/test", test);

// Save Asset (Add/Edit)
router.post("/SaveAsset_Identifier", validateSaveAsset, saveAsset);

//  Asset List
router.post("/AssetList", assetList);
router.get("/AssetList", assetList); // Support both POST and GET

// Get Asset By ID
router.get("/GetAsset/:id", getAssetById);

// Delete Asset
router.delete("/DeleteAsset/:id", deleteAsset);

module.exports = router;