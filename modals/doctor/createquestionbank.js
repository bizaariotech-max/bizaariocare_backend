const mongoose=require('mongoose')

const createquestionbankschema=new mongoose.Schema({
  digital_cme_id:{type:String},
  question_id: {type:String},
  question_type: {type:String},
  question_text: {type:String},
  valid_answer: {type:Array},
  answer_options:{type:Array},
  references: {type:Array},
  image_gallary: {type:Array},

},{timestamps:true})


const createdigitalcme_questionbank=mongoose.model('digital_cme_question_bank',createquestionbankschema)

module.exports=createdigitalcme_questionbank