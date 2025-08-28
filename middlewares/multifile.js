const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Storage setup for Multer
const storage = multer.diskStorage({
  // destination: function (req, file, cb) {
  //   cb(null, 'uploads'); // Folder to store uploaded files temporarily
  // },
  filename: function (req, file, cb) {
    // Set unique filename using timestamp and file extension
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File filter for accepting specific file types
const fileFilter = (req, file, cb) => {
    const fileTypes = {
      image: ['image/jpeg', 'image/png','image/jpg'],
  
    };

    // Check for image files
    if (file.fieldname.includes('picture_gallary') && fileTypes.image.includes(file.mimetype)) {
      return cb(null, true); // Accept image files for preview
    }

    else if (file.fieldname.includes('award_image') && fileTypes.image.includes(file.mimetype)) {
      return cb(null, true); // Accept image files for document details
    }


    else if (file.fieldname.includes('pic') && fileTypes.image.includes(file.mimetype)) {
      return cb(null, true); // Accept image files for document details
    }
    // Reject file if it doesn't match the allowed types
    else {
      console.log('Rejected File:', file);  // Log rejected file for debugging
      return cb(new Error('Invalid file type'), false); 
    }
};

// Multer upload setup
const upload = multer({
  storage: storage,
  // limits: { fileSize: 50 * 1024 * 1024 }, // Max file size 50MB
  fileFilter: fileFilter
});

// Use upload.any() to allow all fields, since we are using dynamic fields
const uploadFields = upload.any();

module.exports = uploadFields;
