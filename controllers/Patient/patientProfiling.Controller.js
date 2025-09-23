const PatientMaster = require("../../modals/Patient/PatientMaster");
const PatientChiefComplaints = require("../../modals/Patient/PatientChiefComplaints");
const PatientMedicalSummary = require("../../modals/Patient/PatientMedicalSummary");
const PatientClinicalFindings = require("../../modals/Patient/PatientClinicalFindings");
const PatientVitals = require("../../modals/Patient/PatientVitals");
const PatientInvestigations = require("../../modals/Patient/PatientInvestigations");
const PatientDiagnosis = require("../../modals/Patient/PatientDiagnosis");
const PatientTreatment = require("../../modals/Patient/PatientTreatment");
const AdminLookups = require("../../modals/Common/lookupmodel");
const InvestigationMaster = require("../../modals/Common/InvestigationMaster");
const { __requestResponse } = require("../../utils/constant");
const { __SUCCESS, __SOME_ERROR } = require("../../utils/variable");
const { __deepClone } = require("../../utils/constant");
const { __CreateAuditLog } = require("../../utils/auditlog");
const mongoose = require("mongoose");

// Test Route
exports.test = async (req, res) => {
  return res.json(__requestResponse("200", "Patient Profiling API Working"));
};

// ==================== DASHBOARD API ====================

