const EventMaster = require("../../modals/Common/EventMaster");
const { __requestResponse, __deepClone } = require("../../utils/constant");
const { __SUCCESS, __SOME_ERROR } = require("../../utils/variable");

// Test API
const test = async (req, res) => {
  try {
    res.json(__requestResponse("200", __SUCCESS, "EventMaster API is working"));
  } catch (error) {
    res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Add/Edit EventMaster
const saveEventMaster = async (req, res) => {
  try {
    const {
      _id,
      AssetId,
      StationId,
      EventTypeId,
      EventTitle,
      EventVenue,
      EventSchedule,
      RegistrationCurrency,
      RegistrationFee,
      EventPoster,
      EventAdvertisement
    } = req.body;

    let eventMaster;
    
    if (_id) {
      // Edit existing event
      eventMaster = await EventMaster.findByIdAndUpdate(
        _id,
        {
          AssetId: AssetId || null,
          StationId: StationId || null,
          EventTypeId: EventTypeId || null,
          EventTitle,
          EventVenue,
          EventSchedule: EventSchedule || [],
          RegistrationCurrency: RegistrationCurrency || null,
          RegistrationFee,
          EventPoster: EventPoster || [],
          EventAdvertisement: EventAdvertisement || []
        },
        { new: true, runValidators: true }
      );
      
      if (!eventMaster) {
        return res.json(__requestResponse("404", "Event not found"));
      }
      
      res.json(__requestResponse("200", "Event updated successfully", eventMaster));
    } else {
      // Add new event
      eventMaster = new EventMaster({
        AssetId: AssetId || null,
        StationId: StationId || null,
        EventTypeId: EventTypeId || null,
        EventTitle,
        EventVenue,
        EventSchedule: EventSchedule || [],
        RegistrationCurrency: RegistrationCurrency || null,
        RegistrationFee,
        EventPoster: EventPoster || [],
        EventAdvertisement: EventAdvertisement || []
      });
      
      await eventMaster.save();
      res.json(__requestResponse("200", "Event created successfully", eventMaster));
    }
  } catch (error) {
    res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Get EventMaster List with Pagination
const eventMasterList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      AssetId,
      StationId,
      EventTypeId
    } = req.body;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { EventTitle: { $regex: search, $options: "i" } },
        { EventVenue: { $regex: search, $options: "i" } }
      ];
    }
    
    if (AssetId) filter.AssetId = AssetId;
    if (StationId) filter.StationId = StationId;
    if (EventTypeId) filter.EventTypeId = EventTypeId;

    const total = await EventMaster.countDocuments(filter);
    const list = await EventMaster.find(filter)
      .populate("AssetId", "AssetName")
      .populate("StationId", "StationName")
      .populate("EventTypeId", "LookupValue")
      .populate("RegistrationCurrency", "LookupValue")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limitNumber);
      // .lean();//Use lean() for read-only operations

    res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: Number(page),
        limit: Number(limit),
        list: __deepClone(list),
      })
    );
  } catch (error) {
    res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Get EventMaster by ID
const getEventMaster = async (req, res) => {
  try {
    const { id } = req.params;
    
    const eventMaster = await EventMaster.findById(id)
      .populate("AssetId", "AssetName")
      .populate("StationId", "StationName")
      .populate("EventTypeId", "LookupValue")
      .populate("RegistrationCurrency", "LookupValue");
    
    if (!eventMaster) {
      return res.json(__requestResponse("404", "Event not found"));
    }
    
    res.json(__requestResponse("200", "Event retrieved successfully", eventMaster));
  } catch (error) {
    res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Delete EventMaster
const deleteEventMaster = async (req, res) => {
  try {
    const { id } = req.params;
    
    const eventMaster = await EventMaster.findByIdAndDelete(id);
    
    if (!eventMaster) {
      return res.json(__requestResponse("404", "Event not found"));
    }
    
    res.json(__requestResponse("200", "Event deleted successfully"));
  } catch (error) {
    res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

module.exports = {
  test,
  saveEventMaster,
  eventMasterList,
  getEventMaster,
  deleteEventMaster
};