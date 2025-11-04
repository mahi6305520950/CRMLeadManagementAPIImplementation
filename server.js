const express = require('express');
const dotenv = require('dotenv');
const { syncDatabase } = require('./models');

// Load environment variables
dotenv.config();

// Import routes
const employeeRoutes = require('./routes/employeeRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// CORS middleware (enable in production with specific origins)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/enquiries', enquiryRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CRM API Server is running successfully 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to CRM Backend API',
    endpoints: {
      public: {
        'POST /api/employees/register': 'Register new counselor',
        'POST /api/employees/login': 'Login counselor',
        'POST /api/enquiries/public': 'Submit new enquiry (No auth required)'
      },
      protected: {
        'GET /api/employees/profile': 'Get counselor profile',
        'GET /api/enquiries/public': 'Get unclaimed enquiries',
        'GET /api/enquiries/private': 'Get counselor\'s claimed enquiries',
        'PATCH /api/enquiries/:id/claim': 'Claim an enquiry'
      },
      health: {
        'GET /api/health': 'Server health check'
      }
    }
  });
});

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 Global error handler:', error);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Start server function
const startServer = async () => {
  try {
    // Sync database
    await syncDatabase();
    
    // Start listening
    app.listen(PORT, () => {
      console.log('\n✨ ========================================');
      console.log('🚀 CRM Backend Server Started Successfully!');
      console.log('✨ ========================================');
      console.log(`📍 Server URL: http://localhost:${PORT}`);
      console.log(`📊 Database: SQLite (${process.env.DB_STORAGE})`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
      console.log('✨ ========================================\n');
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔻 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔻 Server terminated');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;