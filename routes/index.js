var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var con = require('../database');

router.get('/', function (req, res, next) {
  res.render('login', { title: 'scaleedge' });
});

router.get('/auth_reg', function (req, res, next) {
  res.render('register', { title: 'scaleedge' });
});

router.post('/auth_reg', function (req, res, next) {
  var company_name = req.body.company_name;
  var address = req.body.address;
  var email = req.body.email;
  var mobile = req.body.mobile;
  var password = req.body.password;
  var cpassword = req.body.cpassword;
  var name = req.body.name;

  if (cpassword == password) {
    var insertSql = 'CALL insert_company_user (?, ?, ?, ?, ?);';
    con.query(insertSql, [company_name, address, email, mobile, password, name], function (err, result, fields) {
      if (err) throw err;

      if (result.affectedRows > 0) {
        res.redirect('/');
      } else {
        res.redirect('/');
      }
    });
  } else {
    res.redirect('/');
  }
});



router.get('/auth_login', (req, res) => {
  con.query('SELECT * FROM user_master', (err, rows) => {
    if (!err) {
      let removedUser = req.query.removed;
      res.render('dashboard', { rows, removedUser });
    } else {
      console.log(err);
    }
    console.log('The data from user table: \n', rows);
  });
});

router.post('/auth_login', function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;

  var sql = 'CALL loginUser(?, ?);';

  con.query(sql, [email, password], function (err, result, fields) {
    if (err) throw err;

    var message = result[0][0].message;

    if (message === 'Login successful.') {
      req.session.email = email;
      res.send({ success: true });
    } else {
      res.send({ success: false, message: 'Invalid email or password.' });
    }
  });
});

router.get('/logout', function (req, res, next) {
  if (req.session.email) {
    req.session.destroy();
  }
  res.redirect('/');
});

router.get('/add', function (req, res, next) {
  res.render('adduser', { message: 'Welcome, ' + req.session.email });
});

router.get('/edit', function (req, res, next) {
  res.render('edit', { message: 'Welcome, ' + req.session.email });
});

// router.get('/register', function (req, res, next) {
//   res.render('error', { message: 'Welcome, ' + req.session.email });
// });

module.exports = router;