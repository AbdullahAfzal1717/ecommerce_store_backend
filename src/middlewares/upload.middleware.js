const multer = require("multer");
const { storage } = require("../config/cloudinary"); // Importing the engine from config

// We tell Multer to use the Cloudinary storage engine
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
  
});

module.exports = upload;