const express = require('express');
const fs = require('fs');
const path = require('path');
const { createDepartmentChain, createClassChain } = require('../blockchain/factory');

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

// create class inside department
router.post('/', (req, res) => {
  const { id, name, departmentId } = req.body;
  if (!id || !name || !departmentId) return res.status(400).json({ error: 'id, name, departmentId required' });
  const reg = loadRegistry();
  if (!reg.departments[departmentId]) return res.status(400).json({ error: 'parent department not found' });
  if (reg.classes[id]) return res.status(400).json({ error: 'class exists' });
  reg.classes[id] = { id, name, departmentId, createdAt: new Date().toISOString() };
  saveRegistry(reg);
  // create class chain with genesis prev hash = latest dept hash
  const deptChain = createDepartmentChain(departmentId);
  const classChain = createClassChain(id, deptChain);
  res.json({ ok: true, class: reg.classes[id] });
});

// list classes
router.get('/', (req, res) => {
  const reg = loadRegistry();
  res.json(Object.values(reg.classes || {}));
});

router.get('/:id', (req, res) => {
  const reg = loadRegistry();
  const c = reg.classes[req.params.id];
  if (!c) return res.status(404).json({ error: 'not found' });
  res.json(c);
});

// update class -> append update block
router.put('/:id', (req, res) => {
  const reg = loadRegistry();
  const c = reg.classes[req.params.id];
  if (!c) return res.status(404).json({ error: 'not found' });
  reg.classes[req.params.id] = Object.assign({}, c, req.body, { updatedAt: new Date().toISOString() });
  saveRegistry(reg);
  const deptChain = createDepartmentChain(c.departmentId);
  const classChain = createClassChain(req.params.id, deptChain);
  classChain.addBlock({ action: 'update_class', payload: req.body });
  res.json({ ok: true, class: reg.classes[req.params.id] });
});

// delete class -> append deleted block
router.delete('/:id', (req, res) => {
  const reg = loadRegistry();
  const c = reg.classes[req.params.id];
  if (!c) return res.status(404).json({ error: 'not found' });
  reg.classes[req.params.id] = Object.assign({}, c, { status: 'deleted', deletedAt: new Date().toISOString() });
  saveRegistry(reg);
  const deptChain = createDepartmentChain(c.departmentId);
  const classChain = createClassChain(req.params.id, deptChain);
  classChain.addBlock({ action: 'delete_class' });
  res.json({ ok: true });
});

module.exports = router;
