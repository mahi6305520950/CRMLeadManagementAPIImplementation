const { Enquiry, Employee } = require('../models');

// @desc    Create new public enquiry (no authentication required)
// @route   POST /api/enquiries/public
// @access  Public
const createPublicEnquiry = async (req, res) => {
  try {
    const { name, email, courseInterest } = req.body;

    // Validation
    if (!name || !email || !courseInterest) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and course interest',
        field: !name ? 'name' : !email ? 'email' : 'courseInterest'
      });
    }

    // Create enquiry
    const enquiry = await Enquiry.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      courseInterest: courseInterest.trim(),
      claimed: false,
      counselorId: null
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      data: {
        enquiry: {
          id: enquiry.id,
          name: enquiry.name,
          email: enquiry.email,
          courseInterest: enquiry.courseInterest,
          createdAt: enquiry.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Create enquiry error:', error);

    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating enquiry'
    });
  }
};

// @desc    Get all unclaimed leads (Public Enquiries)
// @route   GET /api/enquiries/public
// @access  Private
const getPublicEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.findAll({
      where: {
        claimed: false,
        counselorId: null
      },
      attributes: ['id', 'name', 'email', 'courseInterest', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      message: 'Public enquiries retrieved successfully',
      data: {
        enquiries,
        count: enquiries.length
      }
    });

  } catch (error) {
    console.error('Get public enquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching public enquiries'
    });
  }
};

// @desc    Get leads claimed by logged in user (Private Enquiries)
// @route   GET /api/enquiries/private
// @access  Private
const getPrivateEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.findAll({
      where: {
        counselorId: req.employee.id
      },
      include: [{
        model: Employee,
        as: 'counselor',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      message: 'Private enquiries retrieved successfully',
      data: {
        enquiries,
        count: enquiries.length
      }
    });

  } catch (error) {
    console.error('Get private enquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching private enquiries'
    });
  }
};

// @desc    Claim a lead
// @route   PATCH /api/enquiries/:id/claim
// @access  Private
const claimEnquiry = async (req, res) => {
  try {
    const enquiryId = parseInt(req.params.id);
    const counselorId = req.employee.id;

    // Validate enquiry ID
    if (isNaN(enquiryId) || enquiryId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enquiry ID'
      });
    }

    // Find the enquiry
    const enquiry = await Enquiry.findByPk(enquiryId);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    // Check if enquiry is already claimed
    if (enquiry.claimed) {
      return res.status(409).json({
        success: false,
        message: 'Enquiry is already claimed by another counselor'
      });
    }

    // Claim the enquiry
    await enquiry.update({
      claimed: true,
      counselorId: counselorId
    });

    // Fetch the updated enquiry with counselor details
    const updatedEnquiry = await Enquiry.findByPk(enquiryId, {
      include: [{
        model: Employee,
        as: 'counselor',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.json({
      success: true,
      message: 'Enquiry claimed successfully',
      data: {
        enquiry: updatedEnquiry
      }
    });

  } catch (error) {
    console.error('Claim enquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while claiming enquiry'
    });
  }
};

module.exports = {
  createPublicEnquiry,
  getPublicEnquiries,
  getPrivateEnquiries,
  claimEnquiry
};