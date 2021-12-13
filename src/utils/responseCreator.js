/**
 * Create response data into one structure
 * @param {string} type Type of the response => error,success
 * @param {string} msg Main and short message
 * @param {*} data Extended data for the response
 * @returns object with type,msg,data
 */
const generateResponse = (type, msg, data) => {
  return {
    type,
    msg,
    data,
  };
};

module.exports = generateResponse;
