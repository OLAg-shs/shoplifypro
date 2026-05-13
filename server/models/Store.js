const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Store customization for branded storefront
  branding: {
    // Store theme and colors
    theme: {
      primaryColor: {
        type: String,
        default: '#3B82F6' // blue-500
      },
      secondaryColor: {
        type: String,
        default: '#1D4ED8' // blue-700
      },
      accentColor: {
        type: String,
        default: '#06B6D4' // cyan-500
      },
      backgroundColor: {
        type: String,
        default: '#FFFFFF' // white
      },
      textColor: {
        type: String,
        default: '#1F2937' // gray-800
      },
      fontFamily: {
        type: String,
        default: 'system-ui, sans-serif'
      }
    },
    // Store assets
    assets: {
      logo: {
        url: String,
        alt: String,
        // For white background processing
        processed: {
          type: Boolean,
          default: false
        }
      },
      banner: {
        url: String,
        alt: String,
        processed: {
          type: Boolean,
          default: false
        }
      },
      // Additional images for store customization
      customImages: [{
        url: String,
        alt: String,
        purpose: String, // e.g., 'hero', 'category', 'promotion'
        processed: {
          type: Boolean,
          default: false
        }
      }]
    },
    // Store layout and sections
    layout: {
      // Whether to show featured products
      showFeaturedProducts: {
        type: Boolean,
        default: true
      },
      // Number of products per row
      productsPerRow: {
        type: Number,
        default: 3,
        min: 1,
        max: 6
      },
      // Store sections order
      sections: [{
        type: String,
        enum: ['hero', 'featured', 'categories', 'new-arrivals', 'bestsellers', 'testimonials', 'custom-html']
      }]
    },
    // Custom HTML/content for advanced customization
    customContent: {
      heroSection: String,
      footerText: String,
      policies: {
        refund: String,
        shipping: String,
        privacy: String
      }
    }
  },
  // Store settings
  settings: {
    // Payment methods accepted
    paymentMethods: [{
      type: String,
      enum: ['credit_card', 'paypal', 'bank_transfer', 'cod']
    }],
    // Shipping settings
    shipping: {
      // Countries served
      countriesServed: [String],
      // Free shipping threshold
      freeShippingThreshold: {
        type: Number,
        default: 0
      },
      // Handling time (days)
      handlingTime: {
        type: Number,
        default: 1
      }
    },
    // Tax settings
    tax: {
      // Whether to charge tax
      chargesTax: {
        type: Boolean,
        default: false
      },
      // Tax rate percentage
      taxRate: {
        type: Number,
        default: 0
      }
    }
  },
  // Store status
  isPublished: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Store metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Store stats (can be calculated but cached for performance)
  stats: {
    totalProducts: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    lastOrderDate: Date
  }
});

// Index for faster queries
storeSchema.index({ owner: 1 });
storeSchema.index({ isPublished: 1 });
storeSchema.index({ isVerified: 1 });
storeSchema.index({ 'settings.paymentMethods': 1 });

// Virtual for store URL slug
storeSchema.virtual('slug').get(function() {
  return this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
});

// Method to get store URL
storeSchema.methods.getStoreUrl = function() {
  return `/store/${this._id}/${this.slug}`;
};

// Static method to find store by slug
storeSchema.statics.findBySlug = function(slug) {
  // In a real app, you'd store the slug separately for performance
  // For now, we'll find by ID and check slug (requires ID in route)
  // Better approach: store slug separately and index it
  return this.findOne(); // Placeholder
};

module.exports = mongoose.model('Store', storeSchema);