// src/middlewares/auth.js

// 懶趴包: 擋那些沒登入不准看的頁面
// 沒有憑證的話, 跳到登入頁面

/**
 * 只有登入限定
 */
function requireLogin(req, res, next) {
  if (!req.isAuthenticated()) {
    console.log("redirect to login page.")
    return res.redirect('/login');
  }
  next();
}

// 懶趴包: 擋那些有登入才不准看的頁面
// 有憑證的話, 跳到dashboard
/**
 * 只有登出限定
 */
function redirectIfLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    console.log("redirect to dashboard page.")
    return res.redirect('/classroom');
  }
  next();
}

module.exports = { requireLogin, redirectIfLoggedIn };