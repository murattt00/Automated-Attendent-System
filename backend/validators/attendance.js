const Joi = require('joi');

// Submit QR Attendance Validation
const submitAttendanceSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'QR token is required'
    }),
  
  lat: Joi.number()
    .min(-90)
    .max(90)
    .required()
    .messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
      'any.required': 'Location (latitude) is required'
    }),
  
  long: Joi.number()
    .min(-180)
    .max(180)
    .required()
    .messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
      'any.required': 'Location (longitude) is required'
    })
});

// Manual Attendance Validation
const manualAttendanceSchema = Joi.object({
  session_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Session ID must be a number',
      'number.integer': 'Session ID must be an integer',
      'number.positive': 'Session ID must be positive',
      'any.required': 'Session ID is required'
    }),
  
  student_no: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': 'Student number cannot exceed 50 characters',
      'any.required': 'Student number is required'
    })
});

module.exports = {
  submitAttendanceSchema,
  manualAttendanceSchema
};
