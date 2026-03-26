const Joi = require('joi');

// Start Session Validation
const startSessionSchema = Joi.object({
  class_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Class ID must be a number',
      'number.integer': 'Class ID must be an integer',
      'number.positive': 'Class ID must be positive',
      'any.required': 'Class ID is required'
    }),
  
  lat: Joi.number()
    .min(-90)
    .max(90)
    .allow(null)
    .messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90'
    }),
  
  long: Joi.number()
    .min(-180)
    .max(180)
    .allow(null)
    .messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180'
    })
});

module.exports = {
  startSessionSchema
};
