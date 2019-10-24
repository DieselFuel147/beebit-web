const sqlite3 = require ('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

/* Constructor */
let db;
function Dbhelper(path) {
    db = new sqlite3.Database(path, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log("sucessfully connected to database.");
        }
    });
}

/* Functions on USERS table */
Dbhelper.prototype.getUsers = function(callback) {
    db.serialize(() => { db.all("SELECT * FROM USERS;", callback) });
};

Dbhelper.prototype.getUserByUsername = function(username, callback) {
    db.serialize(() => { db.all("SELECT * FROM USERS where username = ?;", username, callback); });
};

Dbhelper.prototype.addUser = function(username, fname, lname, authority, password, email, disconnectTime, callback) {
    const sql = "INSERT INTO USERS(username, fname, lname, authority, passwd, email, disconnectTime) VALUES (?, ?, ?, ?, ?, ?, ?);";
    const values = [username, fname, lname, authority, password, email, disconnectTime];

    db.serialize(function() {
        db.run(sql, values, callback);
    });
};

Dbhelper.prototype.deleteUser = function(username, callback) {
    /* remove all associated devices for this user */
    this.deleteDeviceByUSER (username, () => {
        db.serialize(() => { db.run("DELETE FROM USER WHERE username = ?;", username, callback) });
    });
};

Dbhelper.prototype.updateUserdetails = function(username, fname, lname, email, disconnectTime, callback) {
    const sql = "UPDATE USERS SET fname = ?, lname = ?, email = ?, disconnectTime = ? WHERE username = ?;";
    const values = [fname, lname, email, disconnectTime, username];

    db.serialize(function() {
        db.run(sql, values, callback);
    });
};

Dbhelper.prototype.updateUserpasswd = function(username, passwd, callback) {
    const sql = "UPDATE USERS SET passwd = ? WHERE username = ?;";
    const values = [passwd, username];

    db.serialize(function() {
        db.run(sql, values, callback);
    });
};

/* Functions on DEVICES table */
Dbhelper.prototype.getDevicesByUser = function(username, callback) {
    db.serialize(() => { db.all("SELECT username, description, reg_date, hex(uuid) as uuid, datetime(last_update, 'unixepoch', 'localtime') as last_update FROM DEVICES WHERE username = ?;", username, callback) });
};

Dbhelper.prototype.getDeviceStatusesByUser = function(username, callback) {
    db.serialize(() => { db.all("SELECT username, hex(uuid) as uuid, description, reg_date, time, people, dstatus FROM DEVICE_STATUS WHERE username = ?;", username, callback) });
};

Dbhelper.prototype.getDeviceStatusByUUID = function(uuid, callback) {
    db.serialize(() => { db.get("SELECT description, reg_date, time, people, dstatus FROM DEVICE_STATUS WHERE uuid = X'" + uuid + "';", callback) });
};

Dbhelper.prototype.getAllDevices = function(callback) {
    db.serialize(() => { db.all("SELECT username, description, reg_date, hex(uuid) as uuid, datetime(last_update, 'unixepoch', 'localtime') as last_update FROM DEVICES", callback) });
};

Dbhelper.prototype.getDeviceByUUID = function(uuid, callback) {
    const sql = "SELECT username, description, reg_date, hex(uuid) as uuid, datetime(last_update, 'unixepoch', 'localtime') as last_update FROM DEVICES WHERE uuid = X'" + uuid + "';";
    db.serialize(() => { db.get(sql, callback) });
};

Dbhelper.prototype.getDeviceConfigByUUID = function(uuid, callback) {
    const sql = "SELECT config, c_recieved, send_image FROM DEVICES WHERE uuid = X'" + uuid + "';";
    db.serialize(() => { db.get(sql, callback) });
};

Dbhelper.prototype.setDeviceConfigRecievedByUUID = function(uuid, callback) {
    const sql = "UPDATE DEVICES SET c_recieved = 1 WHERE uuid = X'" + uuid + "';";
    db.serialize(() => { db.run(sql, callback) });
}

Dbhelper.prototype.setDeviceConfigByUUID = function(uuid, new_config, callback) {
    const sql = "UPDATE DEVICES SET config = ?, c_recieved = 0 WHERE uuid = X'" + uuid + "';";
    db.serialize(() => { db.run(sql, new_config, callback) });
};

Dbhelper.prototype.deleteDeviceByUUID = function(uuid, callback) {
    const sql = "DELETE FROM DEVICES WHERE uuid = X'" + uuid + "';";
    db.serialize(() => { db.run(sql, callback) });
};

Dbhelper.prototype.deleteDeviceByUSER = function(username, callback) {
    const sql = "DELETE FROM DEVICES WHERE username = ?;";
    db.serialize(() => { db.all(sql, username, callback) });
};

Dbhelper.prototype.getDeviceStatisticsByUser = function(user, enddate, days, callback) {
    const sql = `SELECT hex(LOGS.uuid) as uuid, description, AVG(people) as average, MAX(people) as max, '${enddate}' as endDate
                    FROM LOGS JOIN DEVICES ON LOGS.uuid = DEVICES.uuid
                    WHERE date(rtime,'unixepoch','localtime') BETWEEN date(endDate, '-${days} days') AND endDate AND username=? GROUP BY LOGS.uuid;`
    db.serialize(() => { db.all(sql, user, callback) });
};

Dbhelper.prototype.getDeviceStatisticsByUuid = function(uuid, enddate, days, callback) {
    const sql = "SELECT AVG(people) as average, MAX(people) as max, ? as endDate FROM LOGS WHERE date(rtime,'unixepoch','localtime') BETWEEN date(endDate, '-" + days + " days') AND endDate AND uuid = ?;"
    db.serialize(() => { db.get(sql, enddate, uuid, callback) });
};

