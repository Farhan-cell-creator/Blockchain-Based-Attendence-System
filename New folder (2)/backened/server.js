const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const departmentsRoutes = require('./routes/departmentsRoutes');
const classesRoutes = require('./routes/classesRoutes');
const studentsRoutes = require('./routes/studentsRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();
app.use(bodyParser.json());

// API routes
app.use('/api/departments', departmentsRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/attendance', attendanceRoutes);

// static explorer
app.use('/explorer', express.static(path.join(__dirname, 'explorer')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`BAMS server listening on port ${PORT}`);
});
