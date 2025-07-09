require('dotenv').config();

const express = require('express');

// google login
const session = require('express-session');
const passport = require('passport');
require('./src/utils/passport');

const { create } = require('express-handlebars');
const path = require('path');
const app = express();
const port = 3000;


// db connection
const db = require('./src/utils/db');


// middlewares
const logger = require('./src/middlewares/logger');
const { logErrors, errorHandler } = require('./src/middlewares/errorHandler');
const { requireLogin, redirectIfLoggedIn } = require('./src/middlewares/auth');


// routes
const assignmentRoutes = require('./src/routes/assignments');
const loginRoutes = require('./src/routes/login');
const dashboardRoutes = require('./src/routes/dashboard');
const authRoutes = require('./src/routes/auth');
const classroomRoutes = require('./src/routes/classroom');
const membershipRoutes = require('./src/routes/membership');


// veiw engine setting
const hbs = create({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials'),
  helpers: {
        json: function (context) {
            return JSON.stringify(context);
        }
  }
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));


// parse body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// API Router
app.use('/api/assignments', assignmentRoutes);

// Session & Passport
app.use(session({
  secret: 'guessmyfuckingsecretyoubastard',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

// Router
app.get('/', (req, res) => {
  return res.render('home', { title: 'myScore', user: req.user });
});

// frontend router
app.use('/', loginRoutes);
app.use('/', dashboardRoutes);
app.use('/', authRoutes); // google callback url
app.use('/', classroomRoutes);
app.use('/', membershipRoutes);

// provide public/ static shit
app.use(express.static(path.join(__dirname, 'public'), { index: false }));
app.use(express.static(path.join(__dirname, 'views'), { index: false }));

// err middleware *註: 這玩意最好得放在所有路由之後
app.use(logErrors);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running at http://127.0.0.1:${port}`);
});

// run system command: docker compose up -d --build // 後面兩個看狀況用 懶得解釋了
// todo: 
// 1. 加入教室功能
// 2. 驗證學生是否為教室成員中介
// 3. 教室頁面設計
// 4. 管理學生功能
//      (可以試著在新增課堂頁面新增一個選項 讓建立者自行決定學生加入課堂要不要審核)
//      (學生是不是應該也要有個退出教室功能)
// 5. 建立互評任務功能
// 6. 互評任務結果統計資料設計
// * 可能的功能: 
//    1. 掃 QR code 加入教室
//        (現在的頁面丟到手機上看會很醜 RWD 要重弄)
//    2. 老師匯入課綱直接生成教室
//    3. 其他
// 待補充

// now doing: 