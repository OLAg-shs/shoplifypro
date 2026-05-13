const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  comparePrice: {
    type: Number,
    min: 0
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  // Product images (with white background processing)
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    // For white background processing as requested
    processing: {
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
      },
      // Whether image has been processed to white background
      whiteBackground: {
        type: Boolean,
        default: false
      },
      // Original image info
      original: {
        url: String,
        width: Number,
        height: Number,
        fileSize: Number
      },
      // Processed image info
      processed: {
        url: String,
        width: Number,
        height: Number,
        fileSize: Number
      },
      // Processing metadata
      processedAt: Date,
      processingError: String
    }
  }],
  // Inventory
  stock: {
    type: Number,
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  // Product details
  category: {
    type: String,
    trim: true
  },
  tags: [String],
  // Product variations (for future enhancement)
  variations: [{
    name: String, // e.g., 'Color', 'Size'
    options: [String] // e.g., ['Red', 'Blue', 'Green'] or ['S', 'M', 'L']
  }],
  // Product status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  // SEO fields
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String]
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
productSchema.index({ store: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ category: 1 });
productSchema.index({ 'images.isPrimary': 1 });
productSchema.index({ 'images.processing.whiteBackground': 1 });
productSchema.index({ sku: 1 });

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary : this.images[0] || null;
});

// Method to get processed image URL (fallback to original if not processed)
productSchema.methods.getImageUrl = function(imageIndex = 0, preferProcessed = true) {
  const image = this.images[imageIndex];
  if (!image) return null;
  
  if (preferProcessed && 
      image.processing && 
      image.processing.status === 'completed' && 
      image.processing.whiteBackground && 
      image.processing.processed && 
      image.processing.processed.url) {
    return image.processing.processed.url;
  }
  
  return image.url;
};

module.exports = mongoose.model('Product', productSchema);