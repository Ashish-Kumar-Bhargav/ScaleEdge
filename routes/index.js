var express = require("express");
var router = express.Router();
var mysql = require("mysql");
var bcrypt = require("bcrypt");
var con = require("../database");
const fileUpload = require('express-fileupload');
router.use(fileUpload());

//login
router.get("/", function (req, res, next) {
  res.render("login", { title: "scaleedge" });
});

router.post("/auth_login", function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;

  var sql = "CALL loginUser(?, ?);";

  con.query(sql, [email, password], function (err, result, fields) {
    if (err) throw err;

    var message = result[0][0].message;

    if (message === "Login successful.") {
      req.session.email = email;
      res.send({ success: true });
    } else {
      res.send({ success: false, message: "Invalid email or password." });
    }
  });
});


//registeration
router.get("/auth_reg", function (req, res, next) {
  res.render("register", { title: "scaleedge" });
});

router.post("/auth_reg", function (req, res, next) {
  var company_name = req.body.company_name;
  var address = req.body.address;
  var email = req.body.email;
  var mobile = req.body.mobile;
  var password = req.body.password;
  var cpassword = req.body.cpassword;
  var name = req.body.name;

  if (cpassword == password) {
    var insertSql = "CALL insert_company_user (?, ?, ?, ?, ?);";
    con.query(
      insertSql,
      [company_name, address, email, mobile, password, name],
      function (err, result, fields) {
        if (err) throw err;

        if (result.affectedRows > 0) {
          res.redirect("/");
        } else {
          res.redirect("/");
        }
      }
    );
  } else {
    res.redirect("/");
  }
});


//dashboard
router.get("/dashboard", (req, res) => {
  con.query("CALL user_master_fetchdata()", (err, rows) => {
    if (!err) {
      let removedUser = req.query.removed;
      res.render("dashboard", { rows: rows[0], removedUser });
    } else {
      console.log(err);
    }
    console.log("The data from user table: \n", rows[0]);
  });
});


//logout
router.get("/logout", function (req, res, next) {
  if (req.session.email) {
    req.session.destroy();
  }
  res.redirect("/");
});


//add user
router.get("/add", function (req, res, next) {
  res.render("adduser", { message: "Welcome, " + req.session.email });
});

router.post("/add", function (req, res, next) {
  var user_name = req.body.user_name;
  var email = req.body.email;
  var mobile = req.body.mobile;
  var password = req.body.password;
  var profileImage = req.files.Imagepath;
  var imageName = profileImage.name; 

  var insertSql = "CALL user_master_userformdata (?,?,?,?,?)";

  con.query(insertSql, [user_name, email, mobile, password, imageName], function (err, result, fields) {
    if (err) {
      console.error("An error occurred while adding the user:", err);
      res.redirect("/dashboard");
    } else {
      var imagePath = "public/profile/" + imageName;

      profileImage.mv(imagePath, function (err) {
        if (err) {
          console.error("Failed to save profile image:", err);
        }
      });

      if (result.affectedRows > 0) {
        console.log("User added successfully.");
        res.redirect("/dashboard");
      } else {
        res.redirect("/dashboard");
      }
    }
  });
});


//edit
router.get("/edit/:id", function (req, res, next) {
  var userId = req.params.id;

  var selectSql = "SELECT id, user_name, email, mobile FROM user_master WHERE id = ?";
  con.query(selectSql, [userId], function (err, result) {
    if (err) throw err;

    if (result.length > 0) {
      res.render("edit", {
        title: "scaleedge",
        user: result[0], 
      });
    } else {
      res.redirect("/dashboard");
    }
  });
});

