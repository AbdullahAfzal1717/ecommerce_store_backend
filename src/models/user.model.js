const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto"); // For generating unique referral codes

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, minlength: 3 },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // --- NEW REFERRAL & STATUS FIELDS ---
    accountStatus: {
      type: String,
      enum: ["red", "yellow", "green"],
      default: "red",
    },
    referralCode: {
      type: String,
      unique: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    availableSpins: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash password AND generate a unique referral code
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // Generate a random referral code if it doesn't exist (e.g., ABD123)
  if (!this.referralCode) {
    this.referralCode = crypto.randomBytes(3).toString("hex").toUpperCase();
  }

  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
