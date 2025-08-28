const adddoctormodal = require('../../modals/doctor/adddoctor')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const cloudinary=require('cloudinary').v2
const fs=require('fs')
const path=require('path')
const {uploadToCloudinary,getPublicIdFromUrl}=require('../../commonutilityfunction')


require('dotenv')



require('dotenv').config()
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})


const add_doctor = async (req, res) => {
    try {
    const {firstName,lastName,address1,address2,state,city,postal_code,dateOfBirth,email,gender,password,
        qualification,medical_specialty,hospital_association,clinic_name,clinic_address1,
        clinic_address2,clinic_state,clinic_city,clinic_postal_code,clinic_geo_location,subscription} = req.body;
   
            const profileimage=[]
      
       
                 if (req.files && req.files.length > 0) {
                  profileimage = await uploadToCloudinary(req.files); // use common function
                }
          

      const exitingprofile=await adddoctormodal.findOne({email:email})
      if(exitingprofile)
      {
        res.status(400).send({message:"This Email id already exist..."})
        return
      }
        const hashedPassword = await bcrypt.hash(password, 10);

      const new_add_doctor = new adddoctormodal({
      firstName,lastName,address1,address2,state,city,postal_code,dateOfBirth,email,gender,password:hashedPassword,
        qualification,medical_specialty,hospital_association,clinic_name,clinic_address1,
        clinic_address2,clinic_state,clinic_city,clinic_postal_code,clinic_geo_location,subscription,profile_pic:profileimage
      });
  
      // Save the deal to the database
      const resp = await new_add_doctor.save();
      res.status(200).send({ message: 'Doctor Profile added successfully', doctor: resp });
  
    } catch (error) {
      console.error('Error adding doctor profile:', error);
      res.status(500).send({ message: 'Error occurred while adding doctor profile', error: error.message });
    }
  };


