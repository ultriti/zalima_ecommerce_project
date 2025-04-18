const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const facebookAuthService = require('../config/facebookAuth.config.js');
require('dotenv').config();
const { oauth2client } = require('../config/googleAuth.config');
const axios = require('axios')

const cloudinary = require('cloudinary').v2;


// Cloudinary config (you can move this to a separate config file if needed)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log("Cloudinary Keys", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'YES' : 'NO'
});

const uploadProfileImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }

  try {
    // Delete previous image from Cloudinary if it exists and isn't the default
    if (user.profileImage && user.profileImage.public_id && user.profileImage.public_id !== 'default_profile') {
      await cloudinary.uploader.destroy(user.profileImage.public_id);
    }

    // Upload new image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'user_profiles',
      width: 150,
      crop: 'scale'
    });

    // Update user profile with new image
    user.profileImage = {
      public_id: result.public_id,
      url: result.secure_url
    };

    await user.save();

    res.status(200).json({
      message: 'Profile image updated successfully',
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500);
    throw new Error('Failed to upload image');
  }
});


// module.exports.uploadProfileImage = uploadProfileImage;
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const sendOtpEmail=require('../utils/sendOtpEmail.js');
// ---------- Forgot Password ----------
const forgotUserPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // const resetPasswordUrl = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/user/reset-password/${resetToken}`;

  // const message = `You requested a password reset.\n\nClick to reset: ${resetPasswordUrl}\n\nIgnore if not requested.`;
  const message = `
    Hi ${user.name || ''},

    You recently requested to reset your password.

    Click the link below to reset your password:
    ${resetPasswordUrl}

    This link will expire in 1 hour.

    If you did not request this, you can safely ignore this email.

    Thanks,
    E-Commerce Team
    `;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      text: message,
    });
    console.log("SMTP_USER:", process.env.SMTP_MAIL);
    console.log("SMTP_PASS:", process.env.SMTP_PASSWORD);

    res.status(200).json({ message: `Reset link sent to ${user.email}` });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.error("Forgot Password Error: ", err);
    res.status(500);
    throw new Error("Failed to send email");
  }
});

// ---------- Reset Password ----------
// const resetUserPassword = asyncHandler(async (req, res) => {
//   const resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(req.params.token)
//     .digest("hex");

//   const user = await User.findOne({
//     resetPasswordToken,
//     resetPasswordExpires: { $gt: Date.now() },
//   });

//   if (!user) {
//     res.status(400);
//     throw new Error("Invalid or expired token");
//   }

//   const { password, confirmPassword } = req.body;

//   if (password !== confirmPassword) {
//     res.status(400);
//     throw new Error("Passwords do not match");
//   }

//   user.password = await User.hashPassword(password);
//   user.resetPasswordToken = undefined;
//   user.resetPasswordExpires = undefined;

//   await user.save();

