const mongoose = require("mongoose");
// it is a admin_lookups schema also known as zatra lookup model
const _lookupschema = new mongoose.Schema(
  {
    client_id: {
      type: mongoose.SchemaTypes.ObjectId,
      //   required: true,
    },
    lookup_type: {
      type: String,
    },
    lookup_value: {
      type: String,
    },
    icon: {
      type: String,
    },
    parent_lookup_type: {
      type: String,
    },
    parent_lookup_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    sort_order: {
      type: Number,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    managed_by_ui: {
      type: Boolean,
    },
    other: {
      type: Object, // it may be explanation or any other fields used for symptom master and other
    },
  },
  {
    timestamps: true,
  }
);

// * indexing
// // Indexes for faster queries
// // Compound index for most common lookup pattern
// _lookupschema.index({ lookup_type: 1, is_active: 1, sort_order: 1 });

// // Index for hierarchical lookups
// _lookupschema.index({ parent_lookup_type: 1, parent_lookup_id: 1 });

// // Index for client-specific lookups
// // _lookupschema.index({ client_id: 1, lookup_type: 1, is_active: 1 });

// // Index for lookup value searches
// _lookupschema.index({ lookup_value: 1 });

// // Index for active status filtering
// _lookupschema.index({ is_active: 1 });

// If 'other' contains structured data like:
// { status: 'active', category: 'medical', priority: 1 }
// _lookupschema.index({ 
//   'other.status': 1, 
//   'other.category': 1 
// });




//* // Optimized indexes for large datasets (lakhs of records)

// // 1. Primary compound index - most critical for performance
// _lookupschema.index({ 
//   lookup_type: 1, 
//   is_active: 1, 
//   sort_order: 1 
// }, { 
//   name: 'lookup_type_active_sort_idx',
//   background: true 
// });

// // 2. Client-specific queries (if client_id is frequently used)
// _lookupschema.index({ 
//   client_id: 1, 
//   lookup_type: 1, 
//   is_active: 1 
// }, { 
//   name: 'client_lookup_active_idx',
//   background: true,
//   partialFilterExpression: { client_id: { $exists: true } }
// });

// // 3. Hierarchical lookups - essential for parent-child relationships
// _lookupschema.index({ 
//   parent_lookup_type: 1, 
//   parent_lookup_id: 1,
//   is_active: 1
// }, { 
//   name: 'parent_hierarchy_idx',
//   background: true,
//   partialFilterExpression: { parent_lookup_id: { $exists: true } }
// });

// // 4. Text search on lookup_value (sparse index for performance)
// _lookupschema.index({ 
//   lookup_value: 1 
// }, { 
//   name: 'lookup_value_idx',
//   background: true,
//   sparse: true
// });

// // 5. Active status filter (partial index to reduce size)
// _lookupschema.index({ 
//   is_active: 1,
//   updatedAt: -1
// }, { 
//   name: 'active_updated_idx',
//   background: true,
//   partialFilterExpression: { is_active: true }
// });




module.exports = mongoose.model("admin_lookups", _lookupschema);
