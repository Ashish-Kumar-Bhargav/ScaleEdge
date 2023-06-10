var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var db = require('./database');
// var flash = require('express-flash')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: 'webslesson',
  resave: true,
  saveUninitialized: true
}));
// app.use(flash())

app.use('/', indexRouter);
// app.use('/', usersRouter);
app.post('/login', function (req, res, next) {
  var name = req.body.name
  var id = req.body.id
  var id1 = req.body.id1
  var email = req.body.email
  var number = req.body.number
  var password = req.body.password
  var deleted_by = req.body.deleted_by
  var created_on = req.body.created_on
  var created_by = req.body.created_by
  var updated_on = req.body.updated_on
  var updated_by = req.body.updated_by
  var deleted_on = req.body.deleted_on
  var deleted_by_1 = req.body.deleted_by_1

  // var message = req.body.message
  var sql = `INSERT INTO users1 (name,id, email, number, password, id1,deleted_by,created_on,created_by, updated_on, updated_by,deleted_on,deleted_by_1) VALUES ("${name}", "${id}", "${email}","${number}","${password}","${id1}","${deleted_by}","${created_on}","${created_by}" ,"${updated_on}","${updated_by}","${deleted_on}","${deleted_by_1}" )`
  db.query(sql, function (err, result) {
    if (err) throw err
    console.log('Row has been updated')
    req.flash('success', 'Data stored!')
    res.redirect('/')
  })
})

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

app.get('/index1',function(req, res, next)
{
  res.redirect('E:\\login\\views\\index1.ejs')
})

app.listen(5000, () => {
  console.log('Listening on port 3000...');
});




module.exports = app;
