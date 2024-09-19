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
// Home route
app.get('/', (req, res) => {
  res.redirect('/books');
});
// book Route
app.get('/books', async (req, res) => {
  try {
      const books = await Book.findAll(); // Assuming you have a Book model
      res.render('index', { books });
  } catch (error) {
      next(error); // Pass to global error handler
  }
});
//New Book Route
app.get('/books/new', (req, res) => {
  res.render('new-book');
});
// Post a new book to the database
app.post('/books/new', async (req, res, next) => {
  try {
      await Book.create(req.body); // Assumes a `Book` model exists
      res.redirect('/books');
  } catch (error) {
      next(error);
  }
});
//Book detail Route
app.get('/books/:id', async (req, res, next) => {
  try {
      const book = await Book.findByPk(req.params.id);
      if (book) {
          res.render('update-book', { book });
      } else {
          res.status(404).render('page-not-found');
      }
  } catch (error) {
      next(error);
  }
});
//Update book route
app.post('/books/:id', async (req, res, next) => {
  try {
      const book = await Book.findByPk(req.params.id);
      if (book) {
          await book.update(req.body);
          res.redirect('/books');
      } else {
          res.status(404).render('page-not-found');
      }
  } catch (error) {
      next(error);
  }
});
//Delete Book Route
app.post('/books/:id/delete', async (req, res, next) => {
  try {
      const book = await Book.findByPk(req.params.id);
      if (book) {
          await book.destroy();
          res.redirect('/books');
      } else {
          res.status(404).render('page-not-found');
      }
  } catch (error) {
      next(error);
  }
});
//Form error 


app.post('/submit-form',async (req, res, next) => {
  try {
    // Create a new book instance
    const book = await Book.create({ title, author });
    // Redirect to the books listing page if successful
    res.redirect('/books');
  } catch (error) {
    // Render form with error messages
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      res.render('form-error', { errors }); // Pass errors to your form-error.html template
    } else {
      // Handle other errors
      res.status(500).send('Server Error');
    }
  }
});

module.exports = app;
