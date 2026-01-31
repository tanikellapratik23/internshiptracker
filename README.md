Internship/Job Tracker

A comprehensive full-stack application for tracking job applications, managing networking contacts, and staying organized during your internship/job search. Built with React, Node.js, Express, and SQLite.

Features

Authentication
- Email/Password registration and login with JWT tokens
- LinkedIn OAuth integration for seamless sign-in
- Secure password hashing with bcrypt
- Multi-user support with isolated data

Application Management
- Track unlimited job applications
- Status tracking: Todo → Applied → Interview → Offered/Rejected
- Priority scoring (0-10) for each application
- Source tracking (LinkedIn, Indeed, SimplifyJobs, etc.)
- Direct links to job postings
- Application timeline and dates
- Quick status updates with visual badges

Job Board Integration
- Automatic job fetching from SimplifyJobs/Summer2026-Internships
- Browse 1000+ internship postings
- One-click import to your applications
- Support for multiple job sources

### 👥 Networking Contacts
- Manage recruiters, employees, and professional contacts
- Track company, title, email, and LinkedIn profiles
- Add personal notes for each contact
- Organize your networking efforts

### ⏰ Reminders & Deadlines
- Create reminders for applications and deadlines
- Link reminders to specific applications
- Due date tracking with notifications
- Mark reminders as completed

### 📊 Analytics Dashboard
- Track total applications
- Monitor success rate (offers/applications)
- View pending reminders
- Visualize your job search progress
- Recent applications overview

### 🎨 Modern UI
- Beautiful gradient design with purple theme
- Responsive tab-based navigation
- Status badges with color coding
- Empty states and loading indicators
- Mobile-friendly interface

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Git

### Installation

1. **Clone the repository**
```bash
cd /Users/pratiktanikella/Desktop
git clone <your-repo-url> internship-tracker
cd internship-tracker
```

2. **Setup Backend**
```bash
cd server
npm install
cp .env.example .env
# Edit .env if you want to configure LinkedIn OAuth
npm run dev
```

The server will start on http://localhost:4000

3. **Setup Frontend** (in a new terminal)
```bash
cd client
npm install
npm run dev
```

The frontend will start on http://localhost:5173

4. **Access the application**
Open your browser and navigate to http://localhost:5173

## 🔧 Configuration

### Environment Variables

Edit `server/.env` to configure:

```bash
# Required
JWT_SECRET=your-secret-key-here
PORT=4000

# Optional: LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=http://localhost:4000/api/auth/linkedin/callback
```

### LinkedIn OAuth Setup (Optional)

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create a new app
3. Add redirect URL: `http://localhost:4000/api/auth/linkedin/callback`
4. Copy Client ID and Client Secret to your `.env` file
5. Restart the server

## 📱 Usage Guide

### First Time Setup
1. Register a new account or sign in with LinkedIn
2. Start adding job applications from the Applications tab
3. Browse and import jobs from the Job Board
4. Add recruiters and contacts to the Contacts tab
5. Set reminders for follow-ups and deadlines
6. Monitor your progress on the Dashboard

### Application Workflow
1. **Add Application**: Click "+ Add Application" in Applications tab
2. **Fill Details**: Company, Role, Source, Priority, URL
3. **Track Progress**: Update status as you progress (Applied → Interview → Offered)
4. **Set Reminders**: Create follow-up reminders
5. **Add Notes**: Track interview notes and contacts

### Job Board
- Browse automatically fetched internships
- Click "View Posting" to see the original job listing
- Click "+ Add to My Apps" to import to your applications
- Jobs are updated from SimplifyJobs repository

### Networking
- Add recruiters, HR contacts, and employees you've met
- Store their LinkedIn profiles and contact information
- Add notes about conversations and next steps
- Reference contacts when applying to specific companies

## 📂 Project Structure

```
internship-tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main application component
│   │   ├── main.jsx       # React entry point
│   │   └── styles.css     # Global styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── db.js              # SQLite database setup
│   ├── index.js           # Express server & API routes
│   ├── tracker.db         # SQLite database file
│   ├── package.json
│   └── .env               # Environment variables
└── README.md
```

## 🛠️ Technology Stack

**Frontend:**
- React 18
- Vite (build tool)
- CSS3 (custom styling)
- Fetch API for HTTP requests

**Backend:**
- Node.js & Express
- SQLite3 (database)
- JWT (authentication)
- bcrypt (password hashing)
- Axios (HTTP client for job fetching)

## 🔒 Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token-based authentication
- Protected API endpoints with middleware
- SQL injection prevention with parameterized queries
- Foreign key constraints in database
- CORS enabled for local development

## 📊 Database Schema

**Users**: id, email, password_hash, name, preferences

**Applications**: id, user_id, company, role, source, status, priority, applied_at, url, created_at, updated_at

**Contacts**: id, user_id, name, company, title, email, linkedin_url, notes, created_at

**Reminders**: id, user_id, application_id, due_at, message, done, created_at

**Notes**: id, user_id, application_id, contact_id, body, created_at

## 🎓 Use Cases

- **Students**: Track internship applications for summer/fall programs
- **New Grads**: Manage full-time job search
- **Career Changers**: Organize applications and networking
- **Anyone**: Stay organized during job search

## 🚀 Deployment

### Option 1: Heroku
```bash
# Backend
heroku create your-app-name
git subtree push --prefix server heroku main

# Frontend
cd client && npm run build
# Deploy dist/ to Netlify or Vercel
```

### Option 2: Railway/Render
- Connect your GitHub repository
- Configure build commands
- Set environment variables
- Deploy!

## 🤝 Contributing

This is a portfolio/learning project. Feel free to fork and customize for your own use!

## 📝 Future Enhancements

- Email notifications for reminders
- Chrome extension for one-click job saving
- Resume version tracking
- Interview prep notes
- Salary tracking and comparison
- Application status webhooks
- Export data to CSV/PDF
- Dark mode
- Mobile app (React Native)

## 📄 License

MIT License - feel free to use this project for your own job search!

## 🙏 Acknowledgments

- Job listings from [SimplifyJobs/Summer2026-Internships](https://github.com/SimplifyJobs/Summer2026-Internships)
- Inspired by the need for better job tracking tools
- Built to help students and job seekers stay organized

## 📧 Support

For issues or questions, please open an issue on GitHub or contact the maintainer.

---

**Happy Job Hunting! 🎉**
