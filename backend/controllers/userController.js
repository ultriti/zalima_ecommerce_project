const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const facebookAuthService = require('../config/facebookAuth.config.js');
require('dotenv').config();
const { createOAuth2Client } = require('../config/googleAuth.config');

const axios = require('axios');

const cloudinary = require('cloudinary').v2;

// Cloudinary config
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
    if (user.profileImage && user.profileImage.public_id && user.profileImage.public_id !== 'default_profile') {
      await cloudinary.uploader.destroy(user.profileImage.public_id);
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'user_profiles',
      width: 150,
      crop: 'scale'
    });

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

const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const sendOtpEmail = require('../utils/sendOtpEmail.js');

const forgotUserPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/user/reset-password/${resetToken}`;

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

const authUser = asyncHandler(async (req, res) => {
  const { email, password, superAdminToken } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (user.role === 'superadmin') {
      if (!superAdminToken || superAdminToken !== process.env.SUPER_ADMIN_SECRET) {
        res.status(401);
        throw new Error('Super admin authentication requires additional verification');
      }
    }

    const token = generateToken(user._id);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
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

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, secret } = req.body;
  
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  const role = (secret && secret === process.env.SUPER_ADMIN_SECRET) ? 'superadmin' : 'user';
  const user = await User.create({
    name,
    email,
    password,
    role,
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

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist.product');

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

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

  if (Array.isArray(req.body.shippingAddresses)) {
    if (req.body.shippingAddresses.length > 5) {
      res.status(400);
      throw new Error('Maximum of 5 addresses allowed.');
    }
    user.shippingAddresses = req.body.shippingAddresses;
    user.defaultShippingIndex = req.body.defaultShippingIndex ?? user.shippingAddresses.length - 1;
  }

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

  if (req.body.deleteAddressIndex !== undefined) {
    const index = req.body.deleteAddressIndex;
    if (index >= 0 && index < user.shippingAddresses.length) {
      user.shippingAddresses.splice(index, 1);

      if (user.defaultShippingIndex === index) {
        user.defaultShippingIndex = 0;
      } else if (user.defaultShippingIndex > index) {
        user.defaultShippingIndex -= 1;
      }
    }
  }

  if (req.body.defaultShippingIndex !== undefined) {
    if (
      req.body.defaultShippingIndex >= 0 &&
      req.body.defaultShippingIndex < user.shippingAddresses.length
    ) {
      user.defaultShippingIndex = req.body.defaultShippingIndex;
    }
  }

  if (req.body.password) {
    user.password = req.body.password;
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

const googleAuth = asyncHandler(async (req, res) => {
  try {
    const code = req.body.code;
    const redirectUri = req.body.redirectUri?.replace(/\/$/, '');
    
    console.log('Google Auth - Received code:', code ? 'Yes (length: ' + code.length + ')' : 'No');
    console.log('Google Auth - Redirect URI:', redirectUri);
    
    // Add validation
    if (!redirectUri || !(
      redirectUri.match(/^https?:\/\/localhost:5173\/user\/(register|signin)$/) ||
      redirectUri === 'http://localhost:5000/social-login-test.html'
    )) {
      return res.status(400).json({ 
        error: 'Invalid redirect URI format',
        expectedFormat: 'http://localhost:5173/user/register, http://localhost:5173/user/signin, or http://localhost:5000/social-login-test.html'
      });
    }
    
    const oauth2client = createOAuth2Client(redirectUri);
    
    try {
      console.log('Exchanging code for tokens...');
      const googleRes = await oauth2client.getToken(code);
      console.log('Token exchange successful');
      
      oauth2client.setCredentials(googleRes.tokens);
      const accessToken = googleRes.tokens.access_token;

      console.log('Fetching user info from Google...');
      const userRes = await axios.get(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${encodeURIComponent(accessToken)}`
      );

      const { email, name, picture } = userRes.data;
      console.log('Google user data:', email, name);

      let user = await User.findOne({ email });

      if (!user) {
        console.log('Creating new user...');
        const randomPassword = crypto.randomBytes(16).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        user = await User.create({
          name,
          email,
          profileImage: {
            url: picture,
            public_id: 'google_profile',
          },
          googleLogin: true,
          password: hashedPassword,
          role: 'user',
        });
        console.log('✅ New Google user created.');
      } else {
        console.log('✅ Existing user found, logging in.');
      }
      
      const token = generateToken(user._id);
      
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        token: token,
        user_data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (tokenError) {
      console.error('Token exchange error:', tokenError);
      if (tokenError.response?.data?.error === 'redirect_uri_mismatch') {
        return res.status(400).json({
          error: 'Redirect URI mismatch. Please check the authorized redirect URIs in Google Cloud Console.',
          details: tokenError.message,
        });
      }
      return res.status(401).json({
        error: 'Failed to exchange authorization code for tokens',
        details: tokenError.message,
      });
    }
  } catch (error) {
    // More detailed error logging
    console.error('Google Auth Error Details:', {
      message: error.message,
      name: error.name,
      response: error.response?.data,
      status: error.response?.status
    });
    
    res.status(500).json({
      error: 'Google authentication failed',
      details: error.message,
      type: error.name
    });
  }
});

