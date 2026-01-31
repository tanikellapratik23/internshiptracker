import React, { useState, useEffect } from 'react'

const API_BASE = 'http://localhost:4000';
const API = (path, opts = {}) => fetch(`${API_BASE}${path}`, opts).then(r => r.json())

function Login({ onLogin, onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(user => {
          onLogin({ token, user });
          window.history.replaceState({}, document.title, '/');
        })
        .catch(() => {});
    }
  }, [onLogin]);
  
  const submit = async (e) => {
    e.preventDefault();
    const res = await API('/api/auth/login', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ email, password }) 
    });
    if (res.token) onLogin(res);
    else alert(res.error || 'Login failed');
  }
  
  const loginWithLinkedIn = () => {
    window.location.href = `${API_BASE}/api/auth/linkedin`;
  }
  
  return (
    <form onSubmit={submit} className="card" style={{maxWidth:400, margin:'100px auto'}}>
      <h2>🎯 Internship Tracker</h2>
      <p style={{color:'#718096', marginBottom:20}}>Track your job applications & career progress</p>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" />
      <button type="submit">Login</button>
      <button type="button" onClick={onSwitch} className="secondary" style={{marginTop:8}}>Register</button>
      <div style={{margin:'16px 0', textAlign:'center', color:'#a0aec0'}}>or</div>
      <button type="button" onClick={loginWithLinkedIn} className="linkedin-btn">
        <span style={{fontWeight:'bold'}}>in</span> Sign in with LinkedIn
      </button>
    </form>
  )
}

function Register({ onLogin, onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const submit = async (e) => {
    e.preventDefault();
    const res = await API('/api/auth/register', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ email, password, name }) 
    });
    if (res.token) onLogin(res);
    else alert(res.error || 'Registration failed');
  }
  
  return (
    <form onSubmit={submit} className="card" style={{maxWidth:400, margin:'100px auto'}}>
      <h2>Create Account</h2>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full Name" />
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" />
      <button type="submit">Register</button>
      <button type="button" onClick={onSwitch} className="secondary" style={{marginTop:8}}>Back to Login</button>
    </form>
  )
}

