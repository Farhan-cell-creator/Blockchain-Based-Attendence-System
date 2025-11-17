const fs = require('fs');
const path = require('path');
const { createDepartmentChain, createClassChain, createStudentChain } = require('../blockchain/factory');

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

function generate() {
  const reg = loadRegistry();
  const departments = [
    { id: 'dept-computing', name: 'School of Computing' },
    { id: 'dept-software', name: 'School of Software Engineering' }
  ];
  departments.forEach(d => {
    reg.departments[d.id] = d;
    const deptChain = createDepartmentChain(d.id);
    // add a metadata block
    deptChain.addBlock({ meta: { name: d.name } });
    // create 5 classes
    for (let c = 1; c <= 5; c++) {
      const classId = `${d.id}-class-${c}`;
      reg.classes[classId] = { id: classId, name: `Class ${c}`, departmentId: d.id };
      const classChain = createClassChain(classId, deptChain);
      classChain.addBlock({ meta: { name: `Class ${c}` } });
      // create 35 students
      for (let s = 1; s <= 35; s++) {
        const studentId = `${classId}-stu-${s}`;
        const student = { id: studentId, name: `Student ${s}`, roll: `${c}-${s}`, departmentId: d.id, classId };
        reg.students[studentId] = student;
        const studentChain = createStudentChain(studentId, classChain);
        studentChain.addBlock({ meta: student });
      }
    }
  });
  saveRegistry(reg);
  console.log('Default data generated: departments, classes, and students');
}

generate();