// Get Complete Patient Dashboard with all data
exports.getPatientDashboard = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.json(__requestResponse("400", "Invalid Patient ID"));
    }

    // Fetch all data in parallel for better performance
    const [
      patientInfo,
      chiefComplaints,
      medicalSummary,
      clinicalFindings,
      vitals,
      investigations,
      diagnoses,
      treatment
    ] = await Promise.all([
      PatientMaster.findById(patientId).select("-Password"),
      PatientChiefComplaints.findByPatientId(patientId, 10), // Latest 10
      PatientMedicalSummary.findByPatientId(patientId),
      PatientClinicalFindings.findByPatientId(patientId, 10), // Latest 10
      PatientVitals.findLatestVitals(patientId, 10), // Latest 10
      PatientInvestigations.findByPatientId(patientId, 20), // Latest 20
      PatientDiagnosis.findByPatientId(patientId, 10), // Latest 10
      PatientTreatment.findByPatientId(patientId)
    ]);

    if (!patientInfo) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    // Calculate summary statistics
    const summaryStats = {
      totalChiefComplaints: chiefComplaints.length,
      activeSevereComplaints: chiefComplaints.filter(c => c.SeverityGrade >= 4).length,
      totalInvestigations: investigations.length,
      abnormalInvestigations: investigations.filter(i => i.Abnormalities && i.Abnormalities.length > 0).length,
      totalDiagnoses: diagnoses.length,
      hasAllergies: medicalSummary && medicalSummary.KnownAllergies && medicalSummary.KnownAllergies.length > 0,
      hasActiveTreatment: treatment && treatment.hasActiveTreatment()
    };

    const dashboardData = {
      patientInfo,
      summaryStats,
      chiefComplaints,
      medicalSummary,
      clinicalFindings,
      vitals,
      investigations,
      diagnoses,
      treatment
    };

    return res.json(__requestResponse("200", __SUCCESS, dashboardData));
  } catch (error) {
    console.error("Get Patient Dashboard Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== CHIEF COMPLAINTS APIS ====================

// Get Chief Complaints List with filter
exports.getChiefComplaintsList = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { severityGrade, limit = 50 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.json(__requestResponse("400", "Invalid Patient ID"));
    }

    let query = { PatientId: patientId, IsActive: true, IsDeleted: false };
    
    if (severityGrade) {
      query.SeverityGrade = parseInt(severityGrade);
    }

    const complaints = await PatientChiefComplaints
      .find(query)
      .sort({ CreatedAt: -1 })
      .limit(parseInt(limit))
      .populate("SymptomClass", "lookup_value")
      .populate("Complaint", "lookup_value")
      .populate("AggravatingFactors", "lookup_value")
      .populate("CurrentMedications", "lookup_value")
      .populate("Dosage", "lookup_value")
      .populate("Frequency", "lookup_value")
      .populate("CurrentTherapies", "lookup_value");

    return res.json(__requestResponse("200", __SUCCESS, complaints));
  } catch (error) {
    console.error("Get Chief Complaints List Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Add Chief Complaint
exports.addChiefComplaint = async (req, res) => {
  try {
    const { patientId } = req.params;
    const complaintData = req.body;

    const patientExists = await PatientMaster.findById(patientId);
    if (!patientExists) {
      return res.json(__requestResponse("404", "Patient not found"));
    }

    const newComplaint = new PatientChiefComplaints({
      PatientId: patientId,
      ...complaintData,
      CreatedBy: req.body.CreatedBy,
      CreatedAt: new Date()
    });

    const savedComplaint = await newComplaint.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientChiefComplaints",
      "CREATE",
      null,
      null,
      JSON.stringify(savedComplaint),
      savedComplaint._id,
      req.body.CreatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, savedComplaint));
  } catch (error) {
    console.error("Add Chief Complaint Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Update Chief Complaint
exports.updateChiefComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const updateData = req.body;

    const complaint = await PatientChiefComplaints.findById(complaintId);
    if (!complaint) {
      return res.json(__requestResponse("404", "Chief complaint not found"));
    }

    const oldValue = __deepClone(complaint);

    Object.assign(complaint, updateData);
    complaint.UpdatedBy = req.body.UpdatedBy;
    complaint.updatedAt = new Date();

    const updatedComplaint = await complaint.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientChiefComplaints",
      "UPDATE",
      null,
      JSON.stringify(oldValue),
      JSON.stringify(updatedComplaint),
      updatedComplaint._id,
      req.body.UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, updatedComplaint));
  } catch (error) {
    console.error("Update Chief Complaint Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Delete Chief Complaint (Soft Delete)
exports.deleteChiefComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await PatientChiefComplaints.findById(complaintId);
    if (!complaint) {
      return res.json(__requestResponse("404", "Chief complaint not found"));
    }

    complaint.IsDeleted = true;
    complaint.IsActive = false;
    complaint.UpdatedBy = req.body.UpdatedBy;
    complaint.updatedAt = new Date();

    await complaint.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientChiefComplaints",
      "DELETE",
      null,
      null,
      null,
      complaint._id,
      req.body.UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, "Chief complaint deleted successfully"));
  } catch (error) {
    console.error("Delete Chief Complaint Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== MEDICAL SUMMARY APIS ====================

// Get Medical Summary
exports.getMedicalSummary = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.json(__requestResponse("400", "Invalid Patient ID"));
    }

    const medicalSummary = await PatientMedicalSummary.findByPatientId(patientId);

    if (!medicalSummary) {
      // Create empty medical summary if not exists
      const newSummary = await PatientMedicalSummary.findOrCreate(patientId, req.body.CreatedBy);
      return res.json(__requestResponse("200", __SUCCESS, newSummary));
    }

    return res.json(__requestResponse("200", __SUCCESS, medicalSummary));
  } catch (error) {
    console.error("Get Medical Summary Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Update Medical Summary
exports.updateMedicalSummary = async (req, res) => {
  try {
    const { patientId } = req.params;
    const updateData = req.body;

    let medicalSummary = await PatientMedicalSummary.findOne({ PatientId: patientId });
    
    if (!medicalSummary) {
      medicalSummary = new PatientMedicalSummary({
        PatientId: patientId,
        CreatedBy: req.body.UpdatedBy
      });
    }

    const oldValue = __deepClone(medicalSummary);

    Object.assign(medicalSummary, updateData);
    medicalSummary.UpdatedBy = req.body.UpdatedBy;
    medicalSummary.updatedAt = new Date();

    const updatedSummary = await medicalSummary.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientMedicalSummary",
      "UPDATE",
      null,
      JSON.stringify(oldValue),
      JSON.stringify(updatedSummary),
      updatedSummary._id,
      req.body.UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, updatedSummary));
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

    let medicalSummary = await PatientMedicalSummary.findOne({ PatientId: patientId });
    
    if (!medicalSummary) {
      medicalSummary = await PatientMedicalSummary.findOrCreate(patientId, req.body.CreatedBy);
    }

    medicalSummary.PastMedications.push({
      ...medicationData,
      CreatedAt: new Date()
    });

    const updatedSummary = await medicalSummary.save();

    return res.json(__requestResponse("200", __SUCCESS, updatedSummary.PastMedications));
  } catch (error) {
    console.error("Add Past Medication Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== CLINICAL FINDINGS APIS ====================

// Get Clinical Findings List with filter
exports.getClinicalFindingsList = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { severityGrade, limit = 50 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.json(__requestResponse("400", "Invalid Patient ID"));
    }

    let query = { PatientId: patientId, IsActive: true, IsDeleted: false };
    
    if (severityGrade) {
      query.SeverityGrade = parseInt(severityGrade);
    }

    const findings = await PatientClinicalFindings
      .find(query)
      .sort({ CreatedAt: -1 })
      .limit(parseInt(limit))
      .populate("Symptoms", "lookup_value")
      .populate("AggravatingFactors", "lookup_value");

    return res.json(__requestResponse("200", __SUCCESS, findings));
  } catch (error) {
    console.error("Get Clinical Findings List Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Add Clinical Finding
exports.addClinicalFinding = async (req, res) => {
  try {
    const { patientId } = req.params;
    const findingData = req.body;

    const newFinding = new PatientClinicalFindings({
      PatientId: patientId,
      ...findingData,
      CreatedBy: req.body.CreatedBy,
      CreatedAt: new Date()
    });

    const savedFinding = await newFinding.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientClinicalFindings",
      "CREATE",
      null,
      null,
      JSON.stringify(savedFinding),
      savedFinding._id,
      req.body.CreatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, savedFinding));
  } catch (error) {
    console.error("Add Clinical Finding Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== VITALS/PHYSICAL EXAMINATIONS APIS ====================

// Get Vitals List with filter
exports.getVitalsList = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { parameterId, abnormalOnly, limit = 100 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.json(__requestResponse("400", "Invalid Patient ID"));
    }

    let vitals;
    
    if (abnormalOnly === 'true') {
      vitals = await PatientVitals.findAbnormalVitals(patientId);
    } else if (parameterId) {
      vitals = await PatientVitals.findByParameter(patientId, parameterId, parseInt(limit));
    } else {
      vitals = await PatientVitals.findByPatientId(patientId, parseInt(limit));
    }

    return res.json(__requestResponse("200", __SUCCESS, vitals));
  } catch (error) {
    console.error("Get Vitals List Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Add Vital
exports.addVital = async (req, res) => {
  try {
    const { patientId } = req.params;
    const vitalData = req.body;

    const newVital = new PatientVitals({
      PatientId: patientId,
      ...vitalData,
      CreatedBy: req.body.CreatedBy,
      CreatedAt: new Date()
    });

    const savedVital = await newVital.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientVitals",
      "CREATE",
      null,
      null,
      JSON.stringify(savedVital),
      savedVital._id,
      req.body.CreatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, savedVital));
  } catch (error) {
    console.error("Add Vital Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== DIAGNOSTICS/INVESTIGATIONS APIS ====================

// Get Investigations List with filter
exports.getInvestigationsList = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { categoryId, abnormalOnly, withReportsOnly, limit = 100 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.json(__requestResponse("400", "Invalid Patient ID"));
    }

    let investigations;
    
    if (abnormalOnly === 'true') {
      investigations = await PatientInvestigations.findAbnormalInvestigations(patientId);
    } else if (withReportsOnly === 'true') {
      investigations = await PatientInvestigations.findWithReports(patientId);
    } else if (categoryId) {
      investigations = await PatientInvestigations.findByCategory(patientId, categoryId);
    } else {
      investigations = await PatientInvestigations.findByPatientId(patientId, parseInt(limit));
    }

    return res.json(__requestResponse("200", __SUCCESS, investigations));
  } catch (error) {
    console.error("Get Investigations List Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Add Investigation
exports.addInvestigation = async (req, res) => {
  try {
    const { patientId } = req.params;
    const investigationData = req.body;

    const newInvestigation = new PatientInvestigations({
      PatientId: patientId,
      ...investigationData,
      CreatedBy: req.body.CreatedBy,
      CreatedAt: new Date()
    });

    const savedInvestigation = await newInvestigation.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientInvestigations",
      "CREATE",
      null,
      null,
      JSON.stringify(savedInvestigation),
      savedInvestigation._id,
      req.body.CreatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, savedInvestigation));
  } catch (error) {
    console.error("Add Investigation Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== DIAGNOSIS APIS ====================

// Get Diagnosis List
exports.getDiagnosisList = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 50 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.json(__requestResponse("400", "Invalid Patient ID"));
    }

    const diagnoses = await PatientDiagnosis.findByPatientId(patientId, parseInt(limit));

    return res.json(__requestResponse("200", __SUCCESS, diagnoses));
  } catch (error) {
    console.error("Get Diagnosis List Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Add Diagnosis
exports.addDiagnosis = async (req, res) => {
  try {
    const { patientId } = req.params;
    const diagnosisData = req.body;

    const newDiagnosis = new PatientDiagnosis({
      PatientId: patientId,
      ...diagnosisData,
      CreatedBy: req.body.CreatedBy,
      CreatedAt: new Date()
    });

    const savedDiagnosis = await newDiagnosis.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientDiagnosis",
      "CREATE",
      null,
      null,
      JSON.stringify(savedDiagnosis),
      savedDiagnosis._id,
      req.body.CreatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, savedDiagnosis));
  } catch (error) {
    console.error("Add Diagnosis Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Get Latest Diagnosis
exports.getLatestDiagnosis = async (req, res) => {
  try {
    const { patientId } = req.params;

    const diagnosis = await PatientDiagnosis.getLatestDiagnosis(patientId);

    if (!diagnosis) {
      return res.json(__requestResponse("404", "No diagnosis found for this patient"));
    }

    return res.json(__requestResponse("200", __SUCCESS, diagnosis));
  } catch (error) {
    console.error("Get Latest Diagnosis Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== TREATMENT APIS ====================

// Get Treatment
exports.getTreatment = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.json(__requestResponse("400", "Invalid Patient ID"));
    }

    const treatment = await PatientTreatment.findByPatientId(patientId);

    if (!treatment) {
      // Create empty treatment if not exists
      const newTreatment = await PatientTreatment.findOrCreate(patientId, req.body.CreatedBy);
      return res.json(__requestResponse("200", __SUCCESS, newTreatment));
    }

    return res.json(__requestResponse("200", __SUCCESS, treatment));
  } catch (error) {
    console.error("Get Treatment Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Update Treatment
exports.updateTreatment = async (req, res) => {
  try {
    const { patientId } = req.params;
    const updateData = req.body;

    let treatment = await PatientTreatment.findOne({ PatientId: patientId });
    
    if (!treatment) {
      treatment = new PatientTreatment({
        PatientId: patientId,
        CreatedBy: req.body.UpdatedBy
      });
    }

    const oldValue = __deepClone(treatment);

    Object.assign(treatment, updateData);
    treatment.UpdatedBy = req.body.UpdatedBy;
    treatment.updatedAt = new Date();

    const updatedTreatment = await treatment.save();

    // Create audit log
    await __CreateAuditLog(
      "PatientTreatment",
      "UPDATE",
      null,
      JSON.stringify(oldValue),
      JSON.stringify(updatedTreatment),
      updatedTreatment._id,
      req.body.UpdatedBy,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, updatedTreatment));
  } catch (error) {
    console.error("Update Treatment Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Add Treatment Medicine
exports.addTreatmentMedicine = async (req, res) => {
  try {
    const { patientId } = req.params;
    const medicineData = req.body;

    let treatment = await PatientTreatment.findOne({ PatientId: patientId });
    
    if (!treatment) {
      treatment = await PatientTreatment.findOrCreate(patientId, req.body.CreatedBy);
    }

    const updatedTreatment = await treatment.addMedicine({
      ...medicineData,
      CreatedAt: new Date()
    });

    return res.json(__requestResponse("200", __SUCCESS, updatedTreatment.Medicines));
  } catch (error) {
    console.error("Add Treatment Medicine Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// ==================== SEARCH APIS ====================

// Search by Symptom
exports.searchBySymptom = async (req, res) => {
  try {
    const { symptomId } = req.params;

    const results = await PatientClinicalFindings.searchBySymptom(symptomId);

    return res.json(__requestResponse("200", __SUCCESS, results));
  } catch (error) {
    console.error("Search By Symptom Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Search by Diagnosis
exports.searchByDiagnosis = async (req, res) => {
  try {
    const { diagnosisId } = req.params;

    const results = await PatientDiagnosis.findByDiagnosis(diagnosisId);

    return res.json(__requestResponse("200", __SUCCESS, results));
  } catch (error) {
    console.error("Search By Diagnosis Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};

// Search by Medication
exports.searchByMedication = async (req, res) => {
  try {
    const { medicationId } = req.params;

    const results = await PatientTreatment.findByMedication(medicationId);

    return res.json(__requestResponse("200", __SUCCESS, results));
  } catch (error) {
    console.error("Search By Medication Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
};