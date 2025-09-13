import express from "express";
import Expense from "../models/Expense.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Get all expenses (protected)
router.get("/", protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Add new expense (protected)

router.post("/", protect, async (req, res) => {
  try {
    const { title, amount, category } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ error: "Title and amount are required" });
    }

    const expense = new Expense({
      user: req.user.id,
      title,
      amount,
      category,
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    console.error("❌ Error creating expense:", error); // 👈 log the real error
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
