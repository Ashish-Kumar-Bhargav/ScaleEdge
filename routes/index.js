var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var con = require('../database');

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.session.flag == 1) {
    req.session.destroy();
    res.render('index', { title: 'scaleedge', message: 'Email Already Exists', flag: 1 });
  }
  else if (req.session.flag == 2) {
    req.session.destroy();
    res.render('index', { title: 'scaleedge', message: 'Registration Done. Please Login.', flag: 0 });
  }
  else if (req.session.flag == 3) {
    req.session.destroy();
    res.render('index', { title: 'scaleedge', message: 'Confirm Password Does Not Match.', flag: 1 });
  }
  else if (req.session.flag == 4) {
    req.session.destroy();
    res.render('index', { title: 'scaleedge', message: 'Incorrect Email or Password.', flag: 1 });
  }
  else {
    res.render('index', { title: 'scaleedge' });
  }

});

//Handle POST request for User Registration
router.post('/auth_reg', function (req, res, next) {
  var company_name = req.body.company_name;
  var address = req.body.address;
  var email = req.body.email;
  var mobile = req.body.mobile;
  var password = req.body.password;
  var cpassword = req.body.cpassword;
  var name = req.body.name;
  if (cpassword == password) {
    var sql = 'select * from user_master where email = ?;';
    con.query(sql, [email], function (err, result, fields) {
      if (err) throw err;

      if (result.length > 0) {
        req.session.flag = 1;
        res.redirect('/');
      } else {
        // var hashpassword = bcrypt.hashSync(password, 10);
        //var sql = 'insert into user(company_name,email,password, name , address , mobile) values(?,?,?, ?, ?,?);';
        var sql = 'CALL insert_company_user (?,?,?,?,?);';
        //con.query(sql,[company_name,email, hashpassword, name , address , mobile], function(err, result, fields){
        con.query(sql, [company_name, address, email, mobile, password, name], function (err, result, fields) {
          if (err) throw err;
          req.session.flag = 2;
          res.redirect('/');
        });
      }
    });
  } else {
    req.session.flag = 3;
    res.redirect('/');
  }
});


// Handle POST request for User Login
router.post('/auth_login', function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;

  var sql = 'CALL loginUser(?, ?);';

  con.query(sql, [email, password], function (err, result, fields) {
    if (err) throw err;

    var message = result[0][0].message;

    if (message === 'Login successful.') {
      req.session.email = email;
      res.redirect('/home');
    } else {
      req.session.flag = 4;
      res.redirect('/');
    }
  });
});








//Route For Home Page
router.get('/home', function (req, res, next) {
  res.render('home', { message: 'Welcome, ' + req.session.email });
});

router.get('/logout', function (req, res, next) {
  if (req.session.email) {
    req.session.destroy();
    res.redirect('/');
  }
})



// router.post('/user',function(req, res, next)
// {
//   res.redirect('E:\\login\\views\\error.ejs')
// })

module.exports = router;
