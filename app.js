var express = require('express');
var cors = require('cors');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var request = require('request');
var routes = require('./routes/index');
var users = require('./routes/users');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
 if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
});

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);



var corsOptions = {
  origin: 'http://localhost:3000'
};

app.get('/uberprice', function (req, res) {  
  var start_latitude = req.query.start_latitude;
  var start_longitude = req.query.start_longitude;
  var end_latitude = req.query.end_latitude;
  var end_longitude = req.query.end_longitude;

  //Calling Uber Webservice
  var uberURL = 'http://api.uber.com/v1/estimates/price?async=false&start_latitude='+start_latitude+'&start_longitude='+start_longitude+'&end_latitude='+end_latitude+'&end_longitude='+end_longitude+'&server_token=rQNg72K512hx6HNGC6a6YR3b4ehRjgCrfjtA2XPx';
  var avg_price = 0;
  request(uberURL, function (error, response, body) {
   if (!error && response.statusCode == 200) {
      obj = JSON.parse(body);  
      //console.log(obj.prices[0].low_estimate);
      //console.log(uberURL);
      avg_price = ( obj.prices[0].high_estimate + obj.prices[0].low_estimate)/2 ;
      var results = JSON.stringify({ avg_price: avg_price });
      res.send(results);  
    }  
   else{ res.send(JSON.stringify({ avg_price: 100000 }));}   
  });
  
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
