// 這玩意會在 app.js 裡被 require 

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db'); // MySQL connection pool
// passport 使用參考: 
// https://medium.com/@ginohsu/%E5%AD%B8%E7%BF%92%E7%AD%86%E8%A8%98-%E4%BD%BF%E7%94%A8%E8%80%85%E8%AA%8D%E8%AD%89-passport-js-f17d5ba0acb3

// 序列化, 把使用者 id 寫入 session 
// 當用戶成功登入（通過任何 Passport 策略, 例如 Google）後, Passport 會調用 serializeUser 方法
/**
 * @param {object} user - 這玩意是從下面 GoogleStrategy 那邊得到的
*/
passport.serializeUser((user, done) => done(null, user.user_id));

// 反序列化, 透過使用者 id 到 User 資料庫中提取使用者資料
// 因為 javascript 是 single thread, 所以沒使用非同步函數 (async) 的話有可能會造成阻塞主執行緒, 
// 就跟我昨天拉屎一樣, 通通塞住, 幹
// 只要 serializeUser 是傳 user.user_id 那 deserializeUser 也就應該接受這個 user_id
passport.deserializeUser(async (user_id, done) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE user_id = ?',
      [user_id]
    );
    done(null, rows[0] || false);
  } catch (err) {
    done(err);
  }
});

// 執行 google OAuth2.0 strategy, 告訴 passport 如何使用 google 進行身份驗證
// passport.use()：註冊一個新的 passport 策略
// new GoogleStrategy()：new 一個 google strategy 
passport.use(new GoogleStrategy({ 
  // 這兩個玩意要去 google 那邊拿 微麻煩 要找教學
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, 
/**
 * Google OAuth callback
 * @param {string} accessToken - Google access token
 * @param {string} refreshToken - Google refresh token
 * @param {object} profile - Google profile object
 * @param {function} done - Passport callback
 */
async (_, __, profile, done) => {
  try {
    // 先查詢是否有此估狗使用者
    let [rows] = await db.query('SELECT * FROM users WHERE provider_id = ?', [profile.id]);
    let user = rows[0];
    // console.log('profile.id:', profile.id);
    if (!user) {
      // 沒的話就新增一筆進去
      const [result] = await db.query(
        'INSERT INTO users (provider_id, name, email, provider) VALUES (?, ?, ?, ?)',
        [
          profile.id, 
          profile.displayName, 
          profile.emails?.[0]?.value, 
          "google"
        ]
      );
      // 把剛剛從 google 取得的一堆使用者資料 & 剛剛 insert 進去所生成的使用者 id 
      // 通通寫進user obj裡 供 serializeUser 作使用
      user = { 
        user_id: result.insertId, 
        provider_id: profile.id, 
        name: profile.displayName, 
        email: profile.emails?.[0]?.value || null,
        provider: "google"
      };
    };
    console.log("user_id:", user.user_id, "is logged in");
    done(null, user);
  } catch(err) {
    done(err);
  };

}));
