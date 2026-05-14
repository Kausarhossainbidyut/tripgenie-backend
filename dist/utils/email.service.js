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
        html: `<div style="font-family: Arial, sans-serif;"><h2>Welcome to TripGenie, ${name}!</h2><p>Thank you for joining TripGenie.</p></div>`,
    };
    return getTransporter().sendMail(mailOptions);
});
exports.sendWelcomeEmail = sendWelcomeEmail;

const sendBookingConfirmationEmail = (to, name, bookingDetails) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: `"TripGenie" <${db_1.default.email_user}>`,
        to,
        subject: 'Booking Confirmation - TripGenie',
        html: `<div style="font-family: Arial, sans-serif;"><h2>Booking Confirmed!</h2><p>Hi ${name}, your booking for ${bookingDetails.itemTitle} is confirmed.</p></div>`,
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
        html: `<div style="font-family: Arial, sans-serif;"><h2>Password Reset</h2><p>Hi ${name}, click <a href="${resetUrl}">here</a> to reset your password. Expires in 1 hour.</p></div>`,
    };
    return getTransporter().sendMail(mailOptions);
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