function Dashboard({ token, user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apps, setApps] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [summary, setSummary] = useState({});
  const [reminders, setReminders] = useState([]);
  const [jobListings, setJobListings] = useState([]);
  const [showAppForm, setShowAppForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  const h = { Authorization: `Bearer ${token}` };

  const loadApps = () => fetch(`${API_BASE}/api/apps`, { headers: h }).then(r=>r.json()).then(setApps).catch(()=>{});
  const loadSummary = () => fetch(`${API_BASE}/api/analytics/summary`, { headers: h }).then(r=>r.json()).then(setSummary).catch(()=>{});
  const loadReminders = () => fetch(`${API_BASE}/api/reminders`, { headers: h }).then(r=>r.json()).then(setReminders).catch(()=>{});
  const loadJobs = () => fetch(`${API_BASE}/api/integrations/jobs`, { headers: h }).then(r=>r.json()).then(setJobListings).catch(()=>{});
  const loadContacts = () => fetch(`${API_BASE}/api/contacts`, { headers: h }).then(r=>r.json()).then(setContacts).catch(()=>{});

  useEffect(()=>{ 
    loadApps(); 
    loadSummary(); 
    loadReminders(); 
    loadJobs(); 
    loadContacts();
  }, [token]);

  const updateAppStatus = async (id, status) => {
    await fetch(`${API_BASE}/api/apps/${id}`, { 
      method: 'PUT', 
      headers: { ...h, 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ status, applied_at: status === 'applied' ? new Date().toISOString() : undefined }) 
    });
    loadApps();
    loadSummary();
  }

  const deleteApp = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    await fetch(`${API_BASE}/api/apps/${id}`, { method: 'DELETE', headers: h });
    loadApps();
    loadSummary();
  }

  const deleteReminder = async (id) => {
    await fetch(`${API_BASE}/api/reminders/${id}`, { method: 'DELETE', headers: h });
    loadReminders();
  }

  const deleteContact = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    await fetch(`${API_BASE}/api/contacts/${id}`, { method: 'DELETE', headers: h });
    loadContacts();
  }

  const importJobToApp = async (job) => {
    await fetch(`${API_BASE}/api/apps`, {
      method: 'POST',
      headers: { ...h, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: job.company,
        role: job.role,
        source: job.source || 'SimplifyJobs',
        status: 'todo',
        priority: 0,
        url: job.url
      })
    });
    loadApps();
    alert(`Added ${job.company} - ${job.role} to your applications!`);
  }

  return (
    <div>
      <div className="header">
        <h2>👋 Welcome, {user.name || user.email}</h2>
        <button onClick={onLogout} className="secondary">Logout</button>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          📊 Dashboard
        </button>
        <button className={`tab ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>
          📝 Applications
        </button>
        <button className={`tab ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
          💼 Job Board
        </button>
        <button className={`tab ${activeTab === 'contacts' ? 'active' : ''}`} onClick={() => setActiveTab('contacts')}>
          👥 Contacts
        </button>
        <button className={`tab ${activeTab === 'reminders' ? 'active' : ''}`} onClick={() => setActiveTab('reminders')}>
          ⏰ Reminders
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <>
          <div className="card">
            <h3>📈 Analytics</h3>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-number">{summary.total || 0}</div>
                <div className="stat-label">Total Applications</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{summary.wins || 0}</div>
                <div className="stat-label">Offers/Wins</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{summary.successRate ? summary.successRate.toFixed(1) + '%' : '0%'}</div>
                <div className="stat-label">Success Rate</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{reminders.filter(r => !r.done).length}</div>
                <div className="stat-label">Pending Reminders</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>🚀 Recent Applications</h3>
            {apps.slice(0, 5).map(a => (
              <div key={a.id} className="app-list-item">
                <div><strong>{a.company}</strong> — {a.role}</div>
                <div style={{fontSize:'0.9em', color:'#666', marginTop:4}}>
                  <span className={`badge ${a.status}`}>{a.status}</span>
                  {a.priority > 0 && <span className="priority-badge">Priority: {a.priority}</span>}
                </div>
              </div>
            ))}
            {apps.length === 0 && <div className="empty-state">No applications yet. Start tracking!</div>}
          </div>

          <div className="card">
            <h3>⏰ Upcoming Reminders</h3>
            {reminders.filter(r => !r.done).slice(0, 5).map(r => (
              <div key={r.id} style={{marginBottom:12, padding:12, background:'#fef5e7', borderRadius:6}}>
                <div><strong>{r.message}</strong></div>
                <div style={{fontSize:'0.85em', color:'#666'}}>
                  Due: {r.due_at ? new Date(r.due_at).toLocaleString() : 'N/A'}
                </div>
              </div>
            ))}
            {reminders.filter(r => !r.done).length === 0 && <div className="empty-state">No pending reminders</div>}
          </div>
        </>
      )}

      {activeTab === 'applications' && (
        <div className="card">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
            <h3>📝 Your Applications ({apps.length})</h3>
            <button onClick={()=>setShowAppForm(!showAppForm)}>{showAppForm ? 'Cancel' : '+ Add Application'}</button>
          </div>
          {showAppForm && <AppForm token={token} onDone={()=>{setShowAppForm(false); loadApps(); loadSummary();}} />}
          {apps.length === 0 && <div className="empty-state"><div className="empty-state-icon">📭</div>No applications yet.</div>}
          {apps.map(a => (
            <div key={a.id} className="app-list-item">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                <div style={{flex:1}}>
                  <div><strong>{a.company}</strong> — {a.role}</div>
                  <div style={{fontSize:'0.9em', color:'#666', marginTop:4}}>
                    <span className={`badge ${a.status}`}>{a.status}</span>
                    {a.priority > 0 && <span className="priority-badge">Priority: {a.priority}</span>}
                    {a.source && <span style={{marginLeft:8, fontSize:'0.85em'}}>via {a.source}</span>}
                  </div>
                  {a.applied_at && <div style={{fontSize:'0.85em', color:'#a0aec0', marginTop:4}}>Applied: {new Date(a.applied_at).toLocaleDateString()}</div>}
                  {a.url && <div style={{marginTop:4}}><a href={a.url} target="_blank" rel="noreferrer">View Posting →</a></div>}
                </div>
                <button onClick={()=>deleteApp(a.id)} className="danger" style={{fontSize:'0.8em'}}>Delete</button>
              </div>
              <div className="btn-group">
                <button onClick={()=>updateAppStatus(a.id, 'applied')} style={{background:'#bee3f8', color:'#2c5282', fontSize:'12px'}}>Applied</button>
                <button onClick={()=>updateAppStatus(a.id, 'interview')} style={{background:'#fef5e7', color:'#c27803', fontSize:'12px'}}>Interview</button>
                <button onClick={()=>updateAppStatus(a.id, 'offered')} className="success" style={{fontSize:'12px'}}>Offered</button>
                <button onClick={()=>updateAppStatus(a.id, 'rejected')} style={{background:'#fed7d7', color:'#742a2a', fontSize:'12px'}}>Rejected</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="card">
          <h3>💼 Available Internships & Jobs</h3>
          <p style={{color:'#718096', fontSize:'0.9em'}}>Automatically fetched from SimplifyJobs and other sources</p>
          {jobListings.length === 0 && <div className="empty-state"><div className="empty-state-icon">🔍</div>Loading job listings...</div>}
          {jobListings.map((j, i) => (
            <div key={i} className="app-list-item">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                <div style={{flex:1}}>
                  <div><strong>{j.company}</strong> — {j.role}</div>
                  {j.location && <div style={{fontSize:'0.85em', color:'#666'}}>📍 {j.location}</div>}
                  {j.source && <div style={{fontSize:'0.85em', color:'#a0aec0', marginTop:4}}>Source: {j.source}</div>}
                  {j.url && <div style={{marginTop:4}}><a href={j.url} target="_blank" rel="noreferrer">View Posting →</a></div>}
                </div>
                <button onClick={()=>importJobToApp(j)} className="success" style={{fontSize:'0.8em'}}>+ Add to My Apps</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="card">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
            <h3>👥 Networking Contacts ({contacts.length})</h3>
            <button onClick={()=>setShowContactForm(!showContactForm)}>{showContactForm ? 'Cancel' : '+ Add Contact'}</button>
          </div>
          {showContactForm && <ContactForm token={token} onDone={()=>{setShowContactForm(false); loadContacts();}} />}
          {contacts.length === 0 && <div className="empty-state"><div className="empty-state-icon">👤</div>No contacts yet.</div>}
          {contacts.map(c => (
            <div key={c.id} className="app-list-item">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                <div style={{flex:1}}>
                  <div><strong>{c.name}</strong> {c.title && `— ${c.title}`}</div>
                  {c.company && <div style={{fontSize:'0.9em', color:'#666'}}>🏢 {c.company}</div>}
                  {c.email && <div style={{fontSize:'0.85em', marginTop:4}}>✉️ {c.email}</div>}
                  {c.linkedin_url && <div style={{marginTop:4}}><a href={c.linkedin_url} target="_blank" rel="noreferrer">LinkedIn Profile →</a></div>}
                  {c.notes && <div style={{fontSize:'0.85em', color:'#718096', marginTop:8, padding:8, background:'#f7fafc', borderRadius:4}}>📝 {c.notes}</div>}
                </div>
                <button onClick={()=>deleteContact(c.id)} className="danger" style={{fontSize:'0.8em'}}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'reminders' && (
        <div className="card">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
            <h3>⏰ Reminders</h3>
            <button onClick={()=>setShowReminderForm(!showReminderForm)}>{showReminderForm ? 'Cancel' : '+ Add Reminder'}</button>
          </div>
          {showReminderForm && <ReminderForm token={token} apps={apps} onDone={()=>{setShowReminderForm(false); loadReminders();}} />}
          {reminders.length === 0 && <div className="empty-state"><div className="empty-state-icon">⏰</div>No reminders.</div>}
          {reminders.map(r => (
            <div key={r.id} style={{marginBottom:12, padding:16, background: r.done ? '#f7fafc' : '#fef5e7', borderRadius:8, border:'1px solid #e2e8f0'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                <div style={{flex:1}}>
                  <div><strong>{r.message}</strong></div>
                  <div style={{fontSize:'0.85em', color:'#666', marginTop:4}}>Due: {r.due_at ? new Date(r.due_at).toLocaleString() : 'N/A'}</div>
                  {r.done && <span className="badge" style={{background:'#c6f6d5', color:'#22543d', marginTop:4}}>Completed</span>}
                </div>
                <button onClick={()=>deleteReminder(r.id)} className="danger" style={{fontSize:'0.8em'}}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AppForm({ token, onDone }) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [source, setSource] = useState('');
  const [priority, setPriority] = useState(0);
  const [url, setUrl] = useState('');
  
  const submit = async (e) => {
    e.preventDefault();
    const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    await fetch(`${API_BASE}/api/apps`, { 
      method: 'POST', 
      headers: h, 
      body: JSON.stringify({ company, role, source, priority: parseInt(priority) || 0, url }) 
    });
    onDone();
  }
  
  return (
    <form onSubmit={submit} style={{border:'1px solid #e2e8f0', padding:16, marginBottom:16, borderRadius:8, background:'#f7fafc'}}>
      <div className="form-grid">
        <input value={company} onChange={e=>setCompany(e.target.value)} placeholder="Company Name" required />
        <input value={role} onChange={e=>setRole(e.target.value)} placeholder="Role/Position" required />
      </div>
      <div className="form-grid">
        <input value={source} onChange={e=>setSource(e.target.value)} placeholder="Source (LinkedIn, Indeed, etc.)" />
        <input value={priority} onChange={e=>setPriority(e.target.value)} type="number" placeholder="Priority (0-10)" />
      </div>
      <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="Job Posting URL (optional)" />
      <button type="submit" className="success">Add Application</button>
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
    await fetch(`${API_BASE}/api/reminders`, { 
      method: 'POST', 
      headers: h, 
      body: JSON.stringify({ application_id: appId ? parseInt(appId) : null, due_at: dueAt, message }) 
    });
    onDone();
  }
  
  return (
    <form onSubmit={submit} style={{border:'1px solid #e2e8f0', padding:16, marginBottom:16, borderRadius:8, background:'#f7fafc'}}>
      <select value={appId} onChange={e=>setAppId(e.target.value)}>
        <option value="">General reminder (not linked to application)</option>
        {apps.map(a => <option key={a.id} value={a.id}>{a.company} - {a.role}</option>)}
      </select>
      <input value={dueAt} onChange={e=>setDueAt(e.target.value)} type="datetime-local" placeholder="Due date" required />
      <input value={message} onChange={e=>setMessage(e.target.value)} placeholder="Reminder message" required />
      <button type="submit" className="success">Add Reminder</button>
    </form>
  )
}

function ContactForm({ token, onDone }) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [notes, setNotes] = useState('');
  
  const submit = async (e) => {
    e.preventDefault();
    const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    await fetch(`${API_BASE}/api/contacts`, { 
      method: 'POST', 
      headers: h, 
      body: JSON.stringify({ name, company, title, email, linkedin_url: linkedinUrl, notes }) 
    });
    onDone();
  }
  
  return (
    <form onSubmit={submit} style={{border:'1px solid #e2e8f0', padding:16, marginBottom:16, borderRadius:8, background:'#f7fafc'}}>
      <div className="form-grid">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Contact Name" required />
        <input value={company} onChange={e=>setCompany(e.target.value)} placeholder="Company" />
      </div>
      <div className="form-grid">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title/Position" />
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email" />
      </div>
      <input value={linkedinUrl} onChange={e=>setLinkedinUrl(e.target.value)} placeholder="LinkedIn Profile URL" />
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes about this contact" rows="3" />
      <button type="submit" className="success">Add Contact</button>
    </form>
  )
}

export default function App(){
  const [auth, setAuth] = useState(() => {
    try { return JSON.parse(localStorage.getItem('auth') || 'null'); } catch { return null; }
  });
  const [showRegister, setShowRegister] = useState(false);
  
  useEffect(()=> { localStorage.setItem('auth', JSON.stringify(auth)); }, [auth]);
  
  const logout = () => {
    setAuth(null);
    localStorage.removeItem('auth');
  }
  
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
