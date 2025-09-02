const mongoose = require("mongoose");

const _SchemaDesign = new mongoose.Schema({
  AssetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "asset_master",
  },
  StationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "station_master",
  },
  EventTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin_lookups",
  },
  EventTitle: { type: String },
  EventVenue: { type: String },
  EventSchedule: [
    {
      Date: { type: Date },
      StartTime: { type: String },
      EndTime: { type: String },
      NoOfSlots: { type: Number },
    },
  ],// add more event schedule
  RegistrationCurrency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin_lookups",
  },
  RegistrationFee: { type: String },
  EventPoster: [{ type: String }],
  EventAdvertisement: [{ type: String }],
});
module.exports = mongoose.model("event_master", _SchemaDesign);


// Event Master
// a.	Asset ID
// b.	Station ID
// c.	Event ID
// d.	Event Type (Drop-Down from Event Master values (OPD Camp, CME Session)
// e.	Event Title
// f.	Event Venue (User Input)
// g.	Event Schedule
// i.	*Date
// ii.	Start Time
// iii.	End Time
// iv.	No of Slots
// v.	Add More*
// h.	Registration Currency (Country Master)
// i.	Registration Fee
// j.	Event Poster (multiple images)
// k.	Event Advertisement (multiple stations in the same country)

