const Joi = require('joi');

// User Registration Validation
const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
  
  email: Joi.string()
    .email()
    .max(100)
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.max': 'Email cannot exceed 100 characters',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)',
      'any.required': 'Password is required'
    }),
  
  role: Joi.string()
    .valid('teacher', 'student')
    .required()
    .messages({
      'any.only': 'Role must be either teacher or student',
      'any.required': 'Role is required'
    }),
  
  student_no: Joi.string()
    .max(50)
    .when('role', {
      is: 'student',
      then: Joi.required(),
      otherwise: Joi.optional().allow(null)
    })
    .messages({
      'string.max': 'Student number cannot exceed 50 characters',
      'any.required': 'Student number is required for students'
    })
});

// User Login Validation
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

module.exports = {
  registerSchema,
  loginSchema
};
