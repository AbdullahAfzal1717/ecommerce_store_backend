// src/utils/ApiError.js
class ApiError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {object} meta - optional extra info (e.g. { errors: [...] })
   */
  constructor(message, statusCode = 500, meta = null) {
    super(message);
    this.statusCode = statusCode;
    this.meta = meta;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;