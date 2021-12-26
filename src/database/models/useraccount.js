"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserAccount extends Model {
    static associate(models) {
      models.User.hasOne(models.UserAccount, {
        foreignKey: "userID",
      });
      models.UserAccount.belongsTo(models.User, {
        foreignKey: "userID",
      });
    }
  }
  UserAccount.init(
    {
      userID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "active",
      },
      thirdParty: { type: DataTypes.BOOLEAN, defaultValue: false },
      provider: DataTypes.STRING,
      providerUserID: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "UserAccount",
    }
  );
  return UserAccount;
};
