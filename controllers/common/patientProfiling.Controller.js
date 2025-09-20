const PatientProfiling = require("../../modals/Common/PatientProfiling");
const AdminLookups = require("../../modals/Common/lookupmodel");
const InvestigationMaster = require("../../modals/Common/InvestigationMaster");
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
  return res.json(__requestResponse("200", "Patient Profiling API Working"));
};

// ==================== MAIN PROFILING APIS ====================

// Get Complete Patient Profiling by Patient ID
exports.getPatientProfiling = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.json(__requestResponse("400", "Invalid Patient ID"));
    }

    const profiling = await PatientProfiling.findByPatientId(patientId);

    if (!profiling) {
      return res.json(__requestResponse("404", "Patient profiling not found"));
    }

    return res.json(__requestResponse("200", __SUCCESS, profiling));
  } catch (error) {
    console.error("Get Patient Profiling Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Create New Patient Profiling
exports.createPatientProfiling = async (req, res) => {
  try {
    const { PatientId, CreatedBy } = req.body;

    // Check if profiling already exists for this patient
    const existingProfiling = await PatientProfiling.findOne({ 
      PatientId, 
      IsActive: true, 
      IsDeleted: false 
    });

    if (existingProfiling) {
      return res.json(__requestResponse("400", "Patient profiling already exists"));
    }

    const profiling = new PatientProfiling({
      PatientId,
      CreatedBy,
      ChiefComplaints: [],
      MedicalSummary: {
        PastIllness: [],
        PastSurgeries: [],
        PastAccidentsTrauma: [],
        KnownAllergies: [],
        PastMedications: [],
        OccupationalProfile: [],
        HabitsLifestyles: [],
        FamilyHistory: []
      },
      ClinicalFindings: [],
      VitalsPhysicalExaminations: [],
      DiagnosticsInvestigations: [],
      Diagnosis: [],
      TreatmentToDate: {
        Medicines: [],
        SurgeryProcedure: [],
        Therapy: [],
        LifestyleInterventions: [],
        PatientResponse: "",
        ClinicalNote: ""
      }
    });

    const savedProfiling = await profiling.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientProfiling",
      "CREATE",
      null,
      null,
      JSON.stringify(savedProfiling),
      savedProfiling._id,
      CreatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, savedProfiling));
  } catch (error) {
    console.error("Create Patient Profiling Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== CHIEF COMPLAINTS SECTION ====================

// Add Chief Complaint
exports.addChiefComplaint = async (req, res) => {
  try {
    const { patientId } = req.params;
    const complaintData = req.body;

    const profiling = await PatientProfiling.findOne({ 
      PatientId: patientId, 
      IsActive: true, 
      IsDeleted: false 
    });

    if (!profiling) {
      return res.json(__requestResponse("404", "Patient profiling not found"));
    }

    const oldValue = __deepClone(profiling.ChiefComplaints);

    profiling.ChiefComplaints.push({
      ...complaintData,
      CreatedAt: new Date()
    });

    await profiling.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientProfiling",
      "UPDATE",
      "CHIEF_COMPLAINTS",
      JSON.stringify(oldValue),
      JSON.stringify(profiling.ChiefComplaints),
      profiling._id,
      req.body.UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, profiling.ChiefComplaints));
  } catch (error) {
    console.error("Add Chief Complaint Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Update Chief Complaint
exports.updateChiefComplaint = async (req, res) => {
  try {
    const { patientId, complaintId } = req.params;
    const updateData = req.body;

    const profiling = await PatientProfiling.findOne({ 
      PatientId: patientId, 
      IsActive: true, 
      IsDeleted: false 
    });

    if (!profiling) {
      return res.json(__requestResponse("404", "Patient profiling not found"));
    }

    const oldValue = __deepClone(profiling.ChiefComplaints);
    const complaintIndex = profiling.ChiefComplaints.findIndex(
      complaint => complaint._id.toString() === complaintId
    );

    if (complaintIndex === -1) {
      return res.json(__requestResponse("404", "Chief complaint not found"));
    }

    profiling.ChiefComplaints[complaintIndex] = {
      ...profiling.ChiefComplaints[complaintIndex].toObject(),
      ...updateData,
      _id: profiling.ChiefComplaints[complaintIndex]._id
    };

    await profiling.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientProfiling",
      "UPDATE",
      "CHIEF_COMPLAINTS",
      JSON.stringify(oldValue),
      JSON.stringify(profiling.ChiefComplaints),
      profiling._id,
      req.body.UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, profiling.ChiefComplaints));
  } catch (error) {
    console.error("Update Chief Complaint Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Delete Chief Complaint
exports.deleteChiefComplaint = async (req, res) => {
  try {
    const { patientId, complaintId } = req.params;
    const { UpdatedBy } = req.body;

    const profiling = await PatientProfiling.findOne({ 
      PatientId: patientId, 
      IsActive: true, 
      IsDeleted: false 
    });

    if (!profiling) {
      return res.json(__requestResponse("404", "Patient profiling not found"));
    }

    const oldValue = __deepClone(profiling.ChiefComplaints);
    profiling.ChiefComplaints = profiling.ChiefComplaints.filter(
      complaint => complaint._id.toString() !== complaintId
    );

    await profiling.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientProfiling",
      "DELETE",
      "CHIEF_COMPLAINTS",
      JSON.stringify(oldValue),
      JSON.stringify(profiling.ChiefComplaints),
      profiling._id,
      UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, profiling.ChiefComplaints));
  } catch (error) {
    console.error("Delete Chief Complaint Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== MEDICAL SUMMARY SECTION ====================

// Update Medical Summary
exports.updateMedicalSummary = async (req, res) => {
  try {
    const { patientId } = req.params;
    const medicalSummaryData = req.body;

    const profiling = await PatientProfiling.findOne({ 
      PatientId: patientId, 
      IsActive: true, 
      IsDeleted: false 
    });

    if (!profiling) {
      return res.json(__requestResponse("404", "Patient profiling not found"));
    }

    const oldValue = __deepClone(profiling.MedicalSummary);

    profiling.MedicalSummary = {
      ...profiling.MedicalSummary,
      ...medicalSummaryData
    };

    await profiling.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientProfiling",
      "UPDATE",
      "MEDICAL_SUMMARY",
      JSON.stringify(oldValue),
      JSON.stringify(profiling.MedicalSummary),
      profiling._id,
      req.body.UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, profiling.MedicalSummary));
  } catch (error) {
    console.error("Update Medical Summary Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Add Past Medication
exports.addPastMedication = async (req, res) => {
  try {
    const { patientId } = req.params;
    const medicationData = req.body;

    const profiling = await PatientProfiling.findOne({ 
      PatientId: patientId, 
      IsActive: true, 
      IsDeleted: false 
    });

    if (!profiling) {
      return res.json(__requestResponse("404", "Patient profiling not found"));
    }

    const oldValue = __deepClone(profiling.MedicalSummary.PastMedications);

    profiling.MedicalSummary.PastMedications.push({
      ...medicationData,
      CreatedAt: new Date()
    });

    await profiling.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientProfiling",
      "UPDATE",
      "PAST_MEDICATIONS",
      JSON.stringify(oldValue),
      JSON.stringify(profiling.MedicalSummary.PastMedications),
      profiling._id,
      req.body.UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, profiling.MedicalSummary.PastMedications));
  } catch (error) {
    console.error("Add Past Medication Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== CLINICAL FINDINGS SECTION ====================

// Add Clinical Finding
exports.addClinicalFinding = async (req, res) => {
  try {
    const { patientId } = req.params;
    const findingData = req.body;

    const profiling = await PatientProfiling.findOne({ 
      PatientId: patientId, 
      IsActive: true, 
      IsDeleted: false 
    });

    if (!profiling) {
      return res.json(__requestResponse("404", "Patient profiling not found"));
    }

    const oldValue = __deepClone(profiling.ClinicalFindings);

    profiling.ClinicalFindings.push({
      ...findingData,
      CreatedAt: new Date()
    });

    await profiling.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientProfiling",
      "UPDATE",
      "CLINICAL_FINDINGS",
      JSON.stringify(oldValue),
      JSON.stringify(profiling.ClinicalFindings),
      profiling._id,
      req.body.UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, profiling.ClinicalFindings));
  } catch (error) {
    console.error("Add Clinical Finding Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Update Clinical Finding
exports.updateClinicalFinding = async (req, res) => {
  try {
    const { patientId, findingId } = req.params;
    const updateData = req.body;

    const profiling = await PatientProfiling.findOne({ 
      PatientId: patientId, 
      IsActive: true, 
      IsDeleted: false 
    });

    if (!profiling) {
      return res.json(__requestResponse("404", "Patient profiling not found"));
    }

    const oldValue = __deepClone(profiling.ClinicalFindings);
    const findingIndex = profiling.ClinicalFindings.findIndex(
      finding => finding._id.toString() === findingId
    );

    if (findingIndex === -1) {
      return res.json(__requestResponse("404", "Clinical finding not found"));
    }

    profiling.ClinicalFindings[findingIndex] = {
      ...profiling.ClinicalFindings[findingIndex].toObject(),
      ...updateData,
      _id: profiling.ClinicalFindings[findingIndex]._id
    };

    await profiling.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientProfiling",
      "UPDATE",
      "CLINICAL_FINDINGS",
      JSON.stringify(oldValue),
      JSON.stringify(profiling.ClinicalFindings),
      profiling._id,
      req.body.UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, profiling.ClinicalFindings));
  } catch (error) {
    console.error("Update Clinical Finding Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Delete Clinical Finding
exports.deleteClinicalFinding = async (req, res) => {
  try {
    const { patientId, findingId } = req.params;
    const { UpdatedBy } = req.body;

    const profiling = await PatientProfiling.findOne({ 
      PatientId: patientId, 
      IsActive: true, 
      IsDeleted: false 
    });

    if (!profiling) {
      return res.json(__requestResponse("404", "Patient profiling not found"));
    }

    const oldValue = __deepClone(profiling.ClinicalFindings);
    profiling.ClinicalFindings = profiling.ClinicalFindings.filter(
      finding => finding._id.toString() !== findingId
    );

    await profiling.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientProfiling",
      "DELETE",
      "CLINICAL_FINDINGS",
      JSON.stringify(oldValue),
      JSON.stringify(profiling.ClinicalFindings),
      profiling._id,
      UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, profiling.ClinicalFindings));
  } catch (error) {
    console.error("Delete Clinical Finding Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== VITALS/PHYSICAL EXAMINATIONS SECTION ====================

// Add Vital/Physical Examination
exports.addVitalExamination = async (req, res) => {
  try {
    const { patientId } = req.params;
    const vitalData = req.body;

    const profiling = await PatientProfiling.findOne({ 
      PatientId: patientId, 
      IsActive: true, 
      IsDeleted: false 
    });

    if (!profiling) {
      return res.json(__requestResponse("404", "Patient profiling not found"));
    }

    const oldValue = __deepClone(profiling.VitalsPhysicalExaminations);

    profiling.VitalsPhysicalExaminations.push({
      ...vitalData,
      CreatedAt: new Date()
    });

    await profiling.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientProfiling",
      "UPDATE",
      "VITALS",
      JSON.stringify(oldValue),
      JSON.stringify(profiling.VitalsPhysicalExaminations),
      profiling._id,
      req.body.UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, profiling.VitalsPhysicalExaminations));
  } catch (error) {
    console.error("Add Vital Examination Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Update Vital/Physical Examination
exports.updateVitalExamination = async (req, res) => {
  try {
    const { patientId, vitalId } = req.params;
    const updateData = req.body;

    const profiling = await PatientProfiling.findOne({ 
      PatientId: patientId, 
      IsActive: true, 
      IsDeleted: false 
    });

    if (!profiling) {
      return res.json(__requestResponse("404", "Patient profiling not found"));
    }

    const oldValue = __deepClone(profiling.VitalsPhysicalExaminations);
    const vitalIndex = profiling.VitalsPhysicalExaminations.findIndex(
      vital => vital._id.toString() === vitalId
    );

    if (vitalIndex === -1) {
      return res.json(__requestResponse("404", "Vital examination not found"));
    }

    profiling.VitalsPhysicalExaminations[vitalIndex] = {
      ...profiling.VitalsPhysicalExaminations[vitalIndex].toObject(),
      ...updateData,
      _id: profiling.VitalsPhysicalExaminations[vitalIndex]._id
    };

    await profiling.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientProfiling",
      "UPDATE",
      "VITALS",
      JSON.stringify(oldValue),
      JSON.stringify(profiling.VitalsPhysicalExaminations),
      profiling._id,
      req.body.UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, profiling.VitalsPhysicalExaminations));
  } catch (error) {
    console.error("Update Vital Examination Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Delete Vital/Physical Examination
exports.deleteVitalExamination = async (req, res) => {
  try {
    const { patientId, vitalId } = req.params;
    const { UpdatedBy } = req.body;

    const profiling = await PatientProfiling.findOne({ 
      PatientId: patientId, 
      IsActive: true, 
      IsDeleted: false 
    });

    if (!profiling) {
      return res.json(__requestResponse("404", "Patient profiling not found"));
    }

    const oldValue = __deepClone(profiling.VitalsPhysicalExaminations);
    profiling.VitalsPhysicalExaminations = profiling.VitalsPhysicalExaminations.filter(
      vital => vital._id.toString() !== vitalId
    );

    await profiling.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientProfiling",
      "DELETE",
      "VITALS",
      JSON.stringify(oldValue),
      JSON.stringify(profiling.VitalsPhysicalExaminations),
      profiling._id,
      UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, profiling.VitalsPhysicalExaminations));
  } catch (error) {
    console.error("Delete Vital Examination Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== DIAGNOSTICS/INVESTIGATIONS SECTION ====================

// Add Investigation
exports.addInvestigation = async (req, res) => {
  try {
    const { patientId } = req.params;
    const investigationData = req.body;

    const profiling = await PatientProfiling.findOne({ 
      PatientId: patientId, 
      IsActive: true, 
      IsDeleted: false 
    });

    if (!profiling) {
      return res.json(__requestResponse("404", "Patient profiling not found"));
    }

    const oldValue = __deepClone(profiling.DiagnosticsInvestigations);

    profiling.DiagnosticsInvestigations.push({
      ...investigationData,
      CreatedAt: new Date()
    });

    await profiling.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientProfiling",
      "UPDATE",
      "INVESTIGATIONS",
      JSON.stringify(oldValue),
      JSON.stringify(profiling.DiagnosticsInvestigations),
      profiling._id,
      req.body.UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, profiling.DiagnosticsInvestigations));
  } catch (error) {
    console.error("Add Investigation Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Update Investigation
exports.updateInvestigation = async (req, res) => {
  try {
    const { patientId, investigationId } = req.params;
    const updateData = req.body;

    const profiling = await PatientProfiling.findOne({ 
      PatientId: patientId, 
      IsActive: true, 
      IsDeleted: false 
    });

    if (!profiling) {
      return res.json(__requestResponse("404", "Patient profiling not found"));
    }

    const oldValue = __deepClone(profiling.DiagnosticsInvestigations);
    const investigationIndex = profiling.DiagnosticsInvestigations.findIndex(
      investigation => investigation._id.toString() === investigationId
    );

    if (investigationIndex === -1) {
      return res.json(__requestResponse("404", "Investigation not found"));
    }

    profiling.DiagnosticsInvestigations[investigationIndex] = {
      ...profiling.DiagnosticsInvestigations[investigationIndex].toObject(),
      ...updateData,
      _id: profiling.DiagnosticsInvestigations[investigationIndex]._id
    };

    await profiling.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientProfiling",
      "UPDATE",
      "INVESTIGATIONS",
      JSON.stringify(oldValue),
      JSON.stringify(profiling.DiagnosticsInvestigations),
      profiling._id,
      req.body.UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, profiling.DiagnosticsInvestigations));
  } catch (error) {
    console.error("Update Investigation Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Delete Investigation
exports.deleteInvestigation = async (req, res) => {
  try {
    const { patientId, investigationId } = req.params;
    const { UpdatedBy } = req.body;

    const profiling = await PatientProfiling.findOne({ 
      PatientId: patientId, 
      IsActive: true, 
      IsDeleted: false 
    });

    if (!profiling) {
      return res.json(__requestResponse("404", "Patient profiling not found"));
    }

    const oldValue = __deepClone(profiling.DiagnosticsInvestigations);
    profiling.DiagnosticsInvestigations = profiling.DiagnosticsInvestigations.filter(
      investigation => investigation._id.toString() !== investigationId
    );

    await profiling.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientProfiling",
      "DELETE",
      "INVESTIGATIONS",
      JSON.stringify(oldValue),
      JSON.stringify(profiling.DiagnosticsInvestigations),
      profiling._id,
      UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, profiling.DiagnosticsInvestigations));
  } catch (error) {
    console.error("Delete Investigation Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== DIAGNOSIS SECTION ====================

// Add Diagnosis
exports.addDiagnosis = async (req, res) => {
  try {
    const { patientId } = req.params;
    const diagnosisData = req.body;

    const profiling = await PatientProfiling.findOne({ 
      PatientId: patientId, 
      IsActive: true, 
      IsDeleted: false 
    });

    if (!profiling) {
      return res.json(__requestResponse("404", "Patient profiling not found"));
    }

    const oldValue = __deepClone(profiling.Diagnosis);

    profiling.Diagnosis.push({
      ...diagnosisData,
      CreatedAt: new Date()
    });

    await profiling.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientProfiling",
      "UPDATE",
      "DIAGNOSIS",
      JSON.stringify(oldValue),
      JSON.stringify(profiling.Diagnosis),
      profiling._id,
      req.body.UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, profiling.Diagnosis));
  } catch (error) {
    console.error("Add Diagnosis Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Update Diagnosis
exports.updateDiagnosis = async (req, res) => {
  try {
    const { patientId, diagnosisId } = req.params;
    const updateData = req.body;

    const profiling = await PatientProfiling.findOne({ 
      PatientId: patientId, 
      IsActive: true, 
      IsDeleted: false 
    });

    if (!profiling) {
      return res.json(__requestResponse("404", "Patient profiling not found"));
    }

    const oldValue = __deepClone(profiling.Diagnosis);
    const diagnosisIndex = profiling.Diagnosis.findIndex(
      diagnosis => diagnosis._id.toString() === diagnosisId
    );

    if (diagnosisIndex === -1) {
      return res.json(__requestResponse("404", "Diagnosis not found"));
    }

    profiling.Diagnosis[diagnosisIndex] = {
      ...profiling.Diagnosis[diagnosisIndex].toObject(),
      ...updateData,
      _id: profiling.Diagnosis[diagnosisIndex]._id
    };

    await profiling.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientProfiling",
      "UPDATE",
      "DIAGNOSIS",
      JSON.stringify(oldValue),
      JSON.stringify(profiling.Diagnosis),
      profiling._id,
      req.body.UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, profiling.Diagnosis));
  } catch (error) {
    console.error("Update Diagnosis Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Delete Diagnosis
exports.deleteDiagnosis = async (req, res) => {
  try {
    const { patientId, diagnosisId } = req.params;
    const { UpdatedBy } = req.body;

    const profiling = await PatientProfiling.findOne({ 
      PatientId: patientId, 
      IsActive: true, 
      IsDeleted: false 
    });

    if (!profiling) {
      return res.json(__requestResponse("404", "Patient profiling not found"));
    }

    const oldValue = __deepClone(profiling.Diagnosis);
    profiling.Diagnosis = profiling.Diagnosis.filter(
      diagnosis => diagnosis._id.toString() !== diagnosisId
    );

    await profiling.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientProfiling",
      "DELETE",
      "DIAGNOSIS",
      JSON.stringify(oldValue),
      JSON.stringify(profiling.Diagnosis),
      profiling._id,
      UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, profiling.Diagnosis));
  } catch (error) {
    console.error("Delete Diagnosis Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== TREATMENT TO DATE SECTION ====================

// Update Treatment to Date
exports.updateTreatmentToDate = async (req, res) => {
  try {
    const { patientId } = req.params;
    const treatmentData = req.body;

    const profiling = await PatientProfiling.findOne({ 
      PatientId: patientId, 
      IsActive: true, 
      IsDeleted: false 
    });

    if (!profiling) {
      return res.json(__requestResponse("404", "Patient profiling not found"));
    }

    const oldValue = __deepClone(profiling.TreatmentToDate);

    profiling.TreatmentToDate = {
      ...profiling.TreatmentToDate,
      ...treatmentData
    };

    await profiling.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientProfiling",
      "UPDATE",
      "TREATMENT_TO_DATE",
      JSON.stringify(oldValue),
      JSON.stringify(profiling.TreatmentToDate),
      profiling._id,
      req.body.UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, profiling.TreatmentToDate));
  } catch (error) {
    console.error("Update Treatment to Date Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Add Treatment Medicine
exports.addTreatmentMedicine = async (req, res) => {
  try {
    const { patientId } = req.params;
    const medicineData = req.body;

    const profiling = await PatientProfiling.findOne({ 
      PatientId: patientId, 
      IsActive: true, 
      IsDeleted: false 
    });

    if (!profiling) {
      return res.json(__requestResponse("404", "Patient profiling not found"));
    }

    const oldValue = __deepClone(profiling.TreatmentToDate.Medicines);

    profiling.TreatmentToDate.Medicines.push({
      ...medicineData,
      CreatedAt: new Date()
    });

    await profiling.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientProfiling",
      "UPDATE",
      "TREATMENT_MEDICINES",
      JSON.stringify(oldValue),
      JSON.stringify(profiling.TreatmentToDate.Medicines),
      profiling._id,
      req.body.UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, profiling.TreatmentToDate.Medicines));
  } catch (error) {
    console.error("Add Treatment Medicine Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== SEARCH AND ANALYTICS SECTION ====================

// Search Patients by Symptom
exports.searchBySymptom = async (req, res) => {
  try {
    const { symptomId } = req.params;

    const patients = await PatientProfiling.find({
      $or: [
        { "ChiefComplaints.Complaint": symptomId },
        { "ClinicalFindings.Symptoms": symptomId }
      ],
      IsActive: true,
      IsDeleted: false
    }).populate('PatientId');

    return res.json(__requestResponse("200", __SUCCESS, patients));
  } catch (error) {
    console.error("Search by Symptom Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Search Patients by Diagnosis
exports.searchByDiagnosis = async (req, res) => {
  try {
    const { diagnosisId } = req.params;

    const patients = await PatientProfiling.find({
      "Diagnosis.CurrentDiagnosis": diagnosisId,
      IsActive: true,
      IsDeleted: false
    }).populate('PatientId');

    return res.json(__requestResponse("200", __SUCCESS, patients));
  } catch (error) {
    console.error("Search by Diagnosis Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Search Patients by Medication
exports.searchByMedication = async (req, res) => {
  try {
    const { medicationId } = req.params;

    const patients = await PatientProfiling.find({
      $or: [
        { "MedicalSummary.PastMedications.Medicines": medicationId },
        { "TreatmentToDate.Medicines.Medicine": medicationId }
      ],
      IsActive: true,
      IsDeleted: false
    }).populate('PatientId');

    return res.json(__requestResponse("200", __SUCCESS, patients));
  } catch (error) {
    console.error("Search by Medication Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== LOOKUP HELPER SECTION ====================

// Get Lookups by Type
exports.getLookupsByType = async (req, res) => {
  try {
    const { lookupType } = req.params;

    const lookups = await AdminLookups.find({
      lookup_type: lookupType,
      IsActive: true,
      IsDeleted: false
    });

    return res.json(__requestResponse("200", __SUCCESS, lookups));
  } catch (error) {
    console.error("Get Lookups by Type Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Get Investigations by Category
exports.getInvestigationsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const investigations = await InvestigationMaster.find({
      InvestigationCategoryId: categoryId,
      IsActive: true,
      IsDeleted: false
    });

    return res.json(__requestResponse("200", __SUCCESS, investigations));
  } catch (error) {
    console.error("Get Investigations by Category Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Get Vital Parameters
exports.getVitalParameters = async (req, res) => {
  try {
    const vitalParameters = await AdminLookups.find({
      lookup_type: "vital_parameters",
      IsActive: true,
      IsDeleted: false
    });

    return res.json(__requestResponse("200", __SUCCESS, vitalParameters));
  } catch (error) {
    console.error("Get Vital Parameters Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};