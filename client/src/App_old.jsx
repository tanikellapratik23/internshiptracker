import React, { useState, useEffect } from 'react'

const API = (path, opts = {}) => fetch(`http://localhost:4000${path}`, opts).then(r => r.json())

function Login({ onLogin, onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    const res = await API('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (res.token) onLogin(res);
    else alert(res.error || 'Login failed');
  }
  return (
    <form onSubmit={submit} className="card">
      <h2>Login</h2>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
      <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="password" />
      <button type="submit">Login</button>
      <button type="button" onClick={onSwitch} style={{marginLeft:8}}>Register</button>
    </form>
  )
}

function Register({ onLogin, onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    const res = await API('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name }) });
    if (res.token) onLogin(res);
    else alert(res.error || 'Registration failed');
  }
  return (
    <form onSubmit={submit} className="card">
      <h2>Register</h2>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="name (optional)" />
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
      <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="password" />
      <button type="submit">Register</button>
      <button type="button" onClick={onSwitch} style={{marginLeft:8}}>Back to Login</button>
    </form>
  )
}

function Dashboard({ token, user, onLogout }) {
  const [apps, setApps] = useState([]);
  const [summary, setSummary] = useState({});
  const [reminders, setReminders] = useState([]);
  const [jobListings, setJobListings] = useState([]);
  const [showAppForm, setShowAppForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);

  const h = { Authorization: `Bearer ${token}` };

  const loadApps = () => fetch('http://localhost:4000/api/apps', { headers: h }).then(r=>r.json()).then(setApps);
  const loadSummary = () => fetch('http://localhost:4000/api/analytics/summary', { headers: h }).then(r=>r.json()).then(setSummary);
  const loadReminders = () => fetch('http://localhost:4000/api/reminders', { headers: h }).then(r=>r.json()).then(setReminders);
  const loadJobs = () => fetch('http://localhost:4000/api/integrations/jobs', { headers: h }).then(r=>r.json()).then(setJobListings);

  useEffect(()=>{ loadApps(); loadSummary(); loadReminders(); loadJobs(); }, [token]);

  const updateAppStatus = async (id, status) => {
    await fetch(`http://localhost:4000/api/apps/${id}`, { method: 'PUT', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify({ status, applied_at: status === 'applied' ? new Date().toISOString() : undefined }) });
    loadApps();
    loadSummary();
  }

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2>Welcome, {user.name || user.email}</h2>
        <button onClick={onLogout}>Logout</button>
      </div>

      <div className="card">
        <strong>Analytics</strong>
        <div>Applications: {summary.total || 0}</div>
        <div>Wins: {summary.wins || 0}</div>
        <div>Success Rate: {summary.successRate ? summary.successRate.toFixed(1) + '%' : '0%'}</div>
      </div>

      <div className="card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h3>Your Applications</h3>
          <button onClick={()=>setShowAppForm(!showAppForm)}>{showAppForm ? 'Cancel' : 'Add Application'}</button>
        </div>
        {showAppForm && <AppForm token={token} onDone={()=>{setShowAppForm(false); loadApps(); loadSummary();}} />}
        {apps.length === 0 && <div>No applications yet.</div>}
        <ul style={{listStyle:'none', padding:0}}>
          {apps.map(a => (
            <li key={a.id} style={{marginBottom:8, borderBottom:'1px solid #eee', paddingBottom:8}}>
              <div><strong>{a.company}</strong> — {a.role}</div>
              <div style={{fontSize:'0.9em', color:'#666'}}>Status: {a.status} | Priority: {a.priority || 0}</div>
              <div style={{marginTop:4}}>
                <button onClick={()=>updateAppStatus(a.id, 'applied')} style={{fontSize:'0.8em', marginRight:4}}>Mark Applied</button>
                <button onClick={()=>updateAppStatus(a.id, 'interview')} style={{fontSize:'0.8em', marginRight:4}}>Interview</button>
                <button onClick={()=>updateAppStatus(a.id, 'offered')} style={{fontSize:'0.8em', marginRight:4}}>Offered</button>
                <button onClick={()=>updateAppStatus(a.id, 'rejected')} style={{fontSize:'0.8em'}}>Rejected</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h3>Reminders</h3>
          <button onClick={()=>setShowReminderForm(!showReminderForm)}>{showReminderForm ? 'Cancel' : 'Add Reminder'}</button>
        </div>
        {showReminderForm && <ReminderForm token={token} apps={apps} onDone={()=>{setShowReminderForm(false); loadReminders();}} />}
        {reminders.length === 0 && <div>No reminders.</div>}
        <ul style={{listStyle:'none', padding:0}}>
          {reminders.map(r => (
            <li key={r.id} style={{marginBottom:8}}>
              <div>{r.message}</div>
              <div style={{fontSize:'0.85em', color:'#666'}}>Due: {r.due_at ? new Date(r.due_at).toLocaleString() : 'N/A'}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Job Listings (from integrations)</h3>
        {jobListings.length === 0 && <div>No job listings available. Check back later or sync with GitHub job repos.</div>}
        <ul style={{listStyle:'none', padding:0}}>
          {jobListings.map((j, i) => (
            <li key={i} style={{marginBottom:8, borderBottom:'1px solid #eee', paddingBottom:8}}>
              <div><strong>{j.company}</strong> — {j.role}</div>
              {j.url && <a href={j.url} target="_blank" rel="noreferrer" style={{fontSize:'0.85em'}}>View Posting</a>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function AppForm({ token, onDone }) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [source, setSource] = useState('');
  const [priority, setPriority] = useState(0);
  const submit = async (e) => {
    e.preventDefault();
    const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    await fetch('http://localhost:4000/api/apps', { method: 'POST', headers: h, body: JSON.stringify({ company, role, source, priority: parseInt(priority) || 0 }) });
    onDone();
  }
  return (
    <form onSubmit={submit} style={{border:'1px solid #ddd', padding:12, marginTop:8, borderRadius:4}}>
      <input value={company} onChange={e=>setCompany(e.target.value)} placeholder="Company" required />
      <input value={role} onChange={e=>setRole(e.target.value)} placeholder="Role" required />
      <input value={source} onChange={e=>setSource(e.target.value)} placeholder="Source (optional)" />
      <input value={priority} onChange={e=>setPriority(e.target.value)} type="number" placeholder="Priority (0-10)" />
      <button type="submit">Add</button>
    </form>
  )
}

function ReminderForm({ token, apps, onDone }) {
  const [appId, setAppId] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [message, setMessage] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    await fetch('http://localhost:4000/api/reminders', { method: 'POST', headers: h, body: JSON.stringify({ application_id: appId ? parseInt(appId) : null, due_at: dueAt, message }) });
    onDone();
  }
  return (
    <form onSubmit={submit} style={{border:'1px solid #ddd', padding:12, marginTop:8, borderRadius:4}}>
      <select value={appId} onChange={e=>setAppId(e.target.value)}>
        <option value="">General reminder</option>
        {apps.map(a => <option key={a.id} value={a.id}>{a.company} - {a.role}</option>)}
      </select>
      <input value={dueAt} onChange={e=>setDueAt(e.target.value)} type="datetime-local" placeholder="Due date" />
      <input value={message} onChange={e=>setMessage(e.target.value)} placeholder="Reminder message" required />
      <button type="submit">Add Reminder</button>
    </form>
  )
}

export default function App(){
  const [auth, setAuth] = useState(() => {
    try { return JSON.parse(localStorage.getItem('auth') || 'null'); } catch { return null; }
  });
  const [showRegister, setShowRegister] = useState(false);
  useEffect(()=> { localStorage.setItem('auth', JSON.stringify(auth)); }, [auth]);
  const logout = () => setAuth(null);
  if (!auth) {
    return (
      <div className="app">
        {showRegister
          ? <Register onLogin={(res)=>setAuth(res)} onSwitch={()=>setShowRegister(false)} />
          : <Login onLogin={(res)=>setAuth(res)} onSwitch={()=>setShowRegister(true)} />
        }
      </div>
    )
  }
  return <div className="app"><Dashboard token={auth.token} user={auth.user} onLogout={logout} /></div>
}
