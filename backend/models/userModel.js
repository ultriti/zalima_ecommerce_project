const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleLogin;  // only required if not Google login
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
    // Add shipping address
    shippingAddresses: [
      {
        address: { type: String },
        city: { type: String },
        postalCode: { type: String },
        country: { type: String },
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
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {type:String,default: ''},
    resetPasswordExpires: {type:Date,default: ''},
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

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.googleId) {
    next();
  } else {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  }
});
userSchema.methods.generateResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to user schema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expiration time (e.g., 15 min or 1 hour)
  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

  return resetToken;
};
userSchema.statics.hashPassword = async function(password) {
  const bcrypt = require("bcryptjs");
  return await bcrypt.hash(password, 10);
};
const User = mongoose.model('User', userSchema);

module.exports = User;