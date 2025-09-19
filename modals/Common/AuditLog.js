const mongoose = require("mongoose");

const _AuditLog = new mongoose.Schema(
  {
    AuditLogTypeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    AuditLogSubTypeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    RefId: {                                                                               
      type: mongoose.SchemaTypes.ObjectId,
    },
    CollectionName: {
      type: String,
    },
    OldValue: {
      type: Object,
    },
    NewValue: {
      type: Object,
    },
    IsRollbacked: {
      type: Boolean,
    },
    RollbackedOn: {
      type: mongoose.SchemaTypes.Date,
    },
    RollBackBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "asset_master",
    },
    ChangedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "asset_master",
    },
    ClientId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "asset_master",
    },
    LoginLogID: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "login_log",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("audit_Log", _AuditLog);
