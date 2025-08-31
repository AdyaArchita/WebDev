const mongoose = require("mongoose");

const CalculationSchema = new mongoose.Schema(
  {
    expression: { type: String, required: true, trim: true }, // user input
    result: { type: Number, default: null }, // evaluated result or null if failed
    error: { type: String, default: null }, // store error messages if evaluation fails
    evaluatedAt: { type: Date, default: Date.now }, // consistent with API
    source: { type: String, default: "backend" }, // mark where it came from
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("Calculation", CalculationSchema);
