const MedicalHistory = require("../../modals/Patient/MedicalHistory");
const { __requestResponse } = require("../../utils/constant");
const {
  __SUCCESS,
  __SOME_ERROR,
} = require("../../utils/variable");
const { __deepClone } = require("../../utils/constant");
const { __CreateAuditLog } = require("../../utils/auditlog");
const mongoose = require("mongoose");

// Test Route
exports.test = async (req, res) => {
  return res.json(__requestResponse("200", "Medical History API Working"));
};

// Save Medical History (Add/Edit in single API)
exports.saveMedicalHistory = async (req, res) => {
  try {
    const { _id } = req.body;
    let medicalHistory;
    let oldValue = null;
    
    // Remove _id from data to avoid MongoDB issues
    const medicalHistoryData = { ...req.body };
    delete medicalHistoryData._id;
    
    // Check if _id exists and is not null/empty - if true, update; otherwise, create new
    if (_id && _id !== null && _id !== "") {
      // Get old value for audit log
      oldValue = await MedicalHistory.findById(_id).lean();
      
      if (!oldValue) {
        return res.json(__requestResponse("404", "Medical History not found"));
      }
      
      // Update existing medical history
      medicalHistory = await MedicalHistory.findByIdAndUpdate(
        _id, 
        medicalHistoryData, 
        {
          new: true,
          runValidators: true
        }
      );
      
      // Populate references
      medicalHistory = await MedicalHistory.findById(medicalHistory._id);
      
      // Create audit log for update
      await __CreateAuditLog(
        "medical_history",
        "UPDATE",
        null,
        oldValue,
        medicalHistory.toObject(),
        medicalHistory._id,
      );
    } else {
      // Create new medical history
      medicalHistory = await MedicalHistory.create(medicalHistoryData);
      
      // Populate references
      medicalHistory = await MedicalHistory.findById(medicalHistory._id);
      
      // Create audit log for creation
      await __CreateAuditLog(
        "medical_history",
        "CREATE",
        null,
        null,
        medicalHistory.toObject(),
        medicalHistory._id,
      );
    }

    return res.json(__requestResponse("200", __SUCCESS, medicalHistory));
  } catch (error) {
    console.error("Save Medical History Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Medical History List (with pagination + population + filters)
exports.medicalHistoryList = async (req, res) => {
  try {
    // Handle both req.body and req.query to support GET and POST requests
    const requestData = req.body || req.query || {};
    const {
      page = 1,
      limit = 10,
      search = "",
      PatientId,
      Status,
      FromDate,
      ToDate
    } = requestData;

    const query = { IsDeleted: false };

    // Patient ID filter
    if (PatientId) {
      query.PatientId = PatientId;
    }

    // Status filter
    if (Status) {
      query.Status = Status;
    }

    // Date range filter
    if (FromDate || ToDate) {
      query.createdAt = {};
      if (FromDate) {
        query.createdAt.$gte = new Date(FromDate);
      }
      if (ToDate) {
        query.createdAt.$lte = new Date(ToDate);
      }
    }

    // Search filter
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { Notes: regex },
        { "DoctorHospitalInfo.DoctorName": regex },
        { "DoctorHospitalInfo.HospitalName": regex }
      ];
    }

    // Count total records
    const total = await MedicalHistory.countDocuments(query);

    // Get paginated list
    const list = await MedicalHistory.find(query)
      .populate('PatientId', 'Name PatientId')
      .populate('DoctorHospitalInfo.MedicalSpeciality', 'lookup_value')
      .populate('CreatedBy', 'AssetName')
      .populate('UpdatedBy', 'AssetName')
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
          PatientId,
          Status,
          FromDate,
          ToDate
        },
        list: __deepClone(list),
      })
    );
  } catch (error) {
    console.error("Medical History List Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Get Medical History By ID
exports.getMedicalHistoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const medicalHistory = await MedicalHistory.findById(id)
      .populate('PatientId', 'Name PatientId')
      .populate('DoctorHospitalInfo.MedicalSpeciality', 'lookup_value')
      .populate('ChiefComplaints.Symptoms', 'lookup_value')
      .populate('ChiefComplaints.Duration.Unit', 'lookup_value')
      .populate('ChiefComplaints.SeverityGrade', 'lookup_value')
      .populate('ChiefComplaints.AggravatingFactors', 'lookup_value')
      .populate('ClinicalDiagnoses.InvestigationCategory', 'lookup_value')
      .populate('ClinicalDiagnoses.Investigation', 'lookup_value')
      .populate('ClinicalDiagnoses.Abnormalities', 'lookup_value')
      .populate('MedicinesPrescribed.Medicines.MedicineName', 'lookup_value')
      .populate('MedicinesPrescribed.Medicines.Dosage', 'lookup_value')
      .populate('MedicinesPrescribed.RecoveryCycle.Unit', 'lookup_value')
      .populate('Therapies.TherapyName', 'lookup_value')
      .populate('Therapies.PatientResponse', 'lookup_value')
      .populate('SurgeriesProcedures.MedicalSpeciality', 'lookup_value')
      .populate('SurgeriesProcedures.SurgeryProcedureName', 'lookup_value')
      .populate('SurgeriesProcedures.AnaesthesiaType', 'lookup_value')
      .populate('SurgeriesProcedures.RecoveryCycle.Unit', 'lookup_value')
      .populate('SurgeriesProcedures.PostSurgeryComplications', 'lookup_value')
      .populate('CreatedBy', 'AssetName')
      .populate('UpdatedBy', 'AssetName')
      .lean();

    if (!medicalHistory) {
      return res.json(__requestResponse("404", "Medical History not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, medicalHistory));
  } catch (error) {
    console.error("Get Medical History Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Get Medical History By Patient ID
exports.getMedicalHistoryByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.json(__requestResponse("400", "Invalid Patient ID"));
    }
    
    const medicalHistories = await MedicalHistory.findByPatient(patientId);

    return res.json(__requestResponse("200", __SUCCESS, medicalHistories));
  } catch (error) {
    console.error("Get Medical History By Patient ID Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Delete Medical History (Soft Delete)
exports.deleteMedicalHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the record before deletion for audit log
    const oldValue = await MedicalHistory.findById(id).lean();
    
    if (!oldValue) {
      return res.json(__requestResponse("404", "Medical History not found"));
    }
    
    if (oldValue.IsDeleted) {
      return res.json(__requestResponse("400", "Medical History already deleted"));
    }
    
    // Soft delete - set IsDeleted to true
    const medicalHistory = await MedicalHistory.findByIdAndUpdate(
      id,
      { IsDeleted: true, UpdatedBy: req.body.UpdatedBy },
      { new: true }
    );

    // Create audit log for deletion
    await __CreateAuditLog(
      "medical_history",
      "DELETE",
      null,
      oldValue,
      medicalHistory.toObject(),
      id,
    );
    
    return res.json(__requestResponse("200", "Medical History deleted successfully"));
  } catch (error) {
    console.error("Delete Medical History Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Update Medical History Status
exports.updateMedicalHistoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { Status, UpdatedBy } = req.body;
    
    // Get the record before update for audit log
    const oldValue = await MedicalHistory.findById(id).lean();
    
    if (!oldValue) {
      return res.json(__requestResponse("404", "Medical History not found"));
    }
    
    // Update status
    const medicalHistory = await MedicalHistory.findByIdAndUpdate(
      id,
      { Status, UpdatedBy },
      { new: true }
    );

    // Create audit log for status update
    await __CreateAuditLog(
      "medical_history",
      "UPDATE",
      "STATUS_UPDATE",
      oldValue,
      medicalHistory.toObject(),
      id,
    );
    
    return res.json(__requestResponse("200", "Medical History status updated successfully", medicalHistory));
  } catch (error) {
    console.error("Update Medical History Status Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};