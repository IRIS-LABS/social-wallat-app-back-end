"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Connection extends Model {
    static associate(models) {
      models.User.hasMany(models.Connection, {
        foreignKey: "userID",
      });
      models.Connection.belongsTo(models.User, {
        foreignKey: "userID",
      });

      models.User.hasMany(models.Connection, {
        foreignKey: "connectedUserID",
      });
      models.Connection.belongsTo(models.User, {
        foreignKey: "connectedUserID",
      });
    }
  }
  Connection.init(
    {
      userID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      connectedUserID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Connection",
    }
  );
  return Connection;
};
