const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { body, validationResult } = require('express-validator');
const logger = require('morgan');
const createError = require('http-errors');
//Importing the following for the project
const { sequelize, Book } = require('./models');
const seedBooks = require('./seeders/seedBooks');
const { Op } = require('sequelize');

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
    console.log('Books fetched:', books.length);
    if (books.length === 0) {
      console.log('No books found in the database');
    }
    res.render('index', { books, title: 'Books' });
  } catch (error) {
    console.error('Error fetching books:', error);
    next(error);
  }
});

// New book form route
app.get('/books/new', (req, res) => {
  res.render('new-book', { title: 'New Book' });
});

// Create new book route
app.post('/books/new', async (req, res, next) => {
  console.log('Received form data:', req.body); 
  try {
    const book = await Book.create(req.body);
    console.log('New book created:', book.toJSON()); 
    res.redirect("/books");
  } catch (error) {
    console.error('Error creating book:', error);  
    if (error.name === 'SequelizeValidationError') {
      res.render("new-book", {
        book: req.body,
        errors: error.errors,
        title: "New Book"
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
    console.log('Requested Book ID:', req.params.id); 
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
app.post('/books/:id', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("update-book", {
      book: { ...req.body, id: req.params.id },
      errors: errors.array(),
      title: "Update Book"
    });
  }

  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update({
        title: req.body.title,
        author: req.body.author,
        genre: req.body.genre,
        year: req.body.year ? parseInt(req.body.year) : null
      });
      res.redirect('/books');
    } else {
      next(createError(404, 'Book not found'));
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      res.render('update-book', {
        title: 'Update Book',
        errors: error.errors.map(e => ({ message: e.message })),
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

//Search input  handling
app.get('/books', async (req, res, next) => {
  try {
    const query = req.query.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; 
    const offset = (page - 1) * limit; 

    console.log('Search Query:', query); 
    console.log('Page:', page); 
    console.log('Limit:', limit);

    let books;
    if (query) {
      books = await Book.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${query}%` } },
            { author: { [Op.like]: `%${query}%` } },
            { genre: { [Op.like]: `%${query}%` } },
            { year: { [Op.like]: `%${query}%` } }
          ]
        },
        limit: limit,
        offset: offset,
      });
    } else {
      books = await Book.findAll({
        limit: limit,
        offset: offset,
      });
    }

    const totalBooks = await Book.count(); 

    console.log('Books fetched:', books.length);
    
    res.render('index', { 
      books, 
      title: 'Books', 
      currentPage: page, 
      totalPages: Math.ceil(totalBooks / limit)
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    next(error);
  }
});


// 404 Error Handler
app.use((req, res, next) => {
  next(createError(404, 'Page Not Found'));
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.log('Error status:', error.status);
  console.log('Error message:', error.message);

  res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};

  res.status(error.status || 500);
  
  if (error.status === 404) {
    console.log('Rendering page-not-found template');
    res.render('page-not-found', { title: 'Page Not Found' });
  } else {
    console.log('Rendering error template');
    res.render('error', { title: 'Server Error' });
  }
});

// Sync database, seed books, and start server
sequelize.sync({ force: true })
  .then(() => {
    console.log('Database synced');
    return seedBooks();
  })
  .then(() => {
    console.log('Books seeded successfully');
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch(err => {
    console.error('Error syncing database or seeding books:', err);
  });

module.exports = app;