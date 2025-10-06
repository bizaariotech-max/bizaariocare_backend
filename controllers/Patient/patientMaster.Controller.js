const PatientMaster = require("../../modals/Patient/PatientMaster");
const { __requestResponse, __deleteFile } = require("../../utils/constant");
const { __SUCCESS, __SOME_ERROR } = require("../../utils/variable");
const { __deepClone } = require("../../utils/constant");
const { __CreateAuditLog } = require("../../utils/auditlog");
const mongoose = require("mongoose"); // Add this import
// const QRCode = require("qrcode");
// const Jimp = require("jimp");
// const path = require("path");
// const cloudinary = require("cloudinary").v2;
const { generateAndUploadQRCode } = require("../../utils/multer");

// Test Route
exports.test = async (req, res) => {
  return res.json(__requestResponse("200", "Patient Master API Working"));
};

// // Helper function to generate and upload QR code
// const generateAndUploadQRCodex = async (patientId) => {
//   try {
//     // Generate QR code buffer
//     const qrBuffer = await QRCode.toBuffer(patientId, {
//       errorCorrectionLevel: "H",
//       type: "png",
//       width: 400,
//       margin: 1,
//       color: {
//         dark: "#ffffffff",
//         light: "#d60d2f",
//       },
//     });

//     const baseImagePath = path.resolve("./uploads/qrbg.jpeg");
//     const outputPath = path.resolve(`./uploads/qr_${patientId}.png`);

//     // Load base image & QR image
//     const baseImage = await Jimp.read(baseImagePath);
//     const qrImage = await Jimp.read(qrBuffer);

//     // Resize QR code to fit
//     qrImage.resize(490, 490);

//     // Composite QR code on base image
//     baseImage.composite(qrImage, 320, 555);

//     // Save output temporarily
//     await baseImage.writeAsync(outputPath);

//     // Upload to Cloudinary
//     const result = await cloudinary.uploader.upload(outputPath, {
//       folder: "qr",
//       resource_type: "auto",
//       public_id: `patient_qr_${patientId}`, // Consistent naming
//     });

//     // Delete local file after upload
//     __deleteFile(outputPath);

//     console.log("✅ QR code generated and uploaded:", result.secure_url);

//     return result.secure_url;
//   } catch (error) {
//     console.error("QR Generation Error:", error.message);
//     throw error;
//   }
// };

// // Alternative helper function - Works with all Jimp versions
// const generateAndUploadQRCodexx = async (patientId) => {
//   try {
//     // Generate QR code and save to temp file
//     const qrTempPath = path.resolve(`./uploads/qr_temp_${patientId}.png`);
//     await QRCode.toFile(qrTempPath, patientId, {
//       errorCorrectionLevel: "H",
//       type: "png",
//       width: 400,
//       margin: 1,
//       color: {
//         dark: "#ffffffff",
//         light: "#d60d2f",
//       },
//     });

//     const baseImagePath = path.resolve("./uploads/qrbg.jpeg");
//     const outputPath = path.resolve(`./uploads/qr_${patientId}.png`);

//     // Load images using Jimp constructor
//     const [baseImage, qrImage] = await Promise.all([
//       Jimp.read(baseImagePath),
//       Jimp.read(qrTempPath),
//     ]);

//     // Resize QR code
//     qrImage.resize(490, 490);

//     // Composite QR code on base image
//     baseImage.composite(qrImage, 320, 555);

//     // Save final output
//     await baseImage.writeAsync(outputPath);

//     // Delete temp QR file
//     if (fs.existsSync(qrTempPath)) {
//       fs.unlinkSync(qrTempPath);
//     }

//     // Upload to Cloudinary
//     const result = await cloudinary.uploader.upload(outputPath, {
//       folder: "qr",
//       resource_type: "auto",
//       public_id: `patient_qr_${patientId}`,
//     });

//     // Delete final temp file
//     __deleteFile(outputPath);

//     console.log("✅ QR code generated and uploaded:", result.secure_url);

//     return result.secure_url;
//   } catch (error) {
//     console.error("QR Generation Error:", error.message);
//     throw error;
//   }
// };

