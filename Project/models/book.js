'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      // define association here
    }
  }

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
       
      },
      year: {
        type: DataTypes.INTEGER,
        validate: {
          isInt: {
            msg: "Year must be an integer",
          },
          min: {
            args: [1000],
            msg: "Year must be after 1000",
          },
          max: {
            args: [new Date().getFullYear()],
            msg: `Year cannot be in the future`,
          },
        },
      },
    },
    {
      sequelize, 
      modelName: 'Book', 
    }
  );

  return Book;
};

