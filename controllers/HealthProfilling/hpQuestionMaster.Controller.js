const HPQuestionMaster = require("../../modals/HealthProfiling/HPQuestionMaster");
const { __requestResponse } = require("../../utils/constant");
const {
  __SUCCESS,
  __SOME_ERROR,
} = require("../../utils/variable");
const { __CreateAuditLog } = require("../../utils/auditlog");

// Test Route
exports.test = async (req, res) => {
  return res.json(__requestResponse("200", "HP Question Master API Working"));
};

// Add/Edit HP Question (Combined API)
exports.AddEditHpQuestion = async (req, res) => {
  try {
    const { HPQuestionId } = req.body;
    let question;
    let oldValue = null;

    const questionData = {
      HPQuestionCategory: req.body?.HPQuestionCategory,
      HPGroup: req.body?.HPGroup,
      QuestionOrder: req.body?.QuestionOrder,
      LogicalGroup: req.body?.LogicalGroup,
      InvestigationType: req.body?.InvestigationType,
      QuestionType: req.body?.QuestionType,
      HPQuestion: req.body?.HPQuestion,
      OptionValues: req.body?.OptionValues,
      SelectionType: req.body?.SelectionType,
      InputType: req.body?.InputType,
      ValidityMinValue: req.body?.ValidityMinValue,
      ValidityMaxValue: req.body?.ValidityMaxValue,
      ResponseUnit: req.body?.ResponseUnit,
      NormalValueMinimum: req.body?.NormalValueMinimum,
      NormalValueMaximum: req.body?.NormalValueMaximum,
      WeightageValueMinimum: req.body?.WeightageValueMinimum,
      WeightageValueMaximum: req.body?.WeightageValueMaximum,
      SOSValueMinimum: req.body?.SOSValueMinimum,
      SOSValueMaximum: req.body?.SOSValueMaximum,
      IsActive: req.body?.IsActive,
    };

    if (!HPQuestionId) {
      // Create new question
      question = await HPQuestionMaster.create(questionData);
      
      // Create audit log for creation
      await __CreateAuditLog(
        "hp_question_master",
        "CREATE",
        question._id,
        null,
        question.toObject(),
        req.body.CreatedBy || "system"
      );
      
      return res.json(__requestResponse("200", __SUCCESS, question));
    } else {
      // Get old value for audit log
      oldValue = await HPQuestionMaster.findById(HPQuestionId).lean();
      
      if (!oldValue) {
        return res.json(__requestResponse("404", "HP Question not found"));
      }
      
      // Update existing question
      question = await HPQuestionMaster.findByIdAndUpdate(
        HPQuestionId,
        { $set: questionData },
        { new: true, runValidators: true }
      );
      
      // Create audit log for update
      await __CreateAuditLog(
        "hp_question_master",
        "UPDATE",
        question._id,
        oldValue,
        question.toObject(),
        req.body.UpdatedBy || "system"
      );
      
      return res.json(__requestResponse("200", __SUCCESS, question));
    }
  } catch (error) {
    console.log("AddEditHpQuestion Error:", error);
    return res.json(__requestResponse("500", error.message));
  }
};

