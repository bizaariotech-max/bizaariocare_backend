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
const generateAndUploadQRCodex = async (patientId) => {
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
        light: "#FFFFFF",
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

const generateAndUploadQRCodecx = async (patientId) => {
  try {
    // Generate QR code buffer with BLACK on WHITE
    const qrBuffer = await QRCode.toBuffer(patientId, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 490, // Match the resize dimensions
      margin: 1,
      color: {
        dark: "#000000", // BLACK QR code
        light: "#FFFFFF", // WHITE background
      },
    });

    const baseImagePath = path.resolve("./uploads/qr_temp.png");
    const outputPath = path.resolve(`./uploads/qr_${patientId}.png`);

    // Load base image
    const baseImage = await Jimp.read(baseImagePath);

    // Create a WHITE background rectangle first
    const whiteBackground = new Jimp(490, 490, 0xffffffff); // Pure white

    // Load QR image
    const qrImage = await Jimp.read(qrBuffer);

    // Composite QR on white background
    whiteBackground.composite(qrImage, 0, 0);

    // Then composite the white background + QR onto base image
    baseImage.composite(whiteBackground, 320, 555);

    // Save output temporarily
    await baseImage.writeAsync(outputPath);

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(outputPath, {
      folder: "qr",
      resource_type: "auto",
      public_id: `patient_qr_${patientId}`,
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

const generateAndUploadQRCode_working = async (patientId) => {
  try {
    const baseImagePath = path.resolve("./uploads/qr_temp.png");
    const outputPath = path.resolve(`./uploads/qr_${patientId}.png`);

    // Load base image first to get its dimensions
    const baseImage = await Jimp.read(baseImagePath);
    const baseWidth = baseImage.bitmap.width; // 400
    const baseHeight = baseImage.bitmap.height; // 400

    console.log(`Base image size: ${baseWidth}x${baseHeight}`);

    // Calculate QR code size (should fit within base image with padding)
    const qrSize = Math.min(baseWidth, baseHeight) - 20; // Leave 10px padding on each side
    const qrX = (baseWidth - qrSize) / 2; // Center horizontally
    const qrY = (baseHeight - qrSize) / 2; // Center vertically

    console.log(`QR size: ${qrSize}x${qrSize} at position (${qrX}, ${qrY})`);

    // Generate QR code with BLACK on WHITE
    const qrBuffer = await QRCode.toBuffer(patientId, {
      errorCorrectionLevel: "H",
      type: "png",
      width: qrSize,
      margin: 0, // No margin since we're adding padding
      color: {
        dark: "#000000", // BLACK QR code
        light: "#FFFFFF", // WHITE background
      },
    });

    // Load QR image
    const qrImage = await Jimp.read(qrBuffer);

    // Create a white background rectangle that matches QR size
    const whiteBackground = new Jimp(qrSize, qrSize, 0xffffffff); // Pure white

    // Composite QR on white background
    whiteBackground.composite(qrImage, 0, 0);

    // Composite white background + QR onto base image (centered)
    baseImage.composite(whiteBackground, qrX, qrY);

    // Save output
    await baseImage.writeAsync(outputPath);

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(outputPath, {
      folder: "qr",
      resource_type: "auto",
      public_id: `patient_qr_${patientId}`,
    });

    // Delete local file
    __deleteFile(outputPath);

    console.log("✅ QR code generated and uploaded:", result.secure_url);

    return result.secure_url;
  } catch (error) {
    console.error("QR Generation Error:", error.message);
    throw error;
  }
};

// Generate QR code - BLACK on WHITE (No base image needed)
const generateAndUploadQRCode = async (patientId) => {
  try {
    const outputPath = path.resolve(`./uploads/qr_${patientId}.png`);

    // Generate BLACK on WHITE QR code directly
    await QRCode.toFile(outputPath, patientId, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 500,
      margin: 2,
      color: {
        dark: "#000000", // BLACK QR code
        light: "#FFFFFF", // WHITE background
      },
    });

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(outputPath, {
      folder: "qr",
      resource_type: "auto",
      public_id: `patient_qr_${patientId}`,
    });

    // Delete local file after upload
    __deleteFile(outputPath);

    console.log("✅ QR code generated:", result.secure_url);

    return result.secure_url;
  } catch (error) {
    console.error("QR Generation Error:", error.message);
    throw error;
  }
};

// Generate QR code with patient details URL
const generateAndUploadQRCode_2 = async (patientId, baseUrl) => {
  try {
    // Create URL that will be encoded in QR - this is what scanner will open
    const patientDetailsUrl = `${baseUrl}/patient-details/${patientId}`;

    // Generate QR code buffer with BLACK on WHITE
    const qrBuffer = await QRCode.toBuffer(patientDetailsUrl, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 400,
      margin: 1,
      color: {
        dark: "#000000", // QR code color - BLACK
        light: "#FFFFFF", // Background - WHITE
      },
    });

    const baseImagePath = path.resolve("./uploads/qrbg.jpeg");
    const outputPath = path.resolve(`./uploads/qr_${patientId}.png`);

    // Load images
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
      public_id: `patient_qr_${patientId}`,
    });

    // Delete local file after upload
    __deleteFile(outputPath);

    console.log("✅ QR code generated with URL:", patientDetailsUrl);
    console.log("✅ Uploaded to:", result.secure_url);

    return {
      qrCodeUrl: result.secure_url,
      patientDetailsUrl: patientDetailsUrl,
    };
  } catch (error) {
    console.error("QR Generation Error:", error.message);
    throw error;
  }
};

const testBaseImage = async () => {
  const baseImagePath = path.resolve("./uploads/qr_temp.png");
  const image = await Jimp.read(baseImagePath);

  console.log("Base Image Width:", image.bitmap.width);
  console.log("Base Image Height:", image.bitmap.height);

  // Get pixel color at QR position (to see if it's red)
  const pixelColor = image.getPixelColor(320, 555);
  console.log("Pixel color at QR position:", pixelColor.toString(16));
};

// testBaseImage();


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
