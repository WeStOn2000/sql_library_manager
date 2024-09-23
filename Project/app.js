var express = require('express');
var path = require('path');
const db = require('./models/index');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { Book } = require('./models');


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

db.sequelize.sync().then(() => {
  console.log('Database synced');
}).catch(err => {
  console.error('Error syncing database:', err);
});


// Error-handling middleware
app.use((error, req, res, next) => {
  res.status(error.status || 500);

  if (error.status === 404) {
    res.render('page-not-found', { error });
  } else {

    res.render('error', { error });
  }
});

// Global error handler
app.use((err, req, res, next) => {

  err.status = err.status || 500;


  err.message = err.message || "Oops! Something went wrong on the server.";

  console.error(`Error Status: ${err.status}, Message: ${err.message}`);


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
    const books = await Book.findAll();
    res.render('index', { books });
  } catch (error) {
    next(error);
  }
});
//New Book Route
app.get('/books/new', (req, res) => {
  res.render('new-book');
});
// Post a new book to the database
app.post('/books/new', async (req, res, next) => {
  try {
    await Book.create(req.body);
    res.redirect('/books');
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {

      res.render('new-book', {
        errors: error.errors,
        book: req.body
      });
    } else {
      next(error);
    }
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
    if (error.name === 'SequelizeValidationError') {
      res.render('update-book', {
        errors: error.errors,
        book: { ...req.body, id: req.params.id }
      });
    } else {
      next(error);
    }
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
app.post('/submit-form', async (req, res, next) => {
  try {
    const book = await Book.create({ title, author });

    res.redirect('/books');
  } catch (error) {

    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      res.render('form-error', { errors });
    } else {

      res.status(500).send('Server Error');
    }
  }
});

module.exports = app;
