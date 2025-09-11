const Station = require("../../modals/Common/StationMaster");
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
  return res.send("Station API Working 🚀");
};

//  Save (Add / Edit) Station
exports.saveStation = async (req, res) => {
  try {
    const { _id } = req.body;
    // id= !_id || null || ""
    let station;
    if (_id) {
      // Update existing
      station = await Station.findByIdAndUpdate(_id, req.body, {
        new: true,
      });
      // await __CreateAuditLog(req, "Station Updated", station._id);
    } else {
      // New entry
      station = new Station(req.body);
      await station.save();
      // await __CreateAuditLog(req, "Station Created", station._id);
    }

    return res.json(__requestResponse("200", __SUCCESS, station));
  } catch (error) {
    console.error("Save Station Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

//  Station List (with pagination + population)
exports.stationList = async (req, res) => {
  try {
    // Handle both req.body and req.query to support GET and POST requests
    const requestData = req.body || req.query || {};
    const { page = 1, limit = 10, search = "" } = requestData;

    const query = {};
    if (search) {
      query.StationName = { $regex: search, $options: "i" };
    }

    const total = await Station.countDocuments(query);
    const list = await Station.find(query)
      .populate("ParentStationId", "StationName")
      .populate("OrgUnitLevel", "lookup_value")
      .populate("CountryGroupId", "lookup_value")
      .populate("Currency", "lookup_value")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
      // .lean();//Use lean() for read-only operations

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: Number(page),
        limit: Number(limit),
        list: __deepClone(list),
      })
    );
  } catch (error) {
    console.error("Station List Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

//  Get Station By ID
exports.getStationById = async (req, res) => {
  try {
    const { id } = req.params;

    const station = await Station.findById(id)
      .populate("ParentStationId", "StationName")
      .populate("OrgUnitLevel", "org_unit_type")
      .populate("CountryGroupId", "country_group_type")
      .populate("Currency", "lookup_value");

    if (!station) {
      return res.json(__requestResponse("404", "Station not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, station));
  } catch (error) {
    console.error("Get Station Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

//  Delete Station
exports.deleteStation = async (req, res) => {
  try {
    const { id } = req.params;

    const station = await Station.findByIdAndDelete(id);
    if (!station) {
      return res.json(__requestResponse("404", "Station not found"));
    }

    return res.json(__requestResponse("200", "Station deleted successfully"));
  } catch (error) {
    console.error("Delete Station Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};
