const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const facebookAuthService = require('../config/facebookAuth.config.js');
const jwt = require('jsonwebtoken');
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
  console.log('Received file:', req.file);
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
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'user_profiles',
      width: 150,
      crop: 'scale',
    });

    if (user.profileImage && user.profileImage.public_id && user.profileImage.public_id !== 'default_profile') {
      await cloudinary.uploader.destroy(user.profileImage.public_id);
    }

    user.profileImage = {
      public_id: result.public_id,
      url: result.secure_url,
    };

    await user.save();

    res.status(200).json({
      message: 'Profile image updated successfully',
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500);
    throw new Error('Failed to upload image');
  }
});

const sendOtpEmail = require('../utils/sendOtpEmail.js');
const { sendPasswordResetEmail } = require('../utils/sendPasswordResetEmail');

const forgotUserPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/user/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail({
      email: user.email,
      resetLink: resetPasswordUrl,
    });

    res.status(200).json({ message: `Reset link sent to ${user.email}` });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.error('Forgot Password Error:', err);
    res.status(500);
    throw new Error('Failed to send email');
  }
});

const resetUserPassword = asyncHandler(async (req, res) => {
  try {
    console.log('🔁 Password reset request received');

    const { token } = req.params;
    const { password } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.log('❌ Invalid or expired token:', error.message);
      res.status(400);
      throw new Error('Invalid or expired token');
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user || user._id.toString() !== decoded.userId) {
      console.log('❌ Invalid or expired token');
      res.status(400);
      throw new Error('Invalid or expired token');
    }

    if (!password || password.length < 6) {
      console.log('❌ Password must be at least 6 characters');
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    console.log('✅ Password updated and user saved');

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('🔥 Reset Password Error:', error.message);
    res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, phoneNumber, password, superAdminToken } = req.body;

  let user;
  if (email) {
    user = await User.findOne({ email });
  } else if (phoneNumber) {
    user = await User.findOne({ phoneNumber });
  } else {
    res.status(400);
    throw new Error('Please provide email or phone number');
  }

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

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    console.log('Cookies set:', { jwt: token, token });

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
  const { name, email, phoneNumber, password, secret } = req.body;

  if (!name || !password || (!email && !phoneNumber)) {
    res.status(400);
    throw new Error('Please provide name, password, and either email or phone number');
  }

  let userExists = null;
  if (email) userExists = await User.findOne({ email });
  if (!userExists && phoneNumber) userExists = await User.findOne({ phoneNumber });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const role = (secret && secret === process.env.SUPER_ADMIN_SECRET) ? 'superadmin' : 'user';
  const user = await User.create({
    name,
    email,
    phoneNumber,
    password,
    role,
    profileImage: {
      url: '/images/default-user.png',
      public_id: 'default_profile'
    }
  });

  if (user) {
    const token_gen = generateToken(user._id);
    res.cookie("token", token_gen);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      token: token_gen,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist.product')
    // .populate('cart.product');

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
      cart: user.cart,
      // cartTotal: user.getCartTotal(),
      // cartItemCount: user.getCartItemCount(),
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
    req.body.shippingAddresses.forEach(addr => {
      if (!addr.address || !addr.city || !addr.postalCode || !addr.country) {
        throw new Error('All address fields (address, city, postalCode, country) are required.');
      }
    });
    user.shippingAddresses = req.body.shippingAddresses;
    user.defaultShippingIndex = req.body.defaultShippingIndex ?? user.shippingAddresses.length - 1;
  }

  if (req.body.addShippingAddress) {
    const newAddress = req.body.addShippingAddress;

    if (!newAddress.address || !newAddress.city || !newAddress.postalCode || !newAddress.country) {
      res.status(400);
      throw new Error('All address fields are required.');
    }

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
    cart: updatedUser.cart,
    shippingAddresses: updatedUser.shippingAddresses,
    defaultShippingIndex: user.defaultShippingIndex,
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
      const randomPassword = Math.random().toString(36).slice(-8);
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
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    console.log('Cookies set:', { jwt: token, token });

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
      const randomPassword = Math.random().toString(36).slice(-8);
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

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    console.log('Cookies set:', { jwt: token, token });

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
  const { email, phoneNumber } = req.body;

  let user;
  if (email) {
    user = await User.findOne({ email });
  } else if (phoneNumber) {
    user = await User.findOne({ phoneNumber });
  } else {
    res.status(400);
    throw new Error('Please provide email or phone number');
  }

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000;
  await user.save();

  try {
    if (email) {
      await sendOtpEmail(email, user.name || '', otp);
      res.status(200).json({
        message: 'OTP sent successfully to your email',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    } else if (phoneNumber) {
      res.status(200).json({
        message: 'OTP sent successfully to your phone number',
        otp: process.env.NODE_ENV === 'development.integrate' ? otp : undefined
      });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500);
    throw new Error('Failed to send OTP');
  }
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, phoneNumber, otp } = req.body;

  if ((!email && !phoneNumber) || !otp) {
    res.status(400);
    throw new Error('Please provide email or phone number and OTP');
  }

  let user;
  if (email) {
    user = await User.findOne({ email });
  } else if (phoneNumber) {
    user = await User.findOne({ phoneNumber });
  }

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!user.otp || !user.otpExpiry) {
    res.status(400);
    throw new Error('No OTP was sent for this user');
  }

  if (user.otp !== otp) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  if (user.otpExpiry < Date.now()) {
    res.status(400);
    throw new Error('OTP has expired');
  }

  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
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

// WISHLIST FUNCTIONALITY
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

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
    wishlistItem.quantity += parseInt(quantity);
  } else {
    user.wishlist.push({ product: productId, quantity: parseInt(quantity) });
  }

  await user.save();

  res.status(200).json({
    message: 'Product added to wishlist',
    wishlist: user.wishlist
  });
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

  res.status(200).json({
    message: 'Product removed from wishlist',
    wishlist: user.wishlist
  });
});

