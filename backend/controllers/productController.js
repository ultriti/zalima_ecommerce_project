const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const User = require('../models/userModel');

// @desc    Fetch all products with optional filters
// @route   GET /api/products?category=<category>&featured=<true/false>&limit=<number>&vendor=<vendorId>
// @access  Public
const getProducts = asyncHandler(async (req, res) => {  // Only allow admin/superadmin to use this endpoint for all products
  if (!req.user || !['admin', 'superadmin'].includes(req.user.role)) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const {
    status,
    page = 1,
    limit = 10,
    category,
    vendor,
    brand,
    minPrice,
    maxPrice,
    gender,
    size,
    color,
  } = req.query;

  const query = {};

  if (status && status !== 'all') query.status = status;
  if (category) query.category = category;
  if (vendor) query.vendor = vendor;
  if (brand) query.brand = new RegExp(brand, 'i');
  if (gender) query.gender = gender;

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }
  if (size) query['sizes.size'] = size;
  if (color) query['colors.color'] = new RegExp(color, 'i');

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const totalProducts = await Product.countDocuments(query);
  const totalPages = Math.ceil(totalProducts / limit);

  const products = await Product.find(query)
    .populate('vendor', 'email vendorRequest.businessInfo.businessName vendorRequest.businessInfo.contactPhone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    products,
    totalPages,
    totalProducts,
  });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('vendor', 'name email vendorRequest.businessInfo.businessName vendorRequest.businessInfo.contactPhone')
    .populate('reviews.user', 'name');
  
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { 
    name, price, description, image, images, brand, category, subcategory,
    countInStock, sizes, colors, material, careInstructions, fit, season,
    gender, ageGroup, tags, originalPrice, discount
  } = req.body;

  const product = new Product({
    name,
    price,
    originalPrice,
    user: req.user._id,
    image,
    images: images || [image],
    brand,
    category,
    subcategory,
    countInStock,
    numReviews: 0,
    description,
    sizes: sizes || [],
    colors: colors || [],
    material,
    careInstructions,
    fit,
    season,
    gender,
    ageGroup,
    tags: tags || [],
    discount: discount || 0,
    featured: false,
    status: 'active'
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Create a product by vendor
// @route   POST /api/products/vendor/my-products
// @access  Private/Vendor
const createVendorProduct = asyncHandler(async (req, res) => {
  const { 
    name, price, description, image, images, brand, category, subcategory,
    countInStock, sizes, colors, material, careInstructions, fit, season,
    gender, ageGroup, tags, originalPrice, discount
  } = req.body;

  if (req.user.role !== 'vendor') {
    res.status(403);
    throw new Error('Only vendors can create products through this route');
  }

  const product = new Product({
    name,
    price,
    originalPrice,
    user: req.user._id,
    vendor: req.user._id,
    image,
    images: images || [image],
    brand,
    category,
    subcategory,
    countInStock,
    numReviews: 0,
    description,
    sizes: sizes || [],
    colors: colors || [],
    material,
    careInstructions,
    fit,
    season,
    gender,
    ageGroup,
    tags: tags || [],
    discount: discount || 0,
    featured: false,
    status: 'pending-approval',
    vendorApproved: false
  });

  const createdProduct = await product.save();
  
  await createdProduct.populate('vendor', 'name vendorRequest.businessInfo.businessName');
  
  res.status(201).json({
    message: 'Product submitted for approval',
    product: createdProduct
  });
});

// @desc    Get vendor's products
// @route   GET /api/products/vendor/my-products
// @access  Private/Vendor
const getVendorProducts = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 5 } = req.query;
  const query = { vendor: req.user._id };

  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const totalProducts = await Product.countDocuments(query);
  const totalPages = Math.ceil(totalProducts / limit);

  const products = await Product.find(query)
    .populate('vendor', 'name vendorRequest.businessInfo.businessName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    products,
    totalPages,
    totalProducts,
  });
});

// @desc    Update vendor's product
// @route   PUT /api/products/vendor/my-products/:id
// @access  Private/Vendor
const updateVendorProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.vendor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this product');
  }

  const { 
    name, price, description, image, images, brand, category, subcategory,
    countInStock, sizes, colors, material, careInstructions, fit, season,
    gender, ageGroup, tags, originalPrice, discount
  } = req.body;

  product.name = name || product.name;
  product.price = price !== undefined ? price : product.price;
  product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
  product.description = description || product.description;
  product.image = image || product.image;
  product.images = images || product.images;
  product.brand = brand || product.brand;
  product.category = category || product.category;
  product.subcategory = subcategory || product.subcategory;
  product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
  product.sizes = sizes || product.sizes;
  product.colors = colors || product.colors;
  product.material = material || product.material;
  product.careInstructions = careInstructions || product.careInstructions;
  product.fit = fit || product.fit;
  product.season = season || product.season;
  product.gender = gender || product.gender;
  product.ageGroup = ageGroup || product.ageGroup;
  product.tags = tags || product.tags;
  product.discount = discount !== undefined ? discount : product.discount;

  if (product.status === 'rejected') {
    product.status = 'pending-approval';
    product.vendorApproved = false;
  }

  const updatedProduct = await product.save();
  await updatedProduct.populate('vendor', 'name vendorRequest.businessInfo.businessName');
  
  res.json(updatedProduct);
});

