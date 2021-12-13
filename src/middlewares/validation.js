const validate = require("../utils/validator");
const generateResponse = require("../utils/responseCreator");

/**
 * Validation layer of the access management system
 * @param {object} validationSchema validation schema using joi functions
 * @returns Validation middleware for routers
 */
const validateData = (validationSchema) => (req, res, next) => {
  const validationError = {};
  const method = ["body", "query", "params"];

  method.map((m) => {
    if (!validationSchema[m]) {
      validationSchema[m] = {};
    }
    validate(validationSchema[m], req[m], (error, value) => {
      if (error) {
        validationError[m] = error;
      }
    });
  });

  if (validationError.body || validationError.query || validationError.params) {
    res
      .status(400)
      .send(
        generateResponse("error", "Provided data is not valid", validationError)
      );
  } else {
    next();
  }
};

module.exports = validateData;
