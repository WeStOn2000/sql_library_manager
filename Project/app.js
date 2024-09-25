const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');
const { sequelize, Book } = require('./models');

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes

// Home route - redirect to books
app.get('/', (req, res) => {
  res.redirect('/books');
});

// Books listing route
app.get('/books', async (req, res, next) => {
  try {
    const books = await Book.findAll();
    console.log(books); 
    res.render('index', { books, title: 'Books' });
  } catch (error) {
    next(error);
  }
});

// New book form route
app.get('/books/new', (req, res) => {
  res.render('new-book', { title: 'New Book' });
});

// Create new book route
// New book route (POST)
app.post('/books/new', async (req, res, next) => {
  try {
    await Book.create(req.body);
    res.redirect('/books');
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      res.render('new-book', { 
        title: 'New Book',
        errors: error.errors,  
        book: req.body         
      });
    } else {
      next(error);
    }
  }
});


// Book detail route
app.get('/books/:id', async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);  
    if (book) {
      res.render('update-book', { book, title: 'Update Book' }); 
    } else {
      next(createError(404, 'Book not found'));
    }
  } catch (error) {
    next(error);
  }
});


// Update book route
app.post('/books/:id', async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);  
    if (book) {
      await book.update(req.body);  
      res.redirect('/books');  
    } else {
      next(createError(404, 'Book not found'));
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      res.render('update-book', {
        title: 'Update Book',
        errors: error.errors,
        book: { ...req.body, id: req.params.id }
      });
    } else {
      next(error);
    }
  }
});


// Delete book route
app.post('/books/:id/delete', async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy();  
      res.redirect('/books');
    } else {
      next(createError(404, 'Book not found'));
    }
  } catch (error) {
    next(error);
  }
});


// 404 Error Handler
app.use('*', (req, res, next) => {
  next(createError(404, 'Page Not Found'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.locals.title = err.status === 404 ? 'Page Not Found' : 'Error';
  res.locals.url = req.originalUrl;

  // status and render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Sync database and start server
sequelize.sync().then(() => {
  console.log('Database synced');
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}).catch(err => {
  console.error('Error syncing database:', err);
});

module.exports = app;