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
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Welcome to AI Expense Tracker API",
    health: "/api/health",
    dbStatus: "/api/db-status",
  });
});

app.get("/api/health", (req, res) => {
  res.json({ message: "✅ Backend is running 🚀" });
});

app.get("/api/db-status", (req, res) => {
  const state = mongoose.connection.readyState;
  const states = ["🔴 Disconnected", "🟢 Connected", "🟡 Connecting", "🟠 Disconnecting"];
  res.json({
    dbState: states[state],
    code: state,
  });
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
// 🔹 MongoDB Connection Logic
// ===================
const states = ["🔴 Disconnected", "🟢 Connected", "🟡 Connecting", "🟠 Disconnecting"];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "ai-expense-tracker",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
};

// Auto-reconnect on disconnect
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB Disconnected! Retrying in 5s...");
  setTimeout(connectDB, 5000);
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 MongoDB Reconnected!");
});

// ===================
// 🔹 Start Server
// ===================
const startServer = async () => {
  await connectDB();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  // 🔄 Log DB status every 30s
  setInterval(() => {
    const state = mongoose.connection.readyState;
    console.log(`📡 MongoDB Status: ${states[state]} (${state})`);
  }, 30000);
};

startServer();
