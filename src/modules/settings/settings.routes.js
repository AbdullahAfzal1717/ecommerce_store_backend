const express = require("express");
const router = express.Router();
const settingsController = require("./settings.controller");
const { validateSettings } = require("./settings.validator");
// Import your admin middleware here if you have one
// const { isAdmin } = require("../../middleware/auth.middleware");

// Routes
router.get("/", settingsController.fetchSettings);
router.post("/", validateSettings, settingsController.saveSettings);

module.exports = router;
