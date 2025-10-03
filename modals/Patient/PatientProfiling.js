// const mongoose = require("mongoose");
// const { Schema } = mongoose;

// // PATIENT PROFILING SCHEMA
// const PatientProfilingSchema = new Schema(
//   {
//     // 1. PATIENT ID
//     PatientId: {
//       type: Schema.Types.ObjectId,
//       ref: "patient_master",
//       index: true,
//     },

//     // 2. CHIEF COMPLAINTS (Multiple with Add more)
//     ChiefComplaints: [
//       {
//         // a. Symptom Class (Multiple Selection) - lookup_type: "SYMPTOM_CLASS"
//         SymptomClass: [
//           {
//             type: Schema.Types.ObjectId,
//             ref: "admin_lookups",
//           },
//         ],

//         // b. Complaint (Single Selection - filtered by Symptom Class) - lookup_type: "SYMPTOM"
//         Complaint: {
//           type: Schema.Types.ObjectId,
//           ref: "admin_lookups",
//         },

//         // c. Duration (Months)
//         Duration: {
//           type: Number,
//           min: 0,
//         },

//         // d. Severity Grade (5 color grades)
//         SeverityGrade: {
//           type: Number,
//           min: 1,
//           max: 5,
//           enum: [1, 2, 3, 4, 5],
//         },

//         // e. Aggravating Factors (Multiple Selection) - lookup_type: "AGGRAVATING_FACTOR"
//         AggravatingFactors: [
//           {
//             type: Schema.Types.ObjectId,
//             ref: "admin_lookups",
//           },
//         ],

//         // f. Current Medications (Autocomplete) - lookup_type: "PHARMACEUTICAL_SALT"
//         CurrentMedications: {
//           type: Schema.Types.ObjectId,
//           ref: "admin_lookups",
//         },

//         // g. Dosage (Autocomplete) - lookup_type: "DOSAGE"
//         Dosage: {
//           type: Schema.Types.ObjectId,
//           ref: "admin_lookups",
//         },

//         // h. Frequency (Single Selection) - lookup_type: "MEDICINE_FREQUENCY"
//         Frequency: {
//           type: Schema.Types.ObjectId,
//           ref: "admin_lookups",
//         },

//         // i. Current Therapies (Autocomplete) - lookup_type: "THERAPY"
//         CurrentTherapies: {
//           type: Schema.Types.ObjectId,
//           ref: "admin_lookups",
//         },

//         CreatedAt: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],

//     // 3. MEDICAL SUMMARY
//     MedicalSummary: {
//       // a. Past Illness (Multiple Selection) - lookup_type: "DISEASE"
//       PastIllness: [
//         {
//           type: Schema.Types.ObjectId,
//           ref: "admin_lookups",
//         },
//       ],

//       // b. Past Surgeries (Multiple Selection) - lookup_type: "PROCEDURE"
//       PastSurgeries: [
//         {
//           type: Schema.Types.ObjectId,
//           ref: "admin_lookups",
//         },
//       ],

//       // c. Past Accidents/Trauma (Multiple Selection) - lookup_type: "TRAUMA"
//       PastAccidentsTrauma: [
//         {
//           type: Schema.Types.ObjectId,
//           ref: "admin_lookups",
//         },
//       ],

//       // d. Known Allergies (Multiple Selection) - lookup_type: "ALLERGY"
//       KnownAllergies: [
//         {
//           type: Schema.Types.ObjectId,
//           ref: "admin_lookups",
//         },
//       ],

//       // e. Past Medications (Multiple with Add More)
//       PastMedications: [
//         {
//           // i. Medicines (Autocomplete) - lookup_type: "SALT"
//           Medicines: {
//             type: Schema.Types.ObjectId,
//             ref: "admin_lookups",
//           },

//           // ii. Dosage (Autocomplete) - lookup_type: "DOSAGE"
//           Dosage: {
//             type: Schema.Types.ObjectId,
//             ref: "admin_lookups",
//           },

//           // iii. Frequency (Single Selection) - lookup_type: "MEDICINE_FREQUENCY"
//           Frequency: {
//             type: Schema.Types.ObjectId,
//             ref: "admin_lookups",
//           },

//           // iv. Therapies (Autocomplete) - lookup_type: "THERAPY"
//           Therapies: {
//             type: Schema.Types.ObjectId,
//             ref: "admin_lookups",
//           },

