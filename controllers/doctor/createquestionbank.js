const createdigitalcme_questionbank = require('../../modals/doctor/createquestionbank')
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


const add_digitalcme_questionbank = async (req, res) => {
    try {
    const {digital_cme_id,question_id,question_type,question_text,valid_answer,answer_options,
            references} = req.body;
   
            const cmeimagegallary=[]
      
               if (req.files) {

            for (let file of req.files) {
              const result = await cloudinary.uploader.upload(file.path);
              cmeimagegallary.push(result.secure_url);  
           
            }
          }

      const exitingcourse=await createdigitalcme_questionbank.findOne({question_id:question_id})
      if(exitingcourse)
      {
        res.status(400).send({message:"This question id already exist..."})
        return
      }

      const new_create_digitalcme_questionbank = new createdigitalcme_questionbank ({digital_cme_id,question_id,question_type,question_text,valid_answer,answer_options,
            references,image_gallary:cmeimagegallary})
  
      // Save the deal to the database
      const resp = await new_create_digitalcme_questionbank.save();
      res.status(200).send({ message: 'Question Created successfully', doctor: resp });
  
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).send({ message: 'Error occurred while creating question', error: error.message });
    }
  };




const view_digitalcme_questionbank=async(req,res)=>
{
  try {
    const resp=await createdigitalcme_questionbank.find()
    res.status(200).send({message:"data fetch",questionbank:resp})
    
  } catch (error) {
    console.log(error);
    
  }
}

const delete_question=async(req,res)=>
{
  try {
    const _id=req.params._id
    const resp=await createdigitalcme_questionbank.findByIdAndDelete(_id)
    res.status(200).send({message:"question deleted",question:resp})
    
  } catch (error) {
    console.log(error);
    
  }
}




  module.exports={add_digitalcme_questionbank,view_digitalcme_questionbank,delete_question}