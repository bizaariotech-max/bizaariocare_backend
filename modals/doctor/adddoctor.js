const mongoose=require('mongoose')

const adddoctorschema=new mongoose.Schema({
  profile_pic:{type:Array},
  firstName: {type:String},
  lastName: {type:String},
  address1: {type:String},
  address2: {type:String},
  state: {type:String},
  city: {type:String},
  postal_code: {type:String},
  country: {type:String},
  bio: {type:String},
  bio_video: {type:String},
  image_gallary: {type:Array},
  website: {type:String},
  phone_number: {type:String},
  dateOfBirth: {type:String},
  email: {type:String},
  gender: {type:String},
  password: {type:String},
  qualification:{type:Array},
  medical_specialty:{type:String},
  hospital_association:{type:Array},
  clinic_name:{type:String},
  clinic_address1:{type:String},
  clinic_address2:{type:String},
  clinic_state:{type:String},
  clinic_city:{type:String},
  clinic_postal_code:{type:String},
  clinic_geo_location:{type:String},
  subscription:{type:Array},
  ischangedpassword:{type:Boolean,default:"true"},

    work_experience: [
      {
        doctor_id:{type:String},
        hospital_name: { type: String },
        from_year: { type: String },
        to_year: { type: String },
        designation: { type: String },
        major_achievements:{ type: String }
      },
    ],
    awards_and_achievements: [
      {
        doctor_id:{type:String},
        award_title: { type: String },
        awarding_body: { type: String },
        date: { type: String },
        venue: { type: String },
        award_image: { type: Array },
        picture_gallary: { type: Array },
        video_url:{type:String}
      },
    ],
      upcoming_events: [
      {
        doctor_id:{type:String},
        event_id: {type: String},
        event_type: {type: String },
        event_title: { type: String },
        venue: { type: String },
        start_date: { type: String },
        end_date: { type: String },
        start_time: { type: String },
        end_time: { type: String },
        instructions_for_attendees: { type: String },
        currency: { type: String },
        fee: { type: String },
        event_image:{type:Array}
      },
    ],

},{timestamps:true})


const adddoctormodal=mongoose.model('adddoctor',adddoctorschema)

module.exports=adddoctormodal