//   res.status(200).json({ message: "Password reset successfully" });
// });
const resetUserPassword = asyncHandler(async (req, res) => {
  try {
    console.log("🔁 Password reset request received");

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    console.log("🔑 Hashed token:", resetPasswordToken);

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log("❌ Invalid or expired token");
      res.status(400);
      throw new Error("Invalid or expired token");
    }

    const { password, confirmPassword } = req.body;
    console.log("🔒 Received passwords");

    if (password !== confirmPassword) {
      console.log("❌ Passwords do not match");
      res.status(400);
      throw new Error("Passwords do not match");
    }

    // console.log("✅ Passwords match. Hashing now...");
    // user.password = await User.hashPassword(password);
    user.password = password;
    console.log(user.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    console.log("✅ Password updated and user saved");

    res.status(200).json({ message: "Password reset successfully" });

  } catch (error) {
    console.error("🔥 Internal Server Error:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password, superAdminToken } = req.body;

  const user = await User.findOne({ email });

  // Check if user exists and password matches
  if (user && (await user.matchPassword(password))) {
    // Additional security check for super admin login
    if (user.role === 'superAdmin') {
      // Verify the super admin token if attempting to log in as super admin
      if (!superAdminToken || superAdminToken !== process.env.SUPER_ADMIN_SECRET) {
        res.status(401);
        throw new Error('Super admin authentication requires additional verification');
      }
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Set JWT as HTTP-Only cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {

  
  const { name, email, password,secret } = req.body;
  

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  const role = (secret && secret === process.env.SUPER_ADMIN_SECRET) ? 'superAdmin' : 'user';
  const user = await User.create({
    name,
    email,
    password,
    profileImage: {
      url: '/images/default-user.png',
      public_id: 'default_profile'
    }
  });

  if (user) {
    const token_gen = generateToken(user._id)
    res.cookie("token", token_gen)

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token_gen,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});


// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
// const getUserProfile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id);

//   if (user) {
//     res.json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     });
//   } else {
//     res.status(404);
//     throw new Error('User not found');
//   }
// });
// GET /api/users/profile
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      phoneNumber: user.phoneNumber,
      isVerified: user.isVerified,
      wishlist: user.wishlist,
      shippingAddresses: user.shippingAddresses || [],
      defaultShippingIndex: user.defaultShippingIndex ?? 0,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
// const getUserProfile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id).populate('wishlist');

//   if (user) {
//     res.json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       phoneNumber: user.phoneNumber,
//       isVerified: user.isVerified,
//       wishlist: user.wishlist,
//       shippingAddress: user.shippingAddress,
//       googleId: user.googleId,
//       facebookId: user.facebookId,
//     });
//   } else {
//     res.status(404);
//     throw new Error('User not found');
//   }
// });


// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
// const updateUserProfile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id);

//   if (user) {
//     user.name = req.body.name || user.name;
//     user.email = req.body.email || user.email;
    
//     if (req.body.password) {
//       user.password = req.body.password;
//     }

//     const updatedUser = await user.save();

//     res.json({
//       _id: updatedUser._id,
//       name: updatedUser.name,
//       email: updatedUser.email,
//       role: updatedUser.role,
//       token: generateToken(updatedUser._id),
//     });
//   } else {
//     res.status(404);
//     throw new Error('User not found');
//   }
// });
// PUT /api/users/profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Basic user info update
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

  // 1. Replace entire address array (sent from React)
  if (Array.isArray(req.body.shippingAddresses)) {
    if (req.body.shippingAddresses.length > 5) {
      res.status(400);
      throw new Error('Maximum of 5 addresses allowed.');
    }
    user.shippingAddresses = req.body.shippingAddresses;
    user.defaultShippingIndex = req.body.defaultShippingIndex ?? user.shippingAddresses.length - 1;
  }

  // 2. Add single address (only if passed)
  if (req.body.addShippingAddress) {
    const newAddress = req.body.addShippingAddress;

    const isDuplicate = user.shippingAddresses.some(addr =>
      addr.address === newAddress.address &&
      addr.city === newAddress.city &&
      addr.postalCode === newAddress.postalCode &&
      addr.country === newAddress.country
    );

    if (isDuplicate) {
      res.status(400);
      throw new Error('Duplicate address not allowed.');
    }

    if (user.shippingAddresses.length >= 5) {
      res.status(400);
      throw new Error('Maximum of 5 addresses allowed.');
    }

    user.shippingAddresses.push(newAddress);
    user.defaultShippingIndex = user.shippingAddresses.length - 1;
  }

  // 3. Delete address by index
  if (req.body.deleteAddressIndex !== undefined) {
    const index = req.body.deleteAddressIndex;
    if (index >= 0 && index < user.shippingAddresses.length) {
      user.shippingAddresses.splice(index, 1);

      // Adjust default index
      if (user.defaultShippingIndex === index) {
        user.defaultShippingIndex = 0;
      } else if (user.defaultShippingIndex > index) {
        user.defaultShippingIndex -= 1;
      }
    }
  }

  // 4. Set new default address index
  if (req.body.defaultShippingIndex !== undefined) {
    if (
      req.body.defaultShippingIndex >= 0 &&
      req.body.defaultShippingIndex < user.shippingAddresses.length
    ) {
      user.defaultShippingIndex = req.body.defaultShippingIndex;
    }
  }

  // 5. Password update
  if (req.body.password) {
    user.password = req.body.password; // bcrypt handled via pre-save hook
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    phoneNumber: updatedUser.phoneNumber,
    isVerified: updatedUser.isVerified,
    wishlist: updatedUser.wishlist,
    shippingAddresses: updatedUser.shippingAddresses,
    defaultShippingIndex: updatedUser.defaultShippingIndex,
  });
});


// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
  
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Auth user with Google
// @route   POST /api/users/google
// @access  Public
// const googleAuth = asyncHandler(async (req, res) => {
//   const { googleId, email, name } = req.body;

//   if (!googleId || !email) {
//     res.status(400);
//     throw new Error('Invalid Google authentication data');
//   }

//   // Check if user exists
//   const userExists = await User.findOne({ email });

//   let user;
//   if (userExists) {
//     // Update googleId if not already set
//     if (!userExists.googleId) {
//       userExists.googleId = googleId;
//       await userExists.save();
//     }
//     user = userExists;
//   } else {
//     // Create new user
//     user = await User.create({
//       name,
//       email,
//       googleId,
//       password: generateRandomPassword(), // Helper function to generate random password
//     });
//   }

//   if (user) {
//     res.status(200).json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       token: generateToken(user._id),
//     });
//   } else {
//     res.status(400);
//     throw new Error('Invalid user data');
//   }
// });
const googleAuth = asyncHandler(async (req, res) => {
  try {
    console.log('Google Auth Request:', req.body);
    const code = req.method === 'GET' ? req.query.code : req.body.code;
    const redirectUri = req.body.redirectUri || 'http://localhost:5000/social-login-test.html';
    
    console.log(`Received Google auth code via ${req.method}:`, code ? code.substring(0, 10) + '...' : 'none');
    console.log('Using redirect URI:', redirectUri);

    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
    }
    
    // Update the redirect URI in the oauth2client
    oauth2client.redirectUri = redirectUri;
    
    try {
      // Exchange auth code for access token
      console.log('Exchanging code for tokens...');
      const googleRes = await oauth2client.getToken(code);
      console.log('Token exchange successful');
      
      oauth2client.setCredentials(googleRes.tokens);
      const accessToken = googleRes.tokens.access_token;

      // Fetch user info from Google
      console.log('Fetching user info from Google...');
      const userRes = await axios.get(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${encodeURIComponent(accessToken)}`
      );

      const { email, name, picture } = userRes.data;
      console.log('Google user data:', email, name);

      // Check if user exists
      let user = await User.findOne({ email });

      if (!user) {
        // Register new user
        console.log('Creating new user...');
        user = await User.create({
          name,
          email,
          profileImage: {
            url: picture, // Use the Google profile picture URL
            public_id: 'google_profile'
          },
          googleLogin: true,
          password: crypto.randomBytes(16).toString('hex'), // Random password
          role: 'user', // default role like registerUser
        });
        console.log('✅ New Google user created.');
      } else {
        console.log('✅ Existing user found, logging in.');
      }
      
      // Generate token and set cookie (same as registerUser)
      const token = generateToken(user._id);
      
      // Set JWT as HTTP-Only cookie
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
      
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        token: token
      });
    } catch (tokenError) {
      console.error('Token exchange error:', tokenError);
      return res.status(401).json({ 
        error: 'Failed to exchange authorization code for tokens',
        details: tokenError.message
      });
    }
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ 
      error: 'Google authentication failed',
      details: error.message
    });
  }
});





// @desc    Auth user with Facebook
// @route   POST /api/users/facebook
// @access  Public

// Update your facebookAuth function
const facebookAuth = asyncHandler(async (req, res) => {
  try {
    console.log('Facebook Auth Request:', req.body);
    const { code, redirectUri } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
    }
    
    // Exchange code for access token
    console.log('Exchanging Facebook code for token...');
    const accessToken = await facebookAuthService.getAccessToken(code, redirectUri);
    
    // Get user profile
    console.log('Fetching Facebook user profile...');
    const profile = await facebookAuthService.getUserProfile(accessToken);
    
    const { id: facebookId, name, email, picture } = profile;
    console.log('Facebook user data:', email, name);
    
    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Facebook' });
    }
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user
      console.log('Creating new user from Facebook data...');
      user = await User.create({
        name,
        email,
        profileImage: {
          url: picture?.data?.url || '/images/default-user.png',
          public_id: 'facebook_profile'
        },
        facebookId,
        facebookLogin: true,
        password: crypto.randomBytes(16).toString('hex'), // Random password
        role: 'user',
      });
      console.log('✅ New Facebook user created.');
    } else {
      // Update Facebook ID if not already set
      if (!user.facebookId) {
        user.facebookId = facebookId;
        await user.save();
      }
      console.log('✅ Existing user found, logging in.');
    }
    
    // Generate token and set cookie
    const token = generateToken(user._id);
    
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      token: token
    });
  } catch (error) {
    console.error('Facebook Auth Error:', error);
    res.status(500).json({ 
      error: 'Facebook authentication failed',
      details: error.message
    });
  }
});

// @desc    Send OTP for verification
// @route   POST /api/users/otp/send
// @access  Public
// const sendOTP = asyncHandler(async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     res.status(400);
//     throw new Error('Please provide an email');
//   }

//   // Check if user exists
//   const user = await User.findOne({ email });
  
//   if (!user) {
//     res.status(404);
//     throw new Error('User not found');
//   }

//   // Generate OTP (in a real app, you would send this via email/SMS)
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
//   // Store OTP with expiry (in a real app, you might use Redis or another store)
//   // For this example, we'll store it on the user document
//   user.otp = otp;
//   user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
//   await user.save();

//   // In a real app, send the OTP via email or SMS
//   // For this example, we'll just return it (not secure for production)
//   res.status(200).json({ 
//     message: 'OTP sent successfully',
//     otp: process.env.NODE_ENV === 'development' ? otp : undefined
//   });
// });
// controllers/userController.js or wherever your controller is



const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email');
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000;
  await user.save();

  try {
    await sendOtpEmail(email, user.name || '', otp);
    res.status(200).json({
      message: 'OTP sent successfully to your email',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500);
    throw new Error('Failed to send OTP email');
  }
});



// @desc    Verify OTP
// @route   POST /api/users/otp/verify
// @access  Public
// const verifyOTP = asyncHandler(async (req, res) => {
//   const { email, otp } = req.body;

//   if (!email || !otp) {
//     res.status(400);
//     throw new Error('Please provide email and OTP');
//   }

//   // Find user
//   const user = await User.findOne({ email });
  
//   if (!user) {
//     res.status(404);
//     throw new Error('User not found');
//   }

//   // Check if OTP is valid and not expired
//   if (user.otp !== otp || !user.otpExpiry || user.otpExpiry < Date.now()) {
//     res.status(400);
//     throw new Error('Invalid or expired OTP');
//   }

//   // Clear OTP
//   user.otp = undefined;
//   user.otpExpiry = undefined;
//   await user.save();

//   // Return user data with token
//   res.status(200).json({
//     _id: user._id,
//     name: user.name,
//     email: user.email,
//     role: user.role,
//     token: generateToken(user._id),
//   });
// });
// controllers/userController.js (or similar)

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  console.log(`🔍 Incoming OTP verification request for email: ${email}`);

  // Input validation
  if (!email || !otp) {
    console.log('❌ Missing email or OTP');
    res.status(400);
    throw new Error('Please provide email and OTP');
  }

  const user = await User.findOne({ email });

  if (!user) {
    console.log(`❌ User with email ${email} not found`);
    res.status(404);
    throw new Error('User not found');
  }

  if (!user.otp || !user.otpExpiry) {
    console.log('❌ No OTP or OTP expiry set for this user');
    res.status(400);
    throw new Error('No OTP was sent for this user');
  }

  if (user.otp !== otp) {
    console.log(`❌ Invalid OTP entered. Expected: ${user.otp}, Got: ${otp}`);
    res.status(400);
    throw new Error('Invalid OTP');
  }

  if (user.otpExpiry < Date.now()) {
    console.log('⏰ OTP has expired');
    res.status(400);
    throw new Error('OTP has expired');
  }

  console.log('✅ OTP verified successfully. Clearing OTP data and logging in user.');

  // Clear OTP info
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  // Respond with user details + JWT
  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
});


// @desc    Make a user an admin
// @route   PUT /api/users/makeadmin/:id
// @access  Private/SuperAdmin
const makeUserAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.role = 'admin';
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user orders
// @route   GET /api/users/orders
// @access  Private
const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('Please provide a product ID');
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const user = await User.findById(req.user._id);

  // Check if product is already in wishlist
  if (user.wishlist.includes(productId)) {
    res.status(400);
    throw new Error('Product already in wishlist');
  }

  // Add to wishlist
  user.wishlist.push(productId);
  await user.save();

  res.status(200).json({ message: 'Product added to wishlist' });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:id
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const user = await User.findById(req.user._id);

  // Check if product is in wishlist
  if (!user.wishlist.includes(productId)) {
    res.status(400);
    throw new Error('Product not in wishlist');
  }

  // Remove from wishlist
  user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
  await user.save();

  res.status(200).json({ message: 'Product removed from wishlist' });
});

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.json(user.wishlist);
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/SuperAdmin
const getUsers = asyncHandler(async (req, res) => {
  // This route is already restricted to superAdmin in the routes
  // But adding an extra check for security
  if (req.user.role !== 'superAdmin') {
    res.status(403);
    throw new Error('Not authorized to view all users');
  }
  
  const users = await User.find({}).select('-password');
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin or SuperAdmin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Regular admins cannot delete other admins or superAdmins
  if (req.user.role === 'admin' && (user.role === 'admin' || user.role === 'superAdmin')) {
    res.status(403);
    throw new Error('Regular admins cannot delete admin or superAdmin accounts');
  }
  
  await User.deleteOne({ _id: req.params.id });
  res.json({ message: 'User removed' });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin or SuperAdmin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Regular admins cannot view other admins or superAdmins
  if (req.user.role === 'admin' && (user.role === 'admin' || user.role === 'superAdmin')) {
    res.status(403);
    throw new Error('Regular admins cannot view admin or superAdmin profiles');
  }
  
  res.json(user);
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/SuperAdmin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Regular admins cannot update other admins or superAdmins
  if (req.user.role === 'admin' && (user.role === 'admin' || user.role === 'superAdmin')) {
    res.status(403);
    throw new Error('Regular admins cannot update admin or superAdmin accounts');
  }
  
  // Only superAdmin can update roles
  if (req.body.role && req.user.role !== 'superAdmin') {
    res.status(403);
    throw new Error('Only superAdmin can update user roles');
  }
  
  // Prevent changing role to superAdmin through this endpoint
  if (req.body.role === 'superAdmin' && user.role !== 'superAdmin') {
    res.status(403);
    throw new Error('Cannot promote users to superAdmin role through this endpoint');
  }
  
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  
  // Only update role if provided and authorized (superAdmin only)
  if (req.body.role && req.user.role === 'superAdmin') {
    user.role = req.body.role;
  }
  
  const updatedUser = await user.save();
  
  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
  });
});


module.exports = { 
  authUser, 
  registerUser, 
  getUserProfile, 
  updateUserProfile,
  logoutUser,
  googleAuth,
  facebookAuth,
  sendOTP,
  verifyOTP,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  getUserOrders,
  makeUserAdmin,
  uploadProfileImage,
  resetUserPassword,
  forgotUserPassword
};