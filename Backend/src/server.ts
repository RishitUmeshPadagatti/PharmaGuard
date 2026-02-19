import express from "express";
import dotenv from "dotenv";
import analyzeRoute from "./routes/analyze.route.js";
import session from "express-session";

dotenv.config();

const app = express();
app.use(
  session({
    secret: "pharmaguard-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 30, // 30 minutes
    },
  }),
);
app.use(express.json());

app.use("/api/analyze", analyzeRoute);

app.listen(8000, () => {
  console.log("🚀 Server running on port 8000");
});
