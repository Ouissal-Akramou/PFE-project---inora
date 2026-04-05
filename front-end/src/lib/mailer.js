// lib/mailer.js
import nodemailer from 'nodemailer';
import dns from 'dns';

// Force IPv4 globally (optional)
dns.setDefaultResultOrder('ipv4first');

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  family: 4,  // ← HADI LMO7IMA
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 20000
});

export const testMailer = async () => {
  try {
    await transporter.sendMail({
      from: `"Inora" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Test email',
      text: 'This is a test email from Nodemailer'
    });
    console.log('✅ Test email sent');
  } catch (error) {
    console.error('❌ Test email failed:', error);
  }
};