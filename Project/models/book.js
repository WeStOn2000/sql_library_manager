'use strict';

const sequelize = require('../models');
const {
  Model
} = require('sequelize');
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
  Book.init({
    title:{ 
     type: DataTypes.STRING,
     allowNull: false,
    validate:{
      notEmpty:{
        msg: "title cannot be empty"
      }
    }
    },
    author:{
      type: DataTypes.STRING,
      allowNull: false, // Prevent null values
      validate: {
        notEmpty: {
          msg: "Author cannot be empty." // Custom error message if empty
        }
      }
    },
    genre:{ 
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: "genre cannot be empty." // Custom error message if empty
        }
    }
  },
    year: { 
      type: DataTypes.INTEGER, 
      validate: {
        notEmpty: {
          msg: "Year cannot be empty." // Custom error message if empty
        }
      }
    },
    sequelize,
    modelName: 'Book',
  });
  return Book;
};