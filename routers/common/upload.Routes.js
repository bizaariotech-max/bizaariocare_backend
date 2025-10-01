const express = require("express");
const router = express.Router();
const { __uploadImage } = require("../../utils/multer");
const {
  AddImage,
  AddImageOrDoc,
  GenrateQrCode,
} = require("../../controllers/common/upload.Controller");

// Routes
router.post("/AddImage", __uploadImage, AddImage);
router.post("/AddImage_Or_Doc", __uploadImage, AddImageOrDoc);

//GenrateQrCode
router.get("/GenrateQrCode/:id", GenrateQrCode);



module.exports = router;
