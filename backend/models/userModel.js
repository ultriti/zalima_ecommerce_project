const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleLogin; // only required if not Google login
      }
    },
    // Add role field for role-based access
    role: {
      type: String,
      enum: ['user', 'admin', 'vendor', 'superadmin'],
      default: 'user',
    },
    // Consolidated profile image field
    profileImage: {
      public_id: {
        type: String,
        default: 'default_profile',
      },
      url: {
        type: String,
        default: '/images/default-user.png',
      },
    },
    // Add wishlist for user favorites
    googleLogin: {
      type: Boolean,
      default: false
    },
    wishlist: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1
        }
      }
    ],
    // Add cart functionality
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
          required: true
        },
        addedAt: {
          type: Date,
          default: Date.now
        },
        // Optional: Store selected size/color if applicable
        selectedVariant: {
          size: String,
          color: String,
          price: Number
        }
      }
    ],
    // Add shipping address
    shippingAddresses: [
      {
        address: { type: String },
        city: { type: String },
        postalCode: { type: String },
        country: { type: String },
        label: { type: String, default: 'Home' },
      }
    ],
    defaultShippingIndex: {
      type: Number,
      default: 0,
    },
    // For OAuth authentication
    googleId: {
      type: String,
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true
    },
    facebookLogin: {
      type: Boolean,
      default: false
    },
    // For OTP verification
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: { type: String, default: '' },
    resetPasswordExpires: { type: Date, default: '' },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    // For refresh token authentication
    refreshToken: {
      type: String,
    },
    // For user activity tracking
    lastLogin: {
      type: Date,
    },
    loginHistory: [
      {
        timestamp: { type: Date },
        ipAddress: { type: String },
        device: { type: String },
      }
    ],
    vendorRequest: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      requestDate: {
        type: Date,
        default: Date.now
      },
      requestNumber: {
        type: Number,
        default: null
      },
      approvalDate: {
        type: Date
      },
      rejectionReason: {
        type: String
      },
      businessInfo: {
        businessName: {
          type: String
        },
        businessDescription: {
          type: String
        },
        contactPhone: {
          type: String
        },
        businessAddress: {
          type: String
        },
        taxId: {
          type: String
        }
      }
    },
  },
  {
    timestamps: true,
  }
);

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get cart total
userSchema.methods.getCartTotal = function() {
  return this.cart.reduce((total, item) => {
    const price = item.selectedVariant && item.selectedVariant.price 
      ? item.selectedVariant.price 
      : item.product.price || 0;
    return total + (price * item.quantity);
  }, 0);
};

// Method to get cart item count
userSchema.methods.getCartItemCount = function() {
  return this.cart.reduce((total, item) => total + item.quantity, 0);
};

// Method to clear cart
userSchema.methods.clearCart = function() {
  this.cart = [];
  return this.save();
};

userSchema.pre('validate', function(next) {
  if (!this.email && !this.phoneNumber) {
    this.invalidate('email', 'Either email or phone number is required.');
    this.invalidate('phoneNumber', 'Either email or phone number is required.');
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.googleId) {
    next();
  } else {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  }
});

userSchema.statics.hashPassword = async function(password) {
  const bcrypt = require("bcryptjs");
  return await bcrypt.hash(password, 10);
};

const User = mongoose.model('User', userSchema);

module.exports = User;