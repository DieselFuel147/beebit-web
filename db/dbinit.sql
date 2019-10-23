/* Drop schema */
DROP TABLE IF EXISTS LOGS;
DROP TABLE IF EXISTS DEVICES;
DROP TABLE IF EXISTS USERS;
DROP TABLE IF EXISTS KEYS;
DROP TABLE IF EXISTS AUTHORITIES;
DROP VIEW IF EXISTS DEVICE_STATUS;

/* Create schema */
CREATE TABLE AUTHORITIES(
	authority	VARCHAR(20)     NOT NULL,
	CONSTRAINT AUTHORITIES_PKEY PRIMARY KEY(authority));

CREATE TABLE USERS(
	username	VARCHAR(10)     NOT NULL,
	fname		VARCHAR(20)     NOT NULL,
	lname		VARCHAR(20)     NOT NULL,
    authority	VARCHAR(20)     NOT NULL,
    passwd		VARCHAR(20)     NOT NULL,
	email		VARCHAR(40)     NOT NULL,
	disconnectTime		INTEGER			NOT NULL,
	CONSTRAINT USERS_PKEY PRIMARY KEY(username),
	CONSTRAINT USERS_FKEY FOREIGN KEY(authority) REFERENCES AUTHORITIES(authority));

CREATE TABLE KEYS(
	key			BLOB(16)		NOT NULL,
    CONSTRAINT DEVICES_PKEY PRIMARY KEY(key),
    CONSTRAINT DEVICES_UNIQUE UNIQUE(key));
        
CREATE TABLE DEVICES(
	username	VARCHAR(10)     NOT NULL, /* user account */
	uuid		BLOB(16)		NOT NULL, /* license key/uuid this device occupies */
	description	VARCHAR(300)    NOT NULL,
	reg_date	VARCHAR(20)		NOT NULL, /* date device was linked */
	last_update	VARCHAR(20)		NOT NULL, /* unix timestamp */
	config		VARCHAR(300)	NULL, /* configuration */
	c_recieved	INTEGER			NOT NULL, /* Whether the device has recieved the current config value */
	send_image	INTEGER			NOT NULL, /* Whether to batch the device to also send an image with the next detection */
	CONSTRAINT DEVICES_FKEY FOREIGN KEY(username) REFERENCES USERS(username),
	CONSTRAINT DEVICES_FKEY2 FOREIGN KEY(uuid) REFERENCES KEYS(key),
    CONSTRAINT DEVICES_PKEY PRIMARY KEY(uuid, username),
    CONSTRAINT DEVICES_UNIQUE UNIQUE(uuid));

/* This table will store the latest images for every device. Only one image stored per device! */  
CREATE TABLE DEVICE_IMAGES(
	uuid	BLOB(16)	NOT NULL,
	image	TEXT		,
	rtime	INTEGER		,
	CONSTRAINT DEVICE_IMAGES_FKEY FOREIGN KEY(uuid) REFERENCES DEVICES(uuid),
	CONSTRAINT DEVICE_IMAGES_PKEY PRIMARY KEY(uuid),
	CONSTRAINT DEVICE_IMAGES_UNIQUE UNIQUE(uuid)
);

CREATE TABLE LOGS(
	id			INTEGER			PRIMARY KEY,
	uuid		BLOB(16)		NOT NULL,
	rtime		INTEGER			NOT NULL, /* Unix timestamp of the log */
	people		INTEGER			NOT NULL,
	dstatus		VARCHAR(50)		NOT NULL,
	CONSTRAINT LOGS_FKEY FOREIGN KEY(uuid) REFERENCES DEVICES(uuid)
);

CREATE TABLE BOXES(
	id		INTEGER		PRIMARY KEY,
	uuid	BLOB(16)	NOT NULL,
	name	VARCHAR(50)	NOT NULL,
	x_start	REAL		NOT NULL,
	y_start	REAL		NOT NULL,
	x_end	REAL		NOT NULL,
	y_end	REAL		NOT NULL,
	CONSTRAINT BOXES_FKEY FOREIGN KEY(uuid) REFERENCES DEVICES(uuid)
);

CREATE TABLE DETECTIONS(
	id			INTEGER			PRIMARY KEY,
	uuid		BLOB(16)		NOT NULL,
	trackId		INTEGER			NOT NULL,
	rtime		INTEGER			NOT NULL,
	x_pos		REAL			NOT NULL,
	y_pos		REAL			NOT NULL,
	CONSTRAINT DETECTIONS_FKEY FOREIGN KEY(uuid) REFERENCES DEVICES(uuid)
);

/* Device stats is comprised of the latest log */
CREATE VIEW DEVICE_STATUS AS
	SELECT * FROM DEVICES NATURAL JOIN (SELECT uuid, MAX(rtime) as time, people, dstatus FROM LOGS DESC GROUP BY uuid);

/* Populate test data */
INSERT INTO AUTHORITIES(authority) VALUES
("ADMIN"),
("USER");

INSERT INTO USERS(username, fname, lname, authority, passwd, email, disconnectTime) VALUES
("ia000", "ifran", "A", "ADMIN", "$2b$10$SlxYmhOX0YRRi4sMj.gofu9s/JfYfMdUJBn3u3oKlMoa/jQ6bkuVG", "ifran@beebithive.com", 30),
("jd002", "john", "D", "USER", "$2b$10$SlxYmhOX0YRRi4sMj.gofu9s/JfYfMdUJBn3u3oKlMoa/jQ6bkuVG", "john@beebithive.com", 30),
("dj003", "darryl", "J", "USER", "$2b$10$SlxYmhOX0YRRi4sMj.gofu9s/JfYfMdUJBn3u3oKlMoa/jQ6bkuVG", "darryl@beebithive.com", 30),
("wizzledonker", "Win", "Holzapfel", "USER", "$2b$10$IQhHY.bTImyVi1YQOovho.LOtueiKiDc1Z.0jp6/xIc3ooGgx67ym", "win@beebithive.com", 30);

INSERT INTO KEYS(key) VALUES
(X'ed5692a7965aa31cc775d7ef417c5f72'),
(X'3573871ba65032c9a7ae104979d55de9'),
(X'a7050cd5aa819b5a3396ad26a7230bda');

INSERT INTO DEVICES(username, uuid, description, reg_date, last_update, config, c_recieved, send_image) VALUES
("wizzledonker", X'ed5692a7965aa31cc775d7ef417c5f72', "Laptop #1", '2019-01-18', '1565417874', 'uuid=ed5692a7965aa31cc775d7ef417c5f72|frequency=20|image_quality=25|model=dnn/yolov3.weights|config=dnn/config.cfg|confidence=0.2|skipFrames=5|imageWidth=320|imageHeight=240|useOpenCL=1|useCSRT=0|neuralNetQuality=416|maxDisappeared=50|searchDistance=50|useTracking=1', 1, 0),
("wizzledonker", X'3573871ba65032c9a7ae104979d55de9', "Raspberry Pi #1", '2019-02-14', '1565418166', 'uuid=3573871ba65032c9a7ae104979d55de9|frequency=20|image_quality=25|model=dnn/yolov3.weights|config=dnn/config.cfg|confidence=0.2|skipFrames=5|imageWidth=320|imageHeight=240|useOpenCL=1|useCSRT=0|neuralNetQuality=416|maxDisappeared=50|searchDistance=50|useTracking=1', 1, 0),
("dj003", X'a7050cd5aa819b5a3396ad26a7230bda', "Extra Device", '2019-03-12', '1565414166', 'uuid=a7050cd5aa819b5a3396ad26a7230bda|frequency=20|image_quality=25|model=dnn/yolov3.weights|config=dnn/config.cfg|confidence=0.2|skipFrames=5|imageWidth=320|imageHeight=240|useOpenCL=1|useCSRT=0|neuralNetQuality=416|maxDisappeared=50|searchDistance=50|useTracking=1', 1, 0);

INSERT INTO LOGS(uuid, rtime, people, dstatus) VALUES
(X'ed5692a7965aa31cc775d7ef417c5f72', 1569292052, 5, "detecting"),
(X'ed5692a7965aa31cc775d7ef417c5f72', 1569285200, 5, "detecting"),
(X'ed5692a7965aa31cc775d7ef417c5f72', 1569292052, 2, "detecting"),
(X'ed5692a7965aa31cc775d7ef417c5f72', 1569285200, 2, "detecting"),
(X'3573871ba65032c9a7ae104979d55de9', 1568532995, 10, "idle"),
(X'3573871ba65032c9a7ae104979d55de9', 1568533995, 10, "idle"),
(X'3573871ba65032c9a7ae104979d55de9', 1568534995, 10, "idle");

/* extra keys */
INSERT INTO KEYS (key) VALUES
(X'AF233DE1CC579B48964C585A3C7126DF'),
(X'4ABB57D05C35AC3DA066CAC1560DBD03'),
(X'7E7316505A9368F124884410CC9367CF'),
(X'ED1C8DC90D8EA17541E82A17BC8F1C63'),
(X'E4835A3939692228256918FBBD5F3A2C'),
(X'BCB73F62EBD2170A210A855FC3400E1C'),
(X'573A1C9AD8DDDAA4F6BF05C6DC84CAE1'),
(X'715F92849767F02CBD7BA8210370F055'),
(X'2BCC4729DDACFFB668A6784A6ECACEBC'),
(X'966269ADC08C56D536816D455CBE4273'),
(X'7D70F3043CE4CC90B4134BE606208481'),
(X'09955858C234870A1AC5290D97FBD376'),
(X'BC881D5407269C332FB36F1540C499F8'),
(X'9A85A0A3F7AE2C2F3194F5BDC5728614'),
(X'7F1FBB5BD72CF6CB4FA4194B6C849818'),
(X'AA2BCA1620FABA3D6E01C6AE07E5C1CE'),
(X'FAC58C1798FA98BB3940315C45DFEC29'),
(X'F7B83864029C73029E81A80FE3BF25C1'),
(X'31E7424F1CC767127EFBD1B373EF73F1');