const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist.product');
  res.json(user.wishlist);
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

  res.status(200).json({
    message: 'Wishlist item updated',
    wishlist: user.wishlist
  });
});

// CART FUNCTIONALITY
const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('cart.product');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    cart: user.cart,
    cartTotal: user.getCartTotal(),
    cartItemCount: user.getCartItemCount()
  });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, selectedVariant } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('Please provide a product ID');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error(`Product with ID ${productId} not found. Please ensure the product exists in the database.`);
  }

  const user = await User.findById(req.user._id);

  const cartItemIndex = user.cart.findIndex(
    item => item.product.toString() === productId &&
      (!selectedVariant ||
        (item.selectedVariant &&
          item.selectedVariant.size === selectedVariant.size &&
          item.selectedVariant.color === selectedVariant.color))
  );

  if (cartItemIndex > -1) {
    user.cart[cartItemIndex].quantity += parseInt(quantity);
  } else {
    user.cart.push({
      product: productId,
      quantity: parseInt(quantity),
      selectedVariant: selectedVariant || null,
      addedAt: new Date()
    });
  }

  await user.save();

  res.status(200).json({
    message: 'Product added to cart',
    cart: user.cart,
    cartTotal: user.getCartTotal(),
    cartItemCount: user.getCartItemCount()
  });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity, selectedVariant } = req.body;

  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error('Please provide a valid quantity');
  }

  const user = await User.findById(req.user._id);

  const cartItem = user.cart.find(
    item => item.product.toString() === productId
  );

  if (!cartItem) {
    res.status(404);
    throw new Error('Product not found in cart');
  }

  cartItem.quantity = parseInt(quantity);
  if (selectedVariant) {
    cartItem.selectedVariant = selectedVariant;
  }

  await user.save();

  res.status(200).json({
    message: 'Cart item updated',
    cart: user.cart,
    cartTotal: user.getCartTotal(),
    cartItemCount: user.getCartItemCount()
  });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);

  const cartItemIndex = user.cart.findIndex(
    item => item.product.toString() === productId
  );

  if (cartItemIndex === -1) {
    res.status(404);
    throw new Error('Product not found in cart');
  }

  user.cart.splice(cartItemIndex, 1);
  await user.save();

  res.status(200).json({
    message: 'Product removed from cart',
    cart: user.cart,
    cartTotal: user.getCartTotal(),
    cartItemCount: user.getCartItemCount()
  });
});

const incrementCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);

  const cartItem = user.cart.find(
    item => item.product.toString() === productId
  );

  if (!cartItem) {
    res.status(404);
    throw new Error('Product not found in cart');
  }

  cartItem.quantity += 1;
  await user.save();

  res.status(200).json({
    message: 'Cart item quantity incremented',
    cart: user.cart,
    cartTotal: user.getCartTotal(),
    cartItemCount: user.getCartItemCount()
  });
});

const decrementCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);

  const cartItem = user.cart.find(
    item => item.product.toString() === productId
  );

  if (!cartItem) {
    res.status(404);
    throw new Error('Product not found in cart');
  }

  if (cartItem.quantity > 1) {
    cartItem.quantity -= 1;
  } else {
    user.cart = user.cart.filter(
      item => item.product.toString() !== productId
    );
  }

  await user.save();

  res.status(200).json({
    message: 'Cart item quantity decremented',
    cart: user.cart,
    cartTotal: user.getCartTotal(),
    cartItemCount: user.getCartItemCount()
  });
});

const clearCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.cart = [];
  await user.save();

  res.status(200).json({
    message: 'Cart cleared successfully',
    cart: user.cart,
    cartTotal: user.getCartTotal(),
    cartItemCount: user.getCartItemCount()
  });
});

