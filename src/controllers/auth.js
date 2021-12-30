const Joi = require("joi");
const responseCreator = require("../utils/responseCreator");
const { sequelize, Sequelize } = require("../database/models");
const passwordComplexity = require("joi-password-complexity");
const bcrypt = require("bcrypt");
const tokenManager = require("../utils/tokenManager");
const config = require("config");

const signUp = {
  security: {
    authenticationLayer: false,
    authorizationLayer: false,
    validationLayer: true,
  },

  validationSchema: {
    body: {
      firstName: Joi.string()
        .pattern(/^[a-z A-Z]+$/, "english character (a-z, A-Z)")
        .required()
        .label("First name"),
      lastName: Joi.string()
        .pattern(/^[a-z A-Z]+$/, "english character (a-z, A-Z)")
        .required()
        .label("Last name"),
      email: Joi.string()
        .email({ tlds: true })
        .required()
        .label("Email address"),
      password: passwordComplexity({
        min: 8,
        max: 30,
        lowerCase: 1,
        upperCase: 1,
        numeric: 1,
        symbol: 1,
        requirementCount: 4,
      })
        .required()
        .label("Password"),
    },
  },

  async handler(req, res) {
    try {
      await sequelize.transaction(async (t) => {
        const userAccountExistance = await sequelize.models.UserAccount.findOne(
          {
            where: {
              email: req.body.email,
            },
          }
        );

        if (userAccountExistance) {
          if (userAccountExistance.thirdParty)
            throw new Error(
              "You are already registered using the google authorization service"
            );
          throw new Error("Email address is already registered");
        }

        const userData = { ...req.body };
        delete userData["email"];
        delete userData["password"];

        const encryptedPassword = await bcrypt.hash(req.body.password, 10);

        const user = await sequelize.models.User.create(userData);
        await sequelize.models.UserAccount.create({
          userID: user.userID,
          email: req.body.email,
          password: encryptedPassword,
        });
      });

      res
        .status(200)
        .send(
          responseCreator("success", "Successfully registered the new user")
        );
    } catch (e) {
      const errorMsg = e.message;

      switch (errorMsg) {
        case "Email address is already registered":
          res
            .status(400)
            .send(
              responseCreator("error", "Email address is already registered")
            );
          break;
        case "You are already registered using the google authorization service":
          res
            .status(400)
            .send(
              responseCreator(
                "error",
                "You are already registered using the google authorization service"
              )
            );
          break;
        default:
          res
            .status(400)
            .send(responseCreator("error", "Request can't be proceed"));
      }
    }
  },
};

const signIn = {
  security: {
    authenticationLayer: false,
    authorizationLayer: false,
    validationLayer: true,
  },

  validationSchema: {
    body: {
      email: Joi.string()
        .email({ tlds: true })
        .required()
        .label("Email address"),
      password: Joi.string().required().label("Password"),
    },
  },

  async handler(req, res) {
    try {
      const userID = await sequelize.transaction(async (t) => {
        const userAccount = await sequelize.models.UserAccount.findOne({
          where: {
            email: req.body.email,
          },
        });

        if (!userAccount) throw new Error("Wrong Password or Email");

        if (userAccount.thirdParty)
          throw new Error(
            "You registered using the google authorization service, Please use the google sign in to access the account"
          );

        const isPasswordCorrect = await bcrypt.compare(
          req.body.password,
          userAccount.password
        );

        if (!isPasswordCorrect) throw new Error("Wrong Password or Email");

        return userAccount.userID;
      });

      res.cookie(
        "accessToken",
        tokenManager.generateToken(
          { userID },
          config.get("ACCESS_TOKEN_SECRET"),
          `${1000 * 60 * 60 * 24 * config.get("ACCESS_TOKEN_TIME")}`
        ),
        {
          sameSite: "strict",
          path: "/",
          maxAge: new Date(
            new Date().getTime() +
              1000 * 60 * 60 * 24 * config.get("ACCESS_TOKEN_TIME")
          ),
          httpOnly: true,
          //secure: true,
          signed: true,
        }
      );

      res
        .status(200)
        .send(responseCreator("success", "User is successfully authenticated"));
    } catch (e) {
      const errorMsg = e.message;
      console.log(errorMsg);

      switch (errorMsg) {
        case "Wrong Password or Email":
          res
            .status(401)
            .send(responseCreator("error", "Email or password is incorrect"));
          break;
        case "You registered using the google authorization service, Please use the google sign in to access the account":
          res
            .status(400)
            .send(
              responseCreator(
                "error",
                "You registered using the google authorization service, Please use the google sign in to access the account"
              )
            );
          break;
        default:
          res
            .status(400)
            .send(responseCreator("error", "Request can't be proceed"));
      }
    }
  },
};

module.exports = {
  signUp,
  signIn,
};
