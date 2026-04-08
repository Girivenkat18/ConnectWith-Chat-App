const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'connectwith_chat',
    resource_type: 'auto',
    allowedFormats: ['jpg', 'png', 'jpeg', 'gif', 'pdf', 'mp4', 'pdf'],
  },
});

const upload = multer({ storage: storage });

router.post('/', (req, res, next) => {
  upload.single('file')(req, res, function (err) {
    if (err) {
      console.error("Cloudinary/Multer Upload Error:", err);
      return res.status(400).json({ message: "Upload failed: " + err.message });
    }
    next();
  });
}, (req, res) => {
  try {
    if (!req.file) {
       return res.status(400).json({ message: 'No file received' });
    }
    res.status(200).json({ url: req.file.path });
  } catch (error) {
    console.error("Upload Route Error:", error);
    res.status(400).json({ message: 'Error uploading file' });
  }
});

module.exports = router;
