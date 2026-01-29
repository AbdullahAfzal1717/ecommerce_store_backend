// src/modules/auth/auth.controller.js
const authService = require("./auth.service");

const register = async (req, res) => {
  const { username, email, password } = req.body;
  const result = await authService.registerUser(
    { username, email, password },
    req.file
  );

  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: { user: result.user, token: result.token },
  });
};

const login = async (req, res) => {
  const { login, password } = req.body;
  const result = await authService.loginUser({ login, password });

  return res.json({
    success: true,
    message: "Login successful",
    data: { user: result.user, token: result.token },
  });
};

const getMe = async (req, res) => {
  const result = await authService.getUserById(req.user._id);
  return res.json({ success: true, data: { user: result.user } });
};

// Controller function to update user profile
const updateMe = async (req, res) => {
  // req.user._id comes from your 'protect' middleware
  // req.file comes from 'upload.single("avatar")' in the route
  const result = await authService.updateUser(req.user._id, req.body, req.file);

  return res.json({
    success: true,
    message: "Profile updated successfully",
    data: { user: result.user },
  });
};

// Update your module.exports
module.exports = { register, login, getMe, updateMe };
