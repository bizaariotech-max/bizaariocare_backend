const mongoose = require("mongoose");
const TlbLookup = require("../../modals/Common/lookupmodel");
const { __requestResponse } = require("../../utils/constant");
const {
  __NO_LOOKUP_LIST,
  __SUCCESS,
  __SOME_ERROR,
} = require("../../utils/variable");
// const { __CreateAuditLog } = require("../../../utils/auditlog");

// Test Controller
exports.test = async (req, res) => {
  return res.send("Hello World");
};

//  Distinct Lookup Types
exports.getLookupTypeList = async (req, res) => {
  try {
    const list = await TlbLookup.distinct("lookup_type");
    if (!list || list.length === 0) {
      return res.json(__requestResponse("404", __NO_LOOKUP_LIST));
    }
    return res.json(__requestResponse("200", __SUCCESS, list));
  } catch (error) {
    console.error(error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

// Distinct Parent Lookup Types
exports.getParentLookupTypeList = async (req, res) => {
  try {
    const list = await TlbLookup.distinct("parent_lookup_type");
    if (!list || list.length === 0) {
      return res.json(__requestResponse("404", __NO_LOOKUP_LIST));
    }
    return res.json(__requestResponse("200", __SUCCESS, list));
  } catch (error) {
    console.error(error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

//  Lookup List by CodeList
exports.lookupList = async (req, res) => {
  try {
    let _filters = req.body.CodeList?.map((e) => e?.toLowerCase()) || [];
    if (_filters.length === 0) {
      return res.json(__requestResponse("501", __NO_LOOKUP_LIST));
    }

    // const _list = await TlbLookup.find({
    //   lookup_type: { $in: _filters },
    //   is_active: true,
    // });

    const list = await TlbLookup.find({
      lookup_type: { $in: _filters || [] },
      ...(mongoose.Types.ObjectId.isValid(req.body?.parent_lookup_id) && {
        parent_lookup_id: mongoose.Types.ObjectId(req.body?.parent_lookup_id),
      }),
      is_active: true,
    })
      .populate("parent_lookup_id", "lookup_value")
      .lean();

    if (list.length == 0) {
      return res.json(__requestResponse("404", "No Data found"));
    }

    const transformedList = list.map((item) => ({
      ...item,
      parent_lookup_name: item?.parent_lookup_id?.lookup_value || "",
      parent_lookup_id: item?.parent_lookup_id?._id || "",
    }));

    // return res.json(__requestResponse("200", __SUCCESS, transformedList));

    if (transformedList.length > 0) {
      return res.json(__requestResponse("200", __SUCCESS, transformedList));
    } else {
      return res.json(__requestResponse("501", __NO_LOOKUP_LIST));
    }
  } catch (error) {
    console.error("Fatal Error in lookuplist:", error);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

//  Save or Update Lookup
exports.saveLookup = async (req, res) => {
  try {
    const {
      lookup_id,
      lookup_type,
      lookup_value,
      parent_lookup_id,
      parent_lookup_type,
      sort_order,
      is_active,
      managed_by_ui,
      other,// new field for any other data
    } = req.body;

    const client_id = req.client_id;

    if (!lookup_id) {
      // Insert new lookup
      const _lookupData = {
        client_id: mongoose.Types.ObjectId(client_id),
        lookup_type,
        lookup_value,
        parent_lookup_id: parent_lookup_id
          ? mongoose.Types.ObjectId(parent_lookup_id)
          : null,
        parent_lookup_type,
        sort_order,
        is_active,
        managed_by_ui,
        other,
      };

      const newLookup = await TlbLookup.create(_lookupData);

      // __CreateAuditLog(
      //   "admin_lookup",
      //   "Lookup.Add",
      //   null,
      //   null,
      //   _lookupData,
      //   newLookup._id,
      //   client_id,
      //   null
      // );

      return res.json(__requestResponse("200", __SUCCESS, newLookup));
    } else {
      // Update existing lookup
      const oldRecord = await TlbLookup.findOne({ _id: lookup_id });

      const _lookupData = {
        client_id: mongoose.Types.ObjectId(client_id),
        lookup_type,
        lookup_value,
        parent_lookup_id: parent_lookup_id
          ? mongoose.Types.ObjectId(parent_lookup_id)
          : null,
        parent_lookup_type,
        sort_order,
        is_active,
        managed_by_ui,
        other,
      };

      const updatedLookup = await TlbLookup.findByIdAndUpdate(
        lookup_id,
        { $set: _lookupData },
        { new: true }
      );

      // __CreateAuditLog(
      //   "admin_lookup",
      //   "Lookup.Edit",
      //   null,
      //   oldRecord || null,
      //   _lookupData,
      //   lookup_id,
      //   client_id,
      //   null
      // );

      return res.json(__requestResponse("200", __SUCCESS, updatedLookup));
    }
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

//  Lookup Display List (Aggregation)
exports.lookupDisplayList = async (req, res) => {
  try {
    const { lookupType, clientTypeID } = req.body;

    const _list = await TlbLookup.aggregate([
      { $match: { lookup_type: lookupType, is_active: true } },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "parent_lookup_id",
          foreignField: "_id",
          as: "ParentLookup",
        },
      },
      { $unwind: { path: "$ParentLookup", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "asset_masters",
          localField: "client_id",
          foreignField: "_id",
          as: "Clients",
        },
      },
      { $unwind: { path: "$Clients", preserveNullAndEmptyArrays: true } },
      ...(clientTypeID
        ? [
            {
              $match: {
                "Clients._id": mongoose.Types.ObjectId(clientTypeID),
              },
            },
          ]
        : []),
      {
        $project: {
          _id: 1,
          lookup_type: 1,
          lookup_value: 1,
          parent_lookup_type: 1,
          parent_lookup_id: 1,
          sort_order: 1,
          is_active: 1,
          ParentLookup: "$ParentLookup.lookup_value",
          ClientName: "$Clients.AssetName",
          CreatedAt: {
            $dateToString: {
              format: "%d-%b-%G %H:%M:%S",
              date: "$createdAt",
              timezone: "+05:30",
            },
          },
          UpdatedAt: {
            $dateToString: {
              format: "%d-%b-%G %H:%M:%S",
              date: "$updatedAt",
              timezone: "+05:30",
            },
          },
        },
      },
    ]);

    return res.json(__requestResponse("200", __SUCCESS, _list));
  } catch (error) {
    console.error("[API Error]:", error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
};
