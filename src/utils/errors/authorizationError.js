
// src/utils/errors/authorizationError.js
const BaseError = require('./baseError');
class AuthorizationError extends BaseError {
  constructor(msg = '沒有權限') {
    super(msg, 403);
  }
}
module.exports = AuthorizationError;