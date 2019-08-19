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

Dbhelper.prototype.addUser = function(username, fname, lname, authority, password, callback) {
    const sql = "INSERT INTO USERS(username, fname, lname, authority, passwd) VALUES (?, ?, ?, ?, ?);";
    const values = [username, fname, lname, authority, password];

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

/* Functions on DEVICES table */
Dbhelper.prototype.getDevicesByUser = function(username, callback) {
    db.serialize(() => { db.all("SELECT username, description, reg_date, hex(uuid) as uuid, datetime(last_update, 'unixepoch', 'localtime') as last_update, status, people FROM DEVICES WHERE username = ?;", username, callback) });
};

Dbhelper.prototype.getAllDevices = function(callback) {
    db.serialize(() => { db.all("SELECT username, description, reg_date, hex(uuid) as uuid, datetime(last_update, 'unixepoch', 'localtime') as last_update, status, people FROM DEVICES", callback) });
};

Dbhelper.prototype.getDeviceByUUID = function(uuid, callback) {
    const sql = "SELECT username, description, reg_date, hex(uuid) as uuid, datetime(last_update, 'unixepoch', 'localtime') as last_update, status, people FROM DEVICES WHERE uuid = X'" + uuid + "';";
    db.serialize(() => { db.all(sql, callback) });
};

Dbhelper.prototype.deleteDeviceByUUID = function(uuid, callback) {
    const sql = "DELETE FROM DEVICES WHERE uuid = X'" + uuid + "';";
    db.serialize(() => { db.run(sql, callback) });
};

Dbhelper.prototype.deleteDeviceByUSER = function(username, callback) {
    const sql = "DELETE FROM DEVICES WHERE username = ?;";
    db.serialize(() => { db.all(sql, username, callback) });
};

Dbhelper.prototype.updateDeviceStatus = function(uuid, data, callback) {
    status =  "unknown";
    people_detected = 0;
    if (data.status) status = data.status;
    if (data.people) people_detected = data.people;
    const sql = "UPDATE DEVICES SET last_update = strftime('%s', 'now'), people = ?, status = ? WHERE uuid = X'" + uuid + "';";
    db.serialize(() => { db.get(sql, people_detected, status, callback) });
};

Dbhelper.prototype.addDevice = function(uuid, user, description = "", callback) {
    const sql = "INSERT INTO DEVICES(username, uuid, description, reg_date, last_update, status, people) VALUES(? , X'" + uuid + "', ?, date('now'), strftime('%s', 'now'), 'linked', 0);"
    db.serialize(() => { db.run(sql, user, description, callback) });
};

Dbhelper.prototype.checkKeyAvailable = function(uuid, callback) {
    const sql = "select * from (select key from KEYS where KEYS.key not in (select uuid from DEVICES)) where key = X'" + uuid + "';"
    db.serialize(() => { db.get(sql, callback) });
};

module.exports = Dbhelper;