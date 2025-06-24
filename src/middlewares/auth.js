// 懶趴包: 擋那些沒登入不准看的頁面
// 沒有憑證的話, 跳到登入頁面
function requireLogin(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  next();
}

// 懶趴包: 擋那些有登入才不准看的頁面
// 有憑證的話, 跳到dashboard
function redirectIfLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  next();
}

module.exports = { requireLogin, redirectIfLoggedIn };