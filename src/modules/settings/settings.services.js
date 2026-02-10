const Settings = require("../../models/settings.model");

const getGlobalSettings = async () => {
  let settings = await Settings.findOne({ key: "global_config" });
  if (!settings) {
    // Create default settings if they don't exist
    settings = await Settings.create({ key: "global_config" });
  }
  return settings;
};

const updateGlobalSettings = async (updateData) => {
  return await Settings.findOneAndUpdate(
    { key: "global_config" },
    { $set: updateData },
    { new: true, upsert: true }
  );
};

module.exports = {
  getGlobalSettings,
  updateGlobalSettings,
};
