const PDFDocument = require('pdfkit');

/**
 * Generate PDF attendance report for a class
 * @param {Object} classData - Class information
 * @param {Array} attendanceHistory - Array of attendance records with session and student data
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generateAttendancePDF(classData, attendanceHistory) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Header with class info
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .fillColor('#4F46E5')
         .text('Attendance Report', { align: 'center' });

      doc.moveDown(0.5);
      
      // Class details
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#000000')
         .text(`Class: ${classData.name}`, { align: 'center' })
         .text(`Code: ${classData.code}`, { align: 'center' })
         .text(`Teacher: ${classData.teacher.name}`, { align: 'center' })
         .text(`Generated: ${new Date().toLocaleDateString('tr-TR', { 
           day: '2-digit', 
           month: 'long', 
           year: 'numeric',
           hour: '2-digit',
           minute: '2-digit'
         })}`, { align: 'center' });

      doc.moveDown(1);

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
          status: record.attendance_id ? 'P' : 'A',
          type: record.attendance_type
        });
      });
      
      // Sort sessions by date (earliest first)
      const sortedSessions = Array.from(sessionsMap.values()).sort((a, b) => 
        new Date(a.session_start) - new Date(b.session_start)
      );
      
      // Sort students by student number
      const sortedStudents = Array.from(studentsMap.values()).sort((a, b) => 
        (a.student_no || '').localeCompare(b.student_no || '')
      );

      // Statistics
      const totalSessions = sortedSessions.length;
      const totalStudents = sortedStudents.length;
      const presentCount = attendanceHistory.filter(item => item.attendance_id).length;
      const totalSlots = totalSessions * totalStudents;
      const attendanceRate = totalSlots > 0 ? ((presentCount / totalSlots) * 100).toFixed(1) : 0;

      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#000000')
         .text(`Total: ${totalStudents} Students × ${totalSessions} Sessions | Attendance Rate: ${attendanceRate}% | Present: ${presentCount} | Absent: ${totalSlots - presentCount}`, { align: 'center' });

      doc.moveDown(1);

      // Table setup
      const tableTop = doc.y;
      const startX = 30;
      const studentNoWidth = 60;
      const studentNameWidth = 100;
      const sessionColWidth = 30;
      
      // Calculate total table width
      const tableWidth = studentNoWidth + studentNameWidth + (sortedSessions.length * sessionColWidth);
      
      // Table header background
      doc.rect(startX, tableTop, tableWidth, 20)
         .fillAndStroke('#4F46E5', '#4F46E5');

      // Header text
      doc.fontSize(8)
         .font('Helvetica-Bold')
         .fillColor('#FFFFFF');

      let headerX = startX;
      doc.text('Student No', headerX + 2, tableTop + 6, { width: studentNoWidth - 4, align: 'left' });
      headerX += studentNoWidth;
      
      doc.text('Student Name', headerX + 2, tableTop + 6, { width: studentNameWidth - 4, align: 'left' });
      headerX += studentNameWidth;
      
      // Session headers
      sortedSessions.forEach((session, index) => {
        const sessionDate = new Date(session.session_start);
        const dateStr = sessionDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
        doc.fontSize(7)
           .text(`S${index + 1}`, headerX + 2, tableTop + 2, { width: sessionColWidth - 4, align: 'center' })
           .text(dateStr, headerX + 2, tableTop + 11, { width: sessionColWidth - 4, align: 'center' });
        headerX += sessionColWidth;
      });

      // Table rows
      let currentY = tableTop + 20;
      let rowIndex = 0;

      sortedStudents.forEach((student) => {
        // Check if we need a new page
        if (currentY > 520) {
          doc.addPage();
          currentY = 30;
        }

        const rowColor = rowIndex % 2 === 0 ? '#F9FAFB' : '#FFFFFF';
        
        doc.rect(startX, currentY, tableWidth, 18)
           .fillAndStroke(rowColor, '#E5E7EB');

        doc.fontSize(8)
           .font('Helvetica')
           .fillColor('#000000');

        let cellX = startX;
        
        // Student No
        doc.text(student.student_no || 'N/A', cellX + 2, currentY + 5, { width: studentNoWidth - 4, ellipsis: true });
        cellX += studentNoWidth;
        
        // Student Name
        doc.text(student.student_name, cellX + 2, currentY + 5, { width: studentNameWidth - 4, ellipsis: true });
        cellX += studentNameWidth;
        
        // Attendance status for each session
        sortedSessions.forEach(session => {
          const sessionKey = `${session.session_id}`;
          const attendance = student.attendances.get(sessionKey);
          const status = attendance ? attendance.status : 'A';
          
          // Color code: P = green, A = red
          if (status === 'P') {
            doc.fillColor('#10B981');
          } else {
            doc.fillColor('#EF4444');
          }
          
          doc.fontSize(9)
             .font('Helvetica-Bold')
             .text(status, cellX + 2, currentY + 5, { width: sessionColWidth - 4, align: 'center' });
          
          doc.fillColor('#000000');
          cellX += sessionColWidth;
        });

        currentY += 18;
        rowIndex++;
      });

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      if (pageCount > 0) {
        for (let i = 0; i < pageCount; i++) {
          doc.switchToPage(i);
          doc.fontSize(8)
             .font('Helvetica')
             .fillColor('#6B7280')
             .text(
               `Page ${i + 1} of ${pageCount}`,
               50,
               doc.page.height - 50,
               { align: 'center' }
             );
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateAttendancePDF };
