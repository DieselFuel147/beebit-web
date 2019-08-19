const express = require('express');
const fs = require("fs");
const http = require ('http');
//const http = require("https");
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require ('express-session');

/* local resources */
const Dbhelper = require ('./db/DBhelper.js');
const db = new Dbhelper("db/beebit.db");

const app = express();

/* https cert once we have one */
// const options = {
//   key: fs.readFileSync("/srv/www/keys/my-site-key.pem"),
//   cert: fs.readFileSync("/srv/www/keys/chain.pem")
// };

/* server config */
const server = http.createServer(app);
const hostname = 'localhost';
const port = 3420;

/* Routing */
const index = require('./routes/index');
const dashboard = require('./routes/dashboard')(db);
const demo = require('./routes/demo');
const bee = require('./routes/bee')(db);

/* View engine setup */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

/* Setup middlewares */
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
app.use(session({secret: 'password123',	cookie: { maxAge: 900000 } }));

/* Set up access routes */
app.use('/', index);
app.use('/dashboard', dashboard);
app.use('/bee', bee);

/* Set up images for serving */
app.use(express.static('public/dist/img'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

/* start server */
server.listen(port, hostname, ()=> {
	console.log(`running: http://${hostname}:${port}`)
});