const facebookAuth = asyncHandler(async (req, res) => {
  try {
    console.log('Facebook Auth Request:', req.body);
    const { code, redirectUri } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
    }
    
    if (!redirectUri || !(
      redirectUri.match(/^https?:\/\/localhost:5173\/user\/(register|signin)$/) ||
      redirectUri === 'http://localhost:5000/social-login-test.html'
    )) {
      return res.status(400).json({ 
        error: 'Invalid redirect URI format',
        expectedFormat: 'http://localhost:5173/user/register, http://localhost:5173/user/signin, or http://localhost:5000/social-login-test.html'
      });
    }
    
    console.log('Exchanging Facebook code for token...');
    const accessToken = await facebookAuthService.getAccessToken(code, redirectUri);
    
    console.log('Fetching Facebook user profile...');
    const profile = await facebookAuthService.getUserProfile(accessToken);
    
    const { id: facebookId, name, email, picture } = profile;
    console.log('Facebook user data:', email, name);
    
    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Facebook' });
    }
    
    let user = await User.findOne({ email });
    
    if (!user) {
      console.log('Creating new user from Facebook data...');
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      user = await User.create({
        name,
        email,
        profileImage: {
          url: picture?.data?.url || '/images/default-user.png',
          public_id: 'facebook_profile'
        },
        facebookId,
        facebookLogin: true,
        password: hashedPassword,
        role: 'user',
      });
      console.log('✅ New Facebook user created.');
    } else {
      if (!user.facebookId) {
        user.facebookId = facebookId;
        await user.save();
      }
      console.log('✅ Existing user found, logging in.');
    }
    
    const token = generateToken(user._id);
    
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      token: token,
      user_data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Facebook Auth Error:', error);
    res.status(500).json({ 
      error: 'Facebook authentication failed',
      details: error.message
    });
  }
});

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

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  console.log(`🔍 Incoming OTP verification request for email: ${email}`);

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

  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
});

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

const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('Please provide a product ID');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const user = await User.findById(req.user._id);

  const wishlistItem = user.wishlist.find(
    item => item.product.toString() === productId
  );

  if (wishlistItem) {
    wishlistItem.quantity += 1;
  } else {
    user.wishlist.push({ product: productId, quantity: 1 });
  }

  await user.save();

  res.status(200).json({ message: 'Product added to wishlist' });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const user = await User.findById(req.user._id);

  const wishlistIndex = user.wishlist.findIndex(
    item => item.product.toString() === productId
  );

  if (wishlistIndex === -1) {
    res.status(400);
    throw new Error('Product not in wishlist');
  }

  user.wishlist.splice(wishlistIndex, 1);
  await user.save();

  res.status(200).json({ message: 'Product removed from wishlist' });
});

const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist.product');
  res.json(user.wishlist);
});

