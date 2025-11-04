const express = require('express');
const {
  createPublicEnquiry,
  getPublicEnquiries,
  getPrivateEnquiries,
  claimEnquiry
} = require('../controllers/enquiryController');
const authenticate = require('../middlewares/auth');

const router = express.Router();

// Public route - no authentication required for submitting enquiries
router.post('/public', createPublicEnquiry);

// Protected routes - require authentication
router.get('/public', authenticate, getPublicEnquiries);
router.get('/private', authenticate, getPrivateEnquiries);
router.patch('/:id/claim', authenticate, claimEnquiry);

module.exports = router;