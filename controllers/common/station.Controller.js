const Station = require("../../modals/Common/StationMaster");
const { __requestResponse } = require("../../utils/constant");
const {
  __SUCCESS,
  __SOME_ERROR,
  __NO_LOOKUP_LIST,
} = require("../../utils/variable");
const { __deepClone } = require("../../utils/constant");
const { default: mongoose } = require("mongoose");
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
exports.stationListxold = async (req, res) => {
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
      .sort({ createdAt: -1 })
      .lean();//Use lean() for read-only operations

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

//  Station List (with pagination + population)
exports.stationListxx = async (req, res) => {
  try {
    // Handle both req.body and req.query to support GET and POST requests
    const requestData = req.body || req.query || {};
    const {
      page = 1,
      limit = 10,
      search = "",
      CountryGroupId,
      OrgUnitLevel,
      ParentStationId,
    } = requestData;

    const query = {};

    // Search filter
    if (search) {
      query.StationName = { $regex: search, $options: "i" };
    }

    // CountryGroupId filter
    if (CountryGroupId) {
      query.CountryGroupId = CountryGroupId;
    }

    // OrgUnitLevel filter
    if (OrgUnitLevel) {
      query.OrgUnitLevel = OrgUnitLevel;
    }

    // ParentStationId filter
    if (ParentStationId) {
      query.ParentStationId = ParentStationId;
    }

    const total = await Station.countDocuments(query);
    const list = await Station.find(query)
      // .populate("ParentStationId", "StationName")
      .populate("OrgUnitLevel", "lookup_value")
      .populate("CountryGroupId", "lookup_value")
      .populate("Currency", "lookup_value")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(); //Use lean() for read-only operations

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: Number(page),
        limit: Number(limit),
        filters: {
          search,
          CountryGroupId,
          OrgUnitLevel,
          ParentStationId,
        },
        list: __deepClone(list),
      })
    );
  } catch (error) {
    console.error("Station List Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

//  Station List (with pagination + population)
exports.stationListxxx = async (req, res) => {
  try {
    // Handle both req.body and req.query to support GET and POST requests
    const requestData = req.body || req.query || {};
    const {
      page = 1,
      limit = 10,
      search = "",
      CountryGroupId,
      OrgUnitLevel,
      ParentStationId,
    } = requestData;

    const query = {};

    // Search filter
    if (search && search.trim() !== "") {
      query.StationName = { $regex: search.trim(), $options: "i" };
    }

    // CountryGroupId filter - validate before using
    if (CountryGroupId && CountryGroupId !== "" && CountryGroupId !== null && mongoose.Types.ObjectId.isValid(CountryGroupId)) {
      query.CountryGroupId = CountryGroupId;
    }

    // OrgUnitLevel filter - validate before using
    if (OrgUnitLevel && OrgUnitLevel !== "" && OrgUnitLevel !== null && mongoose.Types.ObjectId.isValid(OrgUnitLevel)) {
      query.OrgUnitLevel = OrgUnitLevel;
    }

    // ParentStationId filter - validate before using
    // if (ParentStationId && ParentStationId !== "" && ParentStationId !== null && mongoose.Types.ObjectId.isValid(ParentStationId)) {
    //   query.ParentStationId = ParentStationId;
    // }

    const total = await Station.countDocuments(query);
    const list = await Station.find(query)
      .populate([
        // {
        //   path: "ParentStationId",
        //   select: "StationName _id",
        //   match: { _id: { $ne: null, $ne: "" } },
        // },
        {
          path: "OrgUnitLevel",
          model: "admin_lookups",
          select: "lookup_value _id",
          match: { _id: { $ne: null, $ne: "" } },
        },
        {
          path: "CountryGroupId",
          model: "admin_lookups",
          select: "lookup_value _id",
          match: { _id: { $ne: null, $ne: "" } },
        },
        {
          path: "Currency",
          model: "admin_lookups",
          select: "lookup_value _id",
          match: { _id: { $ne: null, $ne: "" } },
        },
        {
          path: "ISDCode",
          model: "admin_lookups",
          select: "lookup_value _id",
          match: { _id: { $ne: null, $ne: "" } },
        },
      ])
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(); //Use lean() for read-only operations

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: Number(page),
        limit: Number(limit),
        filters: {
          search,
          CountryGroupId,
          OrgUnitLevel,
          ParentStationId,
        },
        list: __deepClone(list),
      })
    );
  } catch (error) {
    console.error("Station List Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Station List (with aggregation pipeline)
exports.stationList = async (req, res) => {
  try {
    const requestData = req.body || req.query || {};
    const {
      page = 1,
      limit = 10,
      search = "",
      CountryGroupId,
      OrgUnitLevel,
      ParentStationId,
    } = requestData;

    const query = {};

    // Search filter
    if (search && search.trim() !== "") {
      query.StationName = { $regex: search.trim(), $options: "i" };
    }

    // CountryGroupId filter - handle array
    if (CountryGroupId && CountryGroupId !== "" && CountryGroupId !== null) {
      if (mongoose.Types.ObjectId.isValid(CountryGroupId)) {
        query.CountryGroupId = { $in: [mongoose.Types.ObjectId(CountryGroupId)] };
      }
    }

    // OrgUnitLevel filter
    if (OrgUnitLevel && OrgUnitLevel !== "" && OrgUnitLevel !== null && mongoose.Types.ObjectId.isValid(OrgUnitLevel)) {
      query.OrgUnitLevel = OrgUnitLevel;
    }

    // ParentStationId filter
    if (ParentStationId && ParentStationId !== "" && ParentStationId !== null && mongoose.Types.ObjectId.isValid(ParentStationId)) {
      query.ParentStationId = ParentStationId;
    }

    const total = await Station.countDocuments(query);
    
    // Build aggregation query
    const aggregationQuery = {};
    
    if (query.StationName) {
      aggregationQuery.StationName = query.StationName;
    }
    
    if (query.CountryGroupId) {
      aggregationQuery.CountryGroupId = query.CountryGroupId;
    }
    
    if (query.OrgUnitLevel) {
      aggregationQuery.OrgUnitLevel = mongoose.Types.ObjectId(query.OrgUnitLevel);
    }
    
    if (query.ParentStationId) {
      aggregationQuery.ParentStationId = mongoose.Types.ObjectId(query.ParentStationId);
    }
    
    // Use aggregation pipeline
    const list = await Station.aggregate([
      { $match: aggregationQuery },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $lookup: {
          from: "station_masters",
          let: { parentId: "$ParentStationId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$parentId", ""] },
                    { $ne: ["$$parentId", null] },
                    { $eq: ["$_id", "$$parentId"] }
                  ]
                }
              }
            }
          ],
          as: "ParentStationId"
        }
      },
      {
        $lookup: {
          from: "admin_lookups",
          let: { orgId: "$OrgUnitLevel" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$orgId", ""] },
                    { $ne: ["$$orgId", null] },
                    { $eq: ["$_id", "$$orgId"] }
                  ]
                }
              }
            }
          ],
          as: "OrgUnitLevel"
        }
      },
      {
        $lookup: {
          from: "admin_lookups",
          let: { countryIds: "$CountryGroupId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$countryIds", ""] },
                    { $ne: ["$$countryIds", null] },
                    { $in: ["$_id", { $cond: [{ $isArray: "$$countryIds" }, "$$countryIds", []] }] }
                  ]
                }
              }
            }
          ],
          as: "CountryGroupId"
        }
      },
      {
        $lookup: {
          from: "admin_lookups",
          let: { currencyId: "$Currency" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$currencyId", ""] },
                    { $ne: ["$$currencyId", null] },
                    { $eq: ["$_id", "$$currencyId"] }
                  ]
                }
              }
            }
          ],
          as: "Currency"
        }
      },
      {
        $lookup: {
          from: "admin_lookups",
          let: { isdId: "$ISDCode" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$isdId", ""] },
                    { $ne: ["$$isdId", null] },
                    { $eq: ["$_id", "$$isdId"] }
                  ]
                }
              }
            }
          ],
          as: "ISDCode"
        }
      },
      {
        $addFields: {
          ParentStationId: { $arrayElemAt: ["$ParentStationId", 0] },
          OrgUnitLevel: { $arrayElemAt: ["$OrgUnitLevel", 0] },
          CountryGroupId: "$CountryGroupId", // Keep as array
          Currency: { $arrayElemAt: ["$Currency", 0] },
          ISDCode: { $arrayElemAt: ["$ISDCode", 0] }
        }
      },
      {
        $project: {
          _id: 1,
          StationName: 1,
          CensusYear: 1,
          PopulationMale: 1,
          PopulationFemale: 1,
          TotalPopulation: 1,
          LiteracyRate: 1,
          AreaSQKM: 1,
          IsActive: 1,
          StationAdmins: 1,
          createdAt: 1,
          updatedAt: 1,
          __v: 1,
          "ParentStationId._id": 1,
          "ParentStationId.StationName": 1,
          "OrgUnitLevel._id": 1,
          "OrgUnitLevel.lookup_value": 1,
          "CountryGroupId._id": 1,
          "CountryGroupId.lookup_value": 1,
          "Currency._id": 1,
          "Currency.lookup_value": 1,
          "ISDCode._id": 1,
          "ISDCode.lookup_value": 1
        }
      }
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: Number(page),
        limit: Number(limit),
        filters: {
          search,
          CountryGroupId,
          OrgUnitLevel,
          ParentStationId,
        },
        list: __deepClone(list),
      })
    );
  } catch (error) {
    console.error("Station List Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

//  Station List (with pagination + population)
exports.stationList_new = async (req, res) => {
  try {
    // Handle both req.body and req.query to support GET and POST requests
    const requestData = req.body || req.query || {};
    const {
      page = 1,
      limit = 10,
      search = "",
      CountryGroupId,
      OrgUnitLevel,
      ParentStationId,
    } = requestData;

    const query = {};

    // Search filter
    if (search) {
      query.StationName = { $regex: search, $options: "i" };
    }

    // CountryGroupId filter
    if (CountryGroupId) {
      query.CountryGroupId = CountryGroupId;
    }

    // OrgUnitLevel filter
    if (OrgUnitLevel) {
      query.OrgUnitLevel = OrgUnitLevel;
    }

    // ParentStationId filter
    if (ParentStationId) {
      query.ParentStationId = ParentStationId;
    }

    const total = await Station.countDocuments(query);
    
    // Get stations without population first
    let list = await Station.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for read-only operations

    // Manual population to avoid ObjectId casting errors
    const AdminLookup = require("../../modals/Common/lookupmodel");

    // Collect all unique ObjectIds for batch lookup
    const orgUnitLevelIds = [];
    const countryGroupIds = [];
    const currencyIds = [];
    const parentStationIds = [];

    list.forEach(station => {
      if (station.OrgUnitLevel && station.OrgUnitLevel !== "" && mongoose.Types.ObjectId.isValid(station.OrgUnitLevel)) {
        orgUnitLevelIds.push(station.OrgUnitLevel);
      }
      if (station.CountryGroupId && station.CountryGroupId !== "" && mongoose.Types.ObjectId.isValid(station.CountryGroupId)) {
        countryGroupIds.push(station.CountryGroupId);
      }
      if (station.Currency && station.Currency !== "" && mongoose.Types.ObjectId.isValid(station.Currency)) {
        currencyIds.push(station.Currency);
      }
      if (station.ParentStationId && station.ParentStationId !== "" && mongoose.Types.ObjectId.isValid(station.ParentStationId)) {
        parentStationIds.push(station.ParentStationId);
      }
    });

    // Batch lookup for admin_lookups
    const [orgUnitLevels, countryGroups, currencies, parentStations] = await Promise.all([
      orgUnitLevelIds.length > 0 ? AdminLookup.find({ _id: { $in: orgUnitLevelIds } }, 'lookup_value').lean() : [],
      countryGroupIds.length > 0 ? AdminLookup.find({ _id: { $in: countryGroupIds } }, 'lookup_value').lean() : [],
      currencyIds.length > 0 ? AdminLookup.find({ _id: { $in: currencyIds } }, 'lookup_value').lean() : [],
      parentStationIds.length > 0 ? Station.find({ _id: { $in: parentStationIds } }, 'StationName').lean() : []
    ]);

    // Create lookup maps for efficient population
    const orgUnitLevelMap = new Map(orgUnitLevels.map(item => [item._id.toString(), item]));
    const countryGroupMap = new Map(countryGroups.map(item => [item._id.toString(), item]));
    const currencyMap = new Map(currencies.map(item => [item._id.toString(), item]));
    const parentStationMap = new Map(parentStations.map(item => [item._id.toString(), item]));

    // Populate the list manually
    list = list.map(station => {
      const populatedStation = { ...station };

      // Populate OrgUnitLevel
      if (station.OrgUnitLevel && orgUnitLevelMap.has(station.OrgUnitLevel.toString())) {
        populatedStation.OrgUnitLevel = orgUnitLevelMap.get(station.OrgUnitLevel.toString());
      }

      // Populate CountryGroupId
      if (station.CountryGroupId && countryGroupMap.has(station.CountryGroupId.toString())) {
        populatedStation.CountryGroupId = countryGroupMap.get(station.CountryGroupId.toString());
      }

      // Populate Currency
      if (station.Currency && currencyMap.has(station.Currency.toString())) {
        populatedStation.Currency = currencyMap.get(station.Currency.toString());
      }

      // Populate ParentStationId
      if (station.ParentStationId && parentStationMap.has(station.ParentStationId.toString())) {
        populatedStation.ParentStationId = parentStationMap.get(station.ParentStationId.toString());
      }

      return populatedStation;
    });

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: Number(page),
        limit: Number(limit),
        filters: {
          search,
          CountryGroupId,
          OrgUnitLevel,
          ParentStationId,
        },
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
      .populate("OrgUnitLevel", "lookup_value")
      .populate("CountryGroupId", "lookup_value")
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
