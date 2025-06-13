require('dotenv').config(); // Load environment variables from .env file
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Counter = require('../models/counterModel');
const { sendEmail } = require('../utils/sendEmail');
const logger = require('../utils/logger');
// const Activity = require('../models/activityModel'); // You need to have this model

/**
 * @desc    Submit a vendor request
 * @route   POST /api/vendor/request
 * @access  Private (User)
 */
const submitVendorRequest = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    logger.warn(`User not found for ID: ${req.user._id}`);
    res.status(404);
    throw new Error('User not found');
  }

  // Validate existing vendor request using the same logic as getMyVendorRequestStatus
  const isValidVendorRequest = (
    user.vendorRequest &&
    user.vendorRequest.status &&
    user.vendorRequest.businessInfo &&
    user.vendorRequest.businessInfo.businessName &&
    user.vendorRequest.businessInfo.businessDescription &&
    user.vendorRequest.businessInfo.contactPhone &&
    user.vendorRequest.businessInfo.businessAddress
  );

  // Check if user already has a valid pending or approved request
  if (isValidVendorRequest && user.vendorRequest.status === 'pending') {
    logger.warn(`User ${req.user._id} already has a pending vendor request`);
    res.status(400);
    throw new Error('You already have a pending vendor request');
  }

  if (isValidVendorRequest && user.vendorRequest.status === 'approved' || user.role === 'vendor') {
    logger.warn(`User ${req.user._id} is already a vendor`);
    res.status(400);
    throw new Error('You are already a vendor');
  }

  // Validate business information
  const { businessName, businessDescription, contactPhone, businessAddress, taxId } = req.body;

  if (!businessName || !businessDescription || !contactPhone || !businessAddress) {
    logger.warn(`Missing required business information for user ${req.user._id}`);
    res.status(400);
    throw new Error('Please provide all required business information (business name, description, contact phone, and address)');
  }

  // Increment the vendor request counter atomically
  const counter = await Counter.findOneAndUpdate(
    { _id: 'vendorRequestCounter' },
    { $inc: { vendorRequestCounter: 1 } },
    { upsert: true, new: true }
  );
  const requestNumber = counter.vendorRequestCounter;

  // Update user with vendor request
  user.vendorRequest = {
    status: 'pending',
    requestDate: new Date(),
    requestNumber,
    businessInfo: {
      businessName,
      businessDescription,
      contactPhone,
      businessAddress,
      taxId: taxId || ''
    }
  };

  await user.save();

  // Use user's phoneNumber if available, otherwise fall back to businessInfo.contactPhone
  const userContactNumber = user.phoneNumber || contactPhone || 'Not provided';

  // Send confirmation email to the user
  try {
    await sendEmail({
      email: user.email,
      subject: 'Vendor Request Submission Confirmation',
      text: `
        Dear ${user.name},

        Thank you for submitting your vendor request on ${new Date().toLocaleString()}.
        Your request is now under review, and you will be updated on its status within 1-3 business days.

        Request Details:
        - Request Number: ${requestNumber}
        - User ID: ${user._id}
        - Contact Number: ${userContactNumber}
        - Business Name: ${businessName}

        We appreciate your patience while we process your request.

        Best regards,
        The Vendor Team
      `,
      from: `Vendor Support <${process.env.SMTP_MAIL}>` // Use environment variable for sender email
    });
    logger.info(`Confirmation email sent to ${user.email} for vendor request #${requestNumber}`);
  } catch (error) {
    logger.error(`Failed to send confirmation email for user ${user._id}: ${error.message}`);
    // Continue execution even if email fails
  }

  // Notify superadmins about the new vendor request
  try {
    const superadmins = await User.find({ role: 'superadmin' });
    
    for (const admin of superadmins) {
      await sendEmail({
        email: admin.email,
        subject: 'New Vendor Request',
        text: `
          A new vendor request has been submitted on ${new Date().toLocaleString()}:
          
          User: ${user.name} (${user.email})
          Business Name: ${businessName}
          Business Description: ${businessDescription}
          Contact Phone: ${contactPhone}
          Business Address: ${businessAddress}
          Tax ID: ${taxId || 'Not provided'}
          
          Please review this request in the admin dashboard.
        `,
        from: `Vendor Support <${process.env.SMTP_MAIL}>` // Use environment variable for sender email
      });
    }
    logger.info(`Vendor request notification sent to ${superadmins.length} superadmins for user ${user._id}`);
  } catch (error) {
    logger.error(`Failed to send vendor request notification for user ${user._id}: ${error.message}`);
    // Continue execution even if email fails
  }

  res.status(201).json({
    message: 'Vendor request submitted successfully',
    vendorRequest: user.vendorRequest
  });
});

/**
 * @desc    Get all vendor requests (only genuine requests)
 * @route   GET /api/vendor/requests
 * @access  Private (Admin, Superadmin)
 */
const getVendorRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
  // Validate status query parameter
  const validStatuses = ['pending', 'approved', 'rejected'];
  if (status && !validStatuses.includes(status)) {
    logger.warn(`Invalid status filter: ${status} used by user ${req.user._id}`);
    res.status(400);
    throw new Error(`Invalid status filter. Must be one of: ${validStatuses.join(', ')}`);
  }

  const filter = {
    'vendorRequest.status': status || 'pending' // Default to pending if no status provided
  };

  logger.info(`Fetching vendor requests with filter: ${JSON.stringify(filter)} by user ${req.user._id}`);
  const requests = await User.find(filter).select('name email vendorRequest createdAt');
  logger.info(`Found ${requests.length} vendor requests for user ${req.user._id}`);

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
    logger.warn(`User not found for ID: ${req.params.id} by requester ${req.user._id}`);
    res.status(404);
    throw new Error('User not found');
  }

  if (!user.vendorRequest) {
    logger.warn(`No vendor request found for user ${req.params.id} by requester ${req.user._id}`);
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
 * @access  Private (Admin, Superadmin)
 */
const processVendorRequest = asyncHandler(async (req, res) => {
  const { action, rejectionReason } = req.body;
  
  // Validate action
  const validActions = ['approve', 'reject'];
  if (!validActions.includes(action)) {
    logger.warn(`Invalid action "${action}" for user ${req.params.id} by requester ${req.user._id}`);
    res.status(400);
    throw new Error(`Invalid action. Must be one of: ${validActions.join(', ')}`);
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    logger.warn(`User not found for ID: ${req.params.id} by requester ${req.user._id}`);
    res.status(404);
    throw new Error('User not found');
  }

  if (!user.vendorRequest) {
    logger.warn(`No vendor request found for user ${req.params.id} by requester ${req.user._id}`);
    res.status(404);
    throw new Error('No vendor request found for this user');
  }

  if (user.vendorRequest.status !== 'pending') {
    logger.warn(`Vendor request for user ${req.params.id} is not pending (status: ${user.vendorRequest.status}) by requester ${req.user._id}`);
    res.status(400);
    throw new Error(`Vendor request is already ${user.vendorRequest.status}. Only pending requests can be processed.`);
  }

  // Extract request number and contact number for email
  const requestNumber = user.vendorRequest.requestNumber || 'N/A';
  // Use user's phoneNumber if available, otherwise fall back to businessInfo.contactPhone
  const userContactNumber = user.phoneNumber || user.vendorRequest.businessInfo.contactPhone || 'Not provided';

  if (action === 'approve') {
    user.role = 'vendor';
    user.vendorRequest.status = 'approved';
    user.vendorRequest.approvalDate = new Date();
    
    // Send approval email with required details
    try {
      await sendEmail({
        email: user.email,
        subject: 'Vendor Request Approved',
        text: `
          Dear ${user.name},

          Congratulations! Your vendor request has been approved on ${new Date().toLocaleString()}.

          Request Details:
          - Request Number: ${requestNumber}
          - User ID: ${user._id}
          - Contact Number: ${userContactNumber}

          You now have access to vendor features and can log in to your account to access the vendor dashboard.

          Thank you for joining our marketplace!

          Best regards,
          The Vendor Team
        `,
        from: `Vendor Support <${process.env.SMTP_MAIL}>` // Use environment variable for sender email
      });
      logger.info(`Approval email sent to ${user.email} for user ${user._id}`);
    } catch (error) {
      logger.error(`Failed to send vendor approval email for user ${user._id}: ${error.message}`);
      // Continue execution even if email fails
    }
  } else {
    // Reject
    if (!rejectionReason) {
      logger.warn(`Rejection reason missing for user ${req.params.id} by requester ${req.user._id}`);
      res.status(400);
      throw new Error('Please provide a reason for rejection');
    }
    
    // Store rejection details temporarily before clearing
    const rejectionDetails = {
      status: 'rejected',
      requestNumber,
      rejectionReason,
      rejectionDate: new Date()
    };
    
    // Send rejection email with required details
    try {
      await sendEmail({
        email: user.email,
        subject: 'Vendor Request Rejected',
        text: `
          Dear ${user.name},

          We have reviewed your vendor request and unfortunately, we cannot approve it at this time.

          Request Details:
          - Request Number: ${requestNumber}
          - User ID: ${user._id}
          - Contact Number: ${userContactNumber}

          Reason for Rejection: ${rejectionReason}
          Rejected on: ${new Date().toLocaleString()}

          You may submit a new request after addressing the issues mentioned above.

          Thank you for your interest in our platform.

          Best regards,
          The Vendor Team
        `,
        from: `Vendor Support <${process.env.SMTP_MAIL}>` // Use environment variable for sender email
      });
      logger.info(`Rejection email sent to ${user.email} for user ${user._id}`);
    } catch (error) {
      logger.error(`Failed to send vendor rejection email for user ${user._id}: ${error.message}`);
      // Continue execution even if email fails
    }

    // Clear the vendorRequest field to allow a new submission
    user.vendorRequest = undefined;
  }

  await user.save();

  logger.info(`Vendor request for user ${user._id} ${action}ed by requester ${req.user._id}`);
  res.status(200).json({
    message: `Vendor request ${action}ed successfully`,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendorRequest: user.vendorRequest || rejectionDetails // Return rejection details if applicable
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
    logger.warn(`User not found for ID: ${req.user._id}`);
    res.status(404);
    throw new Error('User not found');
  }

  // Validate vendorRequest structure
  const isValidVendorRequest = (
    user.vendorRequest &&
    user.vendorRequest.status &&
    user.vendorRequest.businessInfo &&
    user.vendorRequest.businessInfo.businessName &&
    user.vendorRequest.businessInfo.businessDescription &&
    user.vendorRequest.businessInfo.contactPhone &&
    user.vendorRequest.businessInfo.businessAddress
  );

  if (!isValidVendorRequest) {
    logger.warn(`No valid vendor request found for user ${req.user._id}`);
    res.status(404);
    throw new Error('No valid vendor request found');
  }

  res.status(200).json({
    vendorRequest: user.vendorRequest,
    isVendor: user.role === 'vendor'
  });
});

const getMyVendorActivities = asyncHandler(async (req, res) => {
  const activities = await Activity.find({ vendor: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);

  res.json(activities);
});

module.exports = {
  submitVendorRequest,
  getVendorRequests,
  getVendorRequestDetails,
  processVendorRequest,
  getMyVendorRequestStatus,
  getMyVendorActivities,
};