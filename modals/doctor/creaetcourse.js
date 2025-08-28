const mongoose=require('mongoose')

const createcourseschema=new mongoose.Schema({
  user_id:{type:String},
  course_id: {type:String},
  course_title: {type:String},
  description: {type:String},
  course_image: {type:Array},
},{timestamps:true})


const createcourse=mongoose.model('course',createcourseschema)

module.exports=createcourse