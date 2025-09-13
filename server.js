import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import expenseRoutes from "./routes/expenseRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log("📩 Incoming:", req.method, req.url, req.body);
  next();
});

// Routes
app.get("/api/health", (req, res) => {
  res.json({ message: "✅ Backend is running 🚀" });
});
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "ai-expense-tracker",
  })
  .then(() => {
    console.log("✅ MongoDB Connected");

    // ✅ Railway requires listening on 0.0.0.0
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
