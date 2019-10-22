const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// Global variables for the dashboard. Use these to change behaviour
const settings = {
  update_timer : 1.0
}

// Number of seconds before a device is considered 'Disconnected'
const disconnectTime_default = 30;

let database
module.exports = function(db) {
  database = db;
  return router;
};

/* GET login. */
router.get('/login', function(req, res, next) {
  if (req.session.username) {
    res.redirect('/dashboard/');
    return;
  }

  res.render('dash/login', {
    layout: 'dash/form_layout',
    title: 'BeeBit Dashboard'
  });
});

/* GET register. */
router.get('/register', function(req, res, next) {
  res.render('dash/register', {
    layout: 'dash/form_layout',
    title: 'BeeBit Dashboard'
  });
});

// https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const saltRounds = 10;
/* POST register. */
router.post('/register', function(req, res, next) {
  let username = req.body["username"];
  let password = req.body["password"];
  let email = req.body["email"];
  let confirm_password = req.body["cpassword"];
  let firstname = req.body["firstname"];
  let lastname = req.body["lastname"];

  var errors = "";

  if (email.length == 0) errors += "Email is required\n";
  else if (!validateEmail(email)) errors += "Email is invalid\n";
  if (lastname.length == 0 || firstname.length == 0) errors += "First name and last name are required\n";
  if (password.length == 0 || confirm_password .length == 0) errors += "Password is required\n";
  else if (password.length < 5) errors += "Password must be at least 5 characters\n";
  else if (password != confirm_password) errors += "Passwords do not match\n";

  if (errors.length != 0) { 
    errors = errors.slice(0, -1)
    res.status(400).end(errors); 
    return; 
  }

  database.getUserByUsername(username, function (err, rows) {
    if (rows.length == 0) {
      bcrypt.hash(password, saltRounds, function(err, hash) {
        database.addUser(username, firstname, lastname, 'USER', hash, email, disconnectTime_default, (err) => {
          if (err) {
            res.status(500).end("Error creating account");
          } else {
            res.end("Account Created!");
          }
        });
      });
    } else {
      res.status(400).end("Account by that username exists");
    }
  });
});

/* POST login. */
router.post('/login', function(req, res, next) {
  if (req.session.username) {
    res.redirect('/dashboard');
    return;
  }

  let username = req.body["username"];
  let password = req.body["password"];

  var errors = "";

  if (username.length == 0) errors += "username field is empty\n";
  if (password.length == 0) errors += "password field is empty\n";

  if (errors.length != 0) { 
    errors = errors.slice(0, -1)
    res.status(400).end(errors); 
    return; 
  }

  /* Find user */
  database.getUserByUsername(username, function (err, rows) {
    console.log("attempting search for: " + username + " " + password + " in db");
    if (err) {
      console.log ("db error");
      console.error(err);
    } 
    else{
        
        rows.forEach(function(row) {
          console.log ("found");
          bcrypt.compare(password, row.passwd, function(err2, result) {
            if (result === true)
            {
              console.log("Successful login: " + username);
              req.session.disconnectTime = row.disconnectTime;
              req.session.username = row.username;
              req.session.fname = row.fname;
              req.session.lname = row.lname;
              req.session.usertype = row.authority;
              req.session.email = row.email;
              res.send(200).end("Successful login!");
            }
            else {
              res.status(400).end("Invalid password for user: " + username);
            }
            }); 
        });
    }
    setTimeout(function(){ res.status(403).end("Invalid login"); }, 500);
        
  });
  
});

/* GET Account Settings */
router.get('/AccountSettings', function(req, res, next) {
  if (!req.session.username) {
    res.redirect("/dashboard/login");
    return;
  }
  database.getDevicesByUser(req.session.username, (err, devices) => {
    res.render('dash/accountSettings', {
      layout: 'dash/layout',
      title: 'Account Settings',
      userinfo: {
        fname: req.session.fname, 
        lname: req.session.lname, 
        username: req.session.username,
        email: req.session.email,
        disconnectTime: req.session.disconnectTime
      },
      devices: devices,
      dashSettings: settings
    });
  });
});

