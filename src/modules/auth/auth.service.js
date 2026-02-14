// src/modules/auth/auth.service.js
const ApiError = require("../../utils/ApiError");
const User = require("../../models/user.model");
const generateToken = require("../../utils/generateToken");

/**
 * Helper to format user object returned to clients
 * (keeps sensitive fields out)
 */
function formatUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    accountStatus: user.accountStatus, // Added
    referralCode: user.referralCode, // Added
    walletBalance: user.walletBalance, // Added
    availableSpins: user.availableSpins, // Added
  };
}

/**
 * Register a new user
 * @param {Object} param
 * @param {string} param0.username
 * @param {string} param0.email
 * @param {string} param0.password
 */
async function registerUser({ username, email, password, referralCode }, file) {
  if (!username || !email || !password) {
    throw new ApiError("username, email and password are required", 400);
  }

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    throw new ApiError("User already exists with this email or username", 400);
  }

  // CHECK REFERRAL CODE
  let referrerId = null;
  if (referralCode) {
    const referrer = await User.findOne({ referralCode });
    if (referrer) {
      referrerId = referrer._id;
    }
    // Note: We don't throw an error if code is invalid,
    // we just proceed without a referrer (standard professional practice)
  }

  const avatarPath = file ? file.path : "";

  const user = await User.create({
    username,
    email,
    password,
    avatar: avatarPath,
    referredBy: referrerId, // Link the user!
    accountStatus: "red", // Default start
  });

  const token = generateToken(user._id);

  return {
    user: formatUser(user),
    token,
  };
}
/**
 * Login user by email or username
 * @param {Object} param0
 * @param {string} param0.login  // email or username
 * @param {string} param0.password
 */
async function loginUser({ login, password }) {
  if (!login || !password) {
    throw new ApiError("login and password are required", 400);
  }

  // fetch user including password for comparison
  const user = await User.findOne({
    $or: [{ email: login }, { username: login }],
  }).select("+password");

  if (!user) {
    throw new ApiError("Invalid credentials", 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    // optional: implement login attempt tracking / lockout here
    throw new ApiError("Invalid credentials", 401);
  }

  const token = generateToken(user._id);

  return {
    user: formatUser(user),
    token,
  };
}

/**
 * Get user by id (for /me)
 * @param {string} userId
 */
async function getUserById(userId) {
  if (!userId) throw new ApiError("user id is required", 400);

  const user = await User.findById(userId);
  if (!user) throw new ApiError("User not found", 404);

  return { user: formatUser(user) };
}

/**
 * Update user profile details and avatar
 * @param {string} userId
 * @param {Object} updateData
 * @param {Object} file // Multer file object
 */
async function updateUser(userId, updateData, file) {
  // 1. Safety: Never allow password updates through this general profile route
  delete updateData.password;
  delete updateData.email; // Professionally, email changes often require re-verification

  // 2. If a new file is uploaded, add its path to the update object
  if (file) {
    updateData.avatar = file.path;
  }

  // 3. Find and Update
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) throw new ApiError("User not found", 404);

  return { user: formatUser(user) };
}
/**
 * @param {string} userId
 */
async function getReferralTreeData(userId) {
  const user = await User.findById(userId);
  if (!user) return null;

  const referrals = await User.find({ referredBy: userId });

  const children = await Promise.all(
    referrals.map(async (ref) => await getReferralTreeData(ref._id))
  );

  return {
    name: user.username,
    attributes: {
      id: user._id,
      status: user.accountStatus,
      email: user.email,
      joined: new Date(user.createdAt).toLocaleDateString(),
    },
    children: children.filter((c) => c !== null),
  };
}

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  getReferralTreeData,
};
