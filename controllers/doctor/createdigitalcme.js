const createdigitalcme = require('../../modals/doctor/createdigitalcme')
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


const add_digitalcme = async (req, res) => {
    try {
    const {digital_cme_id,user_id,course_id,cme_title,short_description,long_description,video_url,
            meta_tags,references,target_audience,target_geography,publish_date,valid_up_to,comments} = req.body;
   
            const cmeimagegallary=[]
      
            if (req.files) {

            for (let file of req.files) {
              const result = await cloudinary.uploader.upload(file.path);
              cmeimagegallary.push(result.secure_url);  
           
            }
          }
        
          

      const exitingcme=await createdigitalcme.findOne({digital_cme_id:digital_cme_id})
      if(exitingcme)
      {
        res.status(400).send({message:"This cme id already exist..."})
        return
      }

      const new_create_digitalcme = new createdigitalcme ({digital_cme_id,user_id,course_id,cme_title,short_description,long_description,video_url,
            meta_tags,references,target_audience,target_geography,publish_date,valid_up_to,comments,image_gallary:cmeimagegallary})
  
      // Save the deal to the database
      const resp = await new_create_digitalcme.save();
      res.status(200).send({ message: 'Cme Created successfully', cme: resp });
  
    } catch (error) {
      console.error('Error creating cme:', error);
      res.status(500).send({ message: 'Error occurred while creating cme', error: error.message });
    }
  };




const viewcme=async(req,res)=>
{
  try {
    const resp=await createdigitalcme.find()
    res.status(200).send({message:"data fetch",cme:resp})
    
  } catch (error) {
    console.log(error);
    
  }
}


const delete_digitalcme=async(req,res)=>
{
  try {
    const _id=req.params._id
    const resp=await createdigitalcme.findByIdAndDelete(_id)
    res.status(200).send({message:"cme deleted",cme:resp})
    
  } catch (error) {
    console.log(error);
    
  }
}




  module.exports={add_digitalcme,viewcme,delete_digitalcme}