"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      userID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, allowNull: false },
      phoneNumber: { type: DataTypes.STRING, allowNull: false },
      jobTitle: { type: DataTypes.STRING, allowNull: false },
      linkedinURL: { type: DataTypes.STRING, allowNull: false },
      facebookURL: { type: DataTypes.STRING, allowNull: false },
      twitterURL: { type: DataTypes.STRING, allowNull: false },
      personalWebsiteURL: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