router.post("/edit", function (req, res, next) {
  var userId = req.body.id;
  var user_name = req.body.user_name;
  var email = req.body.email;
  var mobile = req.body.mobile;
  var profileImage = req.files.profileImage;

  var updateSql =
    "CALL user_master_update_on (?, ?, ?, ?, ?)";
  con.query(updateSql, [userId, user_name, email, mobile, profileImage.name], function (err, result) {
    if (err) {
      console.error("An error occurred while updating the user:", err);
      res.redirect("/dashboard");
    } else {
      var imagePath = "public/profile/" + profileImage.name;

      profileImage.mv(imagePath, function (err) {
        if (err) {
          console.error("Failed to save profile image:", err);
        }
      });

      console.log("User updated successfully.");
      res.redirect("/dashboard");
    }
  });
});


//delete
router.get("/delete/:id", function (req, res, next) {
  var userId = req.params.id;

  var deleteSql = "CALL delete_data(?);";
  con.query(deleteSql, [userId], function (err, result) {
    if (err) throw err;

    console.log("User deleted:", userId);
    res.redirect("/dashboard?removed=true");
  });
});


//faceRecognition
router.get("/face", function (req, res, next) {
  res.render("face", { title: "sumit" });
});

router.post("/getimg", function (req, res, next) {
  var insertSql = "SELECT id, user_id, Imagepath FROM user_master;";
  con.query(insertSql, [], function (err, result, fields) {
    if (err) throw err;
    res.json(result);
  });
});

router.post("/storeFaceMatchResult", function (req, res, next) {
  var label = req.body.label;
  var distance = req.body.distance;
  var updateType = req.body.update_type;
  var user_id = label; 

  var insertSql = "CALL Attendance(?, ?, ?, ?)";
  con.query(insertSql, [user_id, updateType, distance, null], function (err, result) {
    if (err) {
      console.error("An error occurred while storing face match result:", err);
      res.status(500).json({ success: false, error: err });
    } else {
      console.log("Face match result stored:", result);
      res.json({ success: true });
    }
  });
});

router.post("/storeCheckoutTime", function (req, res, next) {
  var label = req.body.label;
  var updateType = "out";
  var latitude = req.body.latitude;
  var longitude = req.body.longitude;

  var selectSql = "SELECT id FROM user_master WHERE user_id = ?";
  con.query(selectSql, [label], function (err, result) {
    if (err) {
      console.error("An error occurred while retrieving user ID:", err);
      res.status(500).json({ success: false, error: err });
    } else {
      if (result.length > 0) {
        var user_id = result[0].id;

        var insertSql = "CALL Attendance(?, ?, ?, ?)";
        con.query(insertSql, [user_id, updateType, latitude, longitude], function (err, result) {
          if (err) {
            console.error("An error occurred while storing checkout time:", err);
            res.status(500).json({ success: false, error: err });
          } else {
            console.log("Checkout time stored for label:", label);
            res.json({ success: true });
          }
        });
      } else {
        console.error("User not found with label:", label);
        res.status(404).json({ success: false, error: "User not found" });
      }
    }
  });
});

router.post("/storeCheckinTime", function (req, res, next) {
  var label = req.body.label;
  var updateType = "in";
  var latitude = req.body.latitude;
  var longitude = req.body.longitude;

  var selectSql = "SELECT id FROM user_master WHERE user_id = ?";
  con.query(selectSql, [label], function (err, result) {
    if (err) {
      console.error("An error occurred while retrieving user ID:", err);
      res.status(500).json({ success: false, error: err });
    } else {
      if (result.length > 0) {
        var user_id = result[0].id;

        var insertSql = "CALL Attendance(?, ?, ?, ?)";
        con.query(insertSql, [user_id, updateType, latitude, longitude], function (err, result) {
          if (err) {
            console.error("An error occurred while storing check-in time:", err);
            res.status(500).json({ success: false, error: err });
          } else {
            console.log("Check-in time stored for label:", label);
            res.json({ success: true });
          }
        });
      } else {
        console.error("User not found with label:", label);
        res.status(404).json({ success: false, error: "User not found" });
      }
    }
  });
});


function getUserIDFromLabel(label) {
  var selectSql = "SELECT id FROM user_master WHERE user_id = ?";
  var result = con.query(selectSql, [label]);
  if (result.length > 0) {
    return result[0].id;
  } else {
    return null;
  }
}

module.exports = router;