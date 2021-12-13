const jwt = require("jsonwebtoken");

/**
 * @param {object} payload Javascript object with data
 * @param {string} secret Secret for signing the token
 * @param {string} expireTimeInSeconds Expiration time of the token
 * @returns genertaed token as a string
 * To generate json web token
 */
const generateToken = (payload, secret, expireTimeInSeconds) => {
  return jwt.sign(payload, secret, {
    expiresIn: `${expireTimeInSeconds}s`,
  });
};

/**
 * To check whether the token is valid or not
 * @param {String} token Token as a string
 * @param {String} secret Secret as string which was used to generate the token
 * @param {Function} callback (isExpired:Boolean, isWrong:Boolean|undefined, data:Object|undefined)
 */
const verifyToken = (token, secret, callback) => {
  jwt.verify(token, secret, function (err, decoded) {
    if (err) {
      if (err.name === "TokenExpiredError") {
        callback(true);
      } else {
        callback(false, true);
      }
    } else {
      callback(false, false, decoded);
    }
  });
};

module.exports = {
  generateToken,
  verifyToken,
};
