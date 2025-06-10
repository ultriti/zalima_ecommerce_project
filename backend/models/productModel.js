const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function() {
        // Require vendor field if the user creating the product is a vendor
        return this.user && this.populate('user').role === 'vendor';
      }
    },
    vendorInfo: {
      name: { type: String }, // Vendor business name for display
      businessName: { type: String }, // Vendor business name
      contactPhone: { type: String }, // Vendor contact
    },
    name: {
      type: String,
      required: true,
    },
    images: [{
      type: String,
      required: true,
    }], // Changed to array for multiple images
    image: {
      type: String,
      required: true, // Keep for backward compatibility
    },
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'men-shirts',
        'men-pants',
        'men-jackets',
        'men-t-shirts',
        'men-jeans',
        'men-formal',
        'women-dresses',
        'women-tops',
        'women-pants',
        'women-skirts',
        'women-jackets',
        'women-jeans',
        'women-formal',
        'kids-boys',
        'kids-girls',
        'accessories',
        'shoes',
        'bags'
      ]
    },
    subcategory: {
      type: String, // For more specific categorization
    },
    description: {
      type: String,
      required: true,
    },
    // Clothing-specific fields
    sizes: [{
      size: {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46'],
        required: true
      },
      stock: {
        type: Number,
        default: 0,
        min: 0
      }
    }],
    colors: [{
      color: {
        type: String,
        required: true
      },
      colorCode: {
        type: String, // Hex color code
      },
      images: [String], // Color-specific images
      stock: {
        type: Number,
        default: 0,
        min: 0
      }
    }],
    material: {
      type: String, // e.g., Cotton, Polyester, Silk, etc.
    },
    careInstructions: {
      type: String, // Washing and care instructions
    },
    fit: {
      type: String,
      enum: ['slim', 'regular', 'loose', 'oversized', 'tailored']
    },
    season: {
      type: String,
      enum: ['spring', 'summer', 'autumn', 'winter', 'all-season']
    },
    gender: {
      type: String,
      enum: ['men', 'women', 'unisex', 'kids'],
      required: true
    },
    ageGroup: {
      type: String,
      enum: ['adult', 'teen', 'kids', 'toddler', 'infant']
    },
    // Existing fields
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    originalPrice: {
      type: Number, // For showing discounts
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
      max: 100 // Percentage
    },
    isOnSale: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: [String], // For better searchability
    // Vendor-specific fields
    vendorApproved: {
      type: Boolean,
      default: false, // Admin approval for vendor products
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvalDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending-approval', 'rejected'],
      default: 'active'
    }
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to populate vendor info
productSchema.pre('save', async function(next) {
  if (this.vendor && this.isModified('vendor')) {
    try {
      const vendor = await mongoose.model('User').findById(this.vendor);
      if (vendor && vendor.vendorRequest && vendor.vendorRequest.businessInfo) {
        this.vendorInfo = {
          name: vendor.name,
          businessName: vendor.vendorRequest.businessInfo.businessName,
          contactPhone: vendor.vendorRequest.businessInfo.contactPhone
        };
      }
    } catch (error) {
      console.error('Error populating vendor info:', error);
    }
  }
  next();
});

// Virtual for calculating total stock across all sizes and colors
productSchema.virtual('totalStock').get(function() {
  let total = this.countInStock;
  
  // Add stock from sizes
  if (this.sizes && this.sizes.length > 0) {
    total += this.sizes.reduce((sum, size) => sum + size.stock, 0);
  }
  
  // Add stock from colors
  if (this.colors && this.colors.length > 0) {
    total += this.colors.reduce((sum, color) => sum + color.stock, 0);
  }
  
  return total;
});

// Virtual for calculating effective price after discount
productSchema.virtual('effectivePrice').get(function() {
  if (this.discount > 0) {
    return this.price * (1 - this.discount / 100);
  }
  return this.price;
});

// Indexing for optimized queries
productSchema.index({ category: 1, price: 1 });
productSchema.index({ vendor: 1, status: 1 });
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ 'vendorInfo.businessName': 1 });
productSchema.index({ tags: 1 });
productSchema.index({ gender: 1, category: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;