const mongoose = require("mongoose");
const tlbAuditLog = require("../modals/Common/AuditLog");
const tlbLookup = require("../modals/Common/lookupmodel");

// Enhanced audit log creation function
async function __CreateAuditLog(
  _CollectionName,
  _AuditType,
  _AuditSubType,
  _OldValue,
  _NewValue,
  _RefId,
  _ClientId,
  _LoginLogId,
  _ChangedBy,
  _ChangeDescription
) {
  try {
    let _AuditLogType = null;
    let _AlType = await tlbLookup.findOne({
      lookup_type: "audit_log_type",
      lookup_value: _AuditType,
    });
    if (_AlType) {
      _AuditLogType = _AlType._id;
    }

    // Calculate field-level changes
    const fieldChanges = calculateFieldChanges(_OldValue, _NewValue);

    const _AuditLog = await tlbAuditLog.create({
      AuditLogTypeId: _AuditLogType ? mongoose.Types.ObjectId(_AuditLogType) : null,
      RefId: _RefId ? mongoose.Types.ObjectId(_RefId) : null,
      ClientId: _ClientId ? mongoose.Types.ObjectId(_ClientId) : null,
      CollectionName: _CollectionName,
      LoginLogID: _LoginLogId,
      NewValue: _NewValue,
      OldValue: _OldValue,
      ChangedBy: _ChangedBy ? mongoose.Types.ObjectId(_ChangedBy) : null,
      RollBackBy: null,
      AuditLogSubTypeId: _AuditSubType,
      IsRollbacked: false,
      RollbackedOn: null,
      ChangeDescription: _ChangeDescription || `${_AuditType} operation performed`,
      FieldChanges: fieldChanges,
      ChangeHash: generateChangeHash(_OldValue, _NewValue),
      IPAddress: null, // Can be passed from request
      UserAgent: null, // Can be passed from request
    });

    if (_AuditLog) {
      console.log("Audit log created:", _AuditLog._id);
      return _AuditLog._id;
    }
  } catch (error) {
    console.error("__CreateAuditLog error:", error);
    return false;
  }
}

// Calculate field-level changes
function calculateFieldChanges(oldValue, newValue) {
  const changes = [];
  
  if (!oldValue && newValue) {
    // New record created
    Object.keys(newValue).forEach(key => {
      if (key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt') {
        changes.push({
          field: key,
          oldValue: null,
          newValue: newValue[key],
          changeType: 'CREATE'
        });
      }
    });
  } else if (oldValue && newValue) {
    // Record updated
    const allKeys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);
    
    allKeys.forEach(key => {
      if (key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt') {
        const oldVal = oldValue[key];
        const newVal = newValue[key];
        
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          changes.push({
            field: key,
            oldValue: oldVal,
            newValue: newVal,
            changeType: 'UPDATE'
          });
        }
      }
    });
  } else if (oldValue && !newValue) {
    // Record deleted
    Object.keys(oldValue).forEach(key => {
      if (key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt') {
        changes.push({
          field: key,
          oldValue: oldValue[key],
          newValue: null,
          changeType: 'DELETE'
        });
      }
    });
  }
  
  return changes;
}

// Generate unique hash for change tracking
function generateChangeHash(oldValue, newValue) {
  const crypto = require('crypto');
  const changeData = JSON.stringify({ old: oldValue, new: newValue });
  return crypto.createHash('md5').update(changeData).digest('hex');
}

// Get audit history for a specific record
async function getAuditHistory(refId, collectionName, options = {}) {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = -1,
      auditType = null,
      dateFrom = null,
      dateTo = null,
      changedBy = null
    } = options;

    const query = {
      RefId: mongoose.Types.ObjectId(refId),
      CollectionName: collectionName
    };

    if (auditType) {
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

    if (changedBy) {
      query.ChangedBy = mongoose.Types.ObjectId(changedBy);
    }

    const total = await tlbAuditLog.countDocuments(query);
    
    const auditLogs = await tlbAuditLog.find(query)
      .populate('AuditLogTypeId', 'lookup_value')
      .populate('AuditLogSubTypeId', 'lookup_value')
      .populate('ChangedBy', 'Name Email')
      .populate('RollBackBy', 'Name Email')
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      auditLogs: auditLogs.map(log => ({
        ...log,
        auditType: log.AuditLogTypeId?.lookup_value || 'Unknown',
        auditSubType: log.AuditLogSubTypeId?.lookup_value || null,
        changedByName: log.ChangedBy?.Name || 'System',
        rollbackByName: log.RollBackBy?.Name || null
      }))
    };
  } catch (error) {
    console.error("getAuditHistory error:", error);
    throw error;
  }
}

