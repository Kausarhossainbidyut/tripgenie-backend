import nodemailer from 'nodemailer';
import config from '../config/db';

// Create email transporter
const transporter = nodemailer.createTransport({
  host: config.email_host || 'smtp.gmail.com',
  port: Number(config.email_port) || 587,
  secure: false,
  auth: {
    user: config.email_user,
    pass: config.email_pass,
  },
});

// Send welcome email
export const sendWelcomeEmail = async (to: string, name: string) => {
  const mailOptions = {
    from: `"TripGenie" <${config.email_user}>`,
    to,
    subject: 'Welcome to TripGenie!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Welcome to TripGenie, ${name}!</h2>
        <p>Thank you for joining TripGenie - your AI-powered travel companion.</p>
        <p>With TripGenie, you can:</p>
        <ul>
          <li>Discover amazing destinations in Bangladesh</li>
          <li>Get AI-powered travel recommendations</li>
          <li>Book your favorite spots easily</li>
          <li>Share your experiences with reviews</li>
        </ul>
        <p>Start exploring today!</p>
        <p style="margin-top: 30px; color: #666;">
          Best regards,<br>
          The TripGenie Team
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

// Send booking confirmation email
export const sendBookingConfirmationEmail = async (
  to: string,
  name: string,
  bookingDetails: {
    itemTitle: string;
    quantity: number;
    totalPrice: number;
    status: string;
  }
) => {
  const mailOptions = {
    from: `"TripGenie" <${config.email_user}>`,
    to,
    subject: 'Booking Confirmation - TripGenie',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Booking Confirmed!</h2>
        <p>Hi ${name},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Destination:</strong> ${bookingDetails.itemTitle}</p>
          <p><strong>Quantity:</strong> ${bookingDetails.quantity}</p>
          <p><strong>Total Price:</strong> $${bookingDetails.totalPrice}</p>
          <p><strong>Status:</strong> ${bookingDetails.status}</p>
        </div>
        <p>We hope you enjoy your trip!</p>
        <p style="margin-top: 30px; color: #666;">
          Best regards,<br>
          The TripGenie Team
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

// Send password reset email
export const sendPasswordResetEmail = async (to: string, name: string, resetToken: string) => {
  const resetUrl = `${config.client_url}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"TripGenie" <${config.email_user}>`,
    to,
    subject: 'Password Reset Request - TripGenie',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2196F3;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>You requested a password reset for your TripGenie account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
        <p style="margin-top: 30px; color: #666;">
          If you didn't request this, please ignore this email.<br>
          Best regards,<br>
          The TripGenie Team
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
