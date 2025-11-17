const express = require('express');
const fs = require('fs');
const path = require('path');
const { createDepartmentChain, createClassChain, createStudentChain } = require('../blockchain/factory');

const router = express.Router();
const registryPath = path.join(__dirname, '..', 'data', 'registry.json');

function loadRegistry() {
  if (!fs.existsSync(registryPath)) return { departments: {}, classes: {}, students: {} };
  return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
}

function saveRegistry(reg) {
  const folder = path.dirname(registryPath);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(registryPath, JSON.stringify(reg, null, 2));
}

// mark attendance for a student (present/absent/leave)
router.post('/mark', (req, res) => {
  const { studentId, status } = req.body; // status: Present | Absent | Leave
  if (!studentId || !status) return res.status(400).json({ error: 'studentId and status required' });
  const reg = loadRegistry();
  const student = reg.students[studentId];
  if (!student) return res.status(404).json({ error: 'student not found' });
  const deptChain = createDepartmentChain(student.departmentId);
  const classChain = createClassChain(student.classId, deptChain);
  const studentChain = createStudentChain(studentId, classChain);
  const payload = {
    studentId,
    name: student.name,
    roll: student.roll,
    departmentId: student.departmentId,
    classId: student.classId,
    timestamp: new Date().toISOString(),
    status
  };
  const blk = studentChain.addBlock({ attendance: payload });
  res.json({ ok: true, block: blk });
});

// get attendance blocks for student
router.get('/student/:id', (req, res) => {
  const sid = req.params.id;
  const chainPath = path.join(__dirname, '..', 'data', 'chains', `student-${sid}.json`);
  if (!fs.existsSync(chainPath)) return res.status(404).json({ error: 'student chain not found' });
  const raw = fs.readFileSync(chainPath, 'utf8');
  const obj = JSON.parse(raw);
  res.json(obj.blocks || []);
});

// get today's attendance for a class
router.get('/class/:classId/today', (req, res) => {
  const classId = req.params.classId;
  const reg = loadRegistry();
  const students = Object.values(reg.students || {}).filter(s => s.classId === classId);
  const results = [];
  students.forEach(s => {
    const chainPath = path.join(__dirname, '..', 'data', 'chains', `student-${s.id}.json`);
    if (!fs.existsSync(chainPath)) return;
    const obj = JSON.parse(fs.readFileSync(chainPath, 'utf8'));
    const blocks = obj.blocks || [];
    const today = new Date().toISOString().slice(0, 10);
    blocks.forEach(b => {
      if (b.transactions && b.transactions.attendance) {
        const ts = b.transactions.attendance.timestamp.slice(0, 10);
        if (ts === today) results.push({ student: s.id, block: b });
      }
    });
  });
  res.json(results);
});

module.exports = router;
