const createcourse = require('../../modals/doctor/creaetcourse')
const cloudinary=require('cloudinary').v2
const fs=require('fs')
const path=require('path')

require('dotenv')



require('dotenv').config()
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})


const add_course = async (req, res) => {
    try {
    const {user_id,course_id,course_title,description} = req.body;
   
            const courseimage=[]
      
               if (req.files) {

            for (let file of req.files) {
              const result = await cloudinary.uploader.upload(file.path);
              courseimage.push(result.secure_url);  
           
            }
          }

      const exitingcourse=await createcourse.findOne({course_id:course_id})
      if(exitingcourse)
      {
        res.status(400).send({message:"This courst id already exist..."})
        return
      }

      const new_create_course = new createcourse ({user_id,course_id,course_title,description,course_image:courseimage})
  
      // Save the deal to the database
      const resp = await new_create_course.save();
      res.status(200).send({ message: 'Course Created successfully', doctor: resp });
  
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).send({ message: 'Error occurred while creating course', error: error.message });
    }
  };




const viewcourse=async(req,res)=>
{
  try {
    const resp=await createcourse.find()
    res.status(200).send({message:"data fetch",course:resp})
    
  } catch (error) {
    console.log(error);
    
  }
}

const viewcoursebyuserid=async(req,res)=>
{
  try {
    const user_id=req.params.user_id
    const resp=await createcourse.find({user_id:user_id})
    res.status(200).send({message:"data fetch",course:resp})
    
  } catch (error) {
    console.log(error);
    
  }
}

const delete_course=async(req,res)=>
{
  try {
    const _id=req.params._id
    const resp=await createcourse.findByIdAndDelete(_id)
    res.status(200).send({message:"course deleted",cme:resp})
    
  } catch (error) {
    console.log(error);
    
  }
}


  module.exports={add_course,viewcourse,viewcoursebyuserid,delete_course}