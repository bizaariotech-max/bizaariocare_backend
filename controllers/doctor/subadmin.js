const createdoctorsubadmin = require('../../modals/doctor/subadmin')

const add_doctor_subadmin = async (req, res) => {
    try {
    const {name,phone_no,designation,email,password} = req.body;
   
      const exitingcourse=await createdoctorsubadmin.findOne({email:email})
      if(exitingcourse)
      {
        res.status(400).send({message:"This email id already exist..."})
        return
      }

      const new_create_subadmin = new createdoctorsubadmin ({name,phone_no,designation,email,password})
  
      // Save the deal to the database
      const resp = await new_create_subadmin.save();
      res.status(200).send({ message: 'Sub Admin Created successfully', subadmin: resp });
  
    } catch (error) {
      console.error('Error creating sub-admin:', error);
      res.status(500).send({ message: 'Error occurred while creating sub-admin', error: error.message });
    }
  };




const view_subadmin=async(req,res)=>
{
  try {
    const resp=await createdoctorsubadmin.find()
    res.status(200).send({message:"data fetch",subadmin:resp})
    
  } catch (error) {
    console.log(error);
    
  }
}

const delete_subadmin=async(req,res)=>
{
  try {
    const _id=req.params._id
    const resp=await createdoctorsubadmin.findByIdAndDelete(_id)
    res.status(200).send({message:"subadmin deleted",subadmin:resp})
    
  } catch (error) {
    console.log(error);
    
  }
}




  module.exports={add_doctor_subadmin,view_subadmin,delete_subadmin}