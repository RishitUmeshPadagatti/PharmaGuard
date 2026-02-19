import express from "express";
import dotenv from "dotenv";
import analyzeRoute from "./routes/analyze.route.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/analyze", analyzeRoute);

app.listen(8000, () => {
  console.log("🚀 Server running on port 8000");
});
