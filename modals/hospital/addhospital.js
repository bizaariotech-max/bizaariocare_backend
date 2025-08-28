const mongoose=require('mongoose')

const addhospitalschema=new mongoose.Schema({
  hospital_name:{type:String},
  hospital_type: {type:String},
  address1: {type:String},
  address2: {type:String},
  state: {type:String},
  city: {type:String},
  postal_code: {type:String},
  geo_location:{type:String}
},{timestamps:true})


const addhospitalmodel=mongoose.model('addhospital',addhospitalschema)

module.exports=addhospitalmodel