// Public endpoint to view patient details via QR scan
exports.getPatientDetailsByQRScan = async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await PatientMaster.findById(id)
      .populate("Nationality", "StationName")
      .populate("CountryOfResidence", "StationName")
      .populate("State", "StationName")
      .populate("City", "StationName")
      .populate("InsuranceProvider", "lookup_value")
      .populate("Relationship", "lookup_value")
      .select("-CreatedBy -UpdatedBy -__v") // Hide internal fields
      .lean();

    if (!patient || patient.IsDeleted) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    // Return only public information (hide sensitive data if needed)
    const publicPatientData = {
      _id: patient._id,
      Name: patient.Name,
      PatientId: patient.PatientId,
      Age: patient.Age,
      Gender: patient.Gender,
      DateOfBirth: patient.DateOfBirth,
      PhoneNumber: patient.PhoneNumber,
      EmailAddress: patient.EmailAddress,
      ProfilePic: patient.ProfilePic,
      QRCode: patient.QRCode,
      Nationality: patient.Nationality,
      City: patient.City,
      State: patient.State,
      // Add other non-sensitive fields you want to display
    };

    return res.json(__requestResponse("200", __SUCCESS, publicPatientData));
  } catch (error) {
    console.error("Get Patient by QR Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};


// Save Patient (Add/Edit in single API) - WITH QR CODE GENERATION & DB SAVE
exports.SavePatient = async (req, res) => {
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
      patient = await PatientMaster.create(patientData);

      // GENERATE QR CODE FOR NEW PATIENT & SAVE IN DB
      try {
        const qrCodeUrl = await generateAndUploadQRCode(patient._id.toString());

        // Update patient with QR code URL - THIS SAVES IT IN DB
        patient = await PatientMaster.findByIdAndUpdate(
          patient._id,
          { QRCode: qrCodeUrl }, // Saved to database here
          { new: true }
        );

        console.log(
          "✅ Patient created with QR code saved in DB:",
          patient._id
        );
        console.log("✅ QR Code URL:", qrCodeUrl);
      } catch (qrError) {
        console.error(
          "⚠️ QR code generation failed, but patient created:",
          qrError.message
        );
        // Patient still created, just without QR code
      }

      // Fetch with populated fields (QRCode will be included automatically)
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

// Patient List (with pagination + population + filters) - QR CODE INCLUDED
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
        { PostalCode: regex },
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
    if (
      CountryOfResidence &&
      mongoose.Types.ObjectId.isValid(CountryOfResidence)
    ) {
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
    if (
      InsuranceProvider &&
      mongoose.Types.ObjectId.isValid(InsuranceProvider)
    ) {
      query.InsuranceProvider = InsuranceProvider;
    }

    const total = await PatientMaster.countDocuments(query);

    // QRCode field is automatically included in the response
    const list = await PatientMaster.find(query)
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

    // QRCode is automatically included in each patient object in the list

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
        list: __deepClone(list), // QRCode field included here
      })
    );
  } catch (error) {
    console.error("Patient List Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Get Patient By ID - QR CODE INCLUDED
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    // QRCode field is automatically included in the response
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

    // QRCode field is automatically included in patient object

    return res.json(__requestResponse("200", __SUCCESS, patient));
  } catch (error) {
    console.error("Get Patient Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Optional: Regenerate QR Code endpoint
exports.regeneratePatientQRCode = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await PatientMaster.findById(id);
    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    // Generate new QR code
    const qrCodeUrl = await generateAndUploadQRCode(patient._id.toString());

    // Update patient with new QR code in DB
    patient.QRCode = qrCodeUrl;
    await patient.save();

    console.log("✅ QR code regenerated and saved in DB:", patient._id);

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

// ==================== FAMILY HISTORY APIs ====================

// Add Family History Item
exports.addFamilyHistory = async (req, res) => {
  try {
    const { PatientId, FamilyHistoryItem } = req.body;

    if (!PatientId || !FamilyHistoryItem) {
      return res.json(
        __requestResponse("400", "PatientId and FamilyHistoryItem are required")
      );
    }

    // Check if patient exists
    const patient = await PatientMaster.findById(PatientId);
    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    // Check if item already exists in array
    if (patient.FamilyHistory.includes(FamilyHistoryItem)) {
      return res.json(
        __requestResponse("400", "Family history item already exists")
      );
    }

    // Add item to array
    const updatedPatient = await PatientMaster.findByIdAndUpdate(
      PatientId,
      { $push: { FamilyHistory: FamilyHistoryItem } },
      { new: true, runValidators: true }
    ).populate("FamilyHistory", "lookup_value");

    // Create audit log
    await __CreateAuditLog(
      "patient_master",
      "UPDATE",
      null,
      patient.toObject(),
      updatedPatient.toObject(),
      updatedPatient._id
    );

    return res.json(__requestResponse("200", __SUCCESS, updatedPatient.FamilyHistory));
  } catch (error) {
    console.error("Add Family History Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Remove Family History Item
exports.removeFamilyHistory = async (req, res) => {
  try {
    const { PatientId, FamilyHistoryItem } = req.body;

    if (!PatientId || !FamilyHistoryItem) {
      return res.json(
        __requestResponse("400", "PatientId and FamilyHistoryItem are required")
      );
    }

    // Get old value for audit
    const oldPatient = await PatientMaster.findById(PatientId);
    if (!oldPatient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    // Remove item from array
    const updatedPatient = await PatientMaster.findByIdAndUpdate(
      PatientId,
      { $pull: { FamilyHistory: FamilyHistoryItem } },
      { new: true, runValidators: true }
    ).populate("FamilyHistory", "lookup_value");

    // Create audit log
    await __CreateAuditLog(
      "patient_master",
      "UPDATE",
      null,
      oldPatient.toObject(),
      updatedPatient.toObject(),
      updatedPatient._id
    );

    return res.json(__requestResponse("200", __SUCCESS, updatedPatient.FamilyHistory));
  } catch (error) {
    console.error("Remove Family History Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// List Family History
exports.listFamilyHistory = async (req, res) => {
  try {
    const { PatientId } = req.query;

    if (!PatientId) {
      return res.json(__requestResponse("400", "PatientId is required"));
    }

    const patient = await PatientMaster.findById(PatientId)
      .select("FamilyHistory")
      .populate("FamilyHistory", "lookup_value");

    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, patient.FamilyHistory));
  } catch (error) {
    console.error("List Family History Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== HABIT LIFESTYLE APIs ====================

// Add Habit Lifestyle Item
exports.addHabitLifestyle = async (req, res) => {
  try {
    const { PatientId, HabitLifestyleItem } = req.body;

    if (!PatientId || !HabitLifestyleItem) {
      return res.json(
        __requestResponse("400", "PatientId and HabitLifestyleItem are required")
      );
    }

    // Check if patient exists
    const patient = await PatientMaster.findById(PatientId);
    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    // Check if item already exists in array
    if (patient.HabitLifestyle.includes(HabitLifestyleItem)) {
      return res.json(
        __requestResponse("400", "Habit lifestyle item already exists")
      );
    }

    // Add item to array
    const updatedPatient = await PatientMaster.findByIdAndUpdate(
      PatientId,
      { $push: { HabitLifestyle: HabitLifestyleItem } },
      { new: true, runValidators: true }
    ).populate("HabitLifestyle", "lookup_value");

    // Create audit log
    await __CreateAuditLog(
      "patient_master",
      "UPDATE",
      null,
      patient.toObject(),
      updatedPatient.toObject(),
      updatedPatient._id
    );

    return res.json(__requestResponse("200", __SUCCESS, updatedPatient.HabitLifestyle));
  } catch (error) {
    console.error("Add Habit Lifestyle Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Remove Habit Lifestyle Item
exports.removeHabitLifestyle = async (req, res) => {
  try {
    const { PatientId, HabitLifestyleItem } = req.body;

    if (!PatientId || !HabitLifestyleItem) {
      return res.json(
        __requestResponse("400", "PatientId and HabitLifestyleItem are required")
      );
    }

    // Get old value for audit
    const oldPatient = await PatientMaster.findById(PatientId);
    if (!oldPatient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    // Remove item from array
    const updatedPatient = await PatientMaster.findByIdAndUpdate(
      PatientId,
      { $pull: { HabitLifestyle: HabitLifestyleItem } },
      { new: true, runValidators: true }
    ).populate("HabitLifestyle", "lookup_value");

    // Create audit log
    await __CreateAuditLog(
      "patient_master",
      "UPDATE",
      null,
      oldPatient.toObject(),
      updatedPatient.toObject(),
      updatedPatient._id
    );

    return res.json(__requestResponse("200", __SUCCESS, updatedPatient.HabitLifestyle));
  } catch (error) {
    console.error("Remove Habit Lifestyle Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// List Habit Lifestyle
exports.listHabitLifestyle = async (req, res) => {
  try {
    const { PatientId } = req.query;

    if (!PatientId) {
      return res.json(__requestResponse("400", "PatientId is required"));
    }

    const patient = await PatientMaster.findById(PatientId)
      .select("HabitLifestyle")
      .populate("HabitLifestyle", "lookup_value");

    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, patient.HabitLifestyle));
  } catch (error) {
    console.error("List Habit Lifestyle Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== ALLERGIES APIs ====================

// Add Allergy Item
exports.addAllergy = async (req, res) => {
  try {
    const { PatientId, AllergyItem } = req.body;

    if (!PatientId || !AllergyItem) {
      return res.json(
        __requestResponse("400", "PatientId and AllergyItem are required")
      );
    }

    // Check if patient exists
    const patient = await PatientMaster.findById(PatientId);
    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    // Check if item already exists in array
    if (patient.Allergies.includes(AllergyItem)) {
      return res.json(
        __requestResponse("400", "Allergy item already exists")
      );
    }

    // Add item to array
    const updatedPatient = await PatientMaster.findByIdAndUpdate(
      PatientId,
      { $push: { Allergies: AllergyItem } },
      { new: true, runValidators: true }
    ).populate("Allergies", "lookup_value");

    // Create audit log
    await __CreateAuditLog(
      "patient_master",
      "UPDATE",
      null,
      patient.toObject(),
      updatedPatient.toObject(),
      updatedPatient._id
    );

    return res.json(__requestResponse("200", __SUCCESS, updatedPatient.Allergies));
  } catch (error) {
    console.error("Add Allergy Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Remove Allergy Item
exports.removeAllergy = async (req, res) => {
  try {
    const { PatientId, AllergyItem } = req.body;

    if (!PatientId || !AllergyItem) {
      return res.json(
        __requestResponse("400", "PatientId and AllergyItem are required")
      );
    }

    // Get old value for audit
    const oldPatient = await PatientMaster.findById(PatientId);
    if (!oldPatient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    // Remove item from array
    const updatedPatient = await PatientMaster.findByIdAndUpdate(
      PatientId,
      { $pull: { Allergies: AllergyItem } },
      { new: true, runValidators: true }
    ).populate("Allergies", "lookup_value");

    // Create audit log
    await __CreateAuditLog(
      "patient_master",
      "UPDATE",
      null,
      oldPatient.toObject(),
      updatedPatient.toObject(),
      updatedPatient._id
    );

    return res.json(__requestResponse("200", __SUCCESS, updatedPatient.Allergies));
  } catch (error) {
    console.error("Remove Allergy Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// List Allergies
exports.listAllergies = async (req, res) => {
  try {
    const { PatientId } = req.query;

    if (!PatientId) {
      return res.json(__requestResponse("400", "PatientId is required"));
    }

    const patient = await PatientMaster.findById(PatientId)
      .select("Allergies")
      .populate("Allergies", "lookup_value");

    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, patient.Allergies));
  } catch (error) {
    console.error("List Allergies Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== PAST ACCIDENTS TRAUMA APIs ====================

// Add Past Accidents Trauma Item
exports.addPastAccidentsTrauma = async (req, res) => {
  try {
    const { PatientId, PastAccidentsTraumaItem } = req.body;

    if (!PatientId || !PastAccidentsTraumaItem) {
      return res.json(
        __requestResponse("400", "PatientId and PastAccidentsTraumaItem are required")
      );
    }

    // Check if patient exists
    const patient = await PatientMaster.findById(PatientId);
    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    // Check if item already exists in array
    if (patient.PastAccidentsTrauma.includes(PastAccidentsTraumaItem)) {
      return res.json(
        __requestResponse("400", "Past accidents trauma item already exists")
      );
    }

    // Add item to array
    const updatedPatient = await PatientMaster.findByIdAndUpdate(
      PatientId,
      { $push: { PastAccidentsTrauma: PastAccidentsTraumaItem } },
      { new: true, runValidators: true }
    ).populate("PastAccidentsTrauma", "lookup_value");

    // Create audit log
    await __CreateAuditLog(
      "patient_master",
      "UPDATE",
      null,
      patient.toObject(),
      updatedPatient.toObject(),
      updatedPatient._id
    );

    return res.json(__requestResponse("200", __SUCCESS, updatedPatient.PastAccidentsTrauma));
  } catch (error) {
    console.error("Add Past Accidents Trauma Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Remove Past Accidents Trauma Item
exports.removePastAccidentsTrauma = async (req, res) => {
  try {
    const { PatientId, PastAccidentsTraumaItem } = req.body;

    if (!PatientId || !PastAccidentsTraumaItem) {
      return res.json(
        __requestResponse("400", "PatientId and PastAccidentsTraumaItem are required")
      );
    }

    // Get old value for audit
    const oldPatient = await PatientMaster.findById(PatientId);
    if (!oldPatient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    // Remove item from array
    const updatedPatient = await PatientMaster.findByIdAndUpdate(
      PatientId,
      { $pull: { PastAccidentsTrauma: PastAccidentsTraumaItem } },
      { new: true, runValidators: true }
    ).populate("PastAccidentsTrauma", "lookup_value");

    // Create audit log
    await __CreateAuditLog(
      "patient_master",
      "UPDATE",
      null,
      oldPatient.toObject(),
      updatedPatient.toObject(),
      updatedPatient._id
    );

    return res.json(__requestResponse("200", __SUCCESS, updatedPatient.PastAccidentsTrauma));
  } catch (error) {
    console.error("Remove Past Accidents Trauma Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// List Past Accidents Trauma
exports.listPastAccidentsTrauma = async (req, res) => {
  try {
    const { PatientId } = req.query;

    if (!PatientId) {
      return res.json(__requestResponse("400", "PatientId is required"));
    }

    const patient = await PatientMaster.findById(PatientId)
      .select("PastAccidentsTrauma")
      .populate("PastAccidentsTrauma", "lookup_value");

    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, patient.PastAccidentsTrauma));
  } catch (error) {
    console.error("List Past Accidents Trauma Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== PRE-EXISTING DISEASE APIs ====================

// Add Pre-Existing Disease Item
exports.addPreExistingDisease = async (req, res) => {
  try {
    const { PatientId, PreExistingDiseaseItem } = req.body;

    if (!PatientId || !PreExistingDiseaseItem) {
      return res.json(
        __requestResponse("400", "PatientId and PreExistingDiseaseItem are required")
      );
    }

    // Check if patient exists
    const patient = await PatientMaster.findById(PatientId);
    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    // Check if item already exists in array
    if (patient.PreExistingDisease.includes(PreExistingDiseaseItem)) {
      return res.json(
        __requestResponse("400", "Pre-existing disease item already exists")
      );
    }

    // Add item to array
    const updatedPatient = await PatientMaster.findByIdAndUpdate(
      PatientId,
      { $push: { PreExistingDisease: PreExistingDiseaseItem } },
      { new: true, runValidators: true }
    ).populate("PreExistingDisease", "lookup_value");

    // Create audit log
    await __CreateAuditLog(
      "patient_master",
      "UPDATE",
      null,
      patient.toObject(),
      updatedPatient.toObject(),
      updatedPatient._id
    );

    return res.json(__requestResponse("200", __SUCCESS, updatedPatient.PreExistingDisease));
  } catch (error) {
    console.error("Add Pre-Existing Disease Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Remove Pre-Existing Disease Item
exports.removePreExistingDisease = async (req, res) => {
  try {
    const { PatientId, PreExistingDiseaseItem } = req.body;

    if (!PatientId || !PreExistingDiseaseItem) {
      return res.json(
        __requestResponse("400", "PatientId and PreExistingDiseaseItem are required")
      );
    }

    // Get old value for audit
    const oldPatient = await PatientMaster.findById(PatientId);
    if (!oldPatient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    // Remove item from array
    const updatedPatient = await PatientMaster.findByIdAndUpdate(
      PatientId,
      { $pull: { PreExistingDisease: PreExistingDiseaseItem } },
      { new: true, runValidators: true }
    ).populate("PreExistingDisease", "lookup_value");

    // Create audit log
    await __CreateAuditLog(
      "patient_master",
      "UPDATE",
      null,
      oldPatient.toObject(),
      updatedPatient.toObject(),
      updatedPatient._id
    );

    return res.json(__requestResponse("200", __SUCCESS, updatedPatient.PreExistingDisease));
  } catch (error) {
    console.error("Remove Pre-Existing Disease Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// List Pre-Existing Disease
exports.listPreExistingDisease = async (req, res) => {
  try {
    const { PatientId } = req.query;

    if (!PatientId) {
      return res.json(__requestResponse("400", "PatientId is required"));
    }

    const patient = await PatientMaster.findById(PatientId)
      .select("PreExistingDisease")
      .populate("PreExistingDisease", "lookup_value");

    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, patient.PreExistingDisease));
  } catch (error) {
    console.error("List Pre-Existing Disease Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== CURRENT MEDICATIONS APIs ====================

// Add/Update Current Medications (Replace entire medications object)
exports.addCurrentMedications = async (req, res) => {
  try {
    const { PatientId, CurrentMedications, UpdatedBy } = req.body;

    if (!PatientId || !CurrentMedications) {
      return res.json(
        __requestResponse("400", "PatientId and CurrentMedications are required")
      );
    }

    // Validate CurrentMedications structure
    if (!CurrentMedications.Medicines || !Array.isArray(CurrentMedications.Medicines)) {
      return res.json(
        __requestResponse("400", "CurrentMedications must contain Medicines array")
      );
    }

    // Check if patient exists
    const patient = await PatientMaster.findById(PatientId);
    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    const oldValue = patient.toObject();

    // Update current medications (replace entire object)
    const updatedPatient = await PatientMaster.findByIdAndUpdate(
      PatientId,
      { 
        CurrentMedications: CurrentMedications,
        UpdatedBy: UpdatedBy 
      },
      { new: true, runValidators: true }
    ).populate([
      { path: "CurrentMedications.Medicines.MedicineName", select: "lookup_value" },
      { path: "CurrentMedications.Medicines.Dosage", select: "lookup_value" },
      { path: "CurrentMedications.RecoveryCycle.Unit", select: "lookup_value" }
    ]);

    // Create audit log
    await __CreateAuditLog(
      "patient_master",
      "UPDATE_CURRENT_MEDICATIONS",
      null,
      oldValue,
      updatedPatient.toObject(),
      updatedPatient._id
    );

    return res.json(__requestResponse("200", __SUCCESS, updatedPatient.CurrentMedications));
  } catch (error) {
    console.error("Add Current Medications Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Edit Current Medications (Same as add - replaces entire object)
exports.editCurrentMedications = async (req, res) => {
  try {
    const { PatientId, CurrentMedications, UpdatedBy } = req.body;

    if (!PatientId || !CurrentMedications) {
      return res.json(
        __requestResponse("400", "PatientId and CurrentMedications are required")
      );
    }

    // Check if patient exists
    const patient = await PatientMaster.findById(PatientId);
    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    const oldValue = patient.toObject();

    // Update current medications
    const updatedPatient = await PatientMaster.findByIdAndUpdate(
      PatientId,
      { 
        CurrentMedications: CurrentMedications,
        UpdatedBy: UpdatedBy 
      },
      { new: true, runValidators: true }
    ).populate([
      { path: "CurrentMedications.Medicines.MedicineName", select: "lookup_value" },
      { path: "CurrentMedications.Medicines.Dosage", select: "lookup_value" },
      { path: "CurrentMedications.RecoveryCycle.Unit", select: "lookup_value" }
    ]);

    // Create audit log
    await __CreateAuditLog(
      "patient_master",
      "EDIT_CURRENT_MEDICATIONS",
      null,
      oldValue,
      updatedPatient.toObject(),
      updatedPatient._id
    );

    return res.json(__requestResponse("200", __SUCCESS, updatedPatient.CurrentMedications));
  } catch (error) {
    console.error("Edit Current Medications Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Add Individual Medicine to Current Medications
exports.addMedicine = async (req, res) => {
  try {
    const { PatientId, Medicine, UpdatedBy } = req.body;

    if (!PatientId || !Medicine) {
      return res.json(
        __requestResponse("400", "PatientId and Medicine are required")
      );
    }

    // Check if patient exists
    const patient = await PatientMaster.findById(PatientId);
    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    const oldValue = patient.toObject();

    // Initialize CurrentMedications if it doesn't exist
    if (!patient.CurrentMedications) {
      patient.CurrentMedications = {
        Medicines: [],
        RecoveryCycle: { Value: 0, Unit: null },
        PrescriptionUrls: []
      };
    }

    // Add medicine to the array
    patient.CurrentMedications.Medicines.push(Medicine);
    patient.UpdatedBy = UpdatedBy;
    
    await patient.save();

    // Populate the updated patient
    const populatedPatient = await PatientMaster.findById(PatientId).populate([
      { path: "CurrentMedications.Medicines.MedicineName", select: "lookup_value" },
      { path: "CurrentMedications.Medicines.Dosage", select: "lookup_value" },
      { path: "CurrentMedications.RecoveryCycle.Unit", select: "lookup_value" }
    ]);

    // Create audit log
    await __CreateAuditLog(
      "patient_master",
      "ADD_MEDICINE",
      null,
      oldValue,
      populatedPatient.toObject(),
      populatedPatient._id
    );

    return res.json(__requestResponse("200", __SUCCESS, populatedPatient.CurrentMedications));
  } catch (error) {
    console.error("Add Medicine Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Edit Individual Medicine in Current Medications
exports.editMedicine = async (req, res) => {
  try {
    const { PatientId, MedicineId, Medicine, UpdatedBy } = req.body;

    if (!PatientId || !MedicineId || !Medicine) {
      return res.json(
        __requestResponse("400", "PatientId, MedicineId, and Medicine are required")
      );
    }

    // Check if patient exists
    const patient = await PatientMaster.findById(PatientId);
    if (!patient || !patient.CurrentMedications) {
      return res.json(
        __requestResponse("404", "Patient or Current Medications not found")
      );
    }

    const oldValue = patient.toObject();

    // Find medicine index
    const medicineIndex = patient.CurrentMedications.Medicines.findIndex(
      (med) => med._id.toString() === MedicineId.toString()
    );

    if (medicineIndex === -1) {
      return res.json(__requestResponse("404", "Medicine not found"));
    }

    // Update the specific medicine
    patient.CurrentMedications.Medicines[medicineIndex] = {
      ...patient.CurrentMedications.Medicines[medicineIndex].toObject(),
      ...Medicine,
      _id: MedicineId
    };
    patient.UpdatedBy = UpdatedBy;

    await patient.save();

    // Populate the updated patient
    const populatedPatient = await PatientMaster.findById(PatientId).populate([
      { path: "CurrentMedications.Medicines.MedicineName", select: "lookup_value" },
      { path: "CurrentMedications.Medicines.Dosage", select: "lookup_value" },
      { path: "CurrentMedications.RecoveryCycle.Unit", select: "lookup_value" }
    ]);

    // Create audit log
    await __CreateAuditLog(
      "patient_master",
      "EDIT_MEDICINE",
      null,
      oldValue,
      populatedPatient.toObject(),
      populatedPatient._id
    );

    return res.json(__requestResponse("200", __SUCCESS, populatedPatient.CurrentMedications));
  } catch (error) {
    console.error("Edit Medicine Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Delete Individual Medicine from Current Medications
exports.deleteMedicine = async (req, res) => {
  try {
    const { PatientId, MedicineId, UpdatedBy } = req.body;

    if (!PatientId || !MedicineId) {
      return res.json(
        __requestResponse("400", "PatientId and MedicineId are required")
      );
    }

    // Check if patient exists
    const patient = await PatientMaster.findById(PatientId);
    if (!patient || !patient.CurrentMedications) {
      return res.json(
        __requestResponse("404", "Patient or Current Medications not found")
      );
    }

    const oldValue = patient.toObject();

    // Remove medicine from array
    patient.CurrentMedications.Medicines = patient.CurrentMedications.Medicines.filter(
      (med) => med._id.toString() !== MedicineId.toString()
    );
    patient.UpdatedBy = UpdatedBy;

    await patient.save();

    // Populate the updated patient
    const populatedPatient = await PatientMaster.findById(PatientId).populate([
      { path: "CurrentMedications.Medicines.MedicineName", select: "lookup_value" },
      { path: "CurrentMedications.Medicines.Dosage", select: "lookup_value" },
      { path: "CurrentMedications.RecoveryCycle.Unit", select: "lookup_value" }
    ]);

    // Create audit log
    await __CreateAuditLog(
      "patient_master",
      "DELETE_MEDICINE",
      null,
      oldValue,
      populatedPatient.toObject(),
      populatedPatient._id
    );

    return res.json(__requestResponse("200", __SUCCESS, populatedPatient.CurrentMedications));
  } catch (error) {
    console.error("Delete Medicine Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Remove Current Medications (Remove entire medications object)
exports.removeCurrentMedications = async (req, res) => {
  try {
    const { PatientId, UpdatedBy } = req.body;

    if (!PatientId) {
      return res.json(__requestResponse("400", "PatientId is required"));
    }

    // Get old value for audit
    const oldPatient = await PatientMaster.findById(PatientId);
    if (!oldPatient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    // Remove current medications
    const updatedPatient = await PatientMaster.findByIdAndUpdate(
      PatientId,
      { 
        $unset: { CurrentMedications: "" },
        UpdatedBy: UpdatedBy 
      },
      { new: true, runValidators: true }
    );

    // Create audit log
    await __CreateAuditLog(
      "patient_master",
      "REMOVE_CURRENT_MEDICATIONS",
      null,
      oldPatient.toObject(),
      updatedPatient.toObject(),
      updatedPatient._id
    );

    return res.json(__requestResponse("200", __SUCCESS, "Current medications removed successfully"));
  } catch (error) {
    console.error("Remove Current Medications Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// List Current Medications
exports.listCurrentMedications = async (req, res) => {
  try {
    const { PatientId, expandMedicines } = req.query;

    if (!PatientId) {
      return res.json(__requestResponse("400", "PatientId is required"));
    }

    const patient = await PatientMaster.findById(PatientId)
      .select("CurrentMedications")
      .populate([
        { path: "CurrentMedications.Medicines.MedicineName", select: "lookup_value" },
        { path: "CurrentMedications.Medicines.Dosage", select: "lookup_value" },
        { path: "CurrentMedications.RecoveryCycle.Unit", select: "lookup_value" }
      ]);

    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    let responseData;

    if (expandMedicines === "true" && patient.CurrentMedications?.Medicines) {
      // Return individual medicines as separate items
      responseData = patient.CurrentMedications.Medicines.map(medicine => ({
        _id: medicine._id,
        PatientId: PatientId,
        Medicine: medicine,
        MedicinesPrescribed: {
          RecoveryCycle: patient.CurrentMedications.RecoveryCycle,
          PrescriptionUrls: patient.CurrentMedications.PrescriptionUrls,
          _id: patient.CurrentMedications._id
        }
      }));
    } else {
      // Return complete CurrentMedications object
      responseData = patient.CurrentMedications || {};
    }

    return res.json(__requestResponse("200", __SUCCESS, {
      expandMedicines: expandMedicines === "true",
      data: responseData
    }));
  } catch (error) {
    console.error("List Current Medications Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== CURRENT THERAPIES APIs ====================

// Add Single Current Therapy
exports.addCurrentTherapy = async (req, res) => {
  try {
    const { PatientId, TherapyName, PatientResponse } = req.body;

    if (!PatientId || !TherapyName) {
      return res.json(
        __requestResponse("400", "PatientId and TherapyName are required")
      );
    }

    // Check if patient exists
    const patient = await PatientMaster.findById(PatientId);
    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    // Get old value for audit
    const oldValue = patient.toObject();

    // Check if therapy already exists
    const existingTherapy = patient.CurrentTherapies.find(
      therapy => therapy.TherapyName && therapy.TherapyName.toString() === TherapyName
    );

    if (existingTherapy) {
      return res.json(
        __requestResponse("400", "Therapy already exists for this patient")
      );
    }

    // Add therapy to array
    const newTherapy = {
      TherapyName: TherapyName,
      PatientResponse: PatientResponse || ""
    };

    patient.CurrentTherapies.push(newTherapy);
    await patient.save();

    // Create audit log
    await __CreateAuditLog(
      "patient_master",
      "ADD_CURRENT_THERAPY",
      null,
      oldValue,
      patient.toObject(),
      patient._id
    );

    // Populate and return
    const populatedPatient = await PatientMaster.findById(PatientId)
      .select("CurrentTherapies")
      .populate("CurrentTherapies.TherapyName", "lookup_value");

    return res.json(__requestResponse("200", __SUCCESS, populatedPatient.CurrentTherapies));
  } catch (error) {
    console.error("Add Current Therapy Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Add Multiple Current Therapies
exports.addCurrentTherapies = async (req, res) => {
  try {
    const { PatientId, Therapies } = req.body;

    if (!PatientId || !Therapies || !Array.isArray(Therapies) || Therapies.length === 0) {
      return res.json(
        __requestResponse("400", "PatientId and Therapies array are required")
      );
    }

    // Check if patient exists
    const patient = await PatientMaster.findById(PatientId);
    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    // Get old value for audit
    const oldValue = patient.toObject();

    // Validate and add each therapy
    const existingTherapyNames = patient.CurrentTherapies.map(
      therapy => therapy.TherapyName?.toString()
    ).filter(Boolean);

    const newTherapies = [];
    const duplicateTherapies = [];

    Therapies.forEach((therapy) => {
      if (!therapy.TherapyName) {
        return; // Skip invalid therapies
      }

      if (existingTherapyNames.includes(therapy.TherapyName.toString())) {
        duplicateTherapies.push(therapy.TherapyName);
      } else {
        newTherapies.push({
          TherapyName: therapy.TherapyName,
          PatientResponse: therapy.PatientResponse || ""
        });
        existingTherapyNames.push(therapy.TherapyName.toString());
      }
    });

    if (newTherapies.length === 0) {
      return res.json(
        __requestResponse("400", `All therapies already exist. Duplicates: ${duplicateTherapies.length}`)
      );
    }

    // Add all new therapies
    newTherapies.forEach((therapy) => {
      patient.CurrentTherapies.push(therapy);
    });

    await patient.save();

    // Create audit log
    await __CreateAuditLog(
      "patient_master",
      "ADD_CURRENT_THERAPIES",
      null,
      oldValue,
      patient.toObject(),
      patient._id
    );

    // Populate and return
    const populatedPatient = await PatientMaster.findById(PatientId)
      .select("CurrentTherapies")
      .populate("CurrentTherapies.TherapyName", "lookup_value");

    const response = {
      addedTherapies: newTherapies.length,
      duplicateTherapies: duplicateTherapies.length,
      totalTherapies: populatedPatient.CurrentTherapies.length,
      therapies: populatedPatient.CurrentTherapies
    };

    return res.json(__requestResponse("200", __SUCCESS, response));
  } catch (error) {
    console.error("Add Current Therapies Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Edit Single Current Therapy
exports.editCurrentTherapy = async (req, res) => {
  try {
    const { PatientId, TherapyId, TherapyName, PatientResponse } = req.body;

    if (!PatientId || !TherapyId) {
      return res.json(
        __requestResponse("400", "PatientId and TherapyId are required")
      );
    }

    // Get old value for audit
    const oldPatient = await PatientMaster.findById(PatientId);
    if (!oldPatient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    const oldValue = oldPatient.toObject();

    // Find and update specific therapy
    const therapyIndex = oldPatient.CurrentTherapies.findIndex(
      therapy => therapy._id.toString() === TherapyId.toString()
    );

    if (therapyIndex === -1) {
      return res.json(__requestResponse("404", "Therapy not found"));
    }

    // Update therapy fields
    if (TherapyName !== undefined) {
      oldPatient.CurrentTherapies[therapyIndex].TherapyName = TherapyName;
    }
    if (PatientResponse !== undefined) {
      oldPatient.CurrentTherapies[therapyIndex].PatientResponse = PatientResponse;
    }

    await oldPatient.save();

    // Create audit log
    await __CreateAuditLog(
      "patient_master",
      "EDIT_CURRENT_THERAPY",
      null,
      oldValue,
      oldPatient.toObject(),
      oldPatient._id
    );

    // Populate and return
    const populatedPatient = await PatientMaster.findById(PatientId)
      .select("CurrentTherapies")
      .populate("CurrentTherapies.TherapyName", "lookup_value");

    return res.json(__requestResponse("200", __SUCCESS, populatedPatient.CurrentTherapies));
  } catch (error) {
    console.error("Edit Current Therapy Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Edit Multiple Current Therapies (Replace All)
exports.editCurrentTherapies = async (req, res) => {
  try {
    const { PatientId, Therapies } = req.body;

    if (!PatientId || !Therapies || !Array.isArray(Therapies)) {
      return res.json(
        __requestResponse("400", "PatientId and Therapies array are required")
      );
    }

    // Check if patient exists
    const patient = await PatientMaster.findById(PatientId);
    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    // Get old value for audit
    const oldValue = patient.toObject();

    // Replace all therapies
    patient.CurrentTherapies = Therapies.map(therapy => ({
      TherapyName: therapy.TherapyName,
      PatientResponse: therapy.PatientResponse || ""
    }));

    await patient.save();

    // Create audit log
    await __CreateAuditLog(
      "patient_master",
      "EDIT_CURRENT_THERAPIES",
      null,
      oldValue,
      patient.toObject(),
      patient._id
    );

    // Populate and return
    const populatedPatient = await PatientMaster.findById(PatientId)
      .select("CurrentTherapies")
      .populate("CurrentTherapies.TherapyName", "lookup_value");

    return res.json(__requestResponse("200", __SUCCESS, populatedPatient.CurrentTherapies));
  } catch (error) {
    console.error("Edit Current Therapies Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Update Current Therapy (legacy - keeping for backward compatibility)
exports.updateCurrentTherapy = async (req, res) => {
  try {
    const { PatientId, TherapyId, PatientResponse } = req.body;

    if (!PatientId || !TherapyId || !PatientResponse) {
      return res.json(
        __requestResponse("400", "PatientId, TherapyId, and PatientResponse are required")
      );
    }

    // Get old value for audit
    const oldPatient = await PatientMaster.findById(PatientId);
    if (!oldPatient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    // Update specific therapy
    const updatedPatient = await PatientMaster.findOneAndUpdate(
      { 
        _id: PatientId,
        "CurrentTherapies._id": TherapyId
      },
      {
        $set: {
          "CurrentTherapies.$.PatientResponse": PatientResponse
        }
      },
      { new: true, runValidators: true }
    ).populate("CurrentTherapies.TherapyName", "lookup_value");

    if (!updatedPatient) {
      return res.json(__requestResponse("404", "Therapy not found"));
    }

    // Create audit log
    await __CreateAuditLog(
      "patient_master",
      "UPDATE_CURRENT_THERAPY",
      null,
      oldPatient.toObject(),
      updatedPatient.toObject(),
      updatedPatient._id
    );

    return res.json(__requestResponse("200", __SUCCESS, updatedPatient.CurrentTherapies));
  } catch (error) {
    console.error("Update Current Therapy Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Remove Current Therapy
exports.removeCurrentTherapy = async (req, res) => {
  try {
    const { PatientId, TherapyId } = req.body;

    if (!PatientId || !TherapyId) {
      return res.json(
        __requestResponse("400", "PatientId and TherapyId are required")
      );
    }

    // Get old value for audit
    const oldPatient = await PatientMaster.findById(PatientId);
    if (!oldPatient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    // Remove therapy from array
    const updatedPatient = await PatientMaster.findByIdAndUpdate(
      PatientId,
      { $pull: { CurrentTherapies: { _id: TherapyId } } },
      { new: true, runValidators: true }
    ).populate("CurrentTherapies.TherapyName", "lookup_value");

    // Create audit log
    await __CreateAuditLog(
      "patient_master",
      "REMOVE_CURRENT_THERAPY",
      null,
      oldPatient.toObject(),
      updatedPatient.toObject(),
      updatedPatient._id
    );

    return res.json(__requestResponse("200", __SUCCESS, updatedPatient.CurrentTherapies));
  } catch (error) {
    console.error("Remove Current Therapy Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// List Current Therapies
exports.listCurrentTherapies = async (req, res) => {
  try {
    const { PatientId } = req.query;

    if (!PatientId) {
      return res.json(__requestResponse("400", "PatientId is required"));
    }

    const patient = await PatientMaster.findById(PatientId)
      .select("CurrentTherapies")
      .populate("CurrentTherapies.TherapyName", "lookup_value");

    if (!patient) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, patient.CurrentTherapies));
  } catch (error) {
    console.error("List Current Therapies Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};
