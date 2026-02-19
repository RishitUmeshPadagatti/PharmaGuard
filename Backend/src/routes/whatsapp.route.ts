import { Router } from "express";
import { sendWhatsAppReminder } from "../controllers/whatsapp.controller.js";

const router = Router();

// Send a WhatsApp reminder using Twilio template
router.post("/review", sendWhatsAppReminder);

export default router;