// Rollback to a specific audit log entry
async function rollbackToAuditLog(auditLogId, rollbackBy, rollbackReason) {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    // Get the audit log entry
    const auditLog = await tlbAuditLog.findById(auditLogId).session(session);
    if (!auditLog) {
      throw new Error("Audit log entry not found");
    }

    if (auditLog.IsRollbacked) {
      throw new Error("This change has already been rolled back");
    }

    // Get the target collection model
    const targetModel = getModelByCollectionName(auditLog.CollectionName);
    if (!targetModel) {
      throw new Error(`Model not found for collection: ${auditLog.CollectionName}`);
    }

    // Get current state of the record
    const currentRecord = await targetModel.findById(auditLog.RefId).session(session);
    if (!currentRecord) {
      throw new Error("Target record not found");
    }

    const currentState = currentRecord.toObject();

    // Restore to old value
    const restoredRecord = await targetModel.findByIdAndUpdate(
      auditLog.RefId,
      auditLog.OldValue,
      { new: true, session, runValidators: true }
    );

    // Mark the original audit log as rolled back
    auditLog.IsRollbacked = true;
    auditLog.RollbackedOn = new Date();
    auditLog.RollBackBy = mongoose.Types.ObjectId(rollbackBy);
    auditLog.RollbackReason = rollbackReason;
    await auditLog.save({ session });

    // Create new audit log for the rollback action
    await __CreateAuditLog(
      auditLog.CollectionName,
      "ROLLBACK",
      null,
      currentState,
      auditLog.OldValue,
      auditLog.RefId,
      auditLog.ClientId,
      null,
      rollbackBy,
      `Rollback to state from ${auditLog.createdAt}. Reason: ${rollbackReason}`
    );

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      message: "Rollback completed successfully",
      restoredRecord: restoredRecord
    };

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("rollbackToAuditLog error:", error);
    throw error;
  }
}

// Get model by collection name
function getModelByCollectionName(collectionName) {
  const modelMap = {
    'patient_master': require('../modals/Patient/PatientMaster'),
    'medical_history': require('../modals/Patient/MedicalHistory2'),
    'patient_case_file': require('../modals/Patient/PatientCaseFile'),
    'patient_profiling': require('../modals/Patient/PatientProfiling'),
    'patient_referral': require('../modals/Patient/PatientReferral'),
    // Add more models as needed
  };
  
  return modelMap[collectionName] || null;
}

// Compare two audit log entries
async function compareAuditLogs(auditLogId1, auditLogId2) {
  try {
    const [log1, log2] = await Promise.all([
      tlbAuditLog.findById(auditLogId1).populate('AuditLogTypeId', 'lookup_value'),
      tlbAuditLog.findById(auditLogId2).populate('AuditLogTypeId', 'lookup_value')
    ]);

    if (!log1 || !log2) {
      throw new Error("One or both audit log entries not found");
    }

    return {
      log1: {
        id: log1._id,
        type: log1.AuditLogTypeId?.lookup_value,
        date: log1.createdAt,
        oldValue: log1.OldValue,
        newValue: log1.NewValue,
        fieldChanges: log1.FieldChanges
      },
      log2: {
        id: log2._id,
        type: log2.AuditLogTypeId?.lookup_value,
        date: log2.createdAt,
        oldValue: log2.OldValue,
        newValue: log2.NewValue,
        fieldChanges: log2.FieldChanges
      },
      comparison: {
        timeDifference: Math.abs(log2.createdAt - log1.createdAt),
        sameCollection: log1.CollectionName === log2.CollectionName,
        sameRecord: log1.RefId.toString() === log2.RefId.toString()
      }
    };
  } catch (error) {
    console.error("compareAuditLogs error:", error);
    throw error;
  }
}

// Get audit statistics
async function getAuditStatistics(refId, collectionName, dateFrom, dateTo) {
  try {
    const matchQuery = {
      RefId: mongoose.Types.ObjectId(refId),
      CollectionName: collectionName
    };

    if (dateFrom || dateTo) {
      matchQuery.createdAt = {};
      if (dateFrom) matchQuery.createdAt.$gte = new Date(dateFrom);
      if (dateTo) matchQuery.createdAt.$lte = new Date(dateTo);
    }

    const stats = await tlbAuditLog.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'admin_lookups',
          localField: 'AuditLogTypeId',
          foreignField: '_id',
          as: 'auditType'
        }
      },
      {
        $group: {
          _id: '$AuditLogTypeId',
          auditType: { $first: { $arrayElemAt: ['$auditType.lookup_value', 0] } },
          count: { $sum: 1 },
          lastChange: { $max: '$createdAt' },
          rollbackCount: {
            $sum: { $cond: ['$IsRollbacked', 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalChanges = await tlbAuditLog.countDocuments(matchQuery);
    const rollbackCount = await tlbAuditLog.countDocuments({
      ...matchQuery,
      IsRollbacked: true
    });

    return {
      totalChanges,
      rollbackCount,
      changesByType: stats,
      rollbackPercentage: totalChanges > 0 ? (rollbackCount / totalChanges * 100).toFixed(2) : 0
    };
  } catch (error) {
    console.error("getAuditStatistics error:", error);
    throw error;
  }
}

module.exports = {
  __CreateAuditLog,
  getAuditHistory,
  rollbackToAuditLog,
  compareAuditLogs,
  getAuditStatistics,
  calculateFieldChanges,
  generateChangeHash
};