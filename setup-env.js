const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to execute command: ${command}`);
    process.exit(1);
  }
}

// Create virtual environment
if (!fs.existsSync('venv')) {
  console.log('Creating virtual environment...');
  runCommand('python3 -m venv venv');
}

// Install requirements
console.log('Installing Python requirements...');
const activateCmd = process.platform === 'win32' 
  ? 'venv\\Scripts\\activate' 
  : 'source venv/bin/activate';

runCommand(`${activateCmd} && pip install -r backend/requirements.txt`);

console.log('Python environment setup complete!');
