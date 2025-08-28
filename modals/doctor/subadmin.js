const mongoose=require('mongoose')

const createsubadminschema=new mongoose.Schema({
  name:{type:String},
  phone_no: {type:String},
  designation: {type:String},
  email: {type:String},
  password: {type:String},
 
},{timestamps:true})


const createdoctorsubadmin=mongoose.model('doctor-subadmin',createsubadminschema)

module.exports=createdoctorsubadmin