const getUsers = asyncHandler(async (req, res) => {
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view users');
  }

  const query = {};
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

  if (req.user.role === 'admin' && (user.role === 'admin' || user.role === 'superadmin')) {
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

  if (
    req.user._id.toString() !== req.params.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'superadmin'
  ) {
    res.status(403);
    throw new Error('Not authorized to view this profile');
  }

  res.json(user);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (
    req.user._id.toString() !== req.params.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'superadmin'
  ) {
    res.status(403);
    throw new Error('Not authorized to update this profile');
  }

  if (req.user.role === 'admin' && (user.role === 'admin' || user.role === 'superadmin')) {
    res.status(403);
    throw new Error('Regular admins cannot update admin or superAdmin accounts');
  }

  if (req.body.role && req.user.role !== 'superadmin') {
    res.status(403);
    throw new Error('Only superAdmin can update user roles');
  }

  if (req.body.role === 'superadmin' && user.role !== 'superadmin') {
    res.status(403);
    throw new Error('Cannot promote users to superAdmin role through this endpoint');
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

  if (Array.isArray(req.body.shippingAddresses)) {
    if (req.body.shippingAddresses.length > 5) {
      res.status(400);
      throw new Error('Maximum of 5 addresses allowed.');
    }
    req.body.shippingAddresses.forEach(addr => {
      if (!addr.address || !addr.city || !addr.postalCode || !addr.country) {
        throw new Error('All address fields (address, city, postalCode, country) are required.');
      }
    });
    user.shippingAddresses = req.body.shippingAddresses;
    user.defaultShippingIndex = req.body.defaultShippingIndex ?? user.shippingAddresses.length - 1;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    phoneNumber: updatedUser.phoneNumber,
    shippingAddresses: updatedUser.shippingAddresses,
  });
});

const getUserAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('shippingAddresses defaultShippingIndex');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (
    req.user._id.toString() !== req.params.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'superadmin'
  ) {
    res.status(403);
    throw new Error('Not authorized to view this user’s addresses');
  }

  res.status(200).json(user.shippingAddresses || []);
});

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password, role, secretKey } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (user.role !== role) {
    return res.status(403).json({
      message: `You don't have ${role} privileges. Your role is ${user.role}.`
    });
  }

  if (role === 'superadmin') {
    const superAdminSecret = process.env.SUPER_ADMIN_SECRET;

    if (!secretKey || secretKey !== superAdminSecret) {
      return res.status(401).json({ message: 'Invalid super admin secret key' });
    }
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
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
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  });
});

const resetPasswordWithOtp = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    res.status(400);
    throw new Error('Please provide email, OTP, and new password');
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!user.otp || user.otp !== otp || user.otpExpiry < Date.now()) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  user.password = newPassword;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  res.status(200).json({ message: 'Password reset successfully' });
});

const promoteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (req.user.role !== 'superadmin') {
    res.status(403);
    throw new Error('Not authorized to promote users');
  }

  const { secretKey, role, businessInfo } = req.body;
  const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'your-secret-key';

  if (secretKey !== ADMIN_SECRET_KEY) {
    res.status(401);
    throw new Error('Invalid secret key');
  }

  if (user.role === role) {
    res.status(400);
    throw new Error(`User is already a ${role}`);
  }

  if (role === 'vendor') {
    const vendorBusinessInfo = businessInfo || {
      businessName: user.name + "'s Business",
      businessDescription: "Default business description",
      contactPhone: "",
      businessAddress: "",
      taxId: ""
    };

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
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to search users');
  }

  const { term, role } = req.query;

  if (!term) {
    res.status(400);
    throw new Error('Search term is required');
  }

  const query = {};
  if (role) {
    query.role = role;
  }

  query.$or = [
    { name: { $regex: term, $options: 'i' } },
    { email: { $regex: term, $options: 'i' } }
  ];

  if (term.match(/^[0-9a-fA-F]{24}$/)) {
    query.$or.push({ _id: term });
  }

  const users = await User.find(query).select('-password');
  res.json(users);
});

const changeUserRole = asyncHandler(async (req, res) => {
  const { role, secretKey } = req.body;
  const userId = req.params.id;

  if (!role) {
    res.status(400);
    throw new Error('Role is required');
  }

  const validRoles = ['user', 'vendor', 'admin', 'superadmin'];
  if (!validRoles.includes(role.toLowerCase())) {
    res.status(400);
    throw new Error('Invalid role');
  }

  if (
    secretKey !== process.env.ADMIN_SECRET_KEY &&
    secretKey !== process.env.SUPER_ADMIN_SECRET
  ) {
    res.status(401);
    throw new Error('Invalid secret key');
  }

  if (role.toLowerCase() === 'superadmin' && req.user.role.toLowerCase() !== 'superadmin') {
    res.status(403);
    throw new Error('Only superadmins can create other superadmins');
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.role = role.toLowerCase();

  if (role.toLowerCase() === 'vendor') {
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
      user.vendorRequest.status = 'approved';
    }
  } else if (user.vendorRequest) {
    user.vendorRequest = undefined;
  }

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

const changeUserPassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (
    req.user._id.toString() !== req.params.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'superadmin'
  ) {
    res.status(403);
    throw new Error('Not authorized to update this profile');
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current and new password');
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ message: 'Password updated successfully' });
});

module.exports = {
  changeUserRole,
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
  adminLogin,
  changeUserPassword,
  resetPasswordWithOtp,
  getUserAddresses,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  incrementCartItem,
  decrementCartItem,
  clearCart
};