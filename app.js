var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var app = express();
var http = require('http');
var port = process.env.PORT;

// mongodb connection
mongoose.connect(process.env.MONGOLAB_URI)
var db = mongoose.connection;
// mongo error
db.on('error',console.error.bind(console, 'connection error:'));


// use sessions for tracking logins
app.use(session({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// make user ID and name available in templates

app.use(function (req, res, next) {
  res.locals.currentUser = req.session.userId;
  res.locals.currentName = req.session.username;
  next();
})


// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from /public
app.use(express.static(__dirname + '/public'));

// view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// routes
var routes = require("./routes");
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(port, function(){
    console.log("App listening on port", port)
})