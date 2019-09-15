const express = require('express');
const router = express.Router();

let database
module.exports = function(db) {
  database = db;
  return router;
};

// Returns statistics for all devices
router.get('/stats', function (req, res, next) {
  if (!req.session.username) {
    res.sendStatus(403).end();
    return;
  }
  
  // Return a JSON document for the registered user with all specified devices for this user
  database.getDevicesByUser(req.session.username, (err, rows) => {
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

  database.getDeviceByUUID(deviceUuid, (err, rows) => {
    if (err || rows.length == 0) {
      res.status(404).end('Device UUID not found.');
    } else {
      // Return a set of statistics for the device in a JSON document
      res.json({
        count: rows[0].people,
        status: rows[0].status,
        lastUpdate: rows[0].last_update
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