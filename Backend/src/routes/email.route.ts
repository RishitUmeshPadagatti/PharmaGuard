import { Router } from "express";
import { sendEmailReminder } from "../controllers/email.controller.js";

const router = Router();

// Endpoint to send an email
router.post("/review", sendEmailReminder);

export default router;
