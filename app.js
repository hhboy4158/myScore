require('dotenv').config();

const express = require('express');

// google login
const session = require('express-session');
const passport = require('passport');

// /utlis/passport.js
require('./src/utils/passport');

const { create } = require('express-handlebars');
const path = require('path');
const app = express();
const port = 3000;


// db connection
const db = require('./src/utils/db');


// middlewares
const logger = require('./src/middlewares/logger');
const errorHandler = require('./src/middlewares/errorHandler');
const { requireLogin, redirectIfLoggedIn } = require('./src/middlewares/auth');

// routes
const assignmentRoutes = require('./src/routes/assignments');
const loginRoutes = require('./src/routes/login');
const dashboardRoutes = require('./src/routes/dashboard');
const authRoutes = require('./src/routes/auth');


// veiw engine setting
const hbs = create({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials')
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// API Router
app.use('/api/assignments', assignmentRoutes);




//google login section
app.use(session({
  secret: 'guessmyfuckingsecretyoubastard',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Router
app.get('/', (req, res) => {
  return res.render('home', { title: 'myScore', user: req.user });
});

app.use('/', loginRoutes);
app.use('/', dashboardRoutes);
app.use('/', authRoutes);


// provide public/ static shit
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// run system command: docker compose up --build