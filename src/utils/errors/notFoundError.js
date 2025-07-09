// src/utils/errors/notFoundError.js
const BaseError = require('./baseError');
class NotFoundError extends BaseError {
  constructor(msg = '找不到資料') {
    super(msg, 404);
  }
}
module.exports = NotFoundError;