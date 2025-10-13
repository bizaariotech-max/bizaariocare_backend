const PatientReferral = require("../../modals/Patient/PatientReferral");
const { __requestResponse } = require("../../utils/constant");
const { __CreateAuditLog } = require("../../utils/auditlog");

// ==================== MAIN REFERRAL OPERATIONS ====================

// Test Route
exports.test = async (req, res) => {
  try {
    return res
      .status(200)
      .json(__requestResponse("200", "Patient Referral API is working", null));
  } catch (error) {
    console.error("Test error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// Get Patient Referral by ID
exports.getPatientReferral = async (req, res) => {
  try {
    const { referralId } = req.params;

    const referral = await PatientReferral.findById(referralId)
      .populate("PatientId", "Name PatientId PhoneNumber Email")
      .populate("ReferringDoctor", "Name Specialization Email PhoneNumber")
      .populate("ReferredDoctors", "Name Specialization Email PhoneNumber")
      .populate(
        "ReasonForReferral.ReasonType",
        "lookup_value lookup_description"
      )
      .populate("MedicalSpecialty", "lookup_value lookup_description")
      .populate("ReferredCity", "StationName StationType")
      .populate(
        "SecondOpinionQuestions.SecondOpinionQueries",
        "lookup_value lookup_description"
      )
      .populate(
        "ProposedSurgery.SurgeryProcedures",
        "lookup_value lookup_description"
      )
      .populate(
        "PreSurgicalConsiderations.Comorbidities",
        "lookup_value lookup_description"
      )
      .populate(
        "PreSurgicalConsiderations.RiskFactors",
        "lookup_value lookup_description"
      )
      .populate(
        "PreSurgicalConsiderations.PatientConcerns",
        "lookup_value lookup_description"
      )
      .populate(
        "PreSurgicalConsiderations.LogisticalConsiderations",
        "lookup_value lookup_description"
      )
      .populate(
        "DoctorHospitalSelection.SelectedCity",
        "StationName StationType"
      )
      .populate(
        "DoctorHospitalSelection.SelectedMedicalSpecialty",
        "lookup_value lookup_description"
      )
      .populate(
        "DoctorHospitalSelection.SelectedDoctors",
        "Name Specialization Email PhoneNumber"
      )
      .populate("ReferralResponse.RespondedBy", "Name Email")
      .populate("CreatedBy", "Name Email")
      .populate("UpdatedBy", "Name Email");

    if (!referral || referral.IsDeleted) {
      return res
        .status(404)
        .json(__requestResponse("404", "Patient referral not found", null));
    }

    return res
      .status(200)
      .json(
        __requestResponse(
          "200",
          "Patient referral retrieved successfully",
          referral
        )
      );
  } catch (error) {
    console.error("Get patient referral error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// Get Patient Referrals by Patient ID
exports.getPatientReferralsByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;

    const referrals = await PatientReferral.findByPatientId(patientId);

    return res
      .status(200)
      .json(
        __requestResponse(
          "200",
          "Patient referrals retrieved successfully",
          referrals
        )
      );
  } catch (error) {
    console.error("Get patient referrals by patient ID error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// Create Patient Referral
exports.createPatientReferral = async (req, res) => {
  try {
    const {
      PatientId,
      CaseFileId,
      ReferringDoctor,
      MedicalSpecialty,
      ReferredCity,
      ReferredDoctors,
      ReferralDateTime,
      ReferralType,
      PriorityLevel,
      AdditionalInformation,
      CreatedBy,
    } = req.body;

    const newReferral = new PatientReferral({
      PatientId,
      CaseFileId,
      ReferringDoctor,
      MedicalSpecialty,
      ReferredCity,
      ReferredDoctors,
      ReferralDateTime: ReferralDateTime || new Date(),
      ReferralType: ReferralType || "GENERAL",
      PriorityLevel: PriorityLevel || "MEDIUM",
      AdditionalInformation,
      CreatedBy,
      UpdatedBy: CreatedBy,
    });

    const savedReferral = await newReferral.save();

    // Create audit log
    await __CreateAuditLog(
      "patient_referral",
      "CREATE",
      // "REFERRAL_CREATED",
      null,
      null,
      JSON.stringify(savedReferral),
      savedReferral._id,
      CreatedBy,
      null
    );

    return res
      .status(201)
      .json(
        __requestResponse(
          "201",
          "Patient referral created successfully",
          savedReferral
        )
      );
  } catch (error) {
    console.error("Create patient referral error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// ==================== REASON FOR REFERRAL OPERATIONS ====================

// Update Reason for Referral
exports.updateReasonForReferral = async (req, res) => {
  try {
    const { referralId } = req.params;
    const { ReasonType, UpdatedBy } = req.body;

    const referral = await PatientReferral.findById(referralId);
    if (!referral || referral.IsDeleted) {
      return res
        .status(404)
        .json(__requestResponse("404", "Patient referral not found", null));
    }

    const oldValue = JSON.stringify(referral.ReasonForReferral);

    // Update reason for referral
    if (!referral.ReasonForReferral) {
      referral.ReasonForReferral = {};
    }
    referral.ReasonForReferral.ReasonType = ReasonType;
    referral.UpdatedBy = UpdatedBy;

    const updatedReferral = await referral.save();

    // Create audit log
    await __CreateAuditLog(
      "patient_referral",
      "UPDATE",
      // "REASON_FOR_REFERRAL",
      null,
      oldValue,
      JSON.stringify(updatedReferral.ReasonForReferral),
      referralId,
      UpdatedBy,
      null
    );

    return res
      .status(200)
      .json(
        __requestResponse(
          "200",
          "Reason for referral updated successfully",
          updatedReferral.ReasonForReferral
        )
      );
  } catch (error) {
    console.error("Update reason for referral error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// Add Doctor Remark
exports.addDoctorRemark = async (req, res) => {
  try {
    const { referralId } = req.params;
    const { Remark, UpdatedBy } = req.body;

    const referral = await PatientReferral.findById(referralId);
    if (!referral || referral.IsDeleted) {
      return res
        .status(404)
        .json(__requestResponse("404", "Patient referral not found", null));
    }

    const oldValue = JSON.stringify(
      referral.ReasonForReferral?.DoctorRemarks || []
    );

    // Add doctor remark
    if (!referral.ReasonForReferral) {
      referral.ReasonForReferral = { DoctorRemarks: [] };
    }
    if (!referral.ReasonForReferral.DoctorRemarks) {
      referral.ReasonForReferral.DoctorRemarks = [];
    }

    const newRemark = {
      Remark,
      CreatedAt: new Date(),
    };

    referral.ReasonForReferral.DoctorRemarks.push(newRemark);
    referral.UpdatedBy = UpdatedBy;

    const updatedReferral = await referral.save();

    // Create audit log
    await __CreateAuditLog(
      "patient_referral",
      "UPDATE",
      // "DOCTOR_REMARK_ADDED",
      null,
      oldValue,
      JSON.stringify(updatedReferral.ReasonForReferral.DoctorRemarks),
      referralId,
      UpdatedBy,
      null
    );

    const addedRemark =
      updatedReferral.ReasonForReferral.DoctorRemarks[
        updatedReferral.ReasonForReferral.DoctorRemarks.length - 1
      ];
    return res
      .status(200)
      .json(
        __requestResponse(
          "200",
          "Doctor remark added successfully",
          addedRemark
        )
      );
  } catch (error) {
    console.error("Add doctor remark error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// Update Doctor Remark
exports.updateDoctorRemark = async (req, res) => {
  try {
    const { referralId, remarkId } = req.params;
    const { Remark, UpdatedBy } = req.body;

    const referral = await PatientReferral.findById(referralId);
    if (!referral || referral.IsDeleted) {
      return res
        .status(404)
        .json(__requestResponse("404", "Patient referral not found", null));
    }

    const remarkIndex = referral.ReasonForReferral?.DoctorRemarks?.findIndex(
      (remark) => remark._id.toString() === remarkId
    );

    if (remarkIndex === -1) {
      return res
        .status(404)
        .json(__requestResponse("404", "Doctor remark not found", null));
    }

    const oldValue = JSON.stringify(
      referral.ReasonForReferral.DoctorRemarks[remarkIndex]
    );

    // Update doctor remark
    referral.ReasonForReferral.DoctorRemarks[remarkIndex].Remark = Remark;
    referral.UpdatedBy = UpdatedBy;

    const updatedReferral = await referral.save();

    // Create audit log
    await __CreateAuditLog(
      "patient_referral",
      "UPDATE",
      // "DOCTOR_REMARK_UPDATED",
      null,
      oldValue,
      JSON.stringify(
        updatedReferral.ReasonForReferral.DoctorRemarks[remarkIndex]
      ),
      referralId,
      UpdatedBy,
      null
    );

    return res
      .status(200)
      .json(
        __requestResponse(
          "200",
          "Doctor remark updated successfully",
          updatedReferral.ReasonForReferral.DoctorRemarks[remarkIndex]
        )
      );
  } catch (error) {
    console.error("Update doctor remark error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// Delete Doctor Remark
exports.deleteDoctorRemark = async (req, res) => {
  try {
    const { referralId, remarkId } = req.params;
    const { UpdatedBy } = req.body;

    const referral = await PatientReferral.findById(referralId);
    if (!referral || referral.IsDeleted) {
      return res
        .status(404)
        .json(__requestResponse("404", "Patient referral not found", null));
    }

    const remarkIndex = referral.ReasonForReferral?.DoctorRemarks?.findIndex(
      (remark) => remark._id.toString() === remarkId
    );

    if (remarkIndex === -1) {
      return res
        .status(404)
        .json(__requestResponse("404", "Doctor remark not found", null));
    }

    const oldValue = JSON.stringify(
      referral.ReasonForReferral.DoctorRemarks[remarkIndex]
    );

    // Delete doctor remark
    referral.ReasonForReferral.DoctorRemarks.splice(remarkIndex, 1);
    referral.UpdatedBy = UpdatedBy;

    await referral.save();

    // Create audit log
    await __CreateAuditLog(
      "patient_referral",
      "DELETE",
      "DOCTOR_REMARK_DELETED",
      oldValue,
      null,
      referralId,
      UpdatedBy,
      null
    );

    return res
      .status(200)
      .json(
        __requestResponse("200", "Doctor remark deleted successfully", null)
      );
  } catch (error) {
    console.error("Delete doctor remark error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

//* ==================== SECOND OPINION OPERATIONS ====================
// *new
// Unified API to update Second Opinion Questions
exports.updateSecondOpinionQuestions = async (req, res) => {
  try {
    const { referralId } = req.params;
    const {
      // Second Opinion Fields
      SecondOpinionQueries,
      Questions,
      AdditionalInformation,

      UpdatedBy,
    } = req.body;

    const referral = await PatientReferral.findById(referralId);
    if (!referral || referral.IsDeleted) {
      return res
        .status(404)
        .json(__requestResponse("404", "Patient referral not found", null));
    }

    const oldValue = JSON.stringify(referral.SecondOpinionQuestions || {});

    // Update Second Opinion Questions
    if (!referral.SecondOpinionQuestions) {
      referral.SecondOpinionQuestions = {};
    }

    if (SecondOpinionQueries !== undefined) {
      referral.SecondOpinionQuestions.SecondOpinionQueries =
        SecondOpinionQueries;
    }

    if (Questions !== undefined) {
      referral.SecondOpinionQuestions.Questions = Questions;
    }

    if (AdditionalInformation !== undefined) {
      referral.SecondOpinionQuestions.AdditionalInformation =
        AdditionalInformation;
    }

    referral.UpdatedBy = UpdatedBy;
    const updatedReferral = await referral.save();

    // Create audit log
    await __CreateAuditLog(
      "patient_referral",
      "UPDATE",
      // "SECOND_OPINION_QUESTIONS",
      null,
      oldValue,
      JSON.stringify(updatedReferral.SecondOpinionQuestions),
      referralId,
      UpdatedBy,
      null
    );

    return res
      .status(200)
      .json(
        __requestResponse(
          "200",
          "Second opinion questions updated successfully",
          updatedReferral.SecondOpinionQuestions
        )
      );
  } catch (error) {
    console.error("Update second opinion questions error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// *end

// Update Second Opinion Questions
exports.updateSecondOpinionQuestionsx = async (req, res) => {
  try {
    const { referralId } = req.params;
    const { SecondOpinionQueries, UpdatedBy } = req.body;

    const referral = await PatientReferral.findById(referralId);
    if (!referral || referral.IsDeleted) {
      return res
        .status(404)
        .json(__requestResponse("404", "Patient referral not found", null));
    }

    const oldValue = JSON.stringify(referral.SecondOpinionQuestions);

    // Update second opinion questions
    if (!referral.SecondOpinionQuestions) {
      referral.SecondOpinionQuestions = {};
    }
    referral.SecondOpinionQuestions.SecondOpinionQueries = SecondOpinionQueries;
    referral.UpdatedBy = UpdatedBy;

    const updatedReferral = await referral.save();

    // Create audit log
    await __CreateAuditLog(
      "patient_referral",
      "UPDATE",
      // "SECOND_OPINION_QUERIES",
      null,
      oldValue,
      JSON.stringify(updatedReferral.SecondOpinionQuestions),
      referralId,
      UpdatedBy,
      null
    );

    return res
      .status(200)
      .json(
        __requestResponse(
          "200",
          "Second opinion questions updated successfully",
          updatedReferral.SecondOpinionQuestions
        )
      );
  } catch (error) {
    console.error("Update second opinion questions error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// Add Second Opinion Question
exports.addSecondOpinionQuestionx = async (req, res) => {
  try {
    const { referralId } = req.params;
    const { Question, UpdatedBy } = req.body;

    const referral = await PatientReferral.findById(referralId);
    if (!referral || referral.IsDeleted) {
      return res
        .status(404)
        .json(__requestResponse("404", "Patient referral not found", null));
    }

    const oldValue = JSON.stringify(
      referral.SecondOpinionQuestions?.Questions || []
    );

    // Add second opinion question
    if (!referral.SecondOpinionQuestions) {
      referral.SecondOpinionQuestions = { Questions: [] };
    }
    if (!referral.SecondOpinionQuestions.Questions) {
      referral.SecondOpinionQuestions.Questions = [];
    }

    const newQuestion = {
      Question,
      CreatedAt: new Date(),
    };

    referral.SecondOpinionQuestions.Questions.push(newQuestion);
    referral.UpdatedBy = UpdatedBy;

    const updatedReferral = await referral.save();

    // Create audit log
    await __CreateAuditLog(
      "patient_referral",
      "UPDATE",
      // "SECOND_OPINION_QUESTION_ADDED",
      null,
      oldValue,
      JSON.stringify(updatedReferral.SecondOpinionQuestions.Questions),
      referralId,
      UpdatedBy,
      null
    );

    const addedQuestion =
      updatedReferral.SecondOpinionQuestions.Questions[
        updatedReferral.SecondOpinionQuestions.Questions.length - 1
      ];
    return res
      .status(200)
      .json(
        __requestResponse(
          "200",
          "Second opinion question added successfully",
          addedQuestion
        )
      );
  } catch (error) {
    console.error("Add second opinion question error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// Update Second Opinion Question
exports.updateSecondOpinionQuestionx = async (req, res) => {
  try {
    const { referralId, questionId } = req.params;
    const { Question, UpdatedBy } = req.body;

    const referral = await PatientReferral.findById(referralId);
    if (!referral || referral.IsDeleted) {
      return res
        .status(404)
        .json(__requestResponse("404", "Patient referral not found", null));
    }

    const questionIndex = referral.SecondOpinionQuestions?.Questions?.findIndex(
      (question) => question._id.toString() === questionId
    );

    if (questionIndex === -1) {
      return res
        .status(404)
        .json(
          __requestResponse("404", "Second opinion question not found", null)
        );
    }

    const oldValue = JSON.stringify(
      referral.SecondOpinionQuestions.Questions[questionIndex]
    );

    // Update second opinion question
    referral.SecondOpinionQuestions.Questions[questionIndex].Question =
      Question;
    referral.UpdatedBy = UpdatedBy;

    const updatedReferral = await referral.save();

    // Create audit log
    await __CreateAuditLog(
      "patient_referral",
      "UPDATE",
      // "SECOND_OPINION_QUESTION_UPDATED",
      null,
      oldValue,
      JSON.stringify(
        updatedReferral.SecondOpinionQuestions.Questions[questionIndex]
      ),
      referralId,
      UpdatedBy,
      null
    );

    return res
      .status(200)
      .json(
        __requestResponse(
          "200",
          "Second opinion question updated successfully",
          updatedReferral.SecondOpinionQuestions.Questions[questionIndex]
        )
      );
  } catch (error) {
    console.error("Update second opinion question error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// Delete Second Opinion Question
exports.deleteSecondOpinionQuestionx = async (req, res) => {
  try {
    const { referralId, questionId } = req.params;
    const { UpdatedBy } = req.body;

    const referral = await PatientReferral.findById(referralId);
    if (!referral || referral.IsDeleted) {
      return res
        .status(404)
        .json(__requestResponse("404", "Patient referral not found", null));
    }

    const questionIndex = referral.SecondOpinionQuestions?.Questions?.findIndex(
      (question) => question._id.toString() === questionId
    );

    if (questionIndex === -1) {
      return res
        .status(404)
        .json(
          __requestResponse("404", "Second opinion question not found", null)
        );
    }

    const oldValue = JSON.stringify(
      referral.SecondOpinionQuestions.Questions[questionIndex]
    );

    // Delete second opinion question
    referral.SecondOpinionQuestions.Questions.splice(questionIndex, 1);
    referral.UpdatedBy = UpdatedBy;

    await referral.save();

    // Create audit log
    await __CreateAuditLog(
      "patient_referral",
      "DELETE",
      "SECOND_OPINION_QUESTION_DELETED",
      oldValue,
      null,
      referralId,
      UpdatedBy,
      null
    );

    return res
      .status(200)
      .json(
        __requestResponse(
          "200",
          "Second opinion question deleted successfully",
          null
        )
      );
  } catch (error) {
    console.error("Delete second opinion question error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

//* ==================== PROPOSED SURGERY OPERATIONS ====================

// Update Proposed Surgery
exports.updateProposedSurgery = async (req, res) => {
  try {
    const { referralId } = req.params;
    const { SurgeryProcedures, DoctorNote, UpdatedBy } = req.body;

    const referral = await PatientReferral.findById(referralId);
    if (!referral || referral.IsDeleted) {
      return res
        .status(404)
        .json(__requestResponse("404", "Patient referral not found", null));
    }

    const oldValue = JSON.stringify(referral.ProposedSurgery);

    // Update proposed surgery
    if (!referral.ProposedSurgery) {
      referral.ProposedSurgery = {};
    }
    referral.ProposedSurgery.SurgeryProcedures = SurgeryProcedures;
    referral.ProposedSurgery.DoctorNote = DoctorNote;
    referral.UpdatedBy = UpdatedBy;

    const updatedReferral = await referral.save();

    // Create audit log
    await __CreateAuditLog(
      "patient_referral",
      "UPDATE",
      // "PROPOSED_SURGERY",
      null,
      oldValue,
      JSON.stringify(updatedReferral.ProposedSurgery),
      referralId,
      UpdatedBy,
      null
    );

    return res
      .status(200)
      .json(
        __requestResponse(
          "200",
          "Proposed surgery updated successfully",
          updatedReferral.ProposedSurgery
        )
      );
  } catch (error) {
    console.error("Update proposed surgery error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// ==================== PRE-SURGICAL CONSIDERATIONS OPERATIONS ====================

// Update Pre-Surgical Considerations
exports.updatePreSurgicalConsiderations = async (req, res) => {
  try {
    const { referralId } = req.params;
    const {
      Comorbidities,
      ComorbidityDefinition,
      RiskFactors,
      RiskFactorDefinition,
      PatientConcerns,
      LogisticalConsiderations,
      UpdatedBy,
    } = req.body;

    const referral = await PatientReferral.findById(referralId);
    if (!referral || referral.IsDeleted) {
      return res
        .status(404)
        .json(__requestResponse("404", "Patient referral not found", null));
    }

    const oldValue = JSON.stringify(referral.PreSurgicalConsiderations);

    // Update pre-surgical considerations
    if (!referral.PreSurgicalConsiderations) {
      referral.PreSurgicalConsiderations = {};
    }
    referral.PreSurgicalConsiderations.Comorbidities = Comorbidities;
    referral.PreSurgicalConsiderations.ComorbidityDefinition =
      ComorbidityDefinition;
    referral.PreSurgicalConsiderations.RiskFactors = RiskFactors;
    referral.PreSurgicalConsiderations.RiskFactorDefinition =
      RiskFactorDefinition;
    referral.PreSurgicalConsiderations.PatientConcerns = PatientConcerns;
    referral.PreSurgicalConsiderations.LogisticalConsiderations =
      LogisticalConsiderations;
    referral.UpdatedBy = UpdatedBy;

    const updatedReferral = await referral.save();

    // Create audit log
    await __CreateAuditLog(
      "patient_referral",
      "UPDATE",
      // "PRE_SURGICAL_CONSIDERATIONS",
      null,
      oldValue,
      JSON.stringify(updatedReferral.PreSurgicalConsiderations),
      referralId,
      UpdatedBy,
      null
    );

    return res
      .status(200)
      .json(
        __requestResponse(
          "200",
          "Pre-surgical considerations updated successfully",
          updatedReferral.PreSurgicalConsiderations
        )
      );
  } catch (error) {
    console.error("Update pre-surgical considerations error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// ==================== DOCTOR/HOSPITAL SELECTION OPERATIONS ====================

// Update Doctor Hospital Selection
exports.updateDoctorHospitalSelection = async (req, res) => {
  try {
    const { referralId } = req.params;
    const {
      SelectedCity,
      SelectedMedicalSpecialty,
      SelectedDoctors,
      SelectionDateTime,
      Geolocation,
      UpdatedBy,
    } = req.body;

    const referral = await PatientReferral.findById(referralId);
    if (!referral || referral.IsDeleted) {
      return res
        .status(404)
        .json(__requestResponse("404", "Patient referral not found", null));
    }

    const oldValue = JSON.stringify(referral.DoctorHospitalSelection);

    // Update doctor hospital selection
    if (!referral.DoctorHospitalSelection) {
      referral.DoctorHospitalSelection = {};
    }
    referral.DoctorHospitalSelection.SelectedCity = SelectedCity;
    referral.DoctorHospitalSelection.SelectedMedicalSpecialty =
      SelectedMedicalSpecialty;
    referral.DoctorHospitalSelection.SelectedDoctors = SelectedDoctors;
    referral.DoctorHospitalSelection.SelectionDateTime =
      SelectionDateTime || new Date();
    referral.DoctorHospitalSelection.Geolocation = Geolocation;
    referral.UpdatedBy = UpdatedBy;

    const updatedReferral = await referral.save();

    // Create audit log
    await __CreateAuditLog(
      "patient_referral",
      "UPDATE",
      // "DOCTOR_HOSPITAL_SELECTION",
      null,
      oldValue,
      JSON.stringify(updatedReferral.DoctorHospitalSelection),
      referralId,
      UpdatedBy,
      null
    );

    return res
      .status(200)
      .json(
        __requestResponse(
          "200",
          "Doctor hospital selection updated successfully",
          updatedReferral.DoctorHospitalSelection
        )
      );
  } catch (error) {
    console.error("Update doctor hospital selection error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// ==================== REFERRAL RESPONSE OPERATIONS ====================

// Add Referral Response
exports.addReferralResponse = async (req, res) => {
  try {
    const { referralId } = req.params;
    const { ResponseMessage, AcceptanceStatus, ProposedDateTime, RespondedBy } =
      req.body;

    const referral = await PatientReferral.findById(referralId);
    if (!referral || referral.IsDeleted) {
      return res
        .status(404)
        .json(__requestResponse("404", "Patient referral not found", null));
    }

    const oldValue = JSON.stringify(referral.ReferralResponse);

    // Add referral response
    referral.ReferralResponse = {
      RespondedBy,
      ResponseDate: new Date(),
      ResponseMessage,
      AcceptanceStatus,
      ProposedDateTime,
    };

    // Update referral status based on acceptance
    if (AcceptanceStatus === "ACCEPTED") {
      referral.ReferralStatus = "ACCEPTED";
    } else if (AcceptanceStatus === "REJECTED") {
      referral.ReferralStatus = "REJECTED";
    }

    referral.UpdatedBy = RespondedBy;

    const updatedReferral = await referral.save();

    // Create audit log
    await __CreateAuditLog(
      "patient_referral",
      "UPDATE",
      // "REFERRAL_RESPONSE",
      null,
      oldValue,
      JSON.stringify(updatedReferral.ReferralResponse),
      referralId,
      RespondedBy,
      null
    );

    return res
      .status(200)
      .json(
        __requestResponse(
          "200",
          "Referral response added successfully",
          updatedReferral.ReferralResponse
        )
      );
  } catch (error) {
    console.error("Add referral response error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// ==================== STATUS UPDATE OPERATIONS ====================

// Update Referral Status
exports.updateReferralStatus = async (req, res) => {
  try {
    const { referralId } = req.params;
    const { ReferralStatus, PriorityLevel, UpdatedBy } = req.body;

    const referral = await PatientReferral.findById(referralId);
    if (!referral || referral.IsDeleted) {
      return res
        .status(404)
        .json(__requestResponse("404", "Patient referral not found", null));
    }

    const oldStatus = referral.ReferralStatus;
    const oldPriority = referral.PriorityLevel;

    // Update status and priority
    referral.ReferralStatus = ReferralStatus;
    if (PriorityLevel) {
      referral.PriorityLevel = PriorityLevel;
    }
    referral.UpdatedBy = UpdatedBy;

    const updatedReferral = await referral.save();

    // Create audit log
    await __CreateAuditLog(
      "patient_referral",
      "UPDATE",
      // "STATUS_UPDATE",
      null,
      JSON.stringify({ status: oldStatus, priority: oldPriority }),
      JSON.stringify({ status: ReferralStatus, priority: PriorityLevel }),
      referralId,
      UpdatedBy,
      null
    );

    return res.status(200).json(
      __requestResponse("200", "Referral status updated successfully", {
        ReferralStatus: updatedReferral.ReferralStatus,
        PriorityLevel: updatedReferral.PriorityLevel,
      })
    );
  } catch (error) {
    console.error("Update referral status error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// ==================== SEARCH AND ANALYTICS OPERATIONS ====================

// Get Referrals by Referring Doctor
exports.getReferralsByReferringDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const referrals = await PatientReferral.findByReferringDoctor(doctorId);

    return res
      .status(200)
      .json(
        __requestResponse(
          "200",
          "Referrals by referring doctor retrieved successfully",
          referrals
        )
      );
  } catch (error) {
    console.error("Get referrals by referring doctor error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// Get Referrals by Referred Doctor
exports.getReferralsByReferredDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const referrals = await PatientReferral.findByReferredDoctor(doctorId);

    return res
      .status(200)
      .json(
        __requestResponse(
          "200",
          "Referrals by referred doctor retrieved successfully",
          referrals
        )
      );
  } catch (error) {
    console.error("Get referrals by referred doctor error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// Get Pending Referrals
exports.getPendingReferrals = async (req, res) => {
  try {
    const referrals = await PatientReferral.findPendingReferrals();

    return res
      .status(200)
      .json(
        __requestResponse(
          "200",
          "Pending referrals retrieved successfully",
          referrals
        )
      );
  } catch (error) {
    console.error("Get pending referrals error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// Get Urgent Referrals
exports.getUrgentReferrals = async (req, res) => {
  try {
    const referrals = await PatientReferral.findUrgentReferrals();

    return res
      .status(200)
      .json(
        __requestResponse(
          "200",
          "Urgent referrals retrieved successfully",
          referrals
        )
      );
  } catch (error) {
    console.error("Get urgent referrals error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// Get Overdue Referrals
exports.getOverdueReferrals = async (req, res) => {
  try {
    const { days } = req.query;
    const dayLimit = days ? parseInt(days) : 7;

    const referrals = await PatientReferral.findOverdueReferrals(dayLimit);

    return res
      .status(200)
      .json(
        __requestResponse(
          "200",
          "Overdue referrals retrieved successfully",
          referrals
        )
      );
  } catch (error) {
    console.error("Get overdue referrals error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// Get Referrals by Specialty
exports.getReferralsBySpecialty = async (req, res) => {
  try {
    const { specialtyId } = req.params;

    const referrals = await PatientReferral.findBySpecialty(specialtyId);

    return res
      .status(200)
      .json(
        __requestResponse(
          "200",
          "Referrals by specialty retrieved successfully",
          referrals
        )
      );
  } catch (error) {
    console.error("Get referrals by specialty error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// Get Referrals by City
exports.getReferralsByCity = async (req, res) => {
  try {
    const { cityId } = req.params;

    const referrals = await PatientReferral.findByCity(cityId);

    return res
      .status(200)
      .json(
        __requestResponse(
          "200",
          "Referrals by city retrieved successfully",
          referrals
        )
      );
  } catch (error) {
    console.error("Get referrals by city error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// ==================== LOOKUP HELPER OPERATIONS ====================

// Get Lookups by Type
exports.getLookupsByType = async (req, res) => {
  try {
    const { lookupType } = req.params;

    const lookups = await PatientReferral.getLookupsByType(lookupType);

    return res
      .status(200)
      .json(
        __requestResponse("200", "Lookups retrieved successfully", lookups)
      );
  } catch (error) {
    console.error("Get lookups by type error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// Get Cities (Station Master where StationType = "CITY")
exports.getCities = async (req, res) => {
  try {
    const StationMaster = require("../../modals/Common/StationMaster");

    const cities = await StationMaster.find({
      StationType: "CITY",
      IsActive: true,
      IsDeleted: false,
    }).sort({ StationName: 1 });

    return res
      .status(200)
      .json(__requestResponse("200", "Cities retrieved successfully", cities));
  } catch (error) {
    console.error("Get cities error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// Get Doctors by Specialty and City
exports.getDoctorsBySpecialtyAndCity = async (req, res) => {
  try {
    const { specialtyId, cityId } = req.params;
    const AssetMaster = require("../../modals/AssetMaster/AssetMaster");

    let query = {
      AssetType: "DOCTOR",
      IsActive: true,
      IsDeleted: false,
    };

    if (specialtyId && specialtyId !== "all") {
      query.Specialization = specialtyId;
    }

    if (cityId && cityId !== "all") {
      query.City = cityId;
    }

    const doctors = await AssetMaster.find(query)
      .populate("Specialization", "lookup_value")
      .populate("City", "StationName")
      .sort({ Name: 1 });

    return res
      .status(200)
      .json(
        __requestResponse("200", "Doctors retrieved successfully", doctors)
      );
  } catch (error) {
    console.error("Get doctors by specialty and city error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};

// ==================== DELETE OPERATIONS ====================

// Delete Patient Referral (Soft Delete)
exports.deletePatientReferral = async (req, res) => {
  try {
    const { referralId } = req.params;
    const { UpdatedBy } = req.body;

    const referral = await PatientReferral.findById(referralId);
    if (!referral || referral.IsDeleted) {
      return res
        .status(404)
        .json(__requestResponse("404", "Patient referral not found", null));
    }

    const oldValue = JSON.stringify(referral);

    // Soft delete
    referral.IsDeleted = true;
    referral.IsActive = false;
    referral.UpdatedBy = UpdatedBy;

    await referral.save();

    // Create audit log
    await __CreateAuditLog(
      "patient_referral",
      "DELETE",
      "REFERRAL_DELETED",
      oldValue,
      null,
      referralId,
      UpdatedBy,
      null
    );

    return res
      .status(200)
      .json(
        __requestResponse("200", "Patient referral deleted successfully", null)
      );
  } catch (error) {
    console.error("Delete patient referral error:", error);
    return res.status(500).json(
      __requestResponse("500", "Internal server error", {
        error: error.message,
      })
    );
  }
};
