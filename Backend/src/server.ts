import express from "express";
import dotenv from "dotenv";
import analyzeRoute from "./routes/analyze.route.js";
import whatsappRoute from "./routes/whatsapp.route.js";
import emailRoute from "./routes/email.route.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/analyze", analyzeRoute);
app.use("/api/whatsapp", whatsappRoute);
app.use("/api/email", emailRoute);

app.listen(8000, () => {
  console.log("🚀 Server running on port 8000");
});
