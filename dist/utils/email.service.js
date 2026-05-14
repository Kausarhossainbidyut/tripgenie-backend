"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendBookingConfirmationEmail = exports.sendWelcomeEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const db_1 = __importDefault(require("../config/db"));
// Lazy transporter — created on first use, not at module load time
// This prevents crashes on Vercel if nodemailer has env issues at startup
const getTransporter = () => {
    return nodemailer_1.default.createTransport({
        host: db_1.default.email_host || 'smtp.gmail.com',
        port: Number(db_1.default.email_port) || 587,
        secure: false,
        auth: {
            user: db_1.default.email_user,
            pass: db_1.default.email_pass,
        },
    });
};
const sendWelcomeEmail = (to, name) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: `"TripGenie" <${db_1.default.email_user}>`,
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
        <p style="margin-top: 30px; color: #666;">Best regards,<br>The TripGenie Team</p>
      </div>
    `,
    };
    return getTransporter().sendMail(mailOptions);
});
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendBookingConfirmationEmail = (to, name, bookingDetails) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: `"TripGenie" <${db_1.default.email_user}>`,
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
        <p style="margin-top: 30px; color: #666;">Best regards,<br>The TripGenie Team</p>
      </div>
    `,
    };
    return getTransporter().sendMail(mailOptions);
});
exports.sendBookingConfirmationEmail = sendBookingConfirmationEmail;
const sendPasswordResetEmail = (to, name, resetToken) => __awaiter(void 0, void 0, void 0, function* () {
    const resetUrl = `${db_1.default.client_url}/reset-password?token=${resetToken}`;
    const mailOptions = {
        from: `"TripGenie" <${db_1.default.email_user}>`,
        to,
        subject: 'Password Reset Request - TripGenie',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2196F3;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>You requested a password reset for your TripGenie account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link: <span style="word-break: break-all; color: #666;">${resetUrl}</span></p>
        <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
        <p style="margin-top: 30px; color: #666;">If you didn't request this, ignore this email.<br>Best regards,<br>The TripGenie Team</p>
      </div>
    `,
    };
    return getTransporter().sendMail(mailOptions);
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
