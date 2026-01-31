require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: 'no token' });
  const parts = h.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'malformed token' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    res.status(401).json({ error: 'invalid token' });
  }
}

// Auth
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'missing fields' });
  const hash = await bcrypt.hash(password, 10);
  db.run("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)", [email, hash, name], function (err) {
    if (err) return res.status(400).json({ error: 'email exists' });
    const user = { id: this.lastID, email, name };
    const token = jwt.sign(user, JWT_SECRET);
    res.json({ token, user });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT id, email, password_hash, name FROM users WHERE email = ?', [email], async (err, row) => {
    if (err || !row) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const user = { id: row.id, email: row.email, name: row.name };
    const token = jwt.sign(user, JWT_SECRET);
    res.json({ token, user });
  });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  db.get('SELECT id, email, name FROM users WHERE id = ?', [req.user.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'user not found' });
    res.json({ id: row.id, email: row.email, name: row.name });
  });
});

// Applications CRUD
app.get('/api/apps', authMiddleware, (req, res) => {
  db.all('SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/apps', authMiddleware, (req, res) => {
  const { company, role, source, status, priority, applied_at } = req.body;
  const sql = `INSERT INTO applications (user_id, company, role, source, status, priority, applied_at) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [req.user.id, company, role, source, status || 'todo', priority || 0, applied_at || null], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM applications WHERE id = ?', [this.lastID], (e, row) => {
      res.json(row);
    });
  });
});

app.put('/api/apps/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  const fields = req.body;
  const updates = [];
  const vals = [];
  for (const k of Object.keys(fields)) {
    updates.push(`${k} = ?`);
    vals.push(fields[k]);
  }
  vals.push(req.user.id);
  vals.push(id);
  const sql = `UPDATE applications SET ${updates.join(', ')}, updated_at = datetime('now') WHERE user_id = ? AND id = ?`;
  db.run(sql, vals, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

app.delete('/api/apps/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM applications WHERE user_id = ? AND id = ?', [req.user.id, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Simple analytics: success rate and counts
app.get('/api/analytics/summary', authMiddleware, (req, res) => {
  const sql = `SELECT
    SUM(CASE WHEN status = 'offered' OR status = 'hired' THEN 1 ELSE 0 END) AS wins,
    COUNT(*) AS total
  FROM applications WHERE user_id = ?`;
  db.get(sql, [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    const wins = row.wins || 0;
    const total = row.total || 0;
    const successRate = total === 0 ? 0 : (wins / total) * 100;
    res.json({ wins, total, successRate });
  });
});

// Contacts CRUD (minimal)
app.get('/api/contacts', authMiddleware, (req, res) => {
  db.all('SELECT * FROM contacts WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/contacts', authMiddleware, (req, res) => {
  const { name, company, title, email, linkedin_url, notes } = req.body;
  db.run('INSERT INTO contacts (user_id, name, company, title, email, linkedin_url, notes) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.user.id, name, company, title, email, linkedin_url, notes], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM contacts WHERE id = ?', [this.lastID], (e, row) => res.json(row));
  });
});

// Reminders (minimal)
app.get('/api/reminders', authMiddleware, (req, res) => {
  db.all('SELECT * FROM reminders WHERE user_id = ? ORDER BY due_at ASC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/reminders', authMiddleware, (req, res) => {
  const { application_id, due_at, message } = req.body;
  db.run('INSERT INTO reminders (user_id, application_id, due_at, message) VALUES (?, ?, ?, ?)', [req.user.id, application_id, due_at, message], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM reminders WHERE id = ?', [this.lastID], (e, row) => res.json(row));
  });
});

app.delete('/api/reminders/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM reminders WHERE user_id = ? AND id = ?', [req.user.id, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

app.delete('/api/contacts/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM contacts WHERE user_id = ? AND id = ?', [req.user.id, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Notes API
app.get('/api/notes', authMiddleware, (req, res) => {
  db.all('SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/notes', authMiddleware, (req, res) => {
  const { application_id, contact_id, body } = req.body;
  db.run('INSERT INTO notes (user_id, application_id, contact_id, body) VALUES (?, ?, ?, ?)', [req.user.id, application_id, contact_id, body], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM notes WHERE id = ?', [this.lastID], (e, row) => res.json(row));
  });
});

// Placeholder: route to fetch job postings or connect to linked repos/LinkedIn
app.get('/api/integrations/jobs', authMiddleware, async (req, res) => {
  try {
    // Fetch jobs from SimplifyJobs/Summer2026-Internships GitHub repo
    const response = await axios.get('https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/main/README.md');
    const markdown = response.data;
    
    // Simple parser to extract jobs (looks for table rows)
    const jobs = [];
    const lines = markdown.split('\n');
    let inTable = false;
    
    for (const line of lines) {
      if (line.includes('| Company |') || line.includes('|---')) {
        inTable = true;
        continue;
      }
      if (inTable && line.startsWith('|')) {
        const cols = line.split('|').map(c => c.trim()).filter(Boolean);
        if (cols.length >= 2) {
          const company = cols[0].replace(/\[|\]\(.*?\)/g, '').trim();
          const role = cols[1].replace(/\[|\]\(.*?\)/g, '').trim();
          const urlMatch = cols[1].match(/\(([^)]+)\)/);
          const url = urlMatch ? urlMatch[1] : null;
          if (company && role && company !== 'Company') {
            jobs.push({ company, role, url, source: 'SimplifyJobs' });
          }
        }
      }
    }
    
    res.json(jobs.slice(0, 20)); // Return first 20 jobs
  } catch (error) {
    res.json([]);
  }
});

// LinkedIn OAuth (placeholder - requires LinkedIn app credentials)
app.get('/api/auth/linkedin', (req, res) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:4000/api/auth/linkedin/callback';
  if (!clientId) return res.status(500).json({ error: 'LinkedIn not configured. Set LINKEDIN_CLIENT_ID in .env' });
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email`;
  res.redirect(authUrl);
});

app.get('/api/auth/linkedin/callback', async (req, res) => {
  const code = req.query.code;
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:4000/api/auth/linkedin/callback';
  
  if (!clientId || !clientSecret) {
    return res.status(500).send('LinkedIn OAuth not configured');
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
      }
    });
    
    const accessToken = tokenResponse.data.access_token;
    
    // Get user profile
    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const linkedInProfile = profileResponse.data;
    
    // Find or create user
    db.get('SELECT * FROM users WHERE email = ?', [linkedInProfile.email], async (err, user) => {
      if (user) {
        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
        res.redirect(`http://localhost:5173?token=${token}`);
      } else {
        // Create new user
        const hash = await bcrypt.hash(Math.random().toString(), 10);
        db.run("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)", 
          [linkedInProfile.email, hash, linkedInProfile.name], 
          function (err) {
            if (err) return res.status(500).send('Error creating user');
            const newUser = { id: this.lastID, email: linkedInProfile.email, name: linkedInProfile.name };
            const token = jwt.sign(newUser, JWT_SECRET);
            res.redirect(`http://localhost:5173?token=${token}`);
          }
        );
      }
    });
  } catch (error) {
    console.error('LinkedIn OAuth error:', error);
    res.status(500).send('LinkedIn authentication failed');
  }
});

