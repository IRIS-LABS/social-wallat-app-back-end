const authenticateUser = require("../middlewares/authentication");
const authorizeUser = require("../middlewares/authorization");
const validateUser = require("../middlewares/validation");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

/**
 * Generate the end point functions
 * @param {string} controllerFileName Name of the controller file name
 * @param {string} handlerObjectName Name of the corresponding object inside the controller file
 * @returns Array of middlewares
 */
const handleRequest = (controllerFileName, handlerObjectName) => {
  const controller = require(`../controllers/${controllerFileName}`);
  const handlingObject = controller[handlerObjectName];
  const functions = [];

  if (handlingObject.expectedFiles) {
    functions.push(upload.fields(handlingObject.expectedFiles));
  }

  if (handlingObject.security.authenticationLayer) {
    functions.push(authenticateUser());
  }

  if (
    handlingObject.security.authenticationLayer &&
    handlingObject.security.authorizationLayer
  ) {
    functions.push(authorizeUser(handlingObject.authorizationSchema));
  }

  if (handlingObject.security.validationLayer) {
    functions.push(validateUser(handlingObject.validationSchema));
  }

  functions.push(handlingObject.handler);

  return functions;
};

module.exports = handleRequest;
