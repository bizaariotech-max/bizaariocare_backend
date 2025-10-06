const express = require("express");
const router = express.Router();

const {
  test,
  getAuditHistory,
  getAuditDashboard,
  rollbackToAuditLog,
  compareAuditLogs,
  getAuditStatistics,
  getFieldChanges,
  cleanOldAuditLogs
} = require("../../controllers/common/auditLog.Controller");

// Test Route
router.get("/test", test);

// ==================== AUDIT HISTORY ROUTES ====================

// Get audit history for a specific record
// GET /api/audit/history/:refId/:collectionName?page=1&limit=50&auditType=UPDATE&dateFrom=2024-01-01&dateTo=2024-12-31
router.get("/history/:refId/:collectionName", getAuditHistory);

// Get audit dashboard (all recent changes)
// GET /api/audit/dashboard?page=1&limit=100&collectionName=patient_master&auditType=UPDATE&dateFrom=2024-01-01
router.get("/dashboard", getAuditDashboard);

// Get audit statistics for a specific record
// GET /api/audit/statistics/:refId/:collectionName?dateFrom=2024-01-01&dateTo=2024-12-31
router.get("/statistics/:refId/:collectionName", getAuditStatistics);

// Get field-level changes for a specific audit log
// GET /api/audit/field-changes/:auditLogId
router.get("/field-changes/:auditLogId", getFieldChanges);

// ==================== ROLLBACK ROUTES ====================

// Rollback to a specific audit log entry
// POST /api/audit/rollback/:auditLogId
// Body: { "rollbackBy": "userId", "rollbackReason": "Reason for rollback" }
router.post("/rollback/:auditLogId", rollbackToAuditLog);

// ==================== COMPARISON ROUTES ====================

// Compare two audit log entries
// GET /api/audit/compare/:auditLogId1/:auditLogId2
router.get("/compare/:auditLogId1/:auditLogId2", compareAuditLogs);

// ==================== ADMIN ROUTES ====================

// Clean old audit logs (admin only)
// POST /api/audit/clean
// Body: { "daysToKeep": 365 }
router.post("/clean", cleanOldAuditLogs);

module.exports = router;