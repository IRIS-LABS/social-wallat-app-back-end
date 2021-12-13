const generateResponse = require("../utils/responseCreator");
const tokenManager = require("../utils/tokenManager");
const config = require("config");

/**
 * Authetication layer for the access management system
 * @returns Authetication middleware for routers
 */
const authenticateUser = () => (req, res, next) => {
  const { accessToken } = req.signedCookies;

  if (accessToken) {
    tokenManager.verifyToken(
      accessToken,
      config.get("ACCESS_TOKEN_SECRET"),
      async (isExpired, isWrong, data) => {
        if (isExpired || isWrong) {
          res
            .status(401)
            .send(generateResponse("error", "Access token is not valid"));
        } else {
          req.tokenData = data;
          next();
        }
      }
    );
  } else {
    res
      .status(401)
      .send(generateResponse("error", "Access token is not provided"));
  }
};

module.exports = authenticateUser;
