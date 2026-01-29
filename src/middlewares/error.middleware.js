// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  // Always log full error server-side (replace console with a logger in prod)
  console.error("❌ Error:", err);

  // Default status
  let statusCode = err.statusCode || 500;

  // Base response
  const response = {
    success: false,
    message: err.message || "Server Error",
  };

  // ---- Handle specific DB / Mongoose errors ----

  // Mongo duplicate key error (E11000)
  // Example: { code: 11000, keyValue: { username: 'ali' } }
  if (err && (err.code === 11000 || err.code === 11001)) {
    statusCode = 400;
    const key = err.keyValue ? Object.keys(err.keyValue)[0] : null;
    const value = key ? err.keyValue[key] : null;
    response.message =
      key && value ? `${key} "${value}" already exists` : "Duplicate key error";
    // Optionally include the raw keyValue for debugging (only in dev)
    if (process.env.NODE_ENV === "development" && err.keyValue) {
      response.meta = { keyValue: err.keyValue };
    }
  }

  // Mongoose validation error (schema validators)
  // err.errors contains fields -> { message, path, value, kind, ... }
  else if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => ({
      message: e.message,
      path: e.path,
      value: e.value,
      kind: e.kind,
    }));
    response.message = "Validation failed";
    response.errors = errors;
  }

  // Mongoose cast error (e.g., invalid ObjectId)
  else if (err.name === "CastError") {
    statusCode = 400;
    response.message = `Invalid ${err.path}: ${err.value}`;
  }

  // If handler received structured meta (e.g., from ApiError)
  else if (err.meta) {
    if (err.meta.errors) {
      response.errors = err.meta.errors;
    } else {
      response.meta = err.meta;
    }
  }

  // Only include stack in development
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