//           CreatedAt: {
//             type: Date,
//             default: Date.now,
//           },
//         },
//       ],

//       // f. Occupational Profile (Multiple Selection) - lookup_type: "OCCUPATION"
//       OccupationalProfile: [
//         {
//           type: Schema.Types.ObjectId,
//           ref: "admin_lookups",
//         },
//       ],

//       // g. Habits & Lifestyles (Multiple Selection) - lookup_type: "HABITS"
//       HabitsLifestyles: [
//         {
//           type: Schema.Types.ObjectId,
//           ref: "admin_lookups",
//         },
//       ],

//       // h. Family History (Multiple Selection) - lookup_type: "DISEASE"
//       FamilyHistory: [
//         {
//           type: Schema.Types.ObjectId,
//           ref: "admin_lookups",
//         },
//       ],
//     },

//     // 4. CLINICAL FINDINGS
//     ClinicalFindings: [
//       {
//         // a. Symptoms (Single Selection) - lookup_type: "SYMPTOM"
//         Symptoms: {
//           type: Schema.Types.ObjectId,
//           ref: "admin_lookups",
//         },

//         // b. Duration (Months)
//         Duration: {
//           type: Number,
//           min: 0,
//         },

//         // c. Severity Grade (5 color grades)
//         SeverityGrade: {
//           type: Number,
//           min: 1,
//           max: 5,
//           enum: [1, 2, 3, 4, 5],
//         },

//         // d. Aggravating Factors (Multiple Selection) - lookup_type: "AGGRAVATING_FACTOR"
//         AggravatingFactors: [
//           {
//             type: Schema.Types.ObjectId,
//             ref: "admin_lookups",
//           },
//         ],

//         CreatedAt: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],

//     // 5. VITALS/PHYSICAL EXAMINATIONS (Multiple with Add More)
//     VitalsPhysicalExaminations: [
//       {
//         // a. Parameter (Single Selection - Investigation Category = "VITAL PARAMETER")
//         Parameter: {
//           type: Schema.Types.ObjectId,
//           ref: "investigation_master",
//         },

//         // b. Value (Numerical Value)
//         Value: {
//           type: Number,
//         },

//         // c. Abnormalities (Multiple Selection from Investigation Master)
//         Abnormalities: [
//           {
//             type: String,
//             trim: true,
//           },
//         ],

//         CreatedAt: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],

//     // 6. DIAGNOSTICS/INVESTIGATIONS (Multiple with Add More)
//     DiagnosticsInvestigations: [
//       {
//         // a. Investigation Category (Radio Button) - lookup_type: "INVESTIGATION_CATEGORY"
//         InvestigationCategory: {
//           type: Schema.Types.ObjectId,
//           ref: "admin_lookups",
//         },

//         // b. Investigation (Single Selection - filtered by Investigation Category)
//         Investigation: {
//           type: Schema.Types.ObjectId,
//           ref: "investigation_master",
//         },

//         // c. Value (Numerical Value)
//         Value: {
//           type: Number,
//         },

//         // d. Abnormalities (Multiple Selection)
//         Abnormalities: [
//           {
//             type: String,
//             trim: true,
//           },
//         ],

//         // e. Upload (Investigation Report)
//         InvestigationReport: {
//           type: String,
//           trim: true,
//         },

//         // f. Upload (Interpretation)
//         Interpretation: {
//           type: String,
//           trim: true,
//         },

//         // g. URL (Google Drive Link)
//         GoogleDriveURL: {
//           type: String,
//           trim: true,
//         },

//         CreatedAt: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],

//     // 7. DIAGNOSIS (Multiple with Add More)
//     Diagnosis: [
//       {
//         // a. Current Diagnosis (Single Selection) - lookup_type: "DIAGNOSIS"
//         CurrentDiagnosis: {
//           type: Schema.Types.ObjectId,
//           ref: "admin_lookups",
//         },

//         // b. Type of Diagnosis (Single Selection) - lookup_type: "DIAGNOSIS_TYPE"
//         TypeOfDiagnosis: {
//           type: Schema.Types.ObjectId,
//           ref: "admin_lookups",
//         },

//         // c. Clinical Note (Input)
//         ClinicalNote: {
//           type: String,
//           trim: true,
//         },

//         CreatedAt: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],

//     // 8. TREATMENT TO DATE
//     TreatmentToDate: {
//       // a-d. Medicines (Multiple with Add More)
//       Medicines: [
//         {
//           // a. Medicines (Autocomplete) - lookup_type: "SALT"
//           Medicine: {
//             type: Schema.Types.ObjectId,
//             ref: "admin_lookups",
//           },

