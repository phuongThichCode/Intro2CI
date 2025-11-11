const express = require('express');

const app = express();

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Status endpoint with environment information
app.get('/status', (req, res) => {
  res.status(200).json({
    service: 'Intro2CI API',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    stage: process.env.STAGE || 'dev',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Intro2CI API',
    endpoints: {
      health: '/health',
      status: '/status'
    }
  });
});

module.exports = app;

// Test pipeline
// Test pipeline
// Test pipeline
