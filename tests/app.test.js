const request = require('supertest');
const app = require('../src/app');

describe('API Endpoints', () => {
  describe('GET /', () => {
    it('should return welcome message and available endpoints', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('health');
      expect(response.body.endpoints).toHaveProperty('status');
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return a valid timestamp', async () => {
      const response = await request(app).get('/health');
      const timestamp = new Date(response.body.timestamp);
      
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });
  });

  describe('GET /status', () => {
    it('should return service status information', async () => {
      const response = await request(app).get('/status');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('service', 'Intro2CI API');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('stage');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return numeric uptime', async () => {
      const response = await request(app).get('/status');
      
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should use environment variables when set', async () => {
      // Set environment variables
      const originalEnv = process.env.NODE_ENV;
      const originalStage = process.env.STAGE;
      const originalVersion = process.env.npm_package_version;
      
      process.env.NODE_ENV = 'production';
      process.env.STAGE = 'production';
      process.env.npm_package_version = '2.0.0';
      
      const response = await request(app).get('/status');
      
      expect(response.status).toBe(200);
      expect(response.body.environment).toBe('production');
      expect(response.body.stage).toBe('production');
      expect(response.body.version).toBe('2.0.0');
      
      // Restore original environment variables
      process.env.NODE_ENV = originalEnv;
      process.env.STAGE = originalStage;
      process.env.npm_package_version = originalVersion;
    });

    it('should use default values when environment variables are not set', async () => {
      // Temporarily remove environment variables
      const originalEnv = process.env.NODE_ENV;
      const originalStage = process.env.STAGE;
      const originalVersion = process.env.npm_package_version;
      
      delete process.env.NODE_ENV;
      delete process.env.STAGE;
      delete process.env.npm_package_version;
      
      const response = await request(app).get('/status');
      
      expect(response.status).toBe(200);
      expect(response.body.environment).toBe('development');
      expect(response.body.stage).toBe('dev');
      expect(response.body.version).toBe('1.0.0');
      
      // Restore original environment variables
      process.env.NODE_ENV = originalEnv;
      process.env.STAGE = originalStage;
      process.env.npm_package_version = originalVersion;
    });
  });

  describe('Non-existent routes', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app).get('/nonexistent');
      
      expect(response.status).toBe(404);
    });
  });
});

