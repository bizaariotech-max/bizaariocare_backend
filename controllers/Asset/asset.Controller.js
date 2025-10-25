const Asset = require("../../modals/AssetMaster/AssetMaster");
const { __requestResponse } = require("../../utils/constant");
const {
  __SUCCESS,
  __SOME_ERROR,
  __NO_LOOKUP_LIST,
} = require("../../utils/variable");
const { __deepClone } = require("../../utils/constant");
// const { __CreateAuditLog } = require("../../utils/auditlog");

//  Test Controller
exports.test = async (req, res) => {
  return res.send("Asset API Working 🚀");
};

//  Save (Add / Edit) Asset
exports.saveAsset = async (req, res) => {
  try {
    const { _id } = req.body;
    // id= !_id || null || ""
    let asset;
    if (_id) {
      // Update existing
      asset = await Asset.findByIdAndUpdate(_id, req.body, {
        new: true,
      });
      // await __CreateAuditLog(req, "Asset Updated", asset._id);
    } else {
      // New entry
      asset = new Asset(req.body);
      await asset.save();
      // await __CreateAuditLog(req, "Asset Created", asset._id);
    }

    return res.json(__requestResponse("200", __SUCCESS, asset));
  } catch (error) {
    console.error("Save Asset Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

//  Asset List (with pagination + population)
exports.assetList = async (req, res) => {
  try {
    // Handle both req.body and req.query to support GET and POST requests
    const requestData = req.body || req.query || {};
    const {
      page = 1,
      limit = 10,
      search = "",
      AssetCategoryLevel1,
      AssetCategoryLevel2,
      AssetCategoryLevel3,
      StationId,
      SubscriptionType,
    } = requestData;

    const query = {};

    // Search filter
    if (search) {
      query.AssetName = { $regex: search, $options: "i" };
    }

    // Asset Category Level 1 filter
    if (AssetCategoryLevel1) {
      query.AssetCategoryLevel1 = AssetCategoryLevel1;
    }

    // Asset Category Level 2 filter
    if (AssetCategoryLevel2) {
      query.AssetCategoryLevel2 = AssetCategoryLevel2;
    }

    // Asset Category Level 3 filter
    if (AssetCategoryLevel3) {
      query.AssetCategoryLevel3 = AssetCategoryLevel3;
    }

    // Station filter
    if (StationId) {
      query.StationId = StationId;
    }

    // Subscription Type filter
    if (SubscriptionType) {
      query.SubscriptionType = SubscriptionType;
    }

    const total = await Asset.countDocuments(query);
    const list = await Asset.find(query)
      .populate("StationId", "StationName")
      .populate("ParentAssetId", "AssetName")
      .populate("SubscriptionType", "lookup_value")
      .populate("AssetCategoryLevel1", "lookup_value")
      .populate("AssetCategoryLevel2", "lookup_value")
      .populate("AssetCategoryLevel3", "lookup_value")
      .populate("MedicalSpecialties", "lookup_value")
      .populate("HospitalDoctors", "AssetName ShortDescription LongDescription MedicalSpecialties Specialization RegistrationYear AddressLine1 AddressLine2 PostalCode ContactName ContactPhoneNumber ContactEmailAddress ProfilePicture Logo NoofSurgeriesPerformed NoofSatisfiedPatients NoofArticlesPublished NoofLecturesDelivered Fellowships Website YouTubeChannel FacebookPage InstagramAccount LinkedInAccount");
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(); //Use lean() for read-only operations

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: Number(page),
        limit: Number(limit),
        filters: {
          search,
          AssetCategoryLevel1,
          AssetCategoryLevel2,
          AssetCategoryLevel3,
          StationId,
          SubscriptionType,
        },
        list: __deepClone(list),
      })
    );
  } catch (error) {
    console.error("Asset List Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

//  Asset List (with pagination + population)
exports.assetListxx = async (req, res) => {
  try {
    // Handle both req.body and req.query to support GET and POST requests
    const requestData = req.body || req.query || {};
    const { page = 1, limit = 10, search = "" } = requestData;

    const query = {};
    if (search) {
      query.AssetName = { $regex: search, $options: "i" };
    }

    const total = await Asset.countDocuments(query);
    const list = await Asset.find(query)
      .populate("StationId", "StationName")
      .populate("ParentAssetId", "AssetName")
      .populate("SubscriptionType", "lookup_value")
      .populate("AssetCategoryLevel1", "lookup_value")
      .populate("AssetCategoryLevel2", "lookup_value")
      .populate("AssetCategoryLevel3", "lookup_value")
      .populate("MedicalSpecialties", "lookup_value")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: Number(page),
        limit: Number(limit),
        list: __deepClone(list),
      })
    );
  } catch (error) {
    console.error("Asset List Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

//  Get Asset By ID
exports.getAssetByIdxx = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await Asset.findById(id)
      .populate("StationId", "StationName")
      .populate("ParentAssetId", "AssetName")
      .populate("SubscriptionType", "lookup_value")
      .populate("AssetCategoryLevel1", "lookup_value")
      .populate("AssetCategoryLevel2", "lookup_value")
      .populate("AssetCategoryLevel3", "lookup_value")
      .populate("MedicalSpecialties", "lookup_value")
      .populate("AssetMapping", "AssetName")
      .populate("TreatmentPackages.PackageCurrency", "lookup_value")
      .populate("FeesAndCharges.ServiceCategory", "lookup_value")
      .populate("FeesAndCharges.FeeCurrency", "lookup_value");

    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, asset));
  } catch (error) {
    console.error("Get Asset Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

//  Get Asset By ID
exports.getAssetByIdNew = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the main asset with all populated fields
    const asset = await Asset.findById(id)
      .populate("StationId", "StationName")
      .populate("ParentAssetId", "AssetName")
      .populate("SubscriptionType", "lookup_value")
      .populate("AssetCategoryLevel1", "lookup_value")
      .populate("AssetCategoryLevel2", "lookup_value")
      .populate("AssetCategoryLevel3", "lookup_value")
      .populate("MedicalSpecialties", "lookup_value")
      .populate("AssetMapping", "AssetName")
      .populate("TreatmentPackages.PackageCurrency", "lookup_value")
      .populate("FeesAndCharges.ServiceCategory", "lookup_value")
      .populate("FeesAndCharges.FeeCurrency", "lookup_value");

    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    // Import required models for additional data
    const ContentMaster = require("../../modals/Common/ContentMaster");
    const EventMaster = require("../../modals/Common/EventMaster");

    // Get awards and achievements (content type: awards)
    const awards = await ContentMaster.find({
      AssetId: id,
      ContentTypeId: { $exists: true },
    })
      .populate({
        path: "ContentTypeId",
        match: { lookup_value: { $regex: /award/i } },
      })
      .populate("ContentTypeId", "lookup_value");

    // Filter out null ContentTypeId after population
    const filteredAwards = awards.filter(
      (award) => award.ContentTypeId !== null
    );

    // Get patient testimonials (content type: patient testimonial)
    const testimonials = await ContentMaster.find({
      AssetId: id,
      ContentTypeId: { $exists: true },
    })
      .populate({
        path: "ContentTypeId",
        match: { lookup_value: { $regex: /testimonial/i } },
      })
      .populate("ContentTypeId", "lookup_value");

    // Filter out null ContentTypeId after population
    const filteredTestimonials = testimonials.filter(
      (testimonial) => testimonial.ContentTypeId !== null
    );

    // Get all other content (excluding awards and testimonials)
    const otherContent = await ContentMaster.find({
      AssetId: id,
      ContentTypeId: { $exists: true },
    })
      .populate({
        path: "ContentTypeId",
        match: { lookup_value: { $not: { $regex: /(award|testimonial)/i } } },
      })
      .populate("ContentTypeId", "lookup_value");

    // Filter out null ContentTypeId after population
    const filteredOtherContent = otherContent.filter(
      (content) => content.ContentTypeId !== null
    );

    // Get events related to this asset
    const events = await EventMaster.find({ AssetId: id })
      .populate("StationId", "StationName")
      .populate("EventTypeId", "lookup_value")
      .populate("RegistrationCurrency", "lookup_value")
      .sort({ _id: -1 });

    // Combine all data
    const assetWithAdditionalData = {
      ...asset.toObject(),
      awards: filteredAwards,
      patientTestimonials: filteredTestimonials,
      otherContent: filteredOtherContent,
      events: events,
    };

    return res.json(
      __requestResponse("200", __SUCCESS, assetWithAdditionalData)
    );
  } catch (error) {
    console.error("Get Asset Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

//  Get Asset By ID
exports.getAssetById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the main asset with all populated fields
    const asset = await Asset.findById(id)
      .populate("StationId", "StationName")
      .populate("ParentAssetId", "AssetName")
      .populate("SubscriptionType", "lookup_value")
      .populate("AssetCategoryLevel1", "lookup_value")
      .populate("AssetCategoryLevel2", "lookup_value")
      .populate("AssetCategoryLevel3", "lookup_value")
      .populate("MedicalSpecialties", "lookup_value")
      .populate("AssetMapping", "AssetName")
      .populate("TreatmentPackages.PackageCurrency", "lookup_value")
      .populate("FeesAndCharges.ServiceCategory", "lookup_value")
      .populate("FeesAndCharges.FeeCurrency", "lookup_value")
      .populate(
        "HospitalDoctors",
        "AssetName ShortDescription LongDescription MedicalSpecialties Specialization RegistrationYear AddressLine1 AddressLine2 PostalCode ContactName ContactPhoneNumber ContactEmailAddress ProfilePicture Logo NoofSurgeriesPerformed NoofSatisfiedPatients NoofArticlesPublished NoofLecturesDelivered Fellowships Website YouTubeChannel FacebookPage InstagramAccount LinkedInAccount"
      );

    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    // Import required models for additional data
    const ContentMaster = require("../../modals/Common/ContentMaster");
    const EventMaster = require("../../modals/Common/EventMaster");

    // Define specific content type IDs
    const contentTypeIds = {
      digitalCME: "68affee3874340d8d79dbf3b",
      innovations: "68affeef874340d8d79dbf41",
      newsArticles: "68afff04874340d8d79dbf4d",
      awards: "68afff10874340d8d79dbf53",
      testimonials: "68c8f5fab5cf101deca56536",
    };

    // Get Awards and Recognitions
    const awards = await ContentMaster.find({
      AssetId: id,
      ContentTypeId: contentTypeIds.awards,
    })
      .populate("ContentTypeId", "lookup_value")
      .sort({ _id: -1 });

    // Get Patient Testimonials
    const testimonials = await ContentMaster.find({
      AssetId: id,
      ContentTypeId: contentTypeIds.testimonials,
    })
      .populate("ContentTypeId", "lookup_value")
      .sort({ _id: -1 });

    // Get Digital CME
    const digitalCME = await ContentMaster.find({
      AssetId: id,
      ContentTypeId: contentTypeIds.digitalCME,
    })
      .populate("ContentTypeId", "lookup_value")
      .sort({ _id: -1 });

    // Get Innovations
    const innovations = await ContentMaster.find({
      AssetId: id,
      ContentTypeId: contentTypeIds.innovations,
    })
      .populate("ContentTypeId", "lookup_value")
      .sort({ _id: -1 });

    // Get News & Articles
    const newsArticles = await ContentMaster.find({
      AssetId: id,
      ContentTypeId: contentTypeIds.newsArticles,
    })
      .populate("ContentTypeId", "lookup_value")
      .sort({ _id: -1 });

    // Get events related to this asset
    const events = await EventMaster.find({ AssetId: id })
      .populate("StationId", "StationName")
      .populate("EventTypeId", "lookup_value")
      .populate("RegistrationCurrency", "lookup_value")
      .sort({ _id: -1 });

    // Combine all data with proper naming based on lookup_value
    const assetWithAdditionalData = {
      ...asset.toObject(),
      AwardsRecognitions: awards,
      PatientTestimonials: testimonials,
      DigitalCME: digitalCME,
      Innovations: innovations,
      NewsArticles: newsArticles,
      Events: events,
    };

    return res.json(
      __requestResponse("200", __SUCCESS, assetWithAdditionalData)
    );
  } catch (error) {
    console.error("Get Asset Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

//  Delete Asset
exports.deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await Asset.findByIdAndDelete(id);
    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found"));
    }

    return res.json(__requestResponse("200", "Asset deleted successfully"));
  } catch (error) {
    console.error("Delete Asset Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};