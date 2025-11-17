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

// add student
router.post('/', (req, res) => {
  const { id, name, roll, departmentId, classId } = req.body;
  if (!id || !name || !roll || !departmentId || !classId) return res.status(400).json({ error: 'id, name, roll, departmentId, classId required' });
  const reg = loadRegistry();
  if (!reg.departments[departmentId]) return res.status(400).json({ error: 'department not found' });
  if (!reg.classes[classId]) return res.status(400).json({ error: 'class not found' });
  if (reg.students[id]) return res.status(400).json({ error: 'student exists' });
  reg.students[id] = { id, name, roll, departmentId, classId, createdAt: new Date().toISOString() };
  saveRegistry(reg);
  // create student chain linking to class
  const deptChain = createDepartmentChain(departmentId);
  const classChain = createClassChain(classId, deptChain);
  const studentChain = createStudentChain(id, classChain);
  res.json({ ok: true, student: reg.students[id] });
});

// list students
router.get('/', (req, res) => {
  const reg = loadRegistry();
  res.json(Object.values(reg.students || {}));
});

router.get('/:id', (req, res) => {
  const reg = loadRegistry();
  const s = reg.students[req.params.id];
  if (!s) return res.status(404).json({ error: 'not found' });
  res.json(s);
});

// update student -> append block
router.put('/:id', (req, res) => {
  const reg = loadRegistry();
  const s = reg.students[req.params.id];
  if (!s) return res.status(404).json({ error: 'not found' });
  reg.students[req.params.id] = Object.assign({}, s, req.body, { updatedAt: new Date().toISOString() });
  saveRegistry(reg);
  const deptChain = createDepartmentChain(s.departmentId);
  const classChain = createClassChain(s.classId, deptChain);
  const studentChain = createStudentChain(req.params.id, classChain);
  studentChain.addBlock({ action: 'update_student', payload: req.body });
  res.json({ ok: true, student: reg.students[req.params.id] });
});

// delete student -> append deleted block
router.delete('/:id', (req, res) => {
  const reg = loadRegistry();
  const s = reg.students[req.params.id];
  if (!s) return res.status(404).json({ error: 'not found' });
  reg.students[req.params.id] = Object.assign({}, s, { status: 'deleted', deletedAt: new Date().toISOString() });
  saveRegistry(reg);
  const deptChain = createDepartmentChain(s.departmentId);
  const classChain = createClassChain(s.classId, deptChain);
  const studentChain = createStudentChain(req.params.id, classChain);
  studentChain.addBlock({ action: 'delete_student' });
  res.json({ ok: true });
});

module.exports = router;
