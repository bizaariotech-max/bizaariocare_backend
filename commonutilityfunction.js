const cloudinary=require('cloudinary').v2

require('dotenv').config()
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})

// common function to upload single/multiple images
 const uploadToCloudinary = async (files) => {
  try {
    if (!files || files.length === 0) return [];

    const uploadPromises = files.map(file =>
      cloudinary.uploader.upload(file.path, {
        folder: "uploads", // optional: store in a folder
        resource_type: "auto"
      })
    );

    const results = await Promise.all(uploadPromises);

    return results.map(res => res.secure_url); // return only urls
 
    
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};


function getPublicIdFromUrl(url) {
  const urlObj = new URL(url);
  const pathnameParts = urlObj.pathname.split('/');
  const uploadIndex = pathnameParts.findIndex(part => part === 'upload');
  let publicIdParts = pathnameParts.slice(uploadIndex + 1);
  if (publicIdParts[0].startsWith('v')) publicIdParts.shift(); // remove version
  let filename = publicIdParts.join('/');
  const lastDot = filename.lastIndexOf('.');
  if (lastDot !== -1) filename = filename.substring(0, lastDot); // remove extension
  return filename;
}

module.exports={uploadToCloudinary,getPublicIdFromUrl}