/* POST Account Settings */
router.post('/AccountSettings', function(req, res, next) {
  if (!req.session.username) {
    res.redirect("/dashboard/login");
    return;
  }

  let passwd_need_update = (req.body["update_passwd"] == 'true');
 
  let firstname = req.body["fname"];
  let lastname = req.body["lname"];
  let email = req.body["email"];
  let password = req.body["password"];
  let confirm_password = req.body["password_confirm"];
  let disconnectTime = parseInt(req.body["disconnectTime"]);

  var errors = "";

  // input validation
  if (email.length == 0) errors += "Email is required\n";
  else if (!validateEmail(email)) errors += "Email is invalid\n";
  if (lastname.length == 0 || firstname.length == 0) errors += "first name, last name are required\n";
  if (isNaN(disconnectTime)) errors += "Password is required\n";
  else if (disconnectTime < 0) errors += 'DisconnectTime must be positive\n'

  if (passwd_need_update) {
    if (password.length == 0 || confirm_password .length == 0) errors += "Password is required\n";
    else if (password.length < 5) errors += "Password must be at least 5 characters\n";
    else if (password != confirm_password) errors += "Passwords do not match\n";
  }
  
  // return errors if any
  if (errors.length != 0) { 
    errors = errors.slice(0, -1);
    res.status(400).end(errors); 
    return; 
  }

  // save changes
  if (passwd_need_update) {
    // encrypt new password
    bcrypt.hash(password, saltRounds, function(err, hash) {
      // update new password
      database.updateUserpasswd(req.session.username, hash, (err) => {
        if (err) {res.status(500).end("Failed to update password");}
        else {
          // update other user details
          database.updateUserdetails(req.session.username, firstname, lastname, email, disconnectTime, (err) => {
            if (err) {res.status(500).end("Failed to update new details");}
            else {
              res.status(200).end("New details saved");
              req.session.disconnectTime = disconnectTime;
              req.session.fname = firstname;
              req.session.lname = lastname;
              req.session.email = email;
            }
          });
        }
      })
    });
  }
  else {
    // update other user details
    database.updateUserdetails(req.session.username, firstname, lastname, email, disconnectTime, (err) => {
      if (err) {res.status(500).end("Failed to update new details");}
      else {
        req.session.disconnectTime = disconnectTime;
        req.session.fname = firstname;
        req.session.lname = lastname;
        req.session.email = email;
        res.status(200).end("New details saved");}
    });
  }
});

/* GET logout. */
router.get('/logout', function(req, res, next) {
  /* Destroy session uuid and redirect user to login page */
  req.session.destroy(() => {
    res.redirect("/dashboard/login")
  })
});

/* GET dashboard. */
router.get('/', function(req, res, next) {
  if (!req.session.username) {
    res.redirect("/dashboard/login");
    return;
  }

  database.getDevicesByUser(req.session.username, (err, devices) => {
    // Render the view with no devices initially.
    res.render('dash/index', {
      layout: 'dash/layout',
      title: 'BeeBit Dashboard',
      devices: devices,
      dashSettings: settings,
      userinfo: {fname: req.session.fname, lname: req.session.lname, username: req.session.username}
    });
  });
});

/* GET Stats */
router.get('/stats', function(req, res, next) {
  if (!req.session.username) {
    res.redirect("/dashboard/login");
    return;
  }
  database.getDevicesByUser(req.session.username, (err, devices) => {
    // Render the view with no devices initially.
    res.render('dash/stats', {
      layout: 'dash/layout',
      title: 'BeeBit Stats',
      devices: devices,
      userinfo: {fname: req.session.fname, lname: req.session.lname, username: req.session.username},
      dashSettings: settings
    });
  });
});

/* GET view specific bee. */
router.get('/bees/:beeId', function(req, res, next) {
  if (!req.session.username) {
    res.redirect("/dashboard/login");
    return;
  }

  let beeId = req.params.beeId;

  database.getDevicesByUser(req.session.username, function(err, devices) {
    database.getDeviceByUUID(beeId, function(err, currentDevice) {
      if (err) {
        res.statusCode(404).end();
        return;
      }

      res.render('dash/bee', {
        layout: 'dash/layout',
        title: 'Page',
        userinfo: {fname: req.session.fname, lname: req.session.lname, username: req.session.username},
        uuid: beeId,
        devices: devices,
        currDevice: currentDevice
      });
    });
  });
});

/* GET view logs for specific bee. */
router.get('/bees/:beeId/logs', function(req, res, next) {
  if (!req.session.username) {
    res.redirect("/dashboard/login");
    return;
  }

  let beeId = req.params.beeId;

  database.getDevicesByUser(req.session.username, function(err, devices) {
    database.getDeviceByUUID(beeId, function(err, currentDevice) {
      database.getLogsByUUID(beeId, function(err, logs){  
        if (err) {
          res.statusCode(404).end();
          return;
        }
        res.render('dash/logs', {
          layout: 'dash/layout',
          title: 'View Log',
          devices: devices,
          currDevice: currentDevice,
          logs: logs,
          userinfo: {fname: req.session.fname, lname: req.session.lname, username: req.session.username}
        });
      });
    });
  });
});

