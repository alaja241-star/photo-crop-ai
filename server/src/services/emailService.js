import nodemailer from 'nodemailer';
import { emailConfig } from '../config/email.js';

// Create transporter with SMTP configuration
const transporter = nodemailer.createTransport(emailConfig.smtp);

// Verify transporter connection
transporter.verify(function(error, success) {
  if (error) {
    console.log('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 * @param {string} resetUrl - Password reset URL
 * @returns {Promise<Object>} - Email send result
 */
export const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  try {
    const mailOptions = {
      from: `"${emailConfig.sender.name}" <${emailConfig.sender.email}>`,
      to: email,
      subject: `Password Reset Request - ${emailConfig.app.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">${emailConfig.app.name} Password Reset</h1>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;">
            <p>Hello,</p>
            
            <p>You are receiving this email because you (or someone else) has requested the reset of your password for your ${emailConfig.app.name} account.</p>
            
            <p>Please click the button below to reset your password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
            
            <p><strong>Important:</strong> This password reset link will expire in 10 minutes for security reasons.</p>
            
            <p>If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="color: #666; font-size: 12px;">
              This is an automated email from ${emailConfig.app.name}. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
      text: `
        ${emailConfig.app.name} Password Reset
        
        You are receiving this email because you (or someone else) has requested the reset of your password for your ${emailConfig.app.name} account.
        
        Please visit the following link to reset your password:
        ${resetUrl}
        
        This password reset link will expire in 10 minutes for security reasons.
        
        If you did not request this password reset, please ignore this email and your password will remain unchanged.
        
        This is an automated email from AgriAI. Please do not reply to this email.
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully to:', email);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send password reset confirmation email
 * @param {string} email - Recipient email
 * @param {string} userName - User's name
 * @returns {Promise<Object>} - Email send result
 */
export const sendPasswordResetConfirmationEmail = async (email, userName) => {
  try {
    const mailOptions = {
      from: `"${emailConfig.sender.name}" <${emailConfig.sender.email}>`,
      to: email,
      subject: `Password Reset Successful - ${emailConfig.app.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Password Reset Successful</h1>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;">
            <p>Hello ${userName || 'there'},</p>
            
            <p>Your password has been successfully reset for your ${emailConfig.app.name} account.</p>
            
            <p>If you did not perform this action, please contact our support team immediately as your account security may be compromised.</p>
            
            <p>You can now log in to your account using your new password.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="color: #666; font-size: 12px;">
              This is an automated email from AgriAI. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
      text: `
        Password Reset Successful - ${emailConfig.app.name}
        
        Hello ${userName || 'there'},
        
        Your password has been successfully reset for your ${emailConfig.app.name} account.
        
        If you did not perform this action, please contact our support team immediately as your account security may be compromised.
        
        You can now log in to your account using your new password.
        
        This is an automated email from ${emailConfig.app.name}. Please do not reply to this email.
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset confirmation email sent successfully to:', email);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending password reset confirmation email:', error);
    throw new Error('Failed to send password reset confirmation email');
  }
};

export default transporter;
