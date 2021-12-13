const generateResponse = require("../utils/responseCreator");

/**
 * Authorization layer of the access management system
 * @param {object} authorizationSchema all data used to authorize the user
 * @returns Authorization middleware for routers
 */
const authorizeUser = (authorizationSchema) => async (req, res, next) => {
  if (
    authorizationSchema.allowUsers &&
    authorizationSchema.allowUsers.indexOf(req.tokenData.role) === -1
  ) {
    res
      .status(403)
      .send(
        generateResponse(
          "error",
          "You don't have permission to access this resources"
        )
      );
  } else {
    next();
  }
};

module.exports = authorizeUser;
