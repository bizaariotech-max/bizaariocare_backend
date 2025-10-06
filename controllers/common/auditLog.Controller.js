const mongoose = require("mongoose");
const { 
  getAuditHistory, 
  rollbackToAuditLog, 
  compareAuditLogs, 
  getAuditStatistics 
} = require("../../utils/auditlogNew");
const { __requestResponse, __deepClone } = require("../../utils/constant");
const { __SUCCESS, __SOME_ERROR } = require("../../utils/variable");
// const AuditLog = require("../../modals/Common/AuditLog");
const AuditLog = require("../../modals/Common/AuditLogNew");

// Get audit history for a specific record
exports.getAuditHistory = async (req, res) => {
  try {
    const { refId, collectionName } = req.params;
    const {
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = -1,
      auditType,
      dateFrom,
      dateTo,
      changedBy
    } = req.query;

    if (!mongoose.Types.ObjectId.isValid(refId)) {
      return res.json(__requestResponse("400", "Invalid reference ID"));
    }

    const options = {
      page: Number(page),
      limit: Number(limit),
      sortBy,
      sortOrder: Number(sortOrder),
      auditType,
      dateFrom,
      dateTo,
      changedBy
    };

    const history = await getAuditHistory(refId, collectionName, options);

    return res.json(__requestResponse("200", __SUCCESS, history));
  } catch (error) {
    console.error("Get Audit History Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Get audit history for multiple records (dashboard view)
exports.getAuditDashboard = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      collectionName,
      auditType,
      dateFrom,
      dateTo,
      changedBy
    } = req.query;

    const query = {};
    
    if (collectionName) query.CollectionName = collectionName;
    if (changedBy && mongoose.Types.ObjectId.isValid(changedBy)) {
      query.ChangedBy = mongoose.Types.ObjectId(changedBy);
    }
    if (auditType) {
      // Look up audit type ID
      const tlbLookup = require("../../modals/Common/lookupmodel");
      const auditTypeObj = await tlbLookup.findOne({
        lookup_type: "audit_log_type",
        lookup_value: auditType
      });
      if (auditTypeObj) {
        query.AuditLogTypeId = auditTypeObj._id;
      }
    }
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const total = await AuditLog.countDocuments(query);
    
    const auditLogs = await AuditLog.find(query)
      .populate('AuditLogTypeId', 'lookup_value')
      .populate('AuditLogSubTypeId', 'lookup_value')
      .populate('ChangedBy', 'Name Email')
      .populate('RollBackBy', 'Name Email')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const response = {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      auditLogs: auditLogs.map(log => ({
        ...log,
        auditType: log.AuditLogTypeId?.lookup_value || 'Unknown',
        auditSubType: log.AuditLogSubTypeId?.lookup_value || null,
        changedByName: log.ChangedBy?.Name || 'System',
        rollbackByName: log.RollBackBy?.Name || null,
        ageInDays: Math.floor((Date.now() - new Date(log.createdAt)) / (1000 * 60 * 60 * 24))
      }))
    };

    return res.json(__requestResponse("200", __SUCCESS, response));
  } catch (error) {
    console.error("Get Audit Dashboard Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Rollback to a specific audit log entry
exports.rollbackToAuditLog = async (req, res) => {
  try {
    const { auditLogId } = req.params;
    const { rollbackBy, rollbackReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(auditLogId)) {
      return res.json(__requestResponse("400", "Invalid audit log ID"));
    }

    if (!rollbackBy || !rollbackReason) {
      return res.json(__requestResponse("400", "Rollback user and reason are required"));
    }

    const result = await rollbackToAuditLog(auditLogId, rollbackBy, rollbackReason);

    return res.json(__requestResponse("200", __SUCCESS, result));
  } catch (error) {
    console.error("Rollback Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Compare two audit log entries
exports.compareAuditLogs = async (req, res) => {
  try {
    const { auditLogId1, auditLogId2 } = req.params;

    if (!mongoose.Types.ObjectId.isValid(auditLogId1) || 
        !mongoose.Types.ObjectId.isValid(auditLogId2)) {
      return res.json(__requestResponse("400", "Invalid audit log IDs"));
    }

    const comparison = await compareAuditLogs(auditLogId1, auditLogId2);

    return res.json(__requestResponse("200", __SUCCESS, comparison));
  } catch (error) {
    console.error("Compare Audit Logs Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Get audit statistics
exports.getAuditStatistics = async (req, res) => {
  try {
    const { refId, collectionName } = req.params;
    const { dateFrom, dateTo } = req.query;

    if (!mongoose.Types.ObjectId.isValid(refId)) {
      return res.json(__requestResponse("400", "Invalid reference ID"));
    }

    const statistics = await getAuditStatistics(refId, collectionName, dateFrom, dateTo);

    return res.json(__requestResponse("200", __SUCCESS, statistics));
  } catch (error) {
    console.error("Get Audit Statistics Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Get field-level change details
exports.getFieldChanges = async (req, res) => {
  try {
    const { auditLogId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(auditLogId)) {
      return res.json(__requestResponse("400", "Invalid audit log ID"));
    }

    const auditLog = await AuditLog.findById(auditLogId)
      .populate('AuditLogTypeId', 'lookup_value')
      .populate('ChangedBy', 'Name Email')
      .lean();

    if (!auditLog) {
      return res.json(__requestResponse("404", "Audit log not found"));
    }

    const response = {
      auditLogId: auditLog._id,
      auditType: auditLog.AuditLogTypeId?.lookup_value,
      changedBy: auditLog.ChangedBy?.Name || 'System',
      changeDate: auditLog.createdAt,
      fieldChanges: auditLog.FieldChanges || [],
      changeDescription: auditLog.ChangeDescription,
      isRollbacked: auditLog.IsRollbacked,
      rollbackInfo: auditLog.IsRollbacked ? {
        rollbackedOn: auditLog.RollbackedOn,
        rollbackReason: auditLog.RollbackReason
      } : null
    };

    return res.json(__requestResponse("200", __SUCCESS, response));
  } catch (error) {
    console.error("Get Field Changes Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Clean old audit logs (admin function)
exports.cleanOldAuditLogs = async (req, res) => {
  try {
    const { daysToKeep = 365 } = req.body;

    const result = await AuditLog.cleanOldLogs(Number(daysToKeep));

    return res.json(__requestResponse("200", __SUCCESS, {
      message: `Cleaned ${result.deletedCount} old audit log entries`,
      deletedCount: result.deletedCount,
      daysToKeep: Number(daysToKeep)
    }));
  } catch (error) {
    console.error("Clean Old Audit Logs Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Test route
exports.test = async (req, res) => {
  return res.json(__requestResponse("200", "Audit Log API is working"));
};