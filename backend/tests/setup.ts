import dotenv from 'dotenv';

// Load environment variables for testing
dotenv.config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/game-theory-simulator-test';
process.env.BCRYPT_SALT_ROUNDS = '4'; // Lower for faster tests

// Increase timeout for database operations
jest.setTimeout(30000);
