const express = require('express');
const router = express.Router();

let database
module.exports = function(db) {
  database = db;
  return router;
};

// Gets the average of all logs for a specific day
router.get('/avg/:day', function(req, res, next) {
  if (!req.session.username) {
    res.sendStatus(403).end();
    return;
  }

  var day = req.params.day;

  database.getAverageForDay(day, req.session.username, function getAverage(err, data) {
    if (err || data.length == 0) {
      res.sendStatus(404).end();
    } else {
      res.json(data[0]);
    }
  });

});

// Returns statistics for all devices
router.get('/stats', function (req, res, next) {
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
router.get('/stats/:deviceId', function(req, res, next) {
  var deviceUuid = req.params.deviceId;

  database.getDevicesStatusByUUID(deviceUuid, (err, rows) => {
    if (err || rows.length == 0) {
      res.status(404).end('Device UUID not found.');
    } else {
      // Return a set of statistics for the device in a JSON document
      res.json({
        count: rows[0].people,
        status: rows[0].dstatus,
        lastUpdate: rows[0].rtime
      });
    }
  });

});

/* POST update. */
router.post('/update', function(req, res, next) {
  
  /* If there is no session */
  if (!req.session.uuid) {
    /* Create session from sent uuid */ 
    database.getDeviceByUUID(req.body.uuid, (err, rows) => {
      if (err || rows.length == 0) {
        res.status(404).end('device uuid not found or not registered to an account.');
      } else {
        req.session.uuid = rows[0].uuid;
        database.updateDeviceStatus(req.session.uuid, req.body);
        res.status(200).end('status updated');
      }
    });
    return;
  }

  database.updateDeviceStatus(req.session.uuid, req.body);
  res.status(200).end('status updated');
});