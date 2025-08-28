const multer = require("multer");
const path = require("path");

// * Storage config (same for both)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});



// *--- 1. Simple Upload (No MIME Type Filter) ---
const uploadSimple = multer({ storage });
// const __uploadImage = uploadSimple.fields([{ name: "file", maxCount: 1 }]);
const __uploadImage = uploadSimple.fields([{ name: "file", maxCount: 5 }]);




//* --- 2. Filtered Upload (Images, Videos, PDFs only) ---
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only images, PDFs, and videos are allowed."
      ),
      false
    );
  }
};

const uploadFiltered = multer({ storage, fileFilter });
const __uploadMedia = uploadFiltered.fields([{ name: "file", maxCount: 1 }]);

module.exports = {
  __uploadImage, // simple image upload (no validation)
  __uploadMedia, // validated upload for image/video/pdf
};






// const multer = require("multer");
// const path = require("path");

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
// const upload = multer({
//   storage: storage,
// });
// const __uploadImage = upload.fields([{ name: "file", maxCount: 1 }]);

// module.exports = { __uploadImage };