// Priority scoring endpoint
app.post('/api/apps/:id/score', authMiddleware, (req, res) => {
  const id = req.params.id;
  
  db.get('SELECT * FROM applications WHERE id = ? AND user_id = ?', [id, req.user.id], (err, app) => {
    if (err || !app) return res.status(404).json({ error: 'Application not found' });
    
    // Simple priority scoring algorithm
    let score = 0;
    
    // Base score from current priority
    score += app.priority || 0;
    
    // Bonus for certain statuses
    if (app.status === 'interview') score += 5;
    if (app.status === 'offered') score += 10;
    
    // Recency bonus (applications created in last 7 days)
    const daysSinceCreated = (Date.now() - new Date(app.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 7) score += 3;
    
    // Update the priority
    db.run('UPDATE applications SET priority = ? WHERE id = ?', [score, id], function (updateErr) {
      if (updateErr) return res.status(500).json({ error: updateErr.message });
      res.json({ id, score });
    });
  });
});

// User preferences
app.get('/api/user/preferences', authMiddleware, (req, res) => {
  db.get('SELECT preferences FROM users WHERE id = ?', [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    try {
      const prefs = row.preferences ? JSON.parse(row.preferences) : {};
      res.json(prefs);
    } catch {
      res.json({});
    }
  });
});

app.put('/api/user/preferences', authMiddleware, (req, res) => {
  const prefs = JSON.stringify(req.body);
  db.run('UPDATE users SET preferences = ? WHERE id = ?', [prefs, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: true });
  });
});

app.get('/api/integrations/placeholder', authMiddleware, (req, res) => {
  res.json({ note: 'Add LinkedIn and job-source integrations here. Example repo: https://github.com/SimplifyJobs/Summer2026-Internships' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
