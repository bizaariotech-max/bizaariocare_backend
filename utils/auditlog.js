const mongoose = require("mongoose");
const tlbAuditLog = require("../modals/Common/AuditLog");
const tlbLookup = require("../modals/Common/lookupmodel");

async function __CreateAuditLog(
  _CollectionName,
  _AuditType,
  _AuditSubType,
  _OldValue,
  _NewValue,
  _RefId,
  _ClientId,
  _LoginLogId
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
    const _AuditLog = await tlbAuditLog.create({
      AuditLogTypeId: mongoose.Types.ObjectId(_AuditLogType),
      RefId: mongoose.Types.ObjectId(_RefId),
      ClientId: mongoose.Types.ObjectId(_ClientId),
      CollectionName: _CollectionName,
      LoginLogID: _LoginLogId,
      NewValue: _NewValue,
      OldValue: _OldValue,
      ChangedBy: null,
      RollBackBy: null,
      AuditLogSubTypeId: _AuditSubType,
      IsRollbacked: false,
      RollbackedOn: null,
    });
    if (_AuditLog) {
      return true;
    }
  } catch (error) {
    return false;
  }
}

module.exports = { __CreateAuditLog };
