const Joi = require("joi");
const responseCreator = require("../utils/responseCreator");
const { sequelize, Sequelize } = require("../database/models");
const passwordComplexity = require("passwordComplexity");

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
      email: Joi.string()
        .email({ tlds: true })
        .required()
        .label("Email address"),
      password: Joi.string().required().label("Password"),
    },
  },

  async handler(req, res) {
    try {
      const data = req.body;

      console.log(data);
      res
        .status(200)
        .send(
          responseCreator("success", "Successfully registered the new user")
        );
    } catch (e) {
      res
        .status(400)
        .send(responseCreator("error", "Request can't be proceed"));
    }
  },
};

module.exports = {
  signUp,
};
