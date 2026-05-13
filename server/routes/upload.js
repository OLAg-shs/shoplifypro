const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Upload image and process to white background
// @route   POST /api/upload/image
// @access  Private
router.post('/image', protect, async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const file = req.files.image;

    // Upload to Cloudinary with background removal and white background
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'eagle-choice/products',
      transformation: [
        { effect: 'background_removal' }, // Remove background
        { background: 'white' }, // Set background to white
        { width: 800, height: 800, crop: 'limit' } // Resize limit
      ],
      resource_type: 'image',
    });

    // Return the secure URL of the processed image
    res.status(200).json({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during image upload' });
  }
});

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/image/:publicId
// @access  Private
router.delete('/image/:publicId', protect, async (req, res) => {
  try {
    const { publicId } = req.params;
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: 'image'
    });

    if (result.result === 'ok') {
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(500).json({ message: 'Failed to delete image' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;