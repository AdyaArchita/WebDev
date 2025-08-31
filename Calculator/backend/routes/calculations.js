const express = require("express");
const { evaluate } = require("mathjs");
const Calculation = require("../models/Calculation");

const router = express.Router();

// Helper function to clean result
function cleanResult(value, precision = 10) {
  return parseFloat(Number(value).toFixed(precision));
}

// POST /api/calculations → evaluate & save
router.post("/", async (req, res) => {
  const { expression } = req.body;

  if (!expression) {
    return res.status(400).json({ error: "Expression is required" });
  }

  try {
    // Try evaluating the expression
    let result = evaluate(expression);

    // Catch division by zero or non-finite results
    if (!isFinite(result)) {
      throw new Error("Invalid calculation (e.g. division by zero)");
    }

    // ✅ Clean/round result before saving
    result = cleanResult(result);

    // Save successful calculation
    const calculation = new Calculation({
      expression,
      result, // ✅ store as Number, not String
      error: null,
    });
    await calculation.save();

    return res.json(calculation);
  } catch (err) {
    // Save failed attempt too
    const failed = new Calculation({
      expression,
      result: null, // ✅ null instead of "NaN"
      error: err.message || "Invalid expression",
    });
    await failed.save();

    return res.status(400).json(failed);
  }
});

// GET /api/calculations → fetch history
router.get("/", async (req, res) => {
  const history = await Calculation.find().sort({ createdAt: -1 }).limit(10);
  res.json(history);
});

// DELETE /api/calculations → clear history
router.delete("/", async (req, res) => {
  await Calculation.deleteMany({});
  res.json({ message: "History cleared" });
});

module.exports = router;
