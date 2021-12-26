const GoogleStrategy = require("passport-google-oauth20").Strategy;
const config = require("config");
const passport = require("passport");
const { sequelize } = require("../database/models");
const Joi = require("joi");
const tokenManager = require("../utils/tokenManager");
const generateResponse = require("../utils/responseCreator");
const { v4: uuidv4 } = require("uuid");

// Google strategy from passport js
passport.use(
  new GoogleStrategy(
    {
      clientID: config.get("GOOGLE.CLIENT_ID"),
      clientSecret: config.get("GOOGLE.CLIENT_SECRET"),
      callbackURL: `${config.get(
        "BACKEND_URL"
      )}/api/auth/third-party/google/callback`,
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        if (!profile.emails[0].verified) {
          cb(null, { error: "Email is not verified" });
          return;
        }

        let userAccount = await sequelize.models.UserAccount.findOne({
          where: { email: profile.emails[0].value },
        });

        if (userAccount && !userAccount.thirdParty) {
          cb(null, { error: "Uses is already registered as local user" });
          return;
        } else if (userAccount && userAccount.thirdParty) {
          if (userAccount.providerUserID === profile.id) {
            cb(null, { userID: userAccount.userID });
            return;
          } else {
            throw new Error("IDs don't match");
          }
        } else {
          const userID = await sequelize.transaction(async (t) => {
            const userData = await sequelize.models.User.create({
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
            });
            const userAccountData = await sequelize.models.UserAccount.create({
              userID: userData.userID,
              email: profile.emails[0].value,
              thirdParty: true,
              provider: profile.provider,
              providerUserID: profile.id,
            });
            return userAccountData.userID;
          });
          cb(null, { userID, incomplete: true });
        }
      } catch (error) {
        cb(null, false);
      }
    }
  )
);

// Callback function for google authentication (This will be called by the google)
const googleCallback = {
  security: {
    authenticationLayer: false,
    authorizationLayer: false,
    validationLayer: false,
  },

  handler(req, res) {
    if (req.user.error) {
      switch (req.user.error) {
        case "Email is not verified":
          res
            .status(302)
            .redirect(`${config.get("FRONTEND_URL")}/error?code=#2112262`);
          return;
        case "Uses is already registered as local user":
          res
            .status(302)
            .redirect(`${config.get("FRONTEND_URL")}/error?code=#2112263`);
          return;
      }
    }

    const token = uuidv4();

    global[token] = {
      data: req.user,
      time: new Date().getTime(),
    };
    res
      .status(302)
      .redirect(`${config.get("FRONTEND_URL")}/google/verify/${token}`);
  },
};

const verify = {
  security: {
    authenticationLayer: false,
    authorizationLayer: false,
    validationLayer: true,
  },

  validationSchema: {
    query: {
      token: Joi.string().required().label("Token"),
    },
  },

  handler(req, res) {
    try {
      const token = req.query.token;

      if (!global[token]) throw new Error("Token is invalid");

      if (!global[token].data || !global[token].time)
        throw new Error("Token data is invalid");

      const timeChange = new Date().getTime() - global[token].time;

      if (timeChange > 5 * 60 * 1000) throw new Error("Token expired");

      res.cookie(
        "accessToken",
        tokenManager.generateToken(
          global[token].data,
          config.get("ACCESS_TOKEN_SECRET"),
          `${1000 * 60 * 60 * 24 * config.get("ACCESS_TOKEN_TIME")}`
        ),
        {
          sameSite: "strict",
          path: "/",
          expires: new Date(
            new Date().getTime() +
              1000 * 60 * 60 * 24 * config.get("ACCESS_TOKEN_TIME")
          ),
          httpOnly: true,
          //secure: true,
          signed: true,
        }
      );

      delete global[token];

      res
        .status(200)
        .send(
          generateResponse("success", "Third party authorization is completed")
        );
    } catch (e) {
      res
        .status(400)
        .send(generateResponse("error", "Third party authorization failed"));
    }
  },
};

const getPartialUserData = {
  security: {
    authenticationLayer: true,
    authorizationLayer: false,
    validationLayer: false,
  },

  async handler(req, res) {
    try {
      const userData = await sequelize.models.User.findOne({
        userID: req.user.userID,
        attributes: ["firstName", "lastName"],
      });
      const userAccountData = await sequelize.models.UserAccount.findOne({
        where: { userID: req.user.userID },
        attributes: ["email"],
      });
      userData.dataValues["email"] = userAccountData.email;

      res
        .status(200)
        .send(
          generateResponse(
            "success",
            "Partially completed data is succefully retrieved",
            userData
          )
        );
    } catch (e) {
      res
        .status(400)
        .send(generateResponse("error", "Request can't be proceed"));
    }
  },
};

const completeUserProfile = {
  security: {
    authenticationLayer: true,
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
      phoneNumber: Joi.string()
        .pattern(/^[+0-9]+$/, "phone number (Characters allowed: 0-9, +)")
        .required()
        .label("Phone number"),
      jobTitle: Joi.string()
        .pattern(/^[a-z A-Z]+$/, "english character (a-z, A-Z)")
        .required()
        .label("Job title"),
      linkedinURL: Joi.string().uri().required().label("Linkedin account URL"),
      facebookURL: Joi.string().uri().required().label("Facebook account URL"),
      twitterURL: Joi.string().uri().required().label("Twitter account URL"),
      personalWebsiteURL: Joi.string()
        .uri()
        .required()
        .label("Personal website URL"),
    },
  },

  async handler(req, res) {
    try {
      delete req.body.email;
      await sequelize.models.User.update(req.body.email, {
        where: { userID: req.user.userID },
      });

      res.cookie(
        "accessToken",
        tokenManager.generateToken(
          { userID: req.user.userID },
          config.get("ACCESS_TOKEN_SECRET"),
          `${1000 * 60 * 60 * 24 * config.get("ACCESS_TOKEN_TIME")}`
        ),
        {
          sameSite: "strict",
          path: "/",
          expires: new Date(
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
        .send(generateResponse("success", "User account is completed"));
    } catch (e) {
      res
        .status(400)
        .send(generateResponse("error", "Request can't be proceed"));
    }
  },
};

module.exports = {
  passport,
  googleCallback,
  verify,
  completeUserProfile,
  getPartialUserData,
};