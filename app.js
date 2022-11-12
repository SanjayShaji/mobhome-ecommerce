const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');
const hbs = require('express-handlebars');
const db = require('./config/connection')
const session = require('express-session');
const app = express();


const hbsHelper = require('./helpers/hbs-helpers')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs', hbs.engine({ 
  extname: 'hbs', 
  defaultLayout: 'layout', 
  layoutsDir: __dirname + '/views/layout/', 
  partialsDir: __dirname + '/views/partials/',
  helpers: hbsHelper

}))  
  
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); 
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//////////////////////////////////////////////////////////
app.use(session({ secret: "key", resave: false, saveUninitialized: false, 
// cookie: { maxAge: 600000 } 
}))

app.use((req, res, next) => {
  res.set('cache-control', 'no-store')
  next();
}) 
//////////////////////////////////////////////////////////
db.connect((err) => {
  if (err) throw err;
  console.log("database connected")
})

app.use('/admin', adminRouter);
app.use('/', usersRouter);

app.get('/*', (req,res)=>{
  res.render('star')
})

// app.get('/:id', (req,res)=>{
//   res.render('star')
// })

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
