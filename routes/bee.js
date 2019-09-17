const express = require('express');
const router = express.Router();

let database
module.exports = function(db) {
  database = db;
  return router;
};

function userHasDevice(username, uuid) {
  return new Promise(function (resolve, reject) {
    database.getDevicesByUser(username, (err, devices) => {
      if (devices.some(function(device) {
        device.uuid === uuid;
      })) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

// Gets the average of all logs for a specific day
router.get('/avg/day/:day', function(req, res, next) {
  if (!req.session.username) {
    res.sendStatus(403).end();
    return;
  }

  var day = req.params.day;

  database.getAverageForDay(day, req.session.username, function getAverage(err, data) {
    if (err || data.length == 0) {
      res.status(404).end('No records exist for day.');
    } else {
      res.json(data[0]);
    }
  });

});

// Gets the average detection for an entire week, ending on the specified day
router.get('/avg/week/:day', function(req, res, next) {
  if (!req.session.username) {
    res.sendStatus(403).end();
    return;
  }

  var day = req.params.day;

  database.getAverageForWeek(week, req.session.username, function getAverage(err, week) {
    if (err) {
      res.statud(404).end('No records exist for week.');
    } else {
      res.json(week);
    }
  });
});

// Returns status for all devices for the specified user
router.get('/status', function (req, res, next) {
  if (!req.session.username) {
    res.status(403).end();
    return;
  }
  
  // Return a JSON document for the registered user with all specified devices for this user
  database.getDeviceStatusesByUser(req.session.username, (err, rows) => {
    devices = rows;
    if (err) {
      res.status(404).end('Error fetching results.');
    } else {
      res.json({
        devices: devices
      });
    }
  
  });
});

// Returns statistics for a single device
router.post('/stats/', async function(req, res, next) {
  if (!req.session.username) {
    res.sendStatus(403).end();
    return;
  }

  if (!req.body) {
    res.status(400).end('Provide a valid date body');
    return;
  }

  var hasDevice = await userHasDevice(req.session.username, req.body.uuid);

  if (!hasDevice) {
    res.status(403).end('User not registered to device.');
    return;
  }

  database.getDevicesStatisticsByUUID(req.uuid, req.body.enddate, req.body.days, (err, stats) => {
    if (err) {
      res.status(404).end('Device UUID not found.');
    } else {
      // Return a set of statistics for the device in a JSON document
      res.json(stats);
    }
  });

});

/* POST update. */
router.post('/update', function(req, res, next) {
  
  /* If there is no session */
  if (!req.session.uuid) {
    /* Create session from sent uuid */ 
    database.getDeviceByUUID(req.body.uuid, (err, device) => {
      if (err || !device) {
        res.status(404).end('device uuid not found or not registered to an account.');
      } else {
        req.session.uuid = device.uuid;
        database.updateDeviceStatus(req.session.uuid, req.body);
        res.status(200).end('status updated');
      }
    });
    return;
  }

  database.updateDeviceStatus(req.session.uuid, req.body);
  res.status(200).end('status updated');
});