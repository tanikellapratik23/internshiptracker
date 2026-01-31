# Quick Start Guide - Internship Tracker

## ✅ Your application is ready!

Both servers are currently running:
- **Backend**: http://localhost:4000
- **Frontend**: http://localhost:5173

## 🚀 Access the Application

Open your browser and go to: **http://localhost:5173**

## 📝 First Steps

1. **Register an account** or use LinkedIn to sign in
2. **Add your first application** - Click on "Applications" tab
3. **Browse job listings** - Check out the "Job Board" tab for internships
4. **Import a job** - Click "+ Add to My Apps" on any job listing
5. **Track progress** - Update application statuses as you apply

## 🎯 Features You Can Use Now

### Applications Tab
- Add new applications manually
- Track status (Todo → Applied → Interview → Offered/Rejected)
- Set priority levels (0-10)
- Add job posting URLs
- Quick status updates with colored buttons

### Job Board Tab
- Browse 1000+ internship listings from SimplifyJobs
- View original job postings
- One-click import to your applications
- Automatically updated listings

### Contacts Tab
- Add recruiters and professional contacts
- Store LinkedIn profiles
- Add notes about each contact
- Track company and title information

### Reminders Tab
- Create reminders for follow-ups
- Link reminders to specific applications
- Set due dates and times
- Mark as completed when done

### Dashboard
- View your analytics (total apps, success rate)
- See recent applications
- Check upcoming reminders
- Track your progress

## 🔧 LinkedIn OAuth (Optional)

To enable LinkedIn sign-in:

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create a new app
3. Add redirect URL: `http://localhost:4000/api/auth/linkedin/callback`
4. Copy your Client ID and Secret
5. Edit `server/.env`:
```
LINKEDIN_CLIENT_ID=your-client-id
LINKEDIN_CLIENT_SECRET=your-client-secret
```
6. Restart the server

## 🛑 Stop the Servers

To stop the running servers:
```bash
# Find the process IDs
ps aux | grep node

# Kill the processes
kill <PID>
```

Or press `Ctrl+C` in the terminals running the servers.

## 🔄 Restart the Servers

**Backend:**
```bash
cd /Users/pratiktanikella/Desktop/internship-tracker/server
node index.js
```

**Frontend:**
```bash
cd /Users/pratiktanikella/Desktop/internship-tracker/client
npm run dev
```

## 💡 Tips

- **Priority Scoring**: Set higher priority (7-10) for dream companies
- **Source Tracking**: Note where you found each job (LinkedIn, Indeed, referral)
- **Regular Updates**: Update application statuses immediately
- **Networking**: Add contacts before/after networking events
- **Reminders**: Set reminders for 1-2 weeks after applying
- **Job Board**: Check daily for new internship postings

## 📊 Understanding Analytics

- **Total Applications**: All applications you've tracked
- **Offers/Wins**: Applications with status "offered" or "hired"
- **Success Rate**: (Offers ÷ Total) × 100
- **Pending Reminders**: Uncompleted reminder count

## 🎨 Status Colors

- 🔵 **Todo** (Blue): Not yet applied
- 🔷 **Applied** (Light Blue): Application submitted
- 🟡 **Interview** (Yellow): Interview scheduled/completed
- 🟢 **Offered** (Green): Offer received
- 🔴 **Rejected** (Red): Application declined

## 📁 Data Storage

Your data is stored in `server/tracker.db` (SQLite database)
- Automatic backups recommended
- Can be viewed with SQLite tools
- Portable to other computers

## 🔐 Security

- Passwords are hashed with bcrypt
- JWT tokens for authentication
- Session stored in localStorage
- Logout clears all session data

## 🆘 Troubleshooting

**Can't connect to server?**
- Check if server is running on port 4000
- Look for error messages in terminal
- Verify `.env` file exists in server folder

**Frontend not loading?**
- Check if frontend is running on port 5173
- Clear browser cache
- Check console for errors (F12)

**Database issues?**
- Delete `tracker.db` to start fresh (loses all data)
- Check file permissions
- Verify SQLite3 is installed

## 🎉 Next Steps

- Start tracking your applications
- Import jobs from the job board
- Set up LinkedIn OAuth (optional)
- Add your networking contacts
- Create follow-up reminders
- Monitor your success rate

**Happy job hunting! 🚀**
