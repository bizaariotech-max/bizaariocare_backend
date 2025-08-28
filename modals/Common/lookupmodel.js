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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("admin_lookups", _lookupschema);