/* GET specific bee's boxes page. */
router.get('/bees/:beeId/boxes', function(req, res, next) {
  if (!req.session.username) {
    res.redirect("/dashboard/login");
    return;
  }

  let beeId = req.params.beeId;

  database.getDevicesByUser(req.session.username, function(err, devices) {
    database.getDeviceByUUID(beeId, function(err, currentDevice) {
      if (err) {
        res.statusCode(404).end();
        return;
      }

      res.render('dash/boxes', {
        layout: 'dash/layout',
        title: 'Page',
        userinfo: {fname: req.session.fname, lname: req.session.lname, username: req.session.username},
        uuid: beeId,
        devices: devices,
        currDevice: currentDevice
      });
    });
  });
});

/* GET configure bee. */
router.get('/bees/:beeId/configure', function(req, res, next) {
  if (!req.session.username) {
    res.redirect("/dashboard/login");
    return;
  }
  let beeId = req.params.beeId;

  database.getDevicesByUser(req.session.username, function(err, devices) {
    database.getDeviceByUUID(beeId, function(err, currentDevice) {
      if (err) {
        res.statusCode(404).end();
        return;
      }

      res.render('dash/configure', {
        layout: 'dash/layout',
        title: 'Configure',
        userinfo: {fname: req.session.fname, lname: req.session.lname, username: req.session.username},
        uuid: beeId,
        devices: devices,
        currDevice: currentDevice
      });
    });
  });
});

/* POST configure bee - update config */
router.post('/bees/:beeId/configure', function(req, res, next) {
  let beeId = req.params.beeId;
  let config = req.body["config"];

  if (!beeId) {
    res.status(400).end("beeID required");
    return;
  }
  if (config == undefined) {
    res.status(400).end("no config data was passed");
    return;
  }

  database.getDevicesByUser(req.session.username, function(err, devices) {
    database.getDeviceByUUID(beeId, function(err, currentDevice) {
      if (err) {
        res.status(404).end("device not found");
        return;
      }

      database.setDeviceConfigByUUID(beeId, config, function (err) {
        if (err) {
          res.status(500).end('Failed to update config');
          return;
        }
        res.status(200).end("Config update success");
      })
    });
  });
});


/* GET device register page. */
router.get('/register-a-bee', function(req, res, next) {
  if (!req.session.username) {
    res.redirect("/dashboard/login");
    return;
  }

  database.getDevicesByUser(req.session.username, (err, devices) => {
    res.render('dash/registerdevice', {
      layout: 'dash/layout',
      title: 'BeeBit Dashboard',
      devices: devices,
      dashSettings: settings,
      userinfo: {fname: req.session.fname, lname: req.session.lname, username: req.session.username}
    });
  });
});

const default_config = 'frequency=20|model=dnn/yolov3.weights|config=dnn/config.cfg|confidence=0.2|skipFrames=5|raspi=0|imageWidth=320|imageHeight=240|useOpenCL=1|useCSRT=0|neuralNetQuality=416|maxDisappeared=50|searchDistance=50'

/* POST device register page. */
router.post('/register-a-bee', function(req, res, next) {
  if (!req.session.username) {
    res.redirect("/dashboard/login");
    return;
  }
  
  let uuid = req.body["uuid"];
  let description = req.body["description"];

  // Regex validate hex and len is 32 chars.
  if (!(/^[0-9A-F]{32}$/i.test(uuid))) {
    res.status(400).end('Invalid key format *must be 32 character hexadecimal');
    return;
  }

  if (description == '') description = uuid;

  database.getDeviceByUUID(uuid, (err, device) => {
    if (err || !device) {
      console.log(err);
      database.checkKeyAvailable(uuid, (err, rows) => {
        if (err || rows.length == 0) {
          res.status(400).end('Invalid key');
        } else {
          config = ('uuid=' + uuid  + '|' + default_config);
          database.addDevice(uuid, req.session.username, description, config, (err) => {
            if (err) res.status(500).end('error adding device')
            else res.status(200).end('Device Linked')
          })
        }
      });
    } else {
      msg = 'Key already in use';
      if (device.username == req.session.username) msg = 'The device is already linked to your account';
      res.status(400).end(msg);
    }
  });
});