const express = require("express");
const router = express.Router();
const {
  test,
  getLookupTypeList,
  getParentLookupTypeList,
  lookupList,
  saveLookup,
  lookupDisplayList,
} = require("../../controllers/AdminLookup/adminLookup.Controler");

const {
  LookupParser,
  checkLookupforInsert,
} = require("../../middlewares/adminLookups.middleware");

// Test
router.get("/test", test);

//  Lookup Types
router.get("/LookupTypeList", getLookupTypeList);
router.get("/ParentLookupTypeList", getParentLookupTypeList);

// Lookup List
router.post("/LookupList", LookupParser, lookupList);

//  Save Lookup
router.post("/SaveLookup", checkLookupforInsert, saveLookup);

//  Lookup Display List
router.post("/LookupDisplayList", lookupDisplayList);

module.exports = router;
