// middlewares/errorHandler.js
const BaseError = require('../utils/errors/baseError');

function logErrors(err, req, res, next) {
  console.error(err);
  next(err);
}

function errorHandler(err, req, res, next) {
  if (err instanceof BaseError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
  } else {
    res.status(500).json({ success: false, message: '伺服器錯誤!' });
  }
}

module.exports = { logErrors, errorHandler };
