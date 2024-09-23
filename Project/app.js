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

// Home route
app.get('/', (req, res) => {
  res.redirect('/books');
});

// Book routes
app.get('/books', async (req, res, next) => {
  try {
    const books = await Book.findAll();
    res.render('index', { books });
  } catch (error) {
    next(error);
  }
});

app.get('/books/new', (req, res) => {
  res.render('new-book');
});

app.post('/books/new', async (req, res, next) => {
  try {
    await Book.create(req.body);
    res.redirect('/books');
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      res.render('new-book', { errors: error.errors, book: req.body });
    } else {
      next(error);
    }
  }
});

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

app.post('/submit-form', async (req, res, next) => {
  try {
    const { title, author } = req.body;  // Get form fields from req.body
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

// 404 Error Handler
app.use((req, res, next) => {
  const error = new Error("Page Not Found");
  error.status = 404;
  next(error);
});

// Error-handling middleware
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.render(error.status === 404 ? 'page-not-found' : 'error', { error });
});

module.exports = app;

