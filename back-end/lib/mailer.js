import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    service: "gmail", // or smtp provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
