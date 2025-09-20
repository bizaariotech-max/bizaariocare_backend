const ContentMaster = require("../../modals/Common/ContentMaster");
const { __requestResponse, __deepClone } = require("../../utils/constant");
const { __SUCCESS, __SOME_ERROR } = require("../../utils/variable");

// Test API
const test = async (req, res) => {
  try {
    res.json(__requestResponse("200", __SUCCESS, "ContentMaster API is working"));
  } catch (error) {
    res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Add/Edit ContentMaster
const saveContentMaster = async (req, res) => {
  try {
    const {
      _id,
      AssetId,
      ContentTypeId,
      ContentTitle,
      GrantingBody,
      Date,
      ContentPriority,
      ValidUpto,
      ContentImage,
      ShortDescription,
      LongDescription,
      MetaTags,
      PictureGallery,
      VideoGallery,
      References
    } = req.body;

    let contentMaster;
    
    if (_id) {
      // Edit existing content
      contentMaster = await ContentMaster.findByIdAndUpdate(
        _id,
        {
          AssetId: AssetId || null,
          ContentTypeId: ContentTypeId || null,
          ContentTitle,
          GrantingBody,
          Date: Date,
          ContentPriority,
          ValidUpto: ValidUpto,
          ContentImage,
          ShortDescription,
          LongDescription,
          MetaTags: MetaTags || [],
          PictureGallery: PictureGallery || [],
          VideoGallery: VideoGallery || [],
          References: References || [],
        },
        { new: true, runValidators: true }
      );
      
      if (!contentMaster) {
        return res.json(__requestResponse("404", "Content not found"));
      }
      
      res.json(__requestResponse("200", "Content updated successfully", contentMaster));
    } else {
      // Add new content
      contentMaster = new ContentMaster({
        AssetId: AssetId || null,
        ContentTypeId: ContentTypeId || null,
        ContentTitle,
        GrantingBody,
        Date: Date,
        ContentPriority,
        ValidUpto: ValidUpto ,
        ContentImage,
        ShortDescription,
        LongDescription,
        MetaTags: MetaTags || [],
        PictureGallery: PictureGallery || [],
        VideoGallery: VideoGallery || [],
        References: References || []
      });
      
      await contentMaster.save();
      res.json(__requestResponse("200", "Content created successfully", contentMaster));
    }
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Get ContentMaster List with Pagination
const contentMasterList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      AssetId,
      ContentTypeId,
      ContentPriority
    } = req.body;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { ContentTitle: { $regex: search, $options: "i" } },
        { GrantingBody: { $regex: search, $options: "i" } },
        { ShortDescription: { $regex: search, $options: "i" } }
      ];
    }
    
    if (AssetId) filter.AssetId = AssetId;
    if (ContentTypeId) filter.ContentTypeId = ContentTypeId;
    if (ContentPriority) filter.ContentPriority = ContentPriority;

    const total = await ContentMaster.countDocuments(filter);
    const list = await ContentMaster.find(filter)
      // .populate("AssetId", "AssetName Logo ProfilePicture MedicalSpecialties")
      .populate({
        path: "AssetId",
        select: "AssetName Logo ProfilePicture MedicalSpecialties",
        populate: {
          path: "MedicalSpecialties",
          select: "lookup_value"
        }
      })

      .populate("ContentTypeId", "lookup_value")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();//Use lean() for read-only operations

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

// Get ContentMaster by ID
const getContentMaster = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contentMaster = await ContentMaster.findById(id)
      .populate("AssetId", "AssetName")
      .populate("ContentTypeId", "LookupValue");
    
    if (!contentMaster) {
      return res.json(__requestResponse("404", "Content not found"));
    }
    
    res.json(__requestResponse("200", "Content retrieved successfully", contentMaster));
  } catch (error) {
    res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Delete ContentMaster
const deleteContentMaster = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contentMaster = await ContentMaster.findByIdAndDelete(id);
    
    if (!contentMaster) {
      return res.json(__requestResponse("404", "Content not found"));
    }
    
    res.json(__requestResponse("200", "Content deleted successfully"));
  } catch (error) {
    res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

module.exports = {
  test,
  saveContentMaster,
  contentMasterList,
  getContentMaster,
  deleteContentMaster
};