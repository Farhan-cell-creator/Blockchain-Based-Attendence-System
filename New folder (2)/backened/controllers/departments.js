const express = require('express');
const fs = require('fs');
const path = require('path');
const { createDepartmentChain } = require('../blockchain/factory');

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

// Create department (append genesis block)
router.post('/', (req, res) => {
  const { id, name } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'id and name required' });
  const reg = loadRegistry();
  if (reg.departments[id]) return res.status(400).json({ error: 'department exists' });
  reg.departments[id] = { id, name, createdAt: new Date().toISOString() };
  saveRegistry(reg);
  // create chain file and genesis
  const chain = createDepartmentChain(id);
  res.json({ ok: true, department: reg.departments[id] });
});

// list departments
router.get('/', (req, res) => {
  const reg = loadRegistry();
  res.json(Object.values(reg.departments || {}));
});

// get department by id
router.get('/:id', (req, res) => {
  const reg = loadRegistry();
  const d = reg.departments[req.params.id];
  if (!d) return res.status(404).json({ error: 'not found' });
  res.json(d);
});

// update department -> append a new block to department chain with 'updated' metadata
router.put('/:id', (req, res) => {
  const reg = loadRegistry();
  const d = reg.departments[req.params.id];
  if (!d) return res.status(404).json({ error: 'not found' });
  const updated = Object.assign({}, d, req.body, { updatedAt: new Date().toISOString() });
  reg.departments[req.params.id] = updated;
  saveRegistry(reg);
  // append metadata block to chain
  const chain = createDepartmentChain(req.params.id);
  chain.addBlock({ action: 'update_department', payload: req.body });
  res.json({ ok: true, department: updated });
});

// delete department -> append a deleted block
router.delete('/:id', (req, res) => {
  const reg = loadRegistry();
  const d = reg.departments[req.params.id];
  if (!d) return res.status(404).json({ error: 'not found' });
  // mark deleted in registry and append block
  reg.departments[req.params.id] = Object.assign({}, d, { status: 'deleted', deletedAt: new Date().toISOString() });
  saveRegistry(reg);
  const chain = createDepartmentChain(req.params.id);
  chain.addBlock({ action: 'delete_department' });
  res.json({ ok: true });
});

module.exports = router;
