// lib/mailer.js
import nodemailer from "nodemailer";
import dns from 'dns';

// Force IPv4 globally
dns.setDefaultResultOrder('ipv4first');

export const transporter = nodemailer.createTransport({
    service: "gmail",
    family: 4,  // ← ZID HADI !!!
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});