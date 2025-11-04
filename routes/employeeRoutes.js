const express = require('express');
const {
  registerEmployee,
  loginEmployee,
  getEmployeeProfile
} = require('../controllers/employeeController');
const authenticate = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.post('/register', registerEmployee);
router.post('/login', loginEmployee);

// Protected routes
router.get('/profile', authenticate, getEmployeeProfile);

module.exports = router;