Dbhelper.prototype.addDevice = function(uuid, user, description = "", config, callback) {
    const sql = "INSERT INTO DEVICES(username, uuid, description, reg_date, last_update, config, c_recieved) VALUES(? , X'" + uuid + "', ?, date('now'), strftime('%s', 'now'), ?, ?);"
    db.serialize(() => { db.run(sql, user, description, config, 0, callback) });
};

Dbhelper.prototype.setDeviceImageRequested = function(uuid, requested, callback) {
    const sql = "UPDATE DEVICES SET send_image = ? WHERE uuid=X'" + uuid + "';";
    db.serialize(() => { db.run(sql, requested, callback) });
}

Dbhelper.prototype.storeImageForDevice = function(uuid, imageBase64, recordedTime, callback) { 
    const sql = "REPLACE INTO DEVICE_IMAGES(uuid, image, rtime) VALUES (X'" + uuid + "', ?, ?)";
    db.serialize(() => { db.run(sql, imageBase64, recordedTime, callback) });
}

Dbhelper.prototype.fetchImageForDevice = function(uuid, callback) {
    const sql = "SELECT * FROM DEVICE_IMAGES WHERE uuid = X'" + uuid + "';";
    db.serialize(() => { db.get(sql, callback) });
}

/* Functions on the LOGS table (Records from a device) */
Dbhelper.prototype.getAverageForDay = function(day, username, callback) {
    const sql = "SELECT date(rtime, 'unixepoch', 'localtime') as day, AVG(people) as average FROM LOGS WHERE day=? AND uuid IN (SELECT uuid FROM DEVICES WHERE username = ?) GROUP BY day;";
    db.serialize(() => { db.all(sql, day, username, callback) });
}

Dbhelper.prototype.getAverageForWeek = function(weekEnd, username, callback) {
    const sql = "SELECT AVG(people) as average, ? as endDate FROM LOGS WHERE date(rtime,'unixepoch','localtime') BETWEEN date(endDate, '-7 days') AND endDate AND uuid IN (SELECT uuid FROM DEVICES WHERE username = ?);";
    db.serialize(() => { db.get(sql, weekEnd, username, callback) });
}

Dbhelper.prototype.updateDeviceStatus = function(uuid, data, callback) {
    status =  "unknown";
    people_detected = 0;
    timestamp = (new Date()) / 1000;

    if (data.status) status = data.status;
    if (data.people) people_detected = data.people;
    if (data.timestamp) timestamp = data.timestamp;

    const sql = "INSERT INTO LOGS(uuid,rtime,people,dstatus) VALUES (X'" + uuid + "', " + timestamp + ",'"+people_detected+"','"+status+"');";
    const detectSql = "INSERT INTO DETECTIONS(uuid, trackId, rtime, x_pos, y_pos) VALUES (X'" + uuid + "', ?, ?, ?, ?);";
    
    db.serialize(() => { 
        db.run(sql, callback);

        // Insert all specific detections into the database
        if (data.trackers && data.trackers.length > 0) {
            data.trackers.forEach((tracker, index) => {
                db.run(detectSql, tracker.id, timestamp, tracker.x, tracker.y);
            });
        }

    });
};

Dbhelper.prototype.createNewKey = function(newKey, callback) {
    const sql = "INSERT INTO KEYS (key) VALUES (X'" + newKey + "')";
    db.serialize(() => { db.run(sql, callback) });
};

Dbhelper.prototype.checkKeyAvailable = function(uuid, callback) {
    const sql = "select * from (select key from KEYS where KEYS.key not in (select uuid from DEVICES)) where key = X'" + uuid + "';"
    db.serialize(() => { db.get(sql, callback) });
};

Dbhelper.prototype.getLogsByUUID = function(uuid, callback) {
    const sql = "select  datetime(rtime, 'unixepoch', 'localtime') as rtime, people, dstatus from LOGS where hex(uuid) = '" + uuid + "';";
    db.serialize(() => {db.all(sql, callback)});
}

// Methods to control the boxes related to a particular device
Dbhelper.prototype.getBoxesByUUID = function(uuid, callback) {
    const sql = "SELECT name, x_start AS x, y_start AS y, width, height FROM BOXES WHERE uuid = X'" + uuid + "';";
    db.serialize(() => {db.all(sql, callback)});
}

Dbhelper.prototype.getBoxCounts = function(uuid, recordedTime, callback) {
    const sql = `SELECT BOXES.name, COUNT(*) as count FROM DETECTIONS LEFT JOIN BOXES
                    ON DETECTIONS.uuid = BOXES.uuid
                    WHERE BOXES.uuid = X'${uuid}' AND rtime = ${recordedTime}
                    AND DETECTIONS.x_pos > BOXES.x_start AND DETECTIONS.x_pos < (BOXES.x_start + BOXES.width)
                    AND DETECTIONS.y_pos > BOXES.y_start AND DETECTIONS.y_pos < (BOXES.y_start + BOXES.height)
                    GROUP BY BOXES.name;`;
    
    db.serialize(() => {db.all(sql, callback)});
}

// NOTE: Callback is called for each inserted box
Dbhelper.prototype.setBoxesByUUID = function(uuid, boxes, callback) {
    // Remove all boxes in the database and replace them with the client's boxes
    const delete_sql = "DELETE FROM BOXES WHERE uuid = X'" + uuid + "';";
    const insert_sql = "INSERT INTO BOXES (uuid, name, x_start, y_start, width, height) VALUES (X'" + uuid + "', ?, ?, ?, ?, ?);";
    
    db.serialize(function() {
        db.run(delete_sql, callback);

        boxes.forEach(function (box) {
            db.run(insert_sql, box.name, box.x, box.y, box.width, box.height, callback);
        });
    });
}

module.exports = Dbhelper;