const addhospitalmodel = require('../../modals/hospital/addhospital')
const cloudinary=require('cloudinary').v2


require('dotenv')



require('dotenv').config()
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})


const add_hospital = async (req, res) => {
    try {
    const {hospital_name,hospital_type,address1,address2,state,city,postal_code,geo_location} = req.body;
   
         
      

      // const exitingprofile=await adddoctormodal.findOne({email:email})
      // if(exitingprofile)
      // {
      //   res.status(400).send({message:"This Email id already exist..."})
      //   return
      // }
  

      const new_add_hospital = new addhospitalmodel({
      hospital_name,hospital_type,address1,address2,state,city,postal_code,geo_location
      });
  
      // Save the deal to the database
      const resp = await new_add_hospital.save();
      res.status(200).send({ message: 'Hospital added successfully', doctor: resp });
  
    } catch (error) {
      console.error('Error adding doctor profile:', error);
      res.status(500).send({ message: 'Error occurred while adding doctor profile', error: error.message });
    }
  };




const viewhospital=async(req,res)=>
{
  try {
    const resp=await addhospitalmodel.find()
    res.status(200).send({message:"data fetch",hospital:resp})
    
  } catch (error) {
    console.log(error);
    
  }
}


  module.exports={add_hospital,viewhospital}