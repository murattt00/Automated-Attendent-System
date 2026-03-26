const XLSX = require('xlsx');

// Helper function to generate Excel file for attendance
const generateAttendanceExcel = (classData, attendanceHistory) => {
  // Prepare data for Excel
  const worksheetData = [];
  
  // Header row
  worksheetData.push([
    'Class Name',
    classData.name,
    '',
    'Class Code',
    classData.code,
    '',
    'Teacher',
    classData.teacher.name
  ]);
  worksheetData.push([]);
  
  // Add export date
  worksheetData.push(['Export Date', new Date().toLocaleString('tr-TR')]);
  worksheetData.push([]);
  
  // Group data by students and sessions
  const studentsMap = new Map();
  const sessionsMap = new Map();
  
  // Collect unique students and sessions
  attendanceHistory.forEach(record => {
    const studentKey = `${record.student_id}`;
    const sessionKey = `${record.session_id}`;
    
    if (!studentsMap.has(studentKey)) {
      studentsMap.set(studentKey, {
        student_no: record.student_no,
        student_name: record.student_name,
        attendances: new Map()
      });
    }
    
    if (!sessionsMap.has(sessionKey)) {
      sessionsMap.set(sessionKey, {
        session_id: record.session_id,
        session_start: record.session_start
      });
    }
    
    // Store attendance status for this student-session pair
    studentsMap.get(studentKey).attendances.set(sessionKey, {
      status: record.attendance_id ? 'Present' : 'Absent',
      type: record.attendance_type
    });
  });
  
  // Sort sessions by date (earliest first)
  const sortedSessions = Array.from(sessionsMap.values()).sort((a, b) => 
    new Date(a.session_start) - new Date(b.session_start)
  );
  
  // Build column headers
  const headers = ['Student No', 'Student Name'];
  const columnWidths = [
    { wch: 15 }, // Student No
    { wch: 25 }  // Student Name
  ];
  
  sortedSessions.forEach((session, index) => {
    const sessionDate = new Date(session.session_start);
    const dateStr = sessionDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    const timeStr = sessionDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    headers.push(`Session ${index + 1}\n${dateStr} ${timeStr}`);
    columnWidths.push({ wch: 12 });
  });
  
  worksheetData.push(headers);
  
  // Sort students by student number
  const sortedStudents = Array.from(studentsMap.values()).sort((a, b) => 
    (a.student_no || '').localeCompare(b.student_no || '')
  );
  
  // Build data rows
  sortedStudents.forEach(student => {
    const row = [student.student_no || 'N/A', student.student_name];
    
    sortedSessions.forEach(session => {
      const sessionKey = `${session.session_id}`;
      const attendance = student.attendances.get(sessionKey);
      row.push(attendance && attendance.status === 'Present' ? 'P' : 'A');
    });
    
    worksheetData.push(row);
  });
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Apply cell styling for attendance cells
  const headerRowIndex = 4; // 0-indexed row where headers are (after class info and blank rows)
  sortedStudents.forEach((student, studentIndex) => {
    const rowIndex = headerRowIndex + 1 + studentIndex;
    
    sortedSessions.forEach((session, sessionIndex) => {
      const colIndex = 2 + sessionIndex; // First 2 columns are Student No and Name
      const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
      
      const sessionKey = `${session.session_id}`;
      const attendance = student.attendances.get(sessionKey);
      const isPresent = attendance && attendance.status === 'Present';
      
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          fill: {
            fgColor: { rgb: isPresent ? 'FF10B981' : 'FFEF4444' }
          },
          font: {
            bold: true,
            color: { rgb: 'FFFFFFFF' }
          },
          alignment: {
            horizontal: 'center',
            vertical: 'center'
          }
        };
      }
    });
  });
  
  // Set column widths
  worksheet['!cols'] = columnWidths;
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');
  
  // Generate buffer
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', cellStyles: true });
};

module.exports = {
  generateAttendanceExcel
};