// ======================================update doctor ===============================================

 const updatedoctor = async (req, res) => {
  try {
    const id = req.params._id;
 
    // Find existing doctor data
    const existingDoctor = await adddoctormodal.findById(id);

    let profileimage = existingDoctor.profile_pic; // default to existing images

     if (req.files && req.files.length > 0) {
      profileimage = await uploadToCloudinary(req.files); // use common function
    }

    const updatedata = { ...req.body, profile_pic: profileimage };

    const resp = await adddoctormodal.findByIdAndUpdate(id, updatedata, { new: true,upsert: true });

    res.status(200).json(resp);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};


//==================================== add and delete image gallary============================================

const addimagegallary = async (req, res) => {
  try {
    const id = req.params._id;

    // Find existing doctor data
    const existingDoctor = await adddoctormodal.findById(id);

    if (!existingDoctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const imagegallary = existingDoctor.image_gallary || []; // default to empty if not set

    let newimage = [];
   
     if (req.files && req.files.length > 0) {
      newimage = await uploadToCloudinary(req.files); // use common function
    }


    // FIX: Spread new images instead of nesting
    const updatedata = { 
      ...req.body, 
      image_gallary: [...imagegallary, ...newimage] 
    };

    const resp = await adddoctormodal.findByIdAndUpdate(
      id, 
      updatedata, 
      { new: true, upsert: true }
    );

    res.status(200).json(resp);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};


const deleteimagefromgallary = async (req, res) => {
  try {
    const id = req.params._id;
    const index = parseInt(req.params.index, 10);

    // Find existing doctor data
    const existingDoctor = await adddoctormodal.findById(id);
    if (!existingDoctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    if (
      isNaN(index) ||
      index < 0 ||
      index >= existingDoctor.image_gallary.length
    ) {
      return res.status(400).json({ message: "Invalid index" });
    }

    // Get the image URL to delete
    const deletedImageUrl = existingDoctor.image_gallary[index];
    const public_id = getPublicIdFromUrl(deletedImageUrl)


    await cloudinary.uploader.destroy(public_id, { resource_type: "image" });

    
    // Remove the image from the array
    existingDoctor.image_gallary.splice(index, 1);

    // Save updated document
    await existingDoctor.save();

    res.status(200).json({
      message: "Image deleted successfully",
      deletedImage: deletedImageUrl,
      updatedDoctor: existingDoctor,
    });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};



//==================== add and delete and delete upcoming event image and update upcoming events=======================================

const addupcomingevents = async (req, res) => {
  try {
    const id = req.params._id;
   
    

    // Find existing doctor data
    const existingDoctor = await adddoctormodal.findById(id);

    if (!existingDoctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const upcoming_events = existingDoctor.upcoming_events || []; // default to empty if not set

    const newimage = [];
    if (req.files && req.files.length > 0) {

      newimage = await uploadToCloudinary(req.files); // use common function
    
    }

    // FIX: Spread new images instead of nesting
    const newEvent = {
      ...req.body,
      event_image: newimage,
    };

   

    const resp = await adddoctormodal.findByIdAndUpdate(
      id, 
       { $push: { upcoming_events: newEvent } },
      { new: true, upsert: true }
    );

    res.status(200).json(resp);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};


const deleteupcomingeventsimage = async (req, res) => {
  try {
    const { _id, eventindex, imageIndex } = req.params;
 
    const doctor = await adddoctormodal.findById(_id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const event = doctor.upcoming_events[eventindex];
    if (!event) return res.status(400).json({ error: "Invalid event index" });

    if (!event.event_image || imageIndex >= event.event_image.length) {
      return res.status(400).json({ error: "Invalid image index" });
    }

    const deletedImage = event.event_image[imageIndex];
    event.event_image.splice(imageIndex, 1);

    const public_id = getPublicIdFromUrl(deletedImage)

    await cloudinary.uploader.destroy(public_id, { resource_type: "image" });

    await doctor.save();

    res.status(200).json({
      message: "Image deleted successfully",
      deletedImage,
      updatedDoctor: doctor,
    });
  } catch (error) {
    console.error("Delete award image error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const update_upcoming_events = async (req, res) => {
 try {
      const { _id, eventindex } = req.params;
      const index = parseInt(eventindex, 10);

      const doctor = await adddoctormodal.findById(_id);
      if (!doctor) return res.status(404).json({ error: "Doctor not found" });

      const event = doctor.upcoming_events[index];
      if (!event) return res.status(400).json({ error: "Invalid award index" });

      // Handle uploaded files
      let neweventimage = [];


      if (req.files && req.files.length > 0) {
         neweventimage = await uploadToCloudinary(req.files);
      }

      // Update text fields
      event.event_type = req.body.event_type || event.event_type;
      event.event_title = req.body.event_title ||  event.event_title;
      event.venue = req.body.venue || event.venue;
      event.start_date = req.body.start_date || event.start_date;
      event.end_date = req.body.end_date || event.end_date;
      event.start_time = req.body.start_time || event.start_time;
      event.end_time = req.body.end_time || event.end_time;
      event.instructions_for_attendees = req.body.instructions_for_attendees || event.instructions_for_attendees;
      event.currency = req.body.currency || event.currency;
      event.fee = req.body.fee || event.fee;

      // Add new images if any
      if (neweventimage.length > 0) event.event_image.push(...neweventimage);


      await doctor.save();

      res.status(200).json({
        message: "Award updated successfully",
        updatedDoctor: doctor,
      });
    } catch (error) {
      console.error("Update award error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
};

const delete_upcoming_events = async (req, res) => {
  try {
    const { _id, eventindex } = req.params;
    const index = parseInt(eventindex, 10);

    // Find the doctor
    const doctor = await adddoctormodal.findById(_id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    // Check if the event exists
    if (!doctor.upcoming_events || index < 0 || index >= doctor.upcoming_events.length) {
      return res.status(400).json({ error: "Invalid event index" });
    }

    // Remove the event from the doctor's array
    doctor.upcoming_events.splice(index, 1);

    // Save the doctor document
    await doctor.save();

    res.status(200).json({
      message: "Event deleted successfully",
      updatedDoctor: doctor,
    });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};


//================== add and delete and update work experience=====================================

const add_work_experience = async (req, res) => {
  try {
    const id = req.params._id;
    const {doctor_id,hospital_name,from_year,to_year,designation,major_achievements} = req.body;

    const doctor = await adddoctormodal.findById(id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

      const new_workexperience=[]
    // Push new work experience into array
    new_workexperience.push({
      doctor_id,hospital_name,from_year,to_year,designation,major_achievements
    });

    const updateworkexperience=[...doctor.work_experience,...new_workexperience]

  const resp = await adddoctormodal.findByIdAndUpdate(
  id,
  { $set: { work_experience: updateworkexperience } },
  { new: true, upsert: true }
);

    res
      .status(200)
      .json({ message: "Work experience added successfully", doctor });
  } catch (error) {
    console.error("Error adding work experience:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const edit_work_experience = async (req, res) => {
  try {
  
    
    const doctorId = req.params._id; 
     const index = parseInt(req.params.index, 10); 
    const { hospital_name,from_year,to_year,designation,major_achievements } =  req.body;
    

    const doctor = await adddoctormodal.findById({_id:doctorId});
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check index validity
    if (index < 0 || index >= doctor.work_experience.length) {
      return res.status(400).json({ message: "Invalid work experience index" });
    }

    // Update fields
    doctor.work_experience[index].hospital_name = hospital_name;
    doctor.work_experience[index].from_year = from_year;
    doctor.work_experience[index].to_year = to_year;
    doctor.work_experience[index].designation = designation;
    doctor.work_experience[index].major_achievements = major_achievements;

    await doctor.save();

    res.status(200).json({
      message: "Work experience updated successfully",
      doctor,
    });
  } catch (error) {
    console.error("Error editing work experience:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const delete_work_experience = async (req, res) => {
  try {
    const { _id, workindex } = req.params;
    const index = parseInt(workindex, 10);

    // Find the doctor
    const doctor = await adddoctormodal.findById(_id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    // Check if the event exists
    if (!doctor.work_experience || index < 0 || index >= doctor.work_experience.length) {
      return res.status(400).json({ error: "Invalid work index" });
    }

    // Remove the event from the doctor's array
    doctor.work_experience.splice(index, 1);

    // Save the doctor document
    await doctor.save();

    res.status(200).json({
      message: "Award deleted successfully",
      updatedDoctor: doctor,
    });
  } catch (error) {
    console.error("Delete award error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};



//======================= add update and delete awards_and_achievements================================



const add_awards_achievements = async (req, res) => {
  try {
    const id = req.params._id;
    const existingDoctor = await adddoctormodal.findById(id);

    if (!existingDoctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    let awards_and_achievements = existingDoctor.awards_and_achievements || [];

    let photo_of_award = [];
    let picture_gallary = [];

    if (req.files && req.files.length > 0) {
      const imagefield = req.files.filter(f => f.fieldname.includes("award_image"));
      const imagefield1 = req.files.filter(f => f.fieldname.includes("picture_gallary"));

      if (imagefield.length > 0) {
        photo_of_award = await uploadToCloudinary(imagefield);
      }

      if (imagefield1.length > 0) {
        picture_gallary = await uploadToCloudinary(imagefield1);
      }

    }

    const updateaward = {
      ...req.body,
      award_image: photo_of_award,
      picture_gallary: picture_gallary
    };

    const updatedata = [...awards_and_achievements, updateaward];

    const updatedDoctor = await adddoctormodal.findByIdAndUpdate(
      id,
      { awards_and_achievements: updatedata },
      { new: true, upsert: true }
    );

    res.status(200).json(updatedDoctor);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};


const deleteimagefrom_awardimage = async (req, res) => {
  try {
    const { _id, awardIndex, imageIndex } = req.params;
 
    const doctor = await adddoctormodal.findById(_id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const award = doctor.awards_and_achievements[awardIndex];
    if (!award) return res.status(400).json({ error: "Invalid award index" });

    if (!award.award_image || imageIndex >= award.award_image.length) {
      return res.status(400).json({ error: "Invalid image index" });
    }

    const deletedImage = award.award_image[imageIndex];
    award.award_image.splice(imageIndex, 1);

     const public_id = getPublicIdFromUrl(deletedImage)

    await cloudinary.uploader.destroy(public_id, { resource_type: "image" });

    await doctor.save();

    res.status(200).json({
      message: "Image deleted successfully",
      deletedImage,
      updatedDoctor: doctor,
    });
  } catch (error) {
    console.error("Delete award image error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const deleteimagefrom_picturegallary = async (req, res) => {
  try {
    const { _id, awardIndex, imageIndex } = req.params;
 
    const doctor = await adddoctormodal.findById(_id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const award = doctor.awards_and_achievements[awardIndex];
    if (!award) return res.status(400).json({ error: "Invalid award index" });

    if (!award.picture_gallary || imageIndex >= award.picture_gallary.length) {
      return res.status(400).json({ error: "Invalid image index" });
    }

    const deletedImage = award.picture_gallary[imageIndex];
    award.picture_gallary.splice(imageIndex, 1);

      // Get the image URL to delete
    const public_id = getPublicIdFromUrl(deletedImage)


    await cloudinary.uploader.destroy(public_id, { resource_type: "image" });


    await doctor.save();

    res.status(200).json({
      message: "Image deleted successfully",
      deletedImage,
      updatedDoctor: doctor,
    });
  } catch (error) {
    console.error("Delete award image error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};



const update_awards_achievements = async (req, res) => {
 try {
      const { _id, awardIndex } = req.params;
      const index = parseInt(awardIndex, 10);

      const doctor = await adddoctormodal.findById(_id);
      if (!doctor) return res.status(404).json({ error: "Doctor not found" });

      const award = doctor.awards_and_achievements[index];
      if (!award) return res.status(400).json({ error: "Invalid award index" });

      // Handle uploaded files
      let newAwardImages = [];
      let newGalleryImages = [];

      if (req.files && req.files.length > 0) {
        const awardFiles = req.files.filter(f => f.fieldname.includes("award_image"));
        const galleryFiles = req.files.filter(f => f.fieldname.includes("picture_gallary"));

          if (awardFiles.length > 0) {
        newAwardImages = await uploadToCloudinary(awardFiles);
      }

      if (galleryFiles.length > 0) {
        newGalleryImages = await uploadToCloudinary(galleryFiles);
      }
        // for (let file of awardFiles) {
        //   const result = await cloudinary.uploader.upload(file.path);
        //   newAwardImages.push(result.secure_url);
        // }

        // for (let file of galleryFiles) {
        //   const result = await cloudinary.uploader.upload(file.path);
        //   newGalleryImages.push(result.secure_url);
        // }
      }

      // Update text fields
      award.award_title = req.body.award_title || award.award_title;
      award.awarding_body = req.body.awarding_body || award.awarding_body;
      award.date = req.body.date || award.date;
      award.venue = req.body.venue || award.venue;
      award.video_url = req.body.video_url || award.video_url;

      // Add new images if any
      if (newAwardImages.length > 0) award.award_image.push(...newAwardImages);
      if (newGalleryImages.length > 0) award.picture_gallary.push(...newGalleryImages);

      await doctor.save();

      res.status(200).json({
        message: "Award updated successfully",
        updatedDoctor: doctor,
      });
    } catch (error) {
      console.error("Update award error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
};


const delete_award = async (req, res) => {
  try {
    const { _id, awardIndex } = req.params;
    const index = parseInt(awardIndex, 10);

    // Find the doctor
    const doctor = await adddoctormodal.findById(_id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    // Check if the event exists
    if (!doctor.awards_and_achievements || index < 0 || index >= doctor.awards_and_achievements.length) {
      return res.status(400).json({ error: "Invalid award index" });
    }

    // Remove the event from the doctor's array
    doctor.awards_and_achievements.splice(index, 1);

    // Save the doctor document
    await doctor.save();

    res.status(200).json({
      message: "Award deleted successfully",
      updatedDoctor: doctor,
    });
  } catch (error) {
    console.error("Delete award error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};


//================================== login doctor nd change password for first login ================================================

const logindoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await adddoctormodal.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email ID not found" });
    }

    const matchedPassword = await bcrypt.compare(password, user.password);
    if (!matchedPassword) {
      return res.status(400).json({ message: "Password not matched" });
    }

    if (user.ischangedpassword) {
      return res.status(403).json({ message: "Please change your password first" });
    }

    const payload = {
      id: user._id,
      firstName: user.firstName,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        // id: user._id,
        // email: user.email,
        // name: user.firstName,
        user
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    const user = await adddoctormodal.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).send("Old password is incorrect");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    user.ischangedpassword = false; // Optional: reset the flag
    await user.save();

    res.status(200).send("Password changed successfully");
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).send("Internal Server Error");
  }
};


//============================== view doctor and view by id =========================================


const viewdoctor=async(req,res)=>
{
  try {
    const resp=await adddoctormodal.find()
    res.status(200).send({message:"data fetch",doctor:resp})
    
  } catch (error) {
    console.log(error);
    
  }
}

const viewdoctorby_id=async(req,res)=>
{
  try {
    const id=req.params._id
 
    const resp=await adddoctormodal.findById({_id:id})
    res.status(200).send({message:"data fetch",doctor:resp})
    
  } catch (error) {
    console.log(error);
    
  }
}


  module.exports={add_doctor,logindoctor,changePassword,viewdoctor,updatedoctor,viewdoctorby_id,
    addimagegallary,deleteimagefromgallary,addupcomingevents,deleteupcomingeventsimage,add_work_experience,
    add_awards_achievements,edit_work_experience,add_awards_achievements,deleteimagefrom_awardimage,
    update_awards_achievements,deleteimagefrom_picturegallary,update_upcoming_events,delete_upcoming_events,
    delete_award,delete_work_experience
  }