const getUsers = asyncHandler(async (req, res) => {
  // Check authorization
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view users');
  }
  
  // Build query based on request parameters
  const query = {};
  
  // Filter by role if specified in query params
  if (req.query.role) {
    query.role = req.query.role;
  }
  
  const users = await User.find(query).select('-password');
  res.json(users);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  if (req.user.role === 'admin' && (user.role === 'admin' || user.role === 'superAdmin')) {
    res.status(403);
    throw new Error('Regular admins cannot delete admin or superAdmin accounts');
  }
  
  await User.deleteOne({ _id: req.params.id });
  res.json({ message: 'User removed' });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  if (req.user.role === 'admin' && (user.role === 'admin' || user.role === 'superAdmin')) {
    res.status(403);
    throw new Error('Regular admins cannot view admin or superAdmin profiles');
  }
  
  res.json(user);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  if (req.user.role === 'admin' && (user.role === 'admin' || user.role === 'superAdmin')) {
    res.status(403);
    throw new Error('Regular admins cannot update admin or superAdmin accounts');
  }
  
  if (req.body.role && req.user.role !== 'superAdmin') {
    res.status(403);
    throw new Error('Only superAdmin can update user roles');
  }
  
  if (req.body.role === 'superAdmin' && user.role !== 'superAdmin') {
    res.status(403);
    throw new Error('Cannot promote users to superAdmin role through this endpoint');
  }
  
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  
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

const decrementWishlistItem = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const user = await User.findById(req.user._id);

  const wishlistItem = user.wishlist.find(
    item => item.product.toString() === productId
  );

  if (!wishlistItem) {
    res.status(400);
    throw new Error('Product not in wishlist');
  }

  if (wishlistItem.quantity > 1) {
    wishlistItem.quantity -= 1;
  } else {
    user.wishlist = user.wishlist.filter(
      item => item.product.toString() !== productId
    );
  }

  await user.save();

  res.status(200).json({ message: 'Wishlist item updated' });
});


const adminLogin = asyncHandler(async (req, res) => {
  const { email, password, role, secretKey } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Check if user has the requested role
  if (user.role !== role) {
    return res.status(403).json({ 
      message: `You don't have ${role} privileges. Your role is ${user.role}.` 
    });
  }

  // For superadmin, verify secret key
  if (role === 'superadmin') {
    const superAdminSecret = process.env.SUPER_ADMIN_SECRET;
    
    if (!secretKey || secretKey !== superAdminSecret) {
      return res.status(401).json({ message: 'Invalid super admin secret key' });
    }
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Generate token
  const token = generateToken(user._id);

  // Set cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  // Send response
  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  });
});

/**
 * @desc    Promote user to vendor (superadmin only)
 * @route   PUT /api/users/:id/promote
 * @access  Private (Superadmin)
 */
const promoteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if the requesting user is authorized (superadmin)
  if (req.user.role !== 'superadmin') {
    res.status(403);
    throw new Error('Not authorized to promote users');
  }

  // Verify secret key (you should replace this with your actual secret key)
  const { secretKey, role, businessInfo } = req.body;
  const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'your-secret-key';

  if (secretKey !== ADMIN_SECRET_KEY) {
    res.status(401);
    throw new Error('Invalid secret key');
  }

  // Check if user is already the requested role
  if (user.role === role) {
    res.status(400);
    throw new Error(`User is already a ${role}`);
  }

  // If promoting to vendor, handle business info
  if (role === 'vendor') {
    // Create default business info if not provided
    const vendorBusinessInfo = businessInfo || {
      businessName: user.name + "'s Business",
      businessDescription: "Default business description",
      contactPhone: "",
      businessAddress: "",
      taxId: ""
    };

    // Update user with vendor role and business info
    user.role = 'vendor';
    user.vendorRequest = {
      status: 'approved',
      approvalDate: new Date(),
      businessInfo: vendorBusinessInfo
    };
  } else {
    user.role = role;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    message: `User promoted to ${role} successfully`
  });
});

const searchUsers = asyncHandler(async (req, res) => {
  // Check authorization
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to search users');
  }
  
  const { term, role } = req.query;
  
  if (!term) {
    res.status(400);
    throw new Error('Search term is required');
  }
  
  // Build the query
  const query = {};
  
  // Add role filter if provided
  if (role) {
    query.role = role;
  }
  
  // Search by name, email, or ID
  query.$or = [
    { name: { $regex: term, $options: 'i' } },
    { email: { $regex: term, $options: 'i' } }
  ];
  
  // If the term looks like a MongoDB ObjectId, also search by ID
  if (term.match(/^[0-9a-fA-F]{24}$/)) {
    query.$or.push({ _id: term });
  }
  
  const users = await User.find(query).select('-password');
  res.json(users);
});

const getVendorRequests = asyncHandler(async (req, res) => {
  const { status = 'pending' } = req.query;
  
  const requests = await User.find({
    'vendorRequest.status': status
  }).select('-password');
  
  res.json(requests);
});

const getVendorRequestsCount = asyncHandler(async (req, res) => {
  const count = await User.countDocuments({
    'vendorRequest.status': 'pending'
  });
  
  res.json({ count });
});

