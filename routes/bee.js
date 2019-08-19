const express = require('express');
const router = express.Router();

let database
module.exports = function(db) {
  database = db;
  return router;
};

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