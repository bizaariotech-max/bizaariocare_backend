const path = require("path");
const cloudinary = require("cloudinary").v2;
const AdminEnvSetting = require("../../modals/Common/AdminEnvSetting");
const { __requestResponse, __deleteFile } = require("../../utils/constant");
const { __SUCCESS, __SOME_ERROR } = require("../../utils/variable");


//  Add Image (image/video/pdf) .
const AddImage = async (req, res) => {
  try {
    if (!req.files || !req.files.file || req.files.file.length === 0) {
      return res.json(__requestResponse("400", "No files uploaded"));
    }

    const __ImagePathDetails = await AdminEnvSetting.findOne({
      EnvSettingCode: "IMAGE_PATH",
    });

    const uploadedFiles = [];

    for (const file of req.files.file) {
      const filePath = path.resolve("./uploads/" + file.filename);
      const ext = path.extname(file.originalname).toLowerCase();

      if (ext === ".pdf") {
        // Store PDF locally
        uploadedFiles.push({
          filename: file.filename,
          file_type: "pdf",
          full_URL:
            process.env.NODE_ENV === "development"
              ? `${process.env.LOCAL_IMAGE_URL}/uploads/${file.filename}`
              : `${__ImagePathDetails?.EnvSettingTextValue}/uploads/${file.filename}`,
          base_URL:
            process.env.NODE_ENV === "development"
              ? process.env.LOCAL_IMAGE_URL
              : __ImagePathDetails?.EnvSettingTextValue,
        });
      } else {
        // Upload image/video to Cloudinary
        const result = await cloudinary.uploader.upload(filePath, {
          folder: "bizaario_folder",
          resource_type: "auto",
        });

        __deleteFile(filePath);

        uploadedFiles.push({
          filename: file.filename,
          file_type: file.mimetype.startsWith("video/") ? "video" : "image",
          public_id: result.public_id,
          full_URL: result.secure_url,
          base_URL:
            process.env.NODE_ENV === "development"
              ? process.env.LOCAL_IMAGE_URL
              : __ImagePathDetails?.EnvSettingTextValue,
        });
      }
    }

    return res.json(__requestResponse("200", __SUCCESS, uploadedFiles));
  } catch (error) {
    console.error("Upload Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

//  Add Image or Document (Cloudinary with raw support)
const AddImageOrDoc = async (req, res) => {
  try {
    if (!req.files || !req.files.file || req.files.file.length === 0) {
      return res.json(__requestResponse("400", "No files uploaded"));
    }

    const __ImagePathDetails = await AdminEnvSetting.findOne({
      EnvSettingCode: "IMAGE_PATH",
    });

    const uploadedImages = [];

    for (const file of req.files.file) {
      const filePath = path.resolve("./uploads/" + file.filename);

      let resourceType = "image";
      if (file.mimetype === "application/pdf") {
        resourceType = "raw";
      }

      const result = await cloudinary.uploader.upload(filePath, {
        folder: "tripexplore_docs",
        resource_type: resourceType,
      });

      __deleteFile(filePath);

      uploadedImages.push({
        filename: file.filename,
        public_id: result.public_id,
        full_URL: result.secure_url,
        base_URL:
          process.env.NODE_ENV === "development"
            ? process.env.LOCAL_IMAGE_URL
            : __ImagePathDetails?.EnvSettingTextValue,
      });
    }

    return res.json(__requestResponse("200", __SUCCESS, uploadedImages));
  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};


const QRCode = require("qrcode");
const Jimp = require("jimp");

const GenrateQrCode = async (req, res) => {
  try {
    // http://localhost:8012/api/v1/common/GenrateQrCode/68a83ee3544ccaa184bc2d18
    const { id } = req.params;
    const qrBuffer = await QRCode.toBuffer(id, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 400,
      margin: 1,
      color: {
        dark: "#ffffffff", // QR code color
        light: "#d60d2f", // transparent background
      },
    });
    const baseImagePath = path.resolve("./uploads/qrbg.jpeg");
    const outputPath = "uploads/qr_" + id + ".png";

    // 2. Load base image & QR image
    const baseImage = await Jimp.read(baseImagePath);
    const qrImage = await Jimp.read(qrBuffer);

    // 3. Resize QR code to fit (adjust size as per template)
    qrImage.resize(490, 490); // set size as needed

    // 4. Composite QR code on top of base image
    // Example coordinates → (x, y) adjust until it aligns
    baseImage.composite(qrImage, 320, 555);

    // 5. Save output
    await baseImage.writeAsync(outputPath);

    console.log("✅ QR code generated and placed successfully:", outputPath);
    const __ImagePathDetails = await AdminEnvSetting.findOne({
      EnvSettingCode: "IMAGE_PATH",
    });
    const filePath = path.resolve("./" + outputPath);

    const result = await cloudinary.uploader.upload(filePath, {
      folder: "qr",
      resource_type: "auto",
    });
    __deleteFile(filePath);
    return res.json(
      __requestResponse("200", __SUCCESS, {
        public_id: result.public_id,
        full_URL: result.secure_url,
        base_URL:
          process.env.NODE_ENV === "development"
            ? process.env.LOCAL_IMAGE_URL
            : __ImagePathDetails?.EnvSettingTextValue,
      })
    );
  } catch (error) {
    console.error("Upload Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

module.exports = {
  AddImage,
  AddImageOrDoc,
  GenrateQrCode,
};
