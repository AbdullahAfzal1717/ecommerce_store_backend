const Settings = require("../../models/setting.model");

const getGlobalSettings = async () => {
  let settings = await Settings.findOne({ key: "global_config" });
  console.log("settings", settings);
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
