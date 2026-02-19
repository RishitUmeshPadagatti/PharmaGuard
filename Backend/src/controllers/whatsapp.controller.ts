import type { Request, Response } from "express";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.WHATSAPP_ACCOUNT_SID;
const authToken = process.env.WHATSAPP_AUTH_TOKEN;
const fromNumber = process.env.WHATSAPP_FROM;
const toNumber = process.env.WHATSAPP_TO;

const client = twilio(accountSid, authToken);

export const sendWhatsAppReminder = async (req: Request, res: Response) => {
    try {
        const { message: messageText } = req.body || {};

        if (!messageText) {
            return res.status(400).json({ error: "message is required" });
        }

        if (!accountSid || !authToken || !fromNumber || !toNumber) {
            return res.status(500).json({ error: "WhatsApp configuration is missing in environment variables" });
        }

        const from = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;
        const to = toNumber.startsWith('whatsapp:') ? toNumber : `whatsapp:${toNumber}`;

        const result = await client.messages.create({
            from: from,
            body: messageText,
            to: to
        });

        console.log(`Message sent! SID: ${result.sid}`);
        res.status(200).json({ success: true, sid: result.sid });
    } catch (error: any) {
        console.error("Error sending WhatsApp message:", error);
        res.status(500).json({
            error: "Failed to send WhatsApp message",
            details: error.message
        });
    }
};
