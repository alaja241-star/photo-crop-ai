import { sendPasswordResetEmail } from './src/services/emailService.js';

// Test email service
async function testEmailService() {
  try {
    console.log('Testing email service...');
    
    const testEmail = 'yussifyahuza12@gmail.com';
    const testToken = 'test-token-123';
    const testUrl = 'http://localhost:3000/reset-password/test-token-123';
    
    const result = await sendPasswordResetEmail(testEmail, testToken, testUrl);
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Email service test failed:', error.message);
  }
}

testEmailService();
