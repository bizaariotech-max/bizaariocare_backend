const InvestigationMaster = require("../../modals/Common/InvestigationMaster");
const { __requestResponse } = require("../../utils/constant");
const {
  __SUCCESS,
  __SOME_ERROR,
} = require("../../utils/variable");
const { __deepClone } = require("../../utils/constant");
const { __CreateAuditLog } = require("../../utils/auditlog");

// Test Route
exports.test = async (req, res) => {
  return res.json(__requestResponse("200", "Investigation Master API Working"));
};

// Save Investigation (Add/Edit in single API)
exports.SaveInvestigation = async (req, res) => {
  try {
    const { _id } = req.body;
    let investigation;
    let oldValue = null;
    
    // Remove _id from investigationData to avoid MongoDB issues
    const investigationData = { ...req.body };
    delete investigationData._id;
    
    // Check if _id exists and is not null/empty - if true, update; otherwise, create new
    if (_id && _id !== null && _id !== "") {
      // Get old value for audit log
      oldValue = await InvestigationMaster.findById(_id).lean();
      
      if (!oldValue) {
        return res.json(__requestResponse("404", "Investigation not found"));
      }
      
      // Update existing investigation
      investigation = await InvestigationMaster.findByIdAndUpdate(
        _id, 
        investigationData, 
        {
          new: true,
          runValidators: true
        }
      )
      .populate("Investigation_CategoryId", "lookup_value")
      .populate("Abnormalities", "lookup_value");
      
      // Create audit log for update
      await __CreateAuditLog(
        "investigation_master", // Collection name
        "UPDATE", // Audit type
        // "INVESTIGATION_UPDATED", // Audit sub type
        null,
        oldValue, // Old value
        investigation.toObject(), // New value
        investigation._id, // Reference ID
        // req.body.ClientId || null, // Client ID
        // req.body.LoginLogID || null // Login Log ID
      );
    } else {
      // Create new investigation (when _id is null, undefined, or empty string)
      investigation = await InvestigationMaster.create(investigationData);
      
      investigation = await InvestigationMaster.findById(investigation._id)
        .populate("Investigation_CategoryId", "lookup_value")
        .populate("Abnormalities", "lookup_value");
      
      // Create audit log for creation
      await __CreateAuditLog(
        "investigation_master", // Collection name
        "CREATE", // Audit type
        // "INVESTIGATION_CREATED", // Audit sub type
        null,
        null, // Old value (null for new records)
        investigation.toObject(), // New value
        investigation._id, // Reference ID
        // req.body.ClientId || null, // Client ID
        // req.body.LoginLogID || null // Login Log ID
      );
    }

    return res.json(__requestResponse("200", __SUCCESS, investigation));
  } catch (error) {
    console.error("Save Investigation Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Investigation List (with pagination + population + filters)
exports.investigationList = async (req, res) => {
  try {
    // Handle both req.body and req.query to support GET and POST requests
    const requestData = req.body || req.query || {};
    const {
      page = 1,
      limit = 10,
      search = "",
      Investigation_CategoryId,
      ResponseUnit,
      Validity_Min_Value,
      Validity_Max_Value,
      Normal_Value_Minimum,
      Normal_Value_Maximum,
    } = requestData;

    const query = {};

    // Search filter (Investigation Name)
    if (search) {
      query.InvestigationName = { $regex: search, $options: "i" };
    }

    // Investigation Category filter
    if (Investigation_CategoryId) {
      query.Investigation_CategoryId = Investigation_CategoryId;
    }

    // Response Unit filter
    if (ResponseUnit) {
      query.ResponseUnit = { $regex: ResponseUnit, $options: "i" };
    }

    // Validity Min Value filter
    if (Validity_Min_Value) {
      query.Validity_Min_Value = { $gte: Number(Validity_Min_Value) };
    }

    // Validity Max Value filter
    if (Validity_Max_Value) {
      query.Validity_Max_Value = { $lte: Number(Validity_Max_Value) };
    }

    // Normal Value Minimum filter
    if (Normal_Value_Minimum) {
      query.Normal_Value_Minimum = { $gte: Number(Normal_Value_Minimum) };
    }

    // Normal Value Maximum filter
    if (Normal_Value_Maximum) {
      query.Normal_Value_Maximum = { $lte: Number(Normal_Value_Maximum) };
    }

    const total = await InvestigationMaster.countDocuments(query);
    const list = await InvestigationMaster.find(query)
      .populate("Investigation_CategoryId", "lookup_value")
      .populate("Abnormalities", "lookup_value")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for read-only operations

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: Number(page),
        limit: Number(limit),
        filters: {
          search,
          Investigation_CategoryId,
          ResponseUnit,
          Validity_Min_Value,
          Validity_Max_Value,
          Normal_Value_Minimum,
          Normal_Value_Maximum,
        },
        list: __deepClone(list),
      })
    );
  } catch (error) {
    console.error("Investigation List Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Get Investigation By ID
exports.getInvestigationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const investigation = await InvestigationMaster.findById(id)
      .populate("Investigation_CategoryId", "lookup_value")
      .populate("Abnormalities", "lookup_value")
      .lean();

    if (!investigation) {
      return res.json(__requestResponse("404", "Investigation not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, investigation));
  } catch (error) {
    console.error("Get Investigation Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Delete Investigation
exports.deleteInvestigation = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the record before deletion for audit log
    const oldValue = await InvestigationMaster.findById(id).lean();
    
    if (!oldValue) {
      return res.json(__requestResponse("404", "Investigation not found"));
    }
    
    const investigation = await InvestigationMaster.findByIdAndDelete(id);

    // Create audit log for deletion
    await __CreateAuditLog(
      "investigation_master", // Collection name
      "DELETE", // Audit type
      "INVESTIGATION_DELETED", // Audit sub type
      oldValue, // Old value
      null, // New value (null for deletions)
      id, // Reference ID
      req.body.ClientId || null, // Client ID
      req.body.LoginLogID || null // Login Log ID
    );
    
    return res.json(__requestResponse("200", "Investigation deleted successfully"));
  } catch (error) {
    console.error("Delete Investigation Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};