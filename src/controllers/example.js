const Joi = require("joi");
const responseCreator = require("../utils/responseCreator");
// const { sequelize, Sequelize } = require("../database/models");

/**
 * {
 *      security:{
 *          authenticationLayer: true|false,
 *          authorizationLayer: true|false,
 *          validationLayer: true|false,
 *      }
 *
 *      authorizationSchema:{
 *          allowUser: ["customer","admin"],
 *      }
 *
 *      validationSchema: {
 *          body:{},
 *          query:{},
 *          params:{},
 *      },
 *
 *      expectedFiles: [
 *        { name: "nicFront", maxCount: 1 },
 *        { name: "nicBack", maxCount: 1 },
 *        { name: "businessRegistrationCertificate", maxCount: 1 },
 *        { name: "pharmacyLicense", maxCount: 1 },
 *       ],
 *
 *      handler(req,res){
 *          Logic to handle the route
 *      }
 * }
 */

const example = {
  security: {
    authenticationLayer: false,
    authorizationLayer: false,
    validationLayer: false,
  },

  async handler(req, res) {
    res.status(400).send(
      responseCreator("error", "Successfully complete", {
        firstName: "Dlshan",
        lastName: "Senarath",
      })
    );
  },
};

module.exports = {
  example,
};
