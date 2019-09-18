const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// Global variables for the dashboard. Use these to change behaviour
const settings = {
  update_timer : 1.0
}

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

/* POST register. */
router.post('/register', function(req, res, next) {
  // Todo: min character checks
  let username = req.body["username"];
  let password = req.body["password"];
  let confirm_password = req.body["cpassword"];
  let firstname = req.body["firstname"];
  let lastname = req.body["lastname"];

  if (password != confirm_password) {
    res.end("Passwords do not match"); return;
  }
  const saltRounds = 10;


  database.getUserByUsername(username, function (err, rows) {
    if (rows.length == 0) {
      bcrypt.hash(password, saltRounds, function(err, hash) {
        database.addUser(username, firstname, lastname, 'USER', hash, (err) => {
          if (err) {
            res.status(500).end("Error creating account");
          } else {
            res.end("Account Created");
          }
        });
      });
    } else {
      res.end("Account by that username exists");
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
              req.session.username = row.username;
              req.session.fname = row.fname;
              req.session.lname = row.lname;
              req.session.usertype = row.authority;
              res.redirect("/dashboard");
              res.end();
            }
            else {
              res.end("Invalid password for user: " + username);
            }
            }); 
        });
    }
    setTimeout(function(){ res.status(403).end("Invalid login"); }, 500);
        
  });
  
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

  database.getUserByUsername(req.session.username, (err, users) => {

    database.getDevicesByUser(req.session.username, (err, devices) => {
      // Render the view with no devices initially.
      res.render('dash/index', {
        layout: 'dash/layout',
        title: 'BeeBit Dashboard',
        userinfo: users[0],
        devices: devices,
        dashSettings: settings
      });
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
    res.render('dash/stats', {
      layout: 'dash/layout',
      title: 'BeeBit Stats',
      devices: devices
    });
  });
});

/* GET view specific bee. */
router.get('/bees/:beeId', function(req, res, next) {
  let beeId = req.params.beeId;

  database.getDevicesByUser(req.session.username, function(err, devices) {
    database.getDeviceByUUID(beeId, function(err, currentDevice) {
      if (err) {
        res.statusCode(404).end();
        return;
      }

      res.render('dash/logs', {
        layout: 'dash/layout',
        title: 'View Log',
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


/* GET register. */
router.get('/register-a-bee', function(req, res, next) {
  if (!req.session.username) {
    res.redirect("/dashboard/login");
    return;
  }

  res.render('dash/registerdevice', {
    layout: 'dash/form_layout',
    title: 'BeeBit Dashboard'
  });
});

const default_config = 'frequency=20|model=dnn/yolov3.weights|config=dnn/config.cfg|confidence=0.2|skipFrames=5|raspi=0|imageWidth=320|imageHeight=240|useOpenCL=1|useCSRT=0|neuralNetQuality=416|maxDisappeared=50|searchDistance=50'
/* POST register. */
router.post('/register-a-bee', function(req, res, next) {
  if (!req.session.username) {
    res.redirect("/dashboard/login");
    return;
  }
  
  // Todo: min character checks
  let uuid = req.body["uuid"];
  let description = req.body["description"];

  database.getDeviceByUUID(uuid, (err, device) => {
    if (err || !device) {
      console.log(err);
      database.checkKeyAvailable(uuid, (err, rows) => {
        if (err || rows.length == 0) {
          res.status(200).end('Invalid key');
        } else {
          config = ('uuid=' + uuid  + '|' + default_config);
          database.addDevice(uuid, req.session.username, description, config, (err) => {
            if (err) res.status(500).end('error adding device')
            else res.redirect("/dashboard");
          })
        }
      });
    } else {
      msg = 'Key already in use';
      if (device.username == req.session.username) msg = 'The device is already linked to your account';
      res.status(200).end(msg);
    }
  });
});