//           // b. Dosage (Autocomplete) - lookup_type: "DOSAGE"
//           Dosage: {
//             type: Schema.Types.ObjectId,
//             ref: "admin_lookups",
//           },

//           // c. Frequency (Single Selection) - lookup_type: "MEDICINE_FREQUENCY"
//           Frequency: {
//             type: Schema.Types.ObjectId,
//             ref: "admin_lookups",
//           },

//           CreatedAt: {
//             type: Date,
//             default: Date.now,
//           },
//         },
//       ],

//       // e. Surgery/Procedure (Multiple Selection - Autocomplete) - lookup_type: "PROCEDURE"
//       SurgeryProcedure: [
//         {
//           type: Schema.Types.ObjectId,
//           ref: "admin_lookups",
//         },
//       ],

//       // f. Therapy (Multiple Selection - Autocomplete) - lookup_type: "THERAPY"
//       Therapy: [
//         {
//           type: Schema.Types.ObjectId,
//           ref: "admin_lookups",
//         },
//       ],

//       // g. Lifestyle Interventions (Multiple Selection - Autocomplete) - lookup_type: "LIFESTYLE_INTERVENTION"
//       LifestyleInterventions: [
//         {
//           type: Schema.Types.ObjectId,
//           ref: "admin_lookups",
//         },
//       ],

//       // h. Patient's Response
//       PatientResponse: {
//         type: String,
//         trim: true,
//       },

//       // i. Clinical Note
//       ClinicalNote: {
//         type: String,
//         trim: true,
//       },
//     },

//     // SYSTEM FIELDS
//     CreatedBy: {
//       type: Schema.Types.ObjectId,
//       ref: "asset_master",
//     },

//     UpdatedBy: {
//       type: Schema.Types.ObjectId,
//       ref: "asset_master",
//     },

//     IsActive: {
//       type: Boolean,
//       default: true,
//     },

//     IsDeleted: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // INDEXES
// PatientProfilingSchema.index({ PatientId: 1 });
// PatientProfilingSchema.index({ IsActive: 1, IsDeleted: 1 });
// PatientProfilingSchema.index({ CreatedBy: 1 });
// PatientProfilingSchema.index({ "ChiefComplaints.SymptomClass": 1 });
// PatientProfilingSchema.index({ "ChiefComplaints.Complaint": 1 });
// PatientProfilingSchema.index({ "MedicalSummary.PastIllness": 1 });
// PatientProfilingSchema.index({ "ClinicalFindings.Symptoms": 1 });
// PatientProfilingSchema.index({ "Diagnosis.CurrentDiagnosis": 1 });
// PatientProfilingSchema.index({ "TreatmentToDate.Medicines.Medicine": 1 });

// // VIRTUAL FIELDS
// PatientProfilingSchema.virtual("TotalComplaints").get(function () {
//   return this.ChiefComplaints ? this.ChiefComplaints.length : 0;
// });

// PatientProfilingSchema.virtual("TotalDiagnoses").get(function () {
//   return this.Diagnosis ? this.Diagnosis.length : 0;
// });

// PatientProfilingSchema.virtual("TotalInvestigations").get(function () {
//   return this.DiagnosticsInvestigations ? this.DiagnosticsInvestigations.length : 0;
// });

// // METHODS
// PatientProfilingSchema.methods.getLatestDiagnosis = function () {
//   if (!this.Diagnosis || this.Diagnosis.length === 0) return null;
//   return this.Diagnosis.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt))[0];
// };

// PatientProfilingSchema.methods.getCurrentMedications = function () {
//   if (!this.TreatmentToDate || !this.TreatmentToDate.Medicines) return [];
//   return this.TreatmentToDate.Medicines;
// };

// PatientProfilingSchema.methods.getActiveClinicalFindings = function () {
//   if (!this.ClinicalFindings) return [];
//   return this.ClinicalFindings.filter(finding => finding.SeverityGrade >= 3);
// };

// // STATIC METHODS
// PatientProfilingSchema.statics.findByPatientId = function (patientId) {
//   return this.findOne({ PatientId: patientId, IsActive: true, IsDeleted: false })
//     .populate("PatientId", "Name PatientId PhoneNumber")
//     .populate("ChiefComplaints.SymptomClass", "lookup_value")
//     .populate("ChiefComplaints.Complaint", "lookup_value")
//     .populate("ChiefComplaints.AggravatingFactors", "lookup_value")
//     .populate("ChiefComplaints.CurrentMedications", "lookup_value")
//     .populate("ChiefComplaints.Dosage", "lookup_value")
//     .populate("ChiefComplaints.Frequency", "lookup_value")
//     .populate("ChiefComplaints.CurrentTherapies", "lookup_value")
//     .populate("MedicalSummary.PastIllness", "lookup_value")
//     .populate("MedicalSummary.PastSurgeries", "lookup_value")
//     .populate("MedicalSummary.PastAccidentsTrauma", "lookup_value")
//     .populate("MedicalSummary.KnownAllergies", "lookup_value")
//     .populate("MedicalSummary.PastMedications.Medicines", "lookup_value")
//     .populate("MedicalSummary.PastMedications.Dosage", "lookup_value")
//     .populate("MedicalSummary.PastMedications.Frequency", "lookup_value")
//     .populate("MedicalSummary.PastMedications.Therapies", "lookup_value")
//     .populate("MedicalSummary.OccupationalProfile", "lookup_value")
//     .populate("MedicalSummary.HabitsLifestyles", "lookup_value")
//     .populate("MedicalSummary.FamilyHistory", "lookup_value")
//     .populate("ClinicalFindings.Symptoms", "lookup_value")
//     .populate("ClinicalFindings.AggravatingFactors", "lookup_value")
//     .populate("VitalsPhysicalExaminations.Parameter", "InvestigationName")
//     .populate("DiagnosticsInvestigations.InvestigationCategory", "lookup_value")
//     .populate("DiagnosticsInvestigations.Investigation", "InvestigationName")
//     .populate("Diagnosis.CurrentDiagnosis", "lookup_value")
//     .populate("Diagnosis.TypeOfDiagnosis", "lookup_value")
//     .populate("TreatmentToDate.Medicines.Medicine", "lookup_value")
//     .populate("TreatmentToDate.Medicines.Dosage", "lookup_value")
//     .populate("TreatmentToDate.Medicines.Frequency", "lookup_value")
//     .populate("TreatmentToDate.SurgeryProcedure", "lookup_value")
//     .populate("TreatmentToDate.Therapy", "lookup_value")
//     .populate("TreatmentToDate.LifestyleInterventions", "lookup_value")
//     .populate("CreatedBy", "Name")
//     .populate("UpdatedBy", "Name");
// };

// PatientProfilingSchema.statics.searchBySymptom = function (symptomId) {
//   return this.find({
//     $or: [
//       { "ChiefComplaints.Complaint": symptomId },
//       { "ClinicalFindings.Symptoms": symptomId }
//     ],
//     IsActive: true,
//     IsDeleted: false
//   }).populate("PatientId", "Name PatientId");
// };

// PatientProfilingSchema.statics.findByDiagnosis = function (diagnosisId) {
//   return this.find({
//     "Diagnosis.CurrentDiagnosis": diagnosisId,
//     IsActive: true,
//     IsDeleted: false
//   }).populate("PatientId", "Name PatientId");
// };

// PatientProfilingSchema.statics.findByMedication = function (medicationId) {
//   return this.find({
//     $or: [
//       { "ChiefComplaints.CurrentMedications": medicationId },
//       { "TreatmentToDate.Medicines.Medicine": medicationId }
//     ],
//     IsActive: true,
//     IsDeleted: false
//   }).populate("PatientId", "Name PatientId");
// };

// // Helper static method to get lookup data by type
// PatientProfilingSchema.statics.getLookupsByType = function (lookupType) {
//   const AdminLookups = mongoose.model("admin_lookups");
//   return AdminLookups.find({
//     lookup_type: lookupType,
//     is_active: true
//   }).sort({ sort_order: 1, lookup_value: 1 });
// };

// // PRE-SAVE MIDDLEWARE
// PatientProfilingSchema.pre("save", function (next) {
//   if (this.isNew) {
//     this.CreatedAt = new Date();
//   }
//   this.UpdatedAt = new Date();
//   next();
// });

// // PRE-UPDATE MIDDLEWARE
// PatientProfilingSchema.pre(["updateOne", "findOneAndUpdate"], function (next) {
//   this.set({ UpdatedAt: new Date() });
//   next();
// });

// module.exports = mongoose.model("patient_profiling", PatientProfilingSchema);
