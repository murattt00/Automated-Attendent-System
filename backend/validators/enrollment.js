const Joi = require('joi');

// Enroll in Class Validation
const enrollSchema = Joi.object({
  class_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Class ID must be a number',
      'number.integer': 'Class ID must be an integer',
      'number.positive': 'Class ID must be positive',
      'any.required': 'Class ID is required'
    })
});

// Unenroll from Class Validation
const unenrollSchema = Joi.object({
  class_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Class ID must be a number',
      'number.integer': 'Class ID must be an integer',
      'number.positive': 'Class ID must be positive',
      'any.required': 'Class ID is required'
    })
});

module.exports = {
  enrollSchema,
  unenrollSchema
};
