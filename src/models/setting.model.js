const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  key: { type: String, default: "global_config", unique: true },
  cashbackPercentage: { type: Number, default: 10 },
  winModeEnabled: { type: Boolean, default: false },
  referralBonusEnabled: { type: Boolean, default: true },
});

module.exports = mongoose.model("Settings", settingsSchema);