// @desc    Delete vendor's product
// @route   DELETE /api/products/vendor/my-products/:id
// @access  Private/Vendor
const deleteVendorProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.vendor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this product');
  }

  await Product.deleteOne({ _id: req.params.id });
  res.json({ message: 'Product removed successfully' });
});

// @desc    Update a product (Admin/Vendor)
// @route   PUT /api/products/:id
// @access  Private/Admin or Owner Vendor
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
  const isOwnerVendor = product.vendor && product.vendor.toString() === req.user._id.toString();

  if (!isAdmin && !isOwnerVendor) {
    res.status(403);
    throw new Error('Not authorized to update this product');
  }

  const { 
    name, price, description, image, images, brand, category, subcategory,
    countInStock, sizes, colors, material, careInstructions, fit, season,
    gender, ageGroup, tags, originalPrice, discount, featured, status, vendorApproved
  } = req.body;

  product.name = name || product.name;
  product.price = price !== undefined ? price : product.price;
  product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
  product.description = description || product.description;
  product.image = image || product.image;
  product.images = images || product.images;
  product.brand = brand || product.brand;
  product.category = category || product.category;
  product.subcategory = subcategory || product.subcategory;
  product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
  product.sizes = sizes || product.sizes;
  product.colors = colors || product.colors;
  product.material = material || product.material;
  product.careInstructions = careInstructions || product.careInstructions;
  product.fit = fit || product.fit;
  product.season = season || product.season;
  product.gender = gender || product.gender;
  product.ageGroup = ageGroup || product.ageGroup;
  product.tags = tags || product.tags;
  product.discount = discount !== undefined ? discount : product.discount;

  if (isAdmin) {
    product.featured = typeof featured === 'boolean' ? featured : product.featured;
    product.status = status || product.status;
    
    if (typeof vendorApproved === 'boolean') {
      product.vendorApproved = vendorApproved;
      if (vendorApproved) {
        product.approvedBy = req.user._id;
        product.approvalDate = new Date();
        product.status = 'active';
      }
    }
  }

  const updatedProduct = await product.save();
  await updatedProduct.populate('vendor', 'name vendorRequest.businessInfo.businessName');
  
  res.json(updatedProduct);
});

// @desc    Delete a product (Admin/Vendor)
// @route   DELETE /api/products/:id
// @access  Private/Admin or Owner Vendor
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
  const isOwnerVendor = product.vendor && product.vendor.toString() === req.user._id.toString();

  if (!isAdmin && !isOwnerVendor) {
    res.status(403);
    throw new Error('Not authorized to delete this product');
  }

  await Product.deleteOne({ _id: req.params.id });
  res.json({ message: 'Product removed' });
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = asyncHandler(async (req, res) => {
  const { query, category, gender, minPrice, maxPrice, brand } = req.query;
  
  const searchQuery = { status: 'active' };

  if (query) {
    searchQuery.$or = [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { brand: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ];
  }

  if (category) searchQuery.category = category;
  if (gender) searchQuery.gender = gender;
  if (brand) searchQuery.brand = new RegExp(brand, 'i');
  
  if (minPrice || maxPrice) {
    searchQuery.price = {};
    if (minPrice) searchQuery.price.$gte = parseFloat(minPrice);
    if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice);
  }

  const products = await Product.find(searchQuery)
    .populate('vendor', 'name vendorRequest.businessInfo.businessName')
    .sort({ createdAt: -1 });
    
  res.json(products);
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get pending products for admin approval
// @route   GET /api/products/pending
// @access  Private/Admin
const getPendingProducts = asyncHandler(async (req, res) => {
  const { page = 1, status = 'pending-approval' } = req.query;
  const limit = 10; // Number of products per page
  const skip = (parseInt(page) - 1) * limit;

  const query = { status };

  const totalProducts = await Product.countDocuments(query);
  const totalPages = Math.ceil(totalProducts / limit);

  const products = await Product.find(query)
    .populate('vendor', 'name vendorRequest.businessInfo.businessName vendorRequest.businessInfo.contactPhone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    products,
    totalPages,
  });
});

// @desc    Get a single vendor's product
// @route   GET /api/products/vendor/my-products/:id
// @access  Private/Vendor
const getVendorProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('vendor', 'name vendorRequest.businessInfo.businessName');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const vendorId = product.vendor._id ? product.vendor._id.toString() : product.vendor.toString();
  if (vendorId !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this product');
  }
  res.json(product);
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  createProductReview,
  createVendorProduct,
  getVendorProducts,
  updateVendorProduct,
  deleteVendorProduct,
  getPendingProducts,
  getVendorProductById
};