const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const { sendEmail } = require('../utils/sendEmail');
const logger = require('../utils/logger');

/**
 * @desc    Submit a vendor request
 * @route   POST /api/vendor/request
 * @access  Private (User)
 */
const submitVendorRequest = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if user already has a pending or approved request
  if (user.vendorRequest.status === 'pending') {
    res.status(400);
    throw new Error('You already have a pending vendor request');
  }

  if (user.vendorRequest.status === 'approved' || user.role === 'vendor') {
    res.status(400);
    throw new Error('You are already a vendor');
  }

  // Validate business information
  const { businessName, businessDescription, contactPhone, businessAddress, taxId } = req.body;

  if (!businessName || !businessDescription || !contactPhone || !businessAddress) {
    res.status(400);
    throw new Error('Please provide all required business information');
  }

  // Update user with vendor request
  user.vendorRequest = {
    status: 'pending',
    requestDate: new Date(),
    businessInfo: {
      businessName,
      businessDescription,
      contactPhone,
      businessAddress,
      taxId: taxId || ''
    }
  };

  await user.save();

  // Notify superadmins about the new vendor request
  try {
    const superadmins = await User.find({ role: 'superadmin' });
    
    for (const admin of superadmins) {
      await sendEmail({
        email: admin.email,
        subject: 'New Vendor Request',
        text: `
          A new vendor request has been submitted:
          
          User: ${user.name} (${user.email})
          Business Name: ${businessName}
          Business Description: ${businessDescription}
          
          Please review this request in the admin dashboard.
        `
      });
    }
  } catch (error) {
    logger.error(`Failed to send vendor request notification: ${error.message}`);
    // Continue execution even if email fails
  }

  res.status(201).json({
    message: 'Vendor request submitted successfully',
    vendorRequest: user.vendorRequest
  });
});

/**
 * @desc    Get all vendor requests
 * @route   GET /api/vendor/requests
 * @access  Private (Admin, Superadmin)
 */
const getVendorRequests = asyncHandler(async (req, res) => {
  const status = req.query.status || 'pending'; // Default to pending requests
  
  const requests = await User.find({
    'vendorRequest.status': status
  }).select('name email vendorRequest createdAt');

  res.status(200).json(requests);
});

/**
 * @desc    Get vendor request details
 * @route   GET /api/vendor/requests/:id
 * @access  Private (Admin, Superadmin)
 */
const getVendorRequestDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.vendorRequest.status === 'none') {
    res.status(404);
    throw new Error('No vendor request found for this user');
  }

  res.status(200).json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    },
    vendorRequest: user.vendorRequest
  });
});

/**
 * @desc    Approve or reject vendor request
 * @route   PUT /api/vendor/requests/:id
 * @access  Private (Superadmin only)
 */
const processVendorRequest = asyncHandler(async (req, res) => {
  const { action, rejectionReason } = req.body;
  
  if (!['approve', 'reject'].includes(action)) {
    res.status(400);
    throw new Error('Invalid action. Must be either "approve" or "reject"');
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.vendorRequest.status !== 'pending') {
    res.status(400);
    throw new Error('This request is not in pending status');
  }

  if (action === 'approve') {
    user.role = 'vendor';
    user.vendorRequest.status = 'approved';
    user.vendorRequest.approvalDate = new Date();
    
    // Send approval email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Vendor Request Approved',
        text: `
          Congratulations ${user.name}!
          
          Your request to become a vendor has been approved. You now have access to vendor features.
          
          You can now log in to your account and access the vendor dashboard.
          
          Thank you for joining our marketplace!
        `
      });
    } catch (error) {
      logger.error(`Failed to send vendor approval email: ${error.message}`);
      // Continue execution even if email fails
    }
  } else {
    // Reject
    if (!rejectionReason) {
      res.status(400);
      throw new Error('Please provide a reason for rejection');
    }
    
    user.vendorRequest.status = 'rejected';
    user.vendorRequest.rejectionReason = rejectionReason;
    
    // Send rejection email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Vendor Request Status',
        text: `
          Dear ${user.name},
          
          We have reviewed your vendor application and unfortunately, we cannot approve it at this time.
          
          Reason: ${rejectionReason}
          
          You may submit a new request after addressing the issues mentioned above.
          
          Thank you for your interest in our platform.
        `
      });
    } catch (error) {
      logger.error(`Failed to send vendor rejection email: ${error.message}`);
      // Continue execution even if email fails
    }
  }

  await user.save();

  res.status(200).json({
    message: `Vendor request ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendorRequest: user.vendorRequest
    }
  });
});

/**
 * @desc    Get current user's vendor request status
 * @route   GET /api/vendor/my-request
 * @access  Private
 */
const getMyVendorRequestStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    vendorRequest: user.vendorRequest,
    isVendor: user.role === 'vendor'
  });
});

module.exports = {
  submitVendorRequest,
  getVendorRequests,
  getVendorRequestDetails,
  processVendorRequest,
  getMyVendorRequestStatus
};