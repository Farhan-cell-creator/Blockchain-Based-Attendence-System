# Streamlit Frontend for BAMS

This small Streamlit app provides a simple, user-friendly frontend for the Blockchain Attendance Management System backend.

Files
- `app.py` — main Streamlit application
- `requirements.txt` — Python dependencies (streamlit, requests)

Usage
1. Install dependencies (recommended to use a virtual environment):

```powershell
cd "c:\Users\farhanDev\Desktop\New folder (2)\fronthand"
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Ensure your backend is running (default expected at `http://localhost:3000`). If your backend runs on a different host or port, change the Backend URL in the Streamlit sidebar.

3. Run the Streamlit app:

```powershell
streamlit run app.py
```

Notes
- The app uses server-side HTTP calls (via `requests`) to your backend; no CORS config is required.
- It supports listing/searching departments, classes, students, viewing the student's chain, and marking attendance (which will create a mined block on the student chain).
