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


// QR code
const QRCode = require("qrcode");
const Jimp = require("jimp");
// const path = require("path");
const { __deleteFile } = require("./constant");
const cloudinary = require("cloudinary").v2;

// Helper function to generate and upload QR code
const generateAndUploadQRCode = async (patientId) => {
  try {
    // Generate QR code buffer
    const qrBuffer = await QRCode.toBuffer(patientId, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 400,
      margin: 1,
      color: {
        // dark: "#ffffffff",
        // light: "#d60d2f",
        dark: "#000000",
        light: "#ffffff",
      },
    });

    const baseImagePath = path.resolve("./uploads/qr_temp.png");
    const outputPath = path.resolve(`./uploads/qr_${patientId}.png`);

    // Load base image & QR image
    const baseImage = await Jimp.read(baseImagePath);
    const qrImage = await Jimp.read(qrBuffer);

    // Resize QR code to fit
    qrImage.resize(490, 490);

    // Composite QR code on base image
    baseImage.composite(qrImage, 320, 555);

    // Save output temporarily
    await baseImage.writeAsync(outputPath);

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(outputPath, {
      folder: "qr",
      resource_type: "auto",
      public_id: `patient_qr_${patientId}`, // Consistent naming
    });

    // Delete local file after upload
    __deleteFile(outputPath);

    console.log("✅ QR code generated and uploaded:", result.secure_url);

    return result.secure_url;
  } catch (error) {
    console.error("QR Generation Error:", error.message);
    throw error;
  }
};

module.exports = {
  __uploadImage, // simple image upload (no validation)
  __uploadMedia, // validated upload for image/video/pdf
  generateAndUploadQRCode, // QR code generation and upload
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
