const express = require("express");
const router = express.Router();
const { __uploadImage } = require("../../utils/multer");
const { AddImage, AddImageOrDoc } = require("../../controllers/common/upload.Controller");

// Routes
router.post("/AddImage", __uploadImage, AddImage);
router.post("/AddImage_Or_Doc", __uploadImage, AddImageOrDoc);

module.exports = router;
