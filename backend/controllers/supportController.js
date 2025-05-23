const asyncHandler = require('express-async-handler');
const SupportRequest = require('../models/supportRequestModel');
const User = require('../models/userModel');
const { sendEmail } = require('../utils/sendEmail');
const logger = require('../utils/logger');

/**
 * @desc    Create a new support request
 * @route   POST /api/support
 * @access  Private
 */
const createSupportRequest = asyncHandler(async (req, res) => {
  const { type, subject, message } = req.body;

  if (!type || !subject || !message) {
    res.status(400);
    throw new Error('Please provide type, subject and message');
  }

  // For vendor requests, check if user already has a pending request
  if (type === 'vendor_request') {
    const user = await User.findById(req.user._id);
    
    if (user.vendorRequest && user.vendorRequest.status === 'pending') {
      res.status(400);
      throw new Error('You already have a pending vendor request');
    }
    
    if (user.role === 'vendor') {
      res.status(400);
      throw new Error('You are already a vendor');
    }
  }

  const supportRequest = await SupportRequest.create({
    user: req.user._id,
    type,
    subject,
    message,
    status: 'open',
    priority: type === 'vendor_request' ? 'medium' : 'low',
  });

  // Notify admins about new support request
  try {
    const admins = await User.find({ 
      role: { $in: ['admin', 'superadmin'] } 
    });
    
    for (const admin of admins) {
      await sendEmail({
        email: admin.email,
        subject: `New Support Request: ${subject}`,
        text: `
          A new support request has been submitted:
          
          Type: ${type}
          Subject: ${subject}
          From: ${req.user.name} (${req.user.email})
          
          Message:
          ${message}
          
          Please review this request in the admin dashboard.
        `
      });
    }
  } catch (error) {
    logger.error(`Failed to send support request notification: ${error.message}`);
    // Continue execution even if email fails
  }

  res.status(201).json({
    message: 'Support request submitted successfully',
    supportRequest
  });
});

/**
 * @desc    Get all support requests (admin only)
 * @route   GET /api/support
 * @access  Private (Admin)
 */
const getSupportRequests = asyncHandler(async (req, res) => {
  const { status, type, priority } = req.query;
  
  const filter = {};
  
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (priority) filter.priority = priority;
  
  const supportRequests = await SupportRequest.find(filter)
    .populate('user', 'name email')
    .populate('assignedTo', 'name email')
    .populate('resolution.resolvedBy', 'name email')
    .sort({ createdAt: -1 });
  
  res.status(200).json(supportRequests);
});

/**
 * @desc    Get user's support requests
 * @route   GET /api/support/my-requests
 * @access  Private
 */
const getMyRequests = asyncHandler(async (req, res) => {
  const supportRequests = await SupportRequest.find({ user: req.user._id })
    .sort({ createdAt: -1 });
  
  res.status(200).json(supportRequests);
});

/**
 * @desc    Get support request by ID
 * @route   GET /api/support/:id
 * @access  Private
 */
const getSupportRequestById = asyncHandler(async (req, res) => {
  const supportRequest = await SupportRequest.findById(req.params.id)
    .populate('user', 'name email')
    .populate('assignedTo', 'name email')
    .populate('resolution.resolvedBy', 'name email');
  
  if (!supportRequest) {
    res.status(404);
    throw new Error('Support request not found');
  }
  
  // Check if the request belongs to the user or if user is admin
  if (
    supportRequest.user._id.toString() !== req.user._id.toString() && 
    !['admin', 'superadmin'].includes(req.user.role)
  ) {
    res.status(403);
    throw new Error('Not authorized to access this support request');
  }
  
  res.status(200).json(supportRequest);
});

/**
 * @desc    Update support request (admin only)
 * @route   PUT /api/support/:id
 * @access  Private (Admin)
 */
const updateSupportRequest = asyncHandler(async (req, res) => {
  const { status, priority, assignedTo, resolution } = req.body;
  
  const supportRequest = await SupportRequest.findById(req.params.id);
  
  if (!supportRequest) {
    res.status(404);
    throw new Error('Support request not found');
  }
  
  // Update fields if provided
  if (status) supportRequest.status = status;
  if (priority) supportRequest.priority = priority;
  if (assignedTo) supportRequest.assignedTo = assignedTo;
  
  // Handle resolution
  if (resolution && resolution.message) {
    supportRequest.resolution = {
      message: resolution.message,
      resolvedAt: new Date(),
      resolvedBy: req.user._id
    };
    
    // If providing resolution, also set status to resolved
    supportRequest.status = 'resolved';
    
    // If this is a vendor request and it's being resolved, initiate the vendor request process
    if (supportRequest.type === 'vendor_request' && supportRequest.status === 'resolved') {
      const user = await User.findById(supportRequest.user);
      
      if (user) {
        // Set initial vendor request status
        user.vendorRequest = {
          status: 'pending',
          requestDate: new Date(),
          businessInfo: {
            businessName: user.name, // Default to user name
            businessDescription: supportRequest.message, // Use support request message as initial description
            contactPhone: '',
            businessAddress: '',
            taxId: ''
          }
        };
        
        await user.save();
        
        // Notify user to complete their vendor profile
        try {
          await sendEmail({
            email: user.email,
            subject: 'Complete Your Vendor Profile',
            text: `
              Dear ${user.name},
              
              Your vendor request has been initially approved. To complete the process,
              please log in to your account and complete your vendor profile with all
              required business information.
              
              Thank you for your interest in becoming a vendor on our platform.
            `
          });
        } catch (error) {
          logger.error(`Failed to send vendor profile completion email: ${error.message}`);
        }
      }
    }
  }
  
  await supportRequest.save();
  
  // Notify user about the update
  try {
    const user = await User.findById(supportRequest.user);
    
    if (user) {
      await sendEmail({
        email: user.email,
        subject: `Support Request Update: ${supportRequest.subject}`,
        text: `
          Dear ${user.name},
          
          Your support request "${supportRequest.subject}" has been updated:
          
          Status: ${supportRequest.status}
          ${supportRequest.resolution && supportRequest.resolution.message ? 
            `\nResolution: ${supportRequest.resolution.message}` : ''}
          
          You can check the details in your account.
          
          Thank you for your patience.
        `
      });
    }
  } catch (error) {
    logger.error(`Failed to send support request update email: ${error.message}`);
  }
  
  res.status(200).json({
    message: 'Support request updated successfully',
    supportRequest
  });
});

module.exports = {
  createSupportRequest,
  getSupportRequests,
  getMyRequests,
  getSupportRequestById,
  updateSupportRequest
};