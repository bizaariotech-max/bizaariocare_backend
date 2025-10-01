const PatientMaster = require("../../modals/Patient/PatientMaster");
const { __requestResponse } = require("../../utils/constant");
const {
  __SUCCESS,
  __SOME_ERROR,
} = require("../../utils/variable");
const { __deepClone } = require("../../utils/constant");
const { __CreateAuditLog } = require("../../utils/auditlog");
const mongoose = require("mongoose"); // Add this import
const QRCode = require("qrcode");
const Jimp = require("jimp");
const path = require("path");
const cloudinary = require("cloudinary").v2;

// Test Route
exports.test = async (req, res) => {
  return res.json(__requestResponse("200", "Patient Master API Working"));
};

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
        dark: "#ffffffff",
        light: "#d60d2f",
      },
    });

    const baseImagePath = path.resolve("./uploads/qrbg.jpeg");
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

// Save Patient (Add/Edit in single API) - WITH QR CODE GENERATION
exports.SavePatient = async (req, res) => {
  try {
    const { _id } = req.body;
    let patient;
    let oldValue = null;
    let isNewPatient = false;

    // Remove _id from patientData to avoid MongoDB issues
    const patientData = { ...req.body };
    delete patientData._id;

    // Check if _id exists and is not null/empty - if true, update; otherwise, create new
    if (_id && _id !== null && _id !== "") {
      // Get old value for audit log
      oldValue = await PatientMaster.findById(_id).lean();

      if (!oldValue) {
        return res.json(__requestResponse("404", "Patient not found"));
      }

      // Update existing patient (QR code remains unchanged)
      patient = await PatientMaster.findByIdAndUpdate(_id, patientData, {
        new: true,
        runValidators: true,
      })
        .populate("Nationality", "StationName")
        .populate("CountryOfResidence", "StationName")
        .populate("State", "StationName")
        .populate("City", "StationName")
        .populate("InsuranceProvider", "LookupValue")
        .populate("Relationship", "LookupValue")
        .populate("CreatedBy", "AssetName")
        .populate("UpdatedBy", "AssetName");

      // Create audit log for update
      await __CreateAuditLog(
        "patient_master",
        "UPDATE",
        null,
        oldValue,
        patient.toObject(),
        patient._id
      );
    } else {
      // Create new patient (without QR code first)
      isNewPatient = true;
      patient = await PatientMaster.create(patientData);

      // GENERATE QR CODE FOR NEW PATIENT
      try {
        const qrCodeUrl = await generateAndUploadQRCode(patient._id.toString());

        // Update patient with QR code URL
        patient = await PatientMaster.findByIdAndUpdate(
          patient._id,
          { QRCode: qrCodeUrl },
          { new: true }
        );

        console.log("✅ Patient created with QR code:", patient._id);
      } catch (qrError) {
        console.error(
          "⚠️ QR code generation failed, but patient created:",
          qrError.message
        );
        // Patient still created, just without QR code
      }

      // Fetch with populated fields
      patient = await PatientMaster.findById(patient._id)
        .populate("Nationality", "StationName")
        .populate("CountryOfResidence", "StationName")
        .populate("State", "StationName")
        .populate("City", "StationName")
        .populate("InsuranceProvider", "LookupValue")
        .populate("Relationship", "LookupValue")
        .populate("CreatedBy", "AssetName")
        .populate("UpdatedBy", "AssetName");

      // Create audit log for creation
      await __CreateAuditLog(
        "patient_master",
        "CREATE",
        null,
        null,
        patient.toObject(),
        patient._id
      );
    }

    return res.json(__requestResponse("200", __SUCCESS, patient));
  } catch (error) {
    console.error("Save Patient Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Optional: Separate endpoint to regenerate QR code if needed
exports.regeneratePatientQRCode = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await PatientMaster.findById(id);
    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    // Generate new QR code
    const qrCodeUrl = await generateAndUploadQRCode(patient._id.toString());

    // Update patient with new QR code
    patient.QRCode = qrCodeUrl;
    await patient.save();

    return res.json(
      __requestResponse("200", "QR code regenerated successfully", {
        _id: patient._id,
        QRCode: qrCodeUrl,
      })
    );
  } catch (error) {
    console.error("Regenerate QR Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Save Patient (Add/Edit in single API)
exports.SavePatientxx = async (req, res) => {
  try {
    const { _id } = req.body;
    let patient;
    let oldValue = null;

    // Remove _id from patientData to avoid MongoDB issues
    const patientData = { ...req.body };
    delete patientData._id;

    // Check if _id exists and is not null/empty - if true, update; otherwise, create new
    if (_id && _id !== null && _id !== "") {
      // Get old value for audit log
      oldValue = await PatientMaster.findById(_id).lean();

      if (!oldValue) {
        return res.json(__requestResponse("404", "Patient not found"));
      }

      // Update existing patient
      patient = await PatientMaster.findByIdAndUpdate(_id, patientData, {
        new: true,
        runValidators: true,
      })
        .populate("Nationality", "StationName")
        .populate("CountryOfResidence", "StationName")
        .populate("State", "StationName")
        .populate("City", "StationName")
        .populate("InsuranceProvider", "LookupValue")
        .populate("Relationship", "LookupValue")
        .populate("CreatedBy", "AssetName")
        .populate("UpdatedBy", "AssetName");

      // Create audit log for update
      await __CreateAuditLog(
        "patient_master",
        "UPDATE",
        null,
        oldValue,
        patient.toObject(),
        patient._id
      );
    } else {
      // Create new patient
      patient = await PatientMaster.create(patientData);

      patient = await PatientMaster.findById(patient._id)
        .populate("Nationality", "StationName")
        .populate("CountryOfResidence", "StationName")
        .populate("State", "StationName")
        .populate("City", "StationName")
        .populate("InsuranceProvider", "LookupValue")
        .populate("Relationship", "LookupValue")
        .populate("CreatedBy", "AssetName")
        .populate("UpdatedBy", "AssetName");

      // Create audit log for creation
      await __CreateAuditLog(
        "patient_master",
        "CREATE",
        null,
        null,
        patient.toObject(),
        patient._id
      );
    }

    return res.json(__requestResponse("200", __SUCCESS, patient));
  } catch (error) {
    console.error("Save Patient Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Patient List (with pagination + population + filters)
exports.patientList = async (req, res) => {
  try {
    // Handle both req.body and req.query to support GET and POST requests
    const requestData = req.body || req.query || {};
    const {
      page = 1,
      limit = 10,
      search = "",
      Gender,
      Nationality,
      CountryOfResidence,
      State,
      City,
      IsVerified,
      IsActive,
      InsuranceProvider,
    } = requestData;

    const query = { IsDeleted: false };

    // Search filter (Patient Name, PatientId, Phone, Email, City)
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { Name: regex },
        { PatientId: regex },
        { PhoneNumber: regex },
        { EmailAddress: regex },
        { City: regex },
        { PostalCode: regex }
      ];
    }

    // Gender filter
    if (Gender) {
      query.Gender = Gender;
    }

    // Nationality filter - validate ObjectId
    if (Nationality && mongoose.Types.ObjectId.isValid(Nationality)) {
      query.Nationality = Nationality;
    }

    // Country of Residence filter - validate ObjectId
    if (CountryOfResidence && mongoose.Types.ObjectId.isValid(CountryOfResidence)) {
      query.CountryOfResidence = CountryOfResidence;
    }

    // State filter - validate ObjectId
    if (State && mongoose.Types.ObjectId.isValid(State)) {
      query.State = State;
    }

    // City filter
    if (City) {
      query.City = { $regex: City, $options: "i" };
    }

    // Verification status filter
    if (IsVerified !== undefined) {
      query.IsVerified = IsVerified;
    }

    // Active status filter
    if (IsActive !== undefined) {
      query.IsActive = IsActive;
    }

    // Insurance Provider filter - validate ObjectId
    if (InsuranceProvider && mongoose.Types.ObjectId.isValid(InsuranceProvider)) {
      query.InsuranceProvider = InsuranceProvider;
    }

    const total = await PatientMaster.countDocuments(query);
    const list = await PatientMaster.find(query)
      // .populate("Nationality", "lookup_value")
      // .populate("CountryOfResidence", "lookup_value")
      .populate("Nationality", "StationName")
      .populate("CountryOfResidence", "StationName")
      .populate("State", "StationName")
      .populate("City", "StationName")
      .populate("InsuranceProvider", "lookup_value")
      .populate("Relationship", "lookup_value")
      .populate("CreatedBy", "AssetName")
      .populate("UpdatedBy", "AssetName")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: Number(page),
        limit: Number(limit),
        filters: {
          search,
          Gender,
          Nationality,
          CountryOfResidence,
          State,
          City,
          IsVerified,
          IsActive,
          InsuranceProvider,
        },
        list: __deepClone(list),
      })
    );
  } catch (error) {
    console.error("Patient List Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Get Patient By ID
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await PatientMaster.findById(id)
      .populate("Nationality", "StationName")
      .populate("CountryOfResidence", "StationName")
      .populate("State", "StationName")
      .populate("InsuranceProvider", "lookup_value")
      .populate("Relationship", "lookup_value")
      .populate("CreatedBy", "AssetName")
      .populate("UpdatedBy", "AssetName")
      .lean();

    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, patient));
  } catch (error) {
    console.error("Get Patient Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Get Patient By PatientId
exports.getPatientByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const patient = await PatientMaster.findByPatientId(patientId);

    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, patient));
  } catch (error) {
    console.error("Get Patient By PatientId Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Delete Patient (Soft Delete)
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the record before deletion for audit log
    const oldValue = await PatientMaster.findById(id).lean();
    
    if (!oldValue) {
      return res.json(__requestResponse("404", "Patient not found"));
    }
    
    if (oldValue.IsDeleted) {
      return res.json(__requestResponse("400", "Patient already deleted"));
    }
    
    // Soft delete - set IsDeleted to true
    const patient = await PatientMaster.findByIdAndUpdate(
      id,
      { IsDeleted: true, UpdatedBy: req.body.UpdatedBy },
      { new: true }
    );

    // Create audit log for deletion
    await __CreateAuditLog(
      "patient_master",
      "DELETE",
      null,
      oldValue,
      patient.toObject(),
      id,
    );
    
    return res.json(__requestResponse("200", "Patient deleted successfully"));
  } catch (error) {
    console.error("Delete Patient Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Get Patients by Location
exports.getPatientsByLocation = async (req, res) => {
  try {
    const { countryId, stateId } = req.params;
    
    const patients = await PatientMaster.findByLocation(countryId, stateId);

    return res.json(__requestResponse("200", __SUCCESS, patients));
  } catch (error) {
    console.error("Get Patients By Location Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Search Patients
exports.searchPatients = async (req, res) => {
  try {
    const { searchTerm } = req.params;
    
    const patients = await PatientMaster.searchPatients(searchTerm);

    return res.json(__requestResponse("200", __SUCCESS, patients));
  } catch (error) {
    console.error("Search Patients Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Get Patients by Verification Status
exports.getPatientsByVerificationStatus = async (req, res) => {
  try {
    const { isVerified } = req.params;
    const verificationStatus = isVerified === 'true';
    
    const patients = await PatientMaster.findByVerificationStatus(verificationStatus);

    return res.json(__requestResponse("200", __SUCCESS, patients));
  } catch (error) {
    console.error("Get Patients By Verification Status Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Update Patient Verification Status
exports.updateVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { IsVerified, UpdatedBy } = req.body;
    
    // Get old value for audit log
    const oldValue = await PatientMaster.findById(id).lean();
    
    if (!oldValue) {
      return res.json(__requestResponse("404", "Patient not found"));
    }
    
    // Update verification status
    const patient = await PatientMaster.findByIdAndUpdate(
      id,
      { IsVerified, UpdatedBy },
      { new: true }
    )
    .populate("Nationality", "StationName")
    .populate("CountryOfResidence", "StationName")
    .populate("State", "StationName")
    .populate("InsuranceProvider", "LookupValue")
    .populate("Relationship", "LookupValue")
    .populate("CreatedBy", "AssetName")
    .populate("UpdatedBy", "AssetName");

    // Create audit log for verification update
    await __CreateAuditLog(
      "patient_master",
      "UPDATE",
      null,
      oldValue,
      patient.toObject(),
      id,
    );
    
    return res.json(__requestResponse("200", __SUCCESS, patient));
  } catch (error) {
    console.error("Update Verification Status Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};


// get patient by phone number
exports.getPatientByPhoneNumber = async (req, res) => {
  try {
    const { PhoneNumber } = req.params;

    const patient = await PatientMaster.findOne({ PhoneNumber: PhoneNumber });

    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, patient));
  } catch (error) {
    console.error("Get Patient By PatientId Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};