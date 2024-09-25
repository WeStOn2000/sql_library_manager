const { Book } = require('../models');

async function seedBooks() {
  try {
    await Book.bulkCreate([
      { title: 'The Hunger Games', author: 'Suzanne Collins', genre: 'Fantasy', year: 2008 },
      { title: 'Catching Fire', author: 'Suzanne Collins', genre: 'Fantasy', year: 2009 },
      { title: 'Mockingjay', author: 'Suzanne Collins', genre: 'Fantasy', year: 2010 },
      { title: 'The Ballad of Songbirds and Snakes', author: 'Suzanne Collins', genre: 'Fantasy', year: 2020 },
      { title: 'The Memory Police', author: 'Yoko Ogawa', genre: 'Science Fiction', year: 1994 },
      { title: 'Nickel Boys', author: 'Colson Whitehead', genre: 'Historical Fiction', year: 2019 },
      { title: 'The Book of Unknown Americans', author: 'Cristina Henriquez', genre: 'Fiction', year: 2014 },
      { title: 'A Brief History of Time', author: 'Stephen Hawking', genre: 'Non Fiction', year: 1988 },
      { title: 'Armada', author: 'Ernest Cline', genre: 'Science Fiction', year: 2015 },
      { title: 'Emma', author: 'Jane Austen', genre: 'Classic', year: 1815 },
      { title: 'Frankenstein', author: 'Mary Shelley', genre: 'Horror', year: 1818 },
      { title: 'Pride and Prejudice', author: 'Jane Austen', genre: 'Classic', year: 1813 },
      { title: 'Ready Player One', author: 'Ernest Cline', genre: 'Science Fiction', year: 2011 },
      { title: 'The Martian', author: 'Andy Weir', genre: 'Science Fiction', year: 2014 },
      { title: 'The Universe in a Nutshell', author: 'Stephen Hawking', genre: 'Non Fiction', year: 2001 }
    ]);
    console.log('Books seeded successfully');
  } catch (error) {
    console.error('Error seeding books:', error);
  }
}

module.exports = seedBooks;