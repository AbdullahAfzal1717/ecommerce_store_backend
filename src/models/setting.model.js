const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g., "global_config"
    cashbackPercentage: { type: Number, default: 10 }, // e.g., 10 for 10%
    winModeEnabled: { type: Boolean, default: false }, // Control Lucky Spin
    referralBonusEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
