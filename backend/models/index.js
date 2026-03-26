const sequelize = require('../config/database');
const User = require('./User');
const Class = require('./Class');
const Session = require('./Session');
const Attendance = require('./Attendance');
const Enrollment = require('./Enrollment');

// Define Relationships

// User - Class (Teacher owns many classes)
User.hasMany(Class, { 
  foreignKey: 'teacher_id', 
  as: 'classes' 
});
Class.belongsTo(User, { 
  foreignKey: 'teacher_id', 
  as: 'teacher' 
});

// Class - Session (Class has many sessions)
Class.hasMany(Session, { 
  foreignKey: 'class_id', 
  as: 'sessions' 
});
Session.belongsTo(Class, { 
  foreignKey: 'class_id', 
  as: 'class' 
});

// Session - Attendance (Session has many attendances)
Session.hasMany(Attendance, { 
  foreignKey: 'session_id', 
  as: 'attendances' 
});
Attendance.belongsTo(Session, { 
  foreignKey: 'session_id', 
  as: 'session' 
});

// User - Attendance (Student has many attendances)
User.hasMany(Attendance, { 
  foreignKey: 'student_id', 
  as: 'attendances' 
});
Attendance.belongsTo(User, { 
  foreignKey: 'student_id', 
  as: 'student' 
});

// User - Enrollment (Student has many enrollments)
User.hasMany(Enrollment, {
  foreignKey: 'student_id',
  as: 'enrollments'
});
Enrollment.belongsTo(User, {
  foreignKey: 'student_id',
  as: 'student'
});

// Class - Enrollment (Class has many enrollments)
Class.hasMany(Enrollment, {
  foreignKey: 'class_id',
  as: 'enrollments'
});
Enrollment.belongsTo(Class, {
  foreignKey: 'class_id',
  as: 'class'
});

module.exports = {
  sequelize,
  User,
  Class,
  Session,
  Attendance,
  Enrollment
};
