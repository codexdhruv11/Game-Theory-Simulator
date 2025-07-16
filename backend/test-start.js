// Quick test to check if backend starts
const { spawn } = require('child_process');

console.log('Testing backend startup...');

const backend = spawn('npm', ['run', 'dev'], {
  cwd: process.cwd(),
  stdio: 'pipe'
});

let output = '';
let hasError = false;

backend.stdout.on('data', (data) => {
  output += data.toString();
  console.log('STDOUT:', data.toString());
  
  if (data.toString().includes('Server running on port')) {
    console.log('✅ Backend started successfully!');
    backend.kill();
    process.exit(0);
  }
});

backend.stderr.on('data', (data) => {
  output += data.toString();
  console.log('STDERR:', data.toString());
  hasError = true;
});

backend.on('close', (code) => {
  if (hasError) {
    console.log('❌ Backend failed to start');
    console.log('Full output:', output);
  }
  process.exit(code);
});

// Kill after 15 seconds
setTimeout(() => {
  console.log('⏰ Timeout reached, killing process');
  backend.kill();
  process.exit(1);
}, 15000);