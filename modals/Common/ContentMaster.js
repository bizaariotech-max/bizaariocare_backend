const mongoose = require("mongoose");

const _SchemaDesign = new mongoose.Schema({
  AssetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "asset_master",
  },
  ContentTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin_lookups",
  },
  ContentTitle: { type: String },
  GrantingBody: { type: String },
  Date: { type: Date },
  ContentPriority: { type: String },
  ValidUpto: { type: Date },
  ContentImage: { type: String },
  ShortDescription: { type: String },
  LongDescription: { type: String },
  MetaTags: [{ type: String }],
  PictureGallery: [{ type: String }],
  VideoGallery: [{ type: String }],
  References: [{ type: String }],
});
module.exports = mongoose.model("content_master", _SchemaDesign);

// Content Master
// a.	Asset ID
// b.	Content ID
// c.	Content Type (Drop-Down from Content Type Master values: (Digital CME, Innovations, Case Studies, News & Articles, Awards and Recognitions))
// d.	Content Title
// e.	Granting Body
// f.	Content Date
// g.	Content Priority
// h.	Valid Upto (Date)
// i.	Content Image
// j.	Short Description
// k.	Long Description
// l.	Meta tags (Array)
// m.	Picture Gallery (Array)
// n.	Video Gallery (Array)
// o.	References with Add More (Multiple URLs)
