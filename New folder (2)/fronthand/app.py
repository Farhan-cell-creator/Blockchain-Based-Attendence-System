import streamlit as st
import requests
from requests.exceptions import RequestException
from datetime import datetime

st.set_page_config(page_title='BAMS Explorer (Streamlit)', layout='wide')

DEFAULT_BACKEND = st.session_state.get('backend_url', 'http://localhost:3000')

def backend_url_input():
    url = st.sidebar.text_input('Backend URL', value=DEFAULT_BACKEND)
    st.session_state['backend_url'] = url
    return url.rstrip('/')

BACKEND = backend_url_input()

st.title('BAMS — Streamlit Frontend')
st.markdown('Interact with the Blockchain Attendance Management System backend.')

def api_get(path):
    try:
        r = requests.get(BACKEND + path, timeout=10)
        r.raise_for_status()
        return r.json()
    except RequestException as e:
        st.error(f'GET {path} failed: {e}')
        return None

def api_post(path, payload):
    try:
        r = requests.post(BACKEND + path, json=payload, timeout=10)
        r.raise_for_status()
        return r.json()
    except RequestException as e:
        st.error(f'POST {path} failed: {e}')
        return None

# Tabs for functionality
tabs = st.tabs(['Departments', 'Classes', 'Students', 'Student Ledger', 'Mark Attendance'])

with tabs[0]:
    st.header('Departments')
    if st.button('Load Departments'):
        depts = api_get('/api/departments')
        if depts is not None:
            st.dataframe(depts)
            st.write('Count:', len(depts))

with tabs[1]:
    st.header('Classes')
    if st.button('Load Classes'):
        classes = api_get('/api/classes')
        if classes is not None:
            st.dataframe(classes)
            st.write('Count:', len(classes))

with tabs[2]:
    st.header('Students')
    col1, col2 = st.columns([3,1])
    with col1:
        q = st.text_input('Search by name or roll (leave empty to load all)')
    with col2:
        if st.button('Load Students'):
            students = api_get('/api/students')
            if students is not None:
                if q:
                    ql = q.lower()
                    students = [s for s in students if ql in (s.get('name','').lower() or '') or ql in (s.get('roll','').lower() or '')]
                st.dataframe(students)
                st.write('Count:', len(students))

with tabs[3]:
    st.header('Student Ledger (Attendance Chain)')
    sid = st.text_input('Student ID (e.g. dept-computing-class-1-stu-1)')
    if st.button('Load Student Chain') and sid:
        blocks = api_get(f'/api/attendance/student/{sid}')
        if blocks is not None:
            if not blocks:
                st.info('No blocks found for this student.')
            for b in blocks:
                idx = b.get('index')
                with st.expander(f'Block {idx} — {b.get("timestamp")}', expanded=False):
                    st.write('Index:', b.get('index'))
                    st.write('Timestamp:', b.get('timestamp'))
                    st.write('Prev Hash:', b.get('prev_hash'))
                    st.write('Nonce:', b.get('nonce'))
                    st.write('Hash:', b.get('hash'))
                    st.write('Transactions:')
                    st.json(b.get('transactions'))

with tabs[4]:
    st.header('Mark Attendance')
    # preload students dropdown
    students = api_get('/api/students') or []
    student_map = {f"{s['id']} — {s.get('name','')}": s['id'] for s in students}
    sel = st.selectbox('Select student', options=[''] + list(student_map.keys()))
    status = st.selectbox('Status', ['Present', 'Absent', 'Leave'])
    if st.button('Mark Attendance'):
        if not sel:
            st.warning('Select a student first')
        else:
            student_id = student_map[sel]
            payload = {'studentId': student_id, 'status': status}
            res = api_post('/api/attendance/mark', payload)
            if res is not None:
                st.success('Attendance marked')
                st.json(res)
                # show updated ledger
                st.write('Latest student chain:')
                blk = api_get(f'/api/attendance/student/{student_id}')
                if blk is not None:
                    st.write('Blocks:', len(blk))
                    st.json(blk[-5:])

st.sidebar.markdown('---')
st.sidebar.markdown('BAMS Streamlit frontend — connects to your Node backend.')
