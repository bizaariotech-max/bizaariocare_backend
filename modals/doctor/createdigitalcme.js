const mongoose=require('mongoose')

const createdigitalcmeschema=new mongoose.Schema({
  digital_cme_id:{type:String},
  user_id: {type:String},
  course_id: {type:String},
  cme_title: {type:String},
  short_description: {type:String},
  long_description:{type:String},
  video_url: {type:String},
  meta_tags: {type:Array},
  image_gallary: {type:Array},
  references: {type:Array},
  target_audience: {type:Array},
  target_geography: {type:String},
  publish_date: {type:String},
  valid_up_to:{type:String},
  comments: {type:String},
},{timestamps:true})


                                      
                                  

const createdigitalcme=mongoose.model('digitalcme',createdigitalcmeschema)

module.exports=createdigitalcme