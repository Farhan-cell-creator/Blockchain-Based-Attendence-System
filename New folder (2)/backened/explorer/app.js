// Simple frontend to interact with BAMS backend
async function getJson(path, opts) {
  const res = await fetch(path, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts));
  return res.json();
}

function el(id) { return document.getElementById(id); }

async function loadDepartments() {
  const data = await getJson('/api/departments');
  el('depts').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
}

async function loadClasses() {
  const data = await getJson('/api/classes');
  el('classes').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
}

async function loadStudents() {
  const data = await getJson('/api/students');
  el('students').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
}

async function viewStudent() {
  const id = el('student-id-input').value.trim();
  if (!id) return alert('enter student id');
  const data = await getJson('/api/attendance/student/' + encodeURIComponent(id));
  el('student-chain').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
}

async function markAttendance() {
  const studentId = el('att-student-id').value.trim();
  const status = el('att-status').value;
  if (!studentId) return alert('enter student id');
  const res = await fetch('/api/attendance/mark', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ studentId, status }) });
  const data = await res.json();
  el('att-result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
}

document.addEventListener('DOMContentLoaded', () => {
  el('btn-load-depts').addEventListener('click', loadDepartments);
  el('btn-load-classes').addEventListener('click', loadClasses);
  el('btn-load-students').addEventListener('click', loadStudents);
  el('btn-view-student').addEventListener('click', viewStudent);
  el('btn-mark-att').addEventListener('click', markAttendance);
});