// Get HP Questions List
exports.GetHpQuestion = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      HPQuestionCategory = "",
      IsActive = ""
    } = req.body;

    // Build filter object
    let filter = {};
    
    if (search) {
      filter.$or = [
        { HPQuestion: { $regex: search, $options: "i" } },
        { LogicalGroup: { $regex: search, $options: "i" } },
        { ResponseUnit: { $regex: search, $options: "i" } }
      ];
    }
    
    if (HPQuestionCategory) {
      filter.HPQuestionCategory = HPQuestionCategory;
    }
    
    if (IsActive !== "") {
      filter.IsActive = IsActive === "true" || IsActive === true;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get questions with pagination
    const questions = await HPQuestionMaster.find(filter)
      .populate("HPGroup", "GroupName")
      .populate("InvestigationType", "InvestigationTypeName")
      .populate("QuestionType", "QuestionTypeName")
      .populate("InputType", "InputTypeName")
      .sort({ QuestionOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalCount = await HPQuestionMaster.countDocuments(filter);
    
    const responseData = {
      questions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      }
    };
    
    return res.json(__requestResponse("200", __SUCCESS, responseData));
  } catch (error) {
    console.log("GetHpQuestion Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

// Get HP Question by ID
exports.GetHpQuestionById = async (req, res) => {
  try {
    const { HPQuestionId } = req.params;
    
    if (!HPQuestionId) {
      return res.json(__requestResponse("400", "HP Question ID is required"));
    }
    
    const question = await HPQuestionMaster.findById(HPQuestionId)
      .populate("HPGroup", "GroupName")
      .populate("InvestigationType", "InvestigationTypeName")
      .populate("QuestionType", "QuestionTypeName")
      .populate("InputType", "InputTypeName");
    
    if (!question) {
      return res.json(__requestResponse("404", "HP Question not found"));
    }
    
    return res.json(__requestResponse("200", __SUCCESS, question));
  } catch (error) {
    console.log("GetHpQuestionById Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

// Delete HP Question
exports.DeleteHpQuestion = async (req, res) => {
  try {
    const { HPQuestionId } = req.body;
    
    if (!HPQuestionId) {
      return res.json(__requestResponse("400", "HP Question ID is required"));
    }
    
    // Get question before deletion for audit log
    const oldValue = await HPQuestionMaster.findById(HPQuestionId).lean();
    
    if (!oldValue) {
      return res.json(__requestResponse("404", "HP Question not found"));
    }
    
    // Delete the question
    const question = await HPQuestionMaster.findByIdAndDelete(HPQuestionId);
    
    // Create audit log for deletion
    await __CreateAuditLog(
      "hp_question_master",
      "DELETE",
      HPQuestionId,
      oldValue,
      null,
      req.body.DeletedBy || "system"
    );
    
    return res.json(__requestResponse("200", __SUCCESS));
  } catch (error) {
    console.log("DeleteHpQuestion Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

// Soft Delete HP Question (Update IsActive to false)
exports.SoftDeleteHpQuestion = async (req, res) => {
  try {
    const { HPQuestionId } = req.body;
    
    if (!HPQuestionId) {
      return res.json(__requestResponse("400", "HP Question ID is required"));
    }
    
    // Get old value for audit log
    const oldValue = await HPQuestionMaster.findById(HPQuestionId).lean();
    
    if (!oldValue) {
      return res.json(__requestResponse("404", "HP Question not found"));
    }
    
    // Update IsActive to false
    const question = await HPQuestionMaster.findByIdAndUpdate(
      HPQuestionId,
      { $set: { IsActive: false } },
      { new: true }
    );
    
    // Create audit log for soft delete
    await __CreateAuditLog(
      "hp_question_master",
      "SOFT_DELETE",
      question._id,
      oldValue,
      question.toObject(),
      req.body.UpdatedBy || "system"
    );
    
    return res.json(__requestResponse("200", __SUCCESS, question));
  } catch (error) {
    console.log("SoftDeleteHpQuestion Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

// Get HP Questions by Category
exports.GetHpQuestionsByCategory = async (req, res) => {
  try {
    const { HPQuestionCategory } = req.params;
    
    if (!HPQuestionCategory) {
      return res.json(__requestResponse("400", "HP Question Category is required"));
    }
    
    const questions = await HPQuestionMaster.find({
      HPQuestionCategory,
      IsActive: true
    })
      .populate("HPGroup", "GroupName")
      .populate("InvestigationType", "InvestigationTypeName")
      .populate("QuestionType", "QuestionTypeName")
      .populate("InputType", "InputTypeName")
      .sort({ QuestionOrder: 1 });
    
    return res.json(__requestResponse("200", __SUCCESS, questions));
  } catch (error) {
    console.log("GetHpQuestionsByCategory Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

// Bulk Update Question Order
exports.UpdateQuestionOrder = async (req, res) => {
  try {
    const { questionOrders } = req.body; // Array of {HPQuestionId, QuestionOrder}
    
    if (!questionOrders || !Array.isArray(questionOrders)) {
      return res.json(__requestResponse("400", "Question orders array is required"));
    }
    
    const updatePromises = questionOrders.map(({ HPQuestionId, QuestionOrder }) =>
      HPQuestionMaster.findByIdAndUpdate(
        HPQuestionId,
        { $set: { QuestionOrder } },
        { new: true }
      )
    );
    
    await Promise.all(updatePromises);
    
    return res.json(__requestResponse("200", __SUCCESS));
  } catch (error) {
    console.log("UpdateQuestionOrder Error:", error.message);
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};