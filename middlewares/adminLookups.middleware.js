const { default: mongoose } = require("mongoose");

const {
  __requestResponse,
  __generateAuthToken,
} = require("../utils/constant");
const {
  __MISSING_LOOKUPCODES,
  __BLANK_LOOKUPCODE,
  __LOOKUP_VALUE_MANDATORY,
  __LOOKUP_TYPE_MANDATORY,
  __PARENT_LOOKUP_MANDATORY,
  __LOOKUP_EXIST,
} = require("../utils/variable");

// const TlbEnvSetting = require("../modals/Common/AdminEnvSetting");
const TlbLookup = require("../modals/Common/lookupmodel");

const LookupParser = (req, res, next) => {
  //Parse the request string for Lookup codes and get an array from the string of codes
  //to get all those lookup lists
  let dd = req.body.lookupcodes;

  //console.log("req.body.lookupcodes", req.body.lookupcodes);
  let newCodes = [];
  if (dd?.length === 0) {
    return res.json(__requestResponse("501", __MISSING_LOOKUPCODES));
  } else {
    let _codes = dd?.split(",");
    let _emptyFound = false;
    _codes?.forEach((element) => {
      if (element.trim() === "") {
        _emptyFound = true;
      } else {
        newCodes.push(element);
      }
    });
    console.log("newCodes", newCodes);
    if (!_emptyFound) {
      req.body.CodeList = _codes;
    } else {
      req.body.CodeList = newCodes;
    }
    next();
  }
};

const checkLookupforInsert = async (req, res, next) => {
  let _default_client_id = "";
  let _parent_lookup_needed = false;
  let _lookup_id = req.body.lookup_id;
  let _lookup_type = req.body.lookup_type;
  let _lookup_value = req.body.lookup_value;
  let _client_id = req.body.client_id;
  let _parent_lookup_Id = req.body.parent_lookup_id;
  let _parent_lookup_type = req.body.parent_lookup_type;
  let _sort_order = 0;
  let _is_active = req.body.is_active;
  let _managed_by_ui = req.body.managed_by_ui;

  //get the defult client_id from env_sittings table if there is no client id supplied
  if (_client_id === null || _client_id === "") {
    // const drfaulClientId = await TlbEnvSetting.findOne({
    //   EnvSettingCode: "DEFAULT_CLIENT_ID",
    // });
    // _default_client_id = drfaulClientId.EnvSettingValue;
    _default_client_id = "68a41d11ca20878102c07ebz";
  } else {
    _default_client_id = _client_id;
  }

  //Check the lookup type for mandatory
  if (_lookup_type === null || _lookup_type === "") {
    return res.json(__requestResponse("501", __LOOKUP_TYPE_MANDATORY));
  }
  //Check the lookup value for mandatory
  if (_lookup_value === null || _lookup_type === "") {
    return res.json(__requestResponse("501", __LOOKUP_VALUE_MANDATORY));
  }

  if (_lookup_id == null || _lookup_id == "") {
    //Duplicate check for lookup been inserted
    const checkdup = await TlbLookup.findOne({
      lookup_type: _lookup_type,
      lookup_value: _lookup_value,
    });

    if (checkdup) {
      return res.json(__requestResponse("501", __LOOKUP_EXIST));
    }
  }
  //Check if parent id is there for supplied lookup type then check for mandatory
  await TlbLookup.find({ lookup_type: _lookup_type })
    .sort({ sort_order: -1 })
    .limit(1)
    .then((x) => {
      if (x.length > 0) {
        if (x[0].parent_lookup_type != null) {
          _parent_lookup_type = x[0].parent_lookup_type.trim();
        }

        if (x[0].sort_order != null) {
          if (_lookup_id == null || _lookup_id == "") {
            _sort_order = parseInt(x[0].sort_order) + 1;
          } else {
            _sort_order = parseInt(x[0].sort_order);
          }
        }

        if (x[0].parent_lookup_Id) {
          if (!_parent_lookup_Id) {
            _parent_lookup_needed = true;
          } else {
            _parent_lookup_needed = false;
          }
        } else {
          _parent_lookup_needed = false;
        }
      }
    });

  if (_parent_lookup_needed) {
    return res.json(__requestResponse("501", __PARENT_LOOKUP_MANDATORY));
  } else {
    req.sort_order = _sort_order;
    req.is_active = _is_active;
    req.managed_by_ui = _managed_by_ui;
    req.parent_lookup_type = _parent_lookup_type;
    req.client_id = _default_client_id;
  }

  next();
};

module.exports = {
  LookupParser,
  checkLookupforInsert,
};
