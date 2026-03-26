const Joi = require('joi');

// Create Class Validation
const createClassSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Class name must be at least 3 characters',
      'string.max': 'Class name cannot exceed 100 characters',
      'any.required': 'Class name is required'
    }),
  
  code: Joi.string()
    .min(2)
    .max(20)
    .uppercase()
    .pattern(/^[A-Z0-9]+$/)
    .required()
    .messages({
      'string.min': 'Code must be at least 2 characters',
      'string.max': 'Code cannot exceed 20 characters',
      'string.pattern.base': 'Code must contain only uppercase letters and numbers',
      'any.required': 'Class code is required'
    })
});

module.exports = {
  createClassSchema
};