const handleVendorRequest = asyncHandler(async (req, res) => {
  const { action, rejectionReason } = req.body;
  const userId = req.params.id;
  
  const user = await User.findById(userId);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  if (!user.vendorRequest || user.vendorRequest.status !== 'pending') {
    res.status(400);
    throw new Error('No pending vendor request found');
  }
  
  if (action === 'approve') {
    user.role = 'vendor';
    user.vendorRequest.status = 'approved';
    user.vendorRequest.approvalDate = new Date();
  } else if (action === 'reject') {
    user.vendorRequest.status = 'rejected';
    user.vendorRequest.rejectionReason = rejectionReason || 'No reason provided';
  } else {
    res.status(400);
    throw new Error('Invalid action. Must be either "approve" or "reject"');
  }
  
  await user.save();
  
  res.json({
    message: `Vendor request ${action}d successfully`,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendorRequest: user.vendorRequest
    }
  });
});

const getMyVendorRequest = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  if (!user.vendorRequest) {
    res.status(404);
    throw new Error('No vendor request found');
  }
  
  res.json(user.vendorRequest);
});

const submitVendorRequest = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Check if user already has a pending or approved request
  if (user.vendorRequest && ['pending', 'approved'].includes(user.vendorRequest.status)) {
    res.status(400);
    throw new Error(`You already have a ${user.vendorRequest.status} vendor request`);
  }
  
  // Create or update vendor request
  user.vendorRequest = {
    status: 'pending',
    requestDate: new Date(),
    businessInfo: {
      businessName: req.body.businessName,
      businessDescription: req.body.businessDescription,
      contactPhone: req.body.contactPhone,
      businessAddress: req.body.businessAddress,
      taxId: req.body.taxId
    }
  };
  
  await user.save();
  
  res.status(201).json({
    message: 'Vendor request submitted successfully',
    vendorRequest: user.vendorRequest
  });
});

/**
 * @desc    Change user role
 * @route   PUT /api/users/:id/role
 * @access  Private (Admin, SuperAdmin)
 */
const changeUserRole = asyncHandler(async (req, res) => {
  const { role, secretKey } = req.body;
  const userId = req.params.id;
  
  // Validate input
  if (!role) {
    res.status(400);
    throw new Error('Role is required');
  }
  
  // Validate role value
  const validRoles = ['user', 'vendor', 'admin', 'superadmin'];
  if (!validRoles.includes(role.toLowerCase())) {
    res.status(400);
    throw new Error('Invalid role');
  }
  
  // Check if the secret key matches any of the environment variables
  if (
    secretKey !== process.env.ADMIN_SECRET_KEY && 
    secretKey !== process.env.SUPER_ADMIN_SECRET
  ) {
    res.status(401);
    throw new Error('Invalid secret key');
  }
  
  // Additional security: Only superadmin can create other superadmins
  if (role.toLowerCase() === 'superadmin' && req.user.role.toLowerCase() !== 'superadmin') {
    res.status(403);
    throw new Error('Only superadmins can create other superadmins');
  }
  
  // Find the user
  const user = await User.findById(userId);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Update the role
  user.role = role.toLowerCase();
  
  // Handle vendorRequest status if needed
  if (role.toLowerCase() === 'vendor') {
    // If changing to vendor and user has no vendorRequest, create one
    if (!user.vendorRequest) {
      user.vendorRequest = {
        status: 'approved',
        approvalDate: new Date(),
        businessInfo: {
          businessName: `${user.name}'s Business`,
          businessDescription: 'Auto-generated for role change',
          contactPhone: '',
          businessAddress: '',
          taxId: ''
        }
      };
    } else {
      // If user already has a vendorRequest, just update the status
      user.vendorRequest.status = 'approved';
    }
  } else if (user.vendorRequest) {
    // If changing from vendor to another role and user has a vendorRequest
    // Instead of setting to 'none', either use a valid enum value or unset the field
    if (role.toLowerCase() !== 'vendor') {
      // Option 1: Set to a valid enum value
      user.vendorRequest.status = 'rejected';
      
      // Option 2: If you want to completely remove the vendorRequest field
      // Uncomment the line below instead of using Option 1
      // user.vendorRequest = undefined;
    }
  }
  
  // Save the updated user
  try {
    await user.save();
    
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      message: `User role updated to ${role}`
    });
  } catch (error) {
    res.status(400);
    throw new Error(`Error updating user: ${error.message}`);
  }
});

module.exports = {
  changeUserRole,
  getVendorRequestsCount,
  getVendorRequests,
  handleVendorRequest,
  getMyVendorRequest,
  submitVendorRequest,
  searchUsers,
  promoteUser,
  decrementWishlistItem,
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
  forgotUserPassword,
  adminLogin
};