const express = require("express");
const { lookupList } = require("../../controllers/common/lookup.Controller");

const router = express.Router();

router.post("/LookupList", lookupList);

module.exports = router;