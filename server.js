import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import expenseRoutes from "./routes/expenseRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===================
// 🔹 Middleware
// ===================
app.use(cors());
app.use(express.json());

// Debug logger (helps in Railway logs)
app.use((req, res, next) => {
  console.log("📩 Incoming:", req.method, req.url);
  next();
});

// ===================
// 🔹 Routes
// ===================

// Root route (fix for Railway health checks)
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Welcome to AI Expense Tracker API",
    health: "/api/health",
  });
});

app.get("/api/health", (req, res) => {
  res.json({ message: "✅ Backend is running 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

// ===================
// 🔹 Global Error Handler
// ===================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({ error: "Something broke on the server" });
});

// ===================
// 🔹 MongoDB Connection + Server Start
// ===================
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "ai-expense-tracker",
  })
  .then(() => {
    console.log("✅ MongoDB Connected");

    // Railway requires binding to 0.0.0.0
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
