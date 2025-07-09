const express = require('express');
const router = express.Router();
const { redirectIfLoggedIn, requireLogin } = require('../middlewares/auth');

router.get('/login', redirectIfLoggedIn, (req, res) => {
  return res.render('login', { title: '登入' });
});

// router.post('/login', (req, res) => {
//     const { email, password, remember } = req.body;
// });

router.get('/logout', requireLogin, (req, res) => {
    // req.session 存在表示用戶有活動會話
    if (req.session) {
        console.log("user_id:", req.session.passport.user, "is logged out.")
        req.session.destroy((err) => {
            if (err) {
                // 如果銷毀會話時發生錯誤，將錯誤傳遞給錯誤處理中介軟體
                console.error('Error destroying session:', err);
                return next(err);
            }
            // 會話成功銷毀後，可以進行以下操作：
            // 1. 清除客戶端的 session cookie (connect.sid)
            //    express-session 在 destroy 後通常會自動處理 cookie 的過期
            //    但顯式清除可以確保萬無一失
            res.clearCookie('connect.sid'); // 假設 session cookie 名稱是 'connect.sid'

            // 導向到登入頁面或首頁
            res.redirect('/'); // 或 res.status(200).json({ message: 'Logged out successfully' });
        });
    } else {
        res.redirect('/login');
    }
});

module.exports = router;