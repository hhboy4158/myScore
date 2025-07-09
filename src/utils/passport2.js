// 已棄用 不用看
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db'); // mysql2 pool

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  done(null, rows[0] || false);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
  scope: ['profile', 'email']
}, async (_, __, profile, done) => {
  try {
    const provider = 'google';
    const providerId = profile.id;

    // 查詢是否已有此使用者
    let [rows] = await db.query(
      'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
      [provider, providerId]
    );
    let user = rows[0];

    if (!user) {
      const name = profile.displayName;
      const email = profile.emails?.[0]?.value;
      const avatar = profile.photos?.[0]?.value;
      const emailVerified = profile.emails?.[0]?.verified || false;

      const [result] = await db.query(
        `INSERT INTO users
         (name, email, provider, provider_id, avatar_url, email_verified, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [name, email, provider, providerId, avatar, emailVerified]
      );
      user = {
        id: result.insertId,
        name, email, provider, provider_id: providerId,
        avatar_url: avatar, email_verified: emailVerified
      };
    }

    done(null, user);
  } catch (err) {
    done(err);
  }
}));
