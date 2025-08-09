#!/usr/bin/env node

// Simple deployment script for Render
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting FragsHub Backend...');
console.log('📁 Working directory:', __dirname);
console.log('🔧 Node version:', process.version);

// Start the server
const serverProcess = spawn('node', ['server-working.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  console.log(`🔄 Server process exited with code ${code}`);
  if (code !== 0) {
    process.exit(code);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('📤 Received SIGTERM, shutting down gracefully...');
  serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('📤 Received SIGINT, shutting down gracefully...');
  serverProcess.kill('SIGINT');
});
