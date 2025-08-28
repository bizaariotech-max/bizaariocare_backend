const Asset = require("../../modals/AssetMaster/AssetMaster");
const { __requestResponse } = require("../../utils/constant");
const {
  __SUCCESS,
  __SOME_ERROR,
  __NO_LOOKUP_LIST,
} = require("../../utils/variable");
const { __deepClone } = require("../../utils/constant");
// const { __CreateAuditLog } = require("../../utils/auditlog");

//  Test Controller
exports.test = async (req, res) => {
  return res.send("Asset API Working 🚀");
};

//  Save (Add / Edit) Asset
exports.saveAsset = async (req, res) => {
  try {
    const { _id } = req.body;
    // id= !_id || null || ""
    let asset;
    if (_id) {
      // Update existing
      asset = await Asset.findByIdAndUpdate(_id, req.body, {
        new: true,
      });
      // await __CreateAuditLog(req, "Asset Updated", asset._id);
    } else {
      // New entry
      asset = new Asset(req.body);
      await asset.save();
      // await __CreateAuditLog(req, "Asset Created", asset._id);
    }

    return res.json(__requestResponse("200", __SUCCESS, asset));
  } catch (error) {
    console.error("Save Asset Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

//  Asset List (with pagination + population)
exports.assetList = async (req, res) => {
  try {
    // Handle both req.body and req.query to support GET and POST requests
    const requestData = req.body || req.query || {};
    const { page = 1, limit = 10, search = "" } = requestData;

    const query = {};
    if (search) {
      query.AssetName = { $regex: search, $options: "i" };
    }

    const total = await Asset.countDocuments(query);
    const list = await Asset.find(query)
      .populate("StationId", "StationName")
      .populate("ParentAssetId", "AssetName")
      .populate("SubscriptionType", "lookup_value")
      .populate("AssetCategoryLevel1", "lookup_value")
      .populate("AssetCategoryLevel2", "lookup_value")
      .populate("AssetCategoryLevel3", "lookup_value")
      .populate("MedicalSpecialties", "lookup_value")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: Number(page),
        limit: Number(limit),
        list: __deepClone(list),
      })
    );
  } catch (error) {
    console.error("Asset List Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

//  Get Asset By ID
exports.getAssetById = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await Asset.findById(id)
      .populate("StationId", "StationName")
      .populate("ParentAssetId", "AssetName")
      .populate("SubscriptionType", "lookup_value")
      .populate("AssetCategoryLevel1", "lookup_value")
      .populate("AssetCategoryLevel2", "lookup_value")
      .populate("AssetCategoryLevel3", "lookup_value")
      .populate("MedicalSpecialties", "lookup_value")
      .populate("AssetMapping", "AssetName")
      .populate("TreatmentPackages.PackageCurrency", "lookup_value")
      .populate("FeesAndCharges.ServiceCategory", "lookup_value")
      .populate("FeesAndCharges.FeeCurrency", "lookup_value");

    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, asset));
  } catch (error) {
    console.error("Get Asset Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

//  Delete Asset
exports.deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await Asset.findByIdAndDelete(id);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    return res.json(__requestResponse("200", "Asset deleted successfully"));
  } catch (error) {
    console.error("Delete Asset Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};