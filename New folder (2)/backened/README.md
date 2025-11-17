# BAMS — Blockchain-Based Attendance Management System (minimal)

This repository contains a minimal Node.js backend that implements a three-layer blockchain hierarchy for Departments → Classes → Students and attendance blocks attached to student chains.

What is included
- Node.js Express server (`server.js`)
- Blockchain core in `blockchain/` (Block, Chain, factory, validator)
- Controllers and routes for Departments, Classes, Students, Attendance
- Persistence to JSON files under `data/` and `data/chains/`
- Script to generate default data: `scripts/generateDefaultData.js` (creates 2 departments, 5 classes each, 35 students each)
- Minimal static explorer at `/explorer`

Setup
1. Install dependencies:

```powershell
cd "c:\Users\farhanDev\Desktop\New folder (2)"
npm install
```

2. Generate default data (this will create many files and mine genesis blocks — mining may take some CPU time):

```powershell
npm run gen-data
```

3. Start server:

```powershell
npm start
```

APIs (examples)
- GET /api/departments
- POST /api/departments { id, name }
- PUT /api/departments/:id
- DELETE /api/departments/:id
- POST /api/classes { id, name, departmentId }
- POST /api/students { id, name, roll, departmentId, classId }
- POST /api/attendance/mark { studentId, status }
- GET /api/attendance/student/:id

Notes and next steps
- This is a functional, minimal implementation to satisfy the assignment requirements: PoW (hash starts with "0000"), chaining across department → class → student, immutable updates (append-only metadata blocks).
- Next steps you may want to add: a richer frontend explorer, chain validation endpoints, unit tests, pagination and search endpoints, and deployment instructions.
