import type { Request, Response } from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});

export const sendEmailReminder = async (req: Request, res: Response) => {
    try {
        const { subject, message, to } = req.body || {};

        if (!message) {
            return res.status(400).json({ error: "message is required" });
        }

        if (!emailUser || !emailPass) {
            return res.status(500).json({ error: "Email configuration (EMAIL_USER/EMAIL_PASS) is missing in environment variables" });
        }

        const mailOptions = {
            from: emailUser,
            to: to || emailUser, // Default to self if 'to' is not provided
            subject: subject || "PharmaGuard Notification",
            text: message,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log(`Email sent: ${info.messageId}`);
        res.status(200).json({ success: true, messageId: info.messageId });
    } catch (error: any) {
        console.error("Error sending email:", error);
        res.status(500).json({
            error: "Failed to send email",
            details: error.message
        });
    }
};
