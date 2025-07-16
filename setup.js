#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Game Theory Simulator...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Node.js 18 or higher is required. Current version:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js version check passed:', nodeVersion);

// Install frontend dependencies
console.log('\n📦 Installing frontend dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install frontend dependencies');
  process.exit(1);
}

// Install backend dependencies
console.log('\n📦 Installing backend dependencies...');
try {
  execSync('cd backend && npm install', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install backend dependencies');
  process.exit(1);
}

// Create environment files if they don't exist
console.log('\n⚙️  Setting up environment files...');

// Frontend environment file
const frontendEnvPath = '.env.local';
if (!fs.existsSync(frontendEnvPath)) {
  const frontendEnvContent = `# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:3001/api
`;
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('✅ Created .env.local for frontend');
} else {
  console.log('ℹ️  Frontend .env.local already exists');
}

// Backend environment file
const backendEnvPath = path.join('backend', '.env');
if (!fs.existsSync(backendEnvPath)) {
  const backendEnvExamplePath = path.join('backend', '.env.example');
  if (fs.existsSync(backendEnvExamplePath)) {
    fs.copyFileSync(backendEnvExamplePath, backendEnvPath);
    console.log('✅ Created backend/.env from .env.example');
    console.log('⚠️  Please update backend/.env with your MongoDB URI and other settings');
  }
} else {
  console.log('ℹ️  Backend .env already exists');
}

// Check if MongoDB is accessible (optional)
console.log('\n🗄️  Checking MongoDB connection...');
try {
  // Try to connect to default MongoDB URI
  const { MongoClient } = require('mongodb');
  const defaultUri = 'mongodb://localhost:27017';
  
  MongoClient.connect(defaultUri, { serverSelectionTimeoutMS: 2000 })
    .then(client => {
      console.log('✅ MongoDB connection successful');
      client.close();
    })
    .catch(() => {
      console.log('⚠️  MongoDB not found at localhost:27017');
      console.log('   Please ensure MongoDB is running or update MONGODB_URI in backend/.env');
    });
} catch (error) {
  console.log('⚠️  MongoDB driver not installed yet - will be available after backend setup');
}

console.log('\n🎉 Setup completed successfully!\n');

console.log('📋 Next steps:');
console.log('1. Ensure MongoDB is running');
console.log('2. Update backend/.env with your configuration');
console.log('3. Seed the database: cd backend && npm run seed:philosophers');
console.log('4. Start the application: npm run dev:full');
console.log('5. Open http://localhost:3000 in your browser\n');

console.log('🔧 Available commands:');
console.log('  npm run dev:full      - Run frontend + backend');
console.log('  npm run dev           - Run frontend only');
console.log('  npm run dev:backend   - Run backend only');
console.log('  npm run build:full    - Build frontend + backend');
console.log('  npm run start:full    - Start production servers');
console.log('');

console.log('📚 For more information, see README.md');