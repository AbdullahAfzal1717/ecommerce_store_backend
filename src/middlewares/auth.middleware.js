const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");

const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new ApiError("Access denied. No token provided", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new ApiError("Token is not valid", 401));
    }

    req.user = user;
    next();
  } catch (err) {
    // jwt.verify will throw; send a single structured error
    return next(new ApiError("Token is not valid", 401));
  }
};
// Auth middleware to restrict access based on roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user was set by the 'protect' middleware previously
    if (!roles.includes(req.user.role)) {
      return next(new ApiError("You do not have permission to perform this action", 403));
    }
    next();
  };
};

module.exports = { protect, restrictTo };

