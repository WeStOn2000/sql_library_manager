'use strict';

const { Model, DataTypes } = require('sequelize');  // Import Model and DataTypes
const sequelize = require('../config/db');  // Import the configured sequelize instance

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  // Initialize the Book model
  Book.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Title cannot be empty",
          },
        },
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Author cannot be empty",
          },
        },
      },
      genre: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: "Genre cannot be empty",
          },
        },
      },
      year: {
        type: DataTypes.INTEGER,
        validate: {
          notEmpty: {
            msg: "Year cannot be empty",
          },
        },
      },
    },
    {
      sequelize,  // Only pass the sequelize instance here
      modelName: 'Book',  // Set the model name
    }
  );

  return Book;
};
