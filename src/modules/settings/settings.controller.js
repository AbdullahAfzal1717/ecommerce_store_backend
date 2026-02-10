const settingsService = require("./settings.services");
const { validationResult } = require("express-validator");

const fetchSettings = async (req, res) => {
  try {
    const settings = await settingsService.getGlobalSettings();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const saveSettings = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updated = await settingsService.updateGlobalSettings(req.body);
    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  fetchSettings,
  saveSettings,
};
