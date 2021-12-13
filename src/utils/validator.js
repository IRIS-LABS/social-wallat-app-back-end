const Joi = require("joi");

/**
 * Validate data set using joi library
 * @param {object} schema javascript object with joi validation rules
 * @param {object} data Data object which has to be validate
 * @param {Function} callback (error:object|undefined, value:object|undefined)
 */
const validate = (schema, data, callback) => {
  const { error, value } = Joi.object(schema)
    .options({ abortEarly: false })
    .validate(data);

  if (error) {
    const errorDetails = {};

    error.details.map(({ message, path, context }) => {
      errorDetails[context.key] = {
        message,
        path,
        key: context.key,
        value: context.value,
      };
    });
    callback(errorDetails);
  } else {
    callback(undefined, data);
  }
};

module.exports = validate;
