const Chain = require('./chain');

function createDepartmentChain(deptId) {
  const chain = new Chain(deptId, 'department');
  if (!chain.getLatest()) chain.addGenesis('0');
  return chain;
}

function createClassChain(classId, parentDeptChain) {
  const prev = parentDeptChain.getLatest() ? parentDeptChain.getLatest().hash : '0';
  const chain = new Chain(classId, 'class');
  if (!chain.getLatest()) chain.addGenesis(prev);
  return chain;
}

function createStudentChain(studentId, parentClassChain) {
  const prev = parentClassChain.getLatest() ? parentClassChain.getLatest().hash : '0';
  const chain = new Chain(studentId, 'student');
  if (!chain.getLatest()) chain.addGenesis(prev);
  return chain;
}

module.exports = { createDepartmentChain, createClassChain, createStudentChain };
