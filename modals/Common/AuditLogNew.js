const mongoose = require("mongoose");

const FieldChangeSchema = new mongoose.Schema({
  field: {
    type: String,
    required: true
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed
  },
  changeType: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE'],
    required: true
  }
}, { _id: false });

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
      required: true,
      index: true
    },
    CollectionName: {
      type: String,
      required: true,
      index: true
    },
    OldValue: {
      type: Object,
    },
    NewValue: {
      type: Object,
    },
    FieldChanges: [FieldChangeSchema],
    ChangeHash: {
      type: String,
      index: true
    },
    ChangeDescription: {
      type: String,
      maxlength: 1000
    },
    IsRollbacked: {
      type: Boolean,
      default: false,
      index: true
    },
    RollbackedOn: {
      type: mongoose.SchemaTypes.Date,
    },
    RollBackBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "asset_master",
    },
    RollbackReason: {
      type: String,
      maxlength: 500
    },
    ChangedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "asset_master",
      index: true
    },
    ClientId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "asset_master",
    },
    LoginLogID: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "login_log",
    },
    IPAddress: {
      type: String,
      maxlength: 45 // IPv6 support
    },
    UserAgent: {
      type: String,
      maxlength: 500
    },
    SessionId: {
      type: String,
      index: true
    },
    // Metadata for advanced tracking
    Metadata: {
      browserInfo: String,
      deviceInfo: String,
      location: {
        country: String,
        city: String,
        coordinates: {
          lat: Number,
          lng: Number
        }
      }
    }
  },
  {
    timestamps: true,
  }
);

// Compound indexes for better query performance
_AuditLog.index({ RefId: 1, CollectionName: 1, createdAt: -1 });
_AuditLog.index({ CollectionName: 1, createdAt: -1 });
_AuditLog.index({ ChangedBy: 1, createdAt: -1 });
_AuditLog.index({ IsRollbacked: 1, createdAt: -1 });

// Virtual for audit log age
_AuditLog.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Static method to clean old audit logs
_AuditLog.statics.cleanOldLogs = async function(daysToKeep = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    IsRollbacked: false // Keep rollback logs for compliance
  });
};

module.exports = mongoose.model("audit_Log_new", _AuditLog);