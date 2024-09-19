var express = require('express');
var path = require('path');
const db = require('./models/index');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


// Handle 404 errors and render the 'page-not-found' template
app.use((req, res, next) => {
  const error = new Error("Page not found");
  error.status = 404;
  next(error); // Pass the error to the error-handling middleware
});

// Error-handling middleware
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  // Render the 'page-not-found' template for 404 errors, passing the error message
  if (error.status === 404) {
      res.render('page-not-found', { error });
  } else {
      // Handle other types of errors with a different template or error page
      res.render('error', { error });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  // Set the status to 500 if it's not already set
  err.status = err.status || 500;

  // Set a default user-friendly message if it's not already set
  err.message = err.message || "Oops! Something went wrong on the server.";

  // Log the error status and message to the console
  console.error(`Error Status: ${err.status}, Message: ${err.message}`);

  // Render the error template and pass the error object
  res.status(err.status);
  res.render('error', { err });
});


module.exports = app;
