const mongoose =require("mongoose");
const upload = require("../../middlewares/siglefile.js");

// const Joi = require ("joi");

const  { __requestResponse, __deepClone } =require ("../../utils/constant.js");
const  {
  __NO_LOOKUP_LIST,
  __SUCCESS,
  __SOME_ERROR,
  __VALIDATION_ERROR,
} =require ("../../utils/variable.js");

const LookupMaster = require ("../../modals/Common/lookupmodel.js");
const AssetMaster = require("../../modals/AssetMaster/AssetMaster.js");

// * LookupList (legacy API)
const lookupList = async (req, res) => {
  console.log(req.body);
  console.log("api common lookup list");
  try {
    if (!req?.body?.lookup_type || req?.body?.lookup_type.length === 0) {
      return res.json(__requestResponse("400", "Lookup type is required"));
    }

    if (req?.body?.lookup_type[0] === "asset_list") {
      // console.warn("kk");

      const assets = await AssetMaster.find();
      console.warn(assets, "assets");
      if (assets.length === 0) {
        return res.json(__requestResponse("404", "No Data found"));
      }
      return res.json(
        __requestResponse(
          "200",
          __SUCCESS,
          assets.map((item) => ({
            lookup_value: item?.AssetName,
            _id: item._id,
          }))
        )
      );
    }

    const list = await LookupMaster.find({
      lookup_type: { $in: req?.body?.lookup_type || [] },
      ...(mongoose.Types.ObjectId.isValid(req.body?.parent_lookup_id) && {
        parent_lookup_id: mongoose.Types.ObjectId(req.body?.parent_lookup_id),
      }),
      is_active: true,
    })
      .populate("parent_lookup_id", "lookup_value")
      .lean();

    if (list.length == 0) {
      return res.json(__requestResponse("404", "No Data found"));
    }

    const transformedList = list.map((item) => ({
      ...item,
      parent_lookup_name: item?.parent_lookup_id?.lookup_value || "",
      parent_lookup_id: item?.parent_lookup_id?._id || "",
    }));

    return res.json(__requestResponse("200", __SUCCESS, transformedList));

    // return res.json(__requestResponse("200", __SUCCESS, list));
  } catch (error) {
    return res.json(__requestResponse("500", error.message));
  }
};

// // * LookupList (new API with transformations) no use
// export const lookupListxxx = async (req, res) => {
//   try {
//     if (!req?.body?.lookup_type || req?.body?.lookup_type.length === 0) {
//       return res.json(__requestResponse("400", "Lookup type is required"));
//     }

//     if (
//       [
//         "station_speciality_brands",
//         "station_speciality_odop",
//         "station_speciality_exports",
//         "station_speciality_localcrops",
//         "station_speciality_vocalforlocal",
//         "station_speciality_localsweets",
//         "station_speciality_localsnacks",
//         "station_speciality_localcuisine",
//         "station_speciality_localspices",
//         "station_speciality_localstreetfoods",
//       ].includes(req?.body?.lookup_type[0])
//     ) {
//       const idObjects = {
//         station_speciality_brands: mongoose.Types.ObjectId(
//           "68a408fcd217a77d4590d2d4"
//         ),
//         station_speciality_odop: mongoose.Types.ObjectId(
//           "68a408fcd217a77d4590d2d1"
//         ),
//         station_speciality_exports: mongoose.Types.ObjectId(
//           "68a408fcd217a77d4590d2d2"
//         ),
//         station_speciality_localcrops: mongoose.Types.ObjectId(
//           "68a408fcd217a77d4590d2d3"
//         ),
//         station_speciality_vocalforlocal: mongoose.Types.ObjectId(
//           "68a42f9044f53e4936b744dd"
//         ),
//         station_speciality_localsweets: mongoose.Types.ObjectId(
//           "68a42f9044f53e4936b744de"
//         ),
//         station_speciality_localsnacks: mongoose.Types.ObjectId(
//           "68a42f9044f53e4936b744df"
//         ),
//         station_speciality_localcuisine: mongoose.Types.ObjectId(
//           "68a42f9044f53e4936b744e0"
//         ),
//         station_speciality_localspices: mongoose.Types.ObjectId(
//           "68a42f9044f53e4936b744e1"
//         ),
//         station_speciality_localstreetfoods: mongoose.Types.ObjectId(
//           "68a42f9044f53e4936b744e2"
//         ),
//       };

//       const stationSpecialityList = await ODOPMaster.find({
//         CityId: mongoose.Types.ObjectId(req.body?.parent_lookup_id),
//         StationSpecialityTypeId: idObjects[req?.body?.lookup_type[0]],
//       });

//       return res.json(
//         __requestResponse(
//           "200",
//           __SUCCESS,
//           __deepClone(stationSpecialityList).map((item) => ({
//             lookup_value: item?.Name,
//             _id: item._id,
//           }))
//         )
//       );
//     }

//     if (req?.body?.lookup_type[0] === "city_indicator") {
//       const users = await CityIndicator.find();
//       if (users.length === 0) {
//         return res.json(__requestResponse("404", "No Data found"));
//       }
//       return res.json(
//         __requestResponse(
//           "200",
//           __SUCCESS,
//           users.map((item) => ({
//             lookup_value: item?.CityIndicatorName,
//             _id: item._id,
//           }))
//         )
//       );
//     }

//     if (req?.body?.lookup_type[0] === "user_master_list") {
//       const users = await UserMaster.find();
//       if (users.length === 0) {
//         return res.json(__requestResponse("404", "No Data found"));
//       }
//       return res.json(
//         __requestResponse(
//           "200",
//           __SUCCESS,
//           users.map((item) => ({
//             lookup_value: item?.FullName,
//             _id: item._id,
//           }))
//         )
//       );
//     }

//     const list = await LookupMaster.find({
//       lookup_type: { $in: req?.body?.lookup_type || [] },
//       ...(mongoose.Types.ObjectId.isValid(req.body?.parent_lookup_id) && {
//         parent_lookup_id: mongoose.Types.ObjectId(req.body?.parent_lookup_id),
//       }),
//       is_active: true,
//     })
//       .populate("parent_lookup_id", "lookup_value")
//       .lean();

//     if (list.length === 0) {
//       return res.json(__requestResponse("404", "No Data found"));
//     }

//     const transformedList = list.map((item) => ({
//       ...item,
//       parent_lookup_name: item?.parent_lookup_id?.lookup_value || "",
//       parent_lookup_id: item?.parent_lookup_id?._id || "",
//     }));

//     return res.json(__requestResponse("200", __SUCCESS, transformedList));
//   } catch (error) {
//     console.error("LookupList Error:", error);
//     return res.json(__requestResponse("500", error.message));
//   }
// };

// * LookupList by Parent
// const lookuplistByParentSchema = Joi.object({
//   parentId: Joi.string().required(),
//   lookupType: Joi.string().required(),
// });

// export const lookuplistByParent = async (req, res) => {
//   try {
//     const { error } = lookuplistByParentSchema.validate(req.body);
//     if (error) {
//       return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
//     }
//     const { parentId, lookupType } = req.body;

//     const list = await LookupMaster.find({
//       lookup_type: lookupType,
//       parent_lookup_id: mongoose.Types.ObjectId(parentId),
//     });

//     if (!list || list.length === 0) {
//       return res.json(__requestResponse("404", __NO_LOOKUP_LIST));
//     }

//     return res.json(__requestResponse("200", __SUCCESS, list));
//   } catch (error) {
//     console.log(error.message);
//     return res.json(__requestResponse("500", __SOME_ERROR));
//   }
// };


  module.exports = {
    lookupList,
  };