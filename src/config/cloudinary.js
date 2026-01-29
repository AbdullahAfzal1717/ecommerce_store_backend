const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// 1. Linking to YOUR account
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Setting up the "Engine" (Folder name, allowed formats)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "jumbo_ecommerce/products", 
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

// We export the 'storage' engine to be used by Multer
module.exports = { cloudinary, storage };