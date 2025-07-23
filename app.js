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
        },
        formatDate: function (date) {
          if (!date) return '';
          const d = new Date(date);
          const year = d.getFullYear();
          const month = ('0' + (d.getMonth() + 1)).slice(-2);
          const day = ('0' + d.getDate()).slice(-2);
          const hours = ('0' + d.getHours()).slice(-2);
          const minutes = ('0' + d.getMinutes()).slice(-2);
          const seconds = ('0' + d.getSeconds()).slice(-2);
          return `${year}/${month}/${day} - ${hours}:${minutes}:${seconds}`;
        },
        eq: function (a, b) {
          return a === b;
        },
        lookup: function (obj, field) {
          return obj && obj[field];
        },
        formatForInput: function (date) {
          if (!date) return '';
          const d = new Date(date);
          // Adjust for timezone offset to get local time in YYYY-MM-DDTHH:mm format
          const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
          const localISOTime = (new Date(d - tzoffset)).toISOString().slice(0, 16);
          return localISOTime;
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
// app.use('/api/assignments', assignmentRoutes);

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
app.use('/', assignmentRoutes);

// provide public/ static shit
app.use(express.static(path.join(__dirname, 'public'), { index: false }));
app.use(express.static(path.join(__dirname, 'views'), { index: false }));

// err middleware *註: 這玩意最好得放在所有路由之後
app.use(logErrors);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running at http://127.0.0.1:${port}`);
});

// docker compose up -d --build 
// 新增移除學生功能
// 調整教室瀏覽權限 (原本只要有代碼 所有人都可以看所有教室, 現在調整成教室成員才有資格瀏覽)
// 新增

// todo: 
// 重要但不緊急的功能:
// . 教室一覽可能要多一個讓使用者明確知道哪些教室是加入的 哪些教室是自己建立的
// . 教室頁面設計

// 重要且緊急的功能:
// . 管理學生功能
//      (可以試著在新增課堂頁面新增一個選項 讓建立者自行決定學生加入課堂要不要審核)
//      (學生是不是應該也要有個退出教室功能)
//
// . 建立互評任務 (assignment) 功能
//      建立任務設定:
//        . 匿名性 如單盲或雙盲: (*註: 雙盲可能只有作業互評才用得到 課堂報告能用雙盲嗎 不行吧 總之我目前想像不出來)
//            (就算是提交作業用雙盲 有可能學生也會在作業裡面偷偷塞名字或暗號之類的) (我猜的 因為換作是我就會這樣搞)
//            (等一下 沒有 這玩意好像只有提交作業用得到)
//        . 自評 (self-assessment): 允不允許學生評自己
//        . 任務名稱
//        . 說明
//        . 截止日期
//        . 評分標準 (標準名稱、分數範圍)
//      老師做好的任務設定或許可以做成範本 供老師的其他課堂使用(甚至是匯出給其他老師用) 減少重複性的工作(不一定要做 但感覺在使用上很方便)
//
// . 互評任務結果統計資料設計:
//      針對被評分者 (個人表現):
//        老師看得到的:
//          排名
//          班級整體平均得分 (總分的平均)
//          班級整體平均得分 (每個標準的平均)
//          個別學生的平均得分 (總分的平均)
//          個別學生的平均得分 (每個標準的平均)
//          或許可以做一個 個別學生分數 之於 整體分數 的視覺化圖表
//
//        學生看得到的:
//          學生自己的平均總分得分
//          學生自己的平均個別標準得分
//          
//
//      針對評分者 (互評的品質):
//        評分者的分數一致性 (同一個對象, 不同評分者給分的離散程度(標準差之類的 我還不太懂 要稍微研究一下))
//        應該要有機制可以觀測出異常評分的學生
// 
//
//      每位學生需評鑑幾份作業/報告？ 這東西要不要讓老師來設定?
//      假設老師設定成 10 個 意即一位學生要評其他 10 位學生
//      如果平均分配作業 那麼一分報告應會被評幾次?
//
//      N = 老師設定一位學生的評分數量
//      S = 學生總數
//      T = 總報告數量
//      R = 報告總數(如果所有學生都提交的話 R 就會等於 S)
//      M = 一份作業會被評的次數
//      T = S * N
//      M = T / R
//      
//      新功能: 課堂即時回饋
//        老師匯入課綱 自動產生學生要回饋的任務 (或是老師想手動產生)
//        在課程的大章節、小章節中 做一個有點像聊天室的東西 (像是圖奇的聊天室、slido)
//          學生可以決定要不要匿名 
//          在別的同學提問後 如果有相同提問的可以按+1之類的
//        在課堂段落授課中、結束時檢視學生問題 讓學生給出回饋 
//          回饋內容需要 標準、分數、文字回饋
//          


// 假設 6 個學生 一個學生評 2 份作業:
//      A B C D E F
//      A: B、C
//      B: C、D
//      C: D、E
//      D: E、F
//      E: F、A
//      F: A、B


// * 未來可以考慮的功能: 
//    1. 掃 QR code 加入教室
//        (現在的頁面丟到手機上看會很醜, RWD 要重弄)
//    2. 老師匯入課綱直接生成教室、任務
//    3. 其他
// 待補充

// now doing: 設計互評任務資料表、設計fetch請求、後端 API and so on