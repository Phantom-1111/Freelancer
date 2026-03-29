# Quick Start Guide

## One-Time Setup (5 minutes)

### 1. Download & Install MongoDB

**Windows:**
- Download from https://www.mongodb.com/try/download/community
- Run installer, follow prompts
- MongoDB starts automatically

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

---

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```

**Expected Output:**
```
✓ MongoDB connected successfully
🚀 Backend server running on http://localhost:5000
```

---

### 3. Setup Frontend (New Terminal)

```bash
cd frontend
npm install
npm start
```

**Expected Output:**
- Browser opens to http://localhost:3000 automatically
- You should see the Login page

---

## You're Ready! 🎉

### First Test
1. Click **Register**
2. Create account:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
3. Click **Login** with same credentials
4. You're in! Start exploring the app

---

## Next Steps

1. **Add a Client:**
   - Go to Clients → + Add Client
   - Fill in name, email, company

2. **Create a Project:**
   - Go to Projects → + New Project
   - Select the client you created
   - Set hourly rate (e.g., $50/hr)

3. **Track Time:**
   - Go to Timer
   - Select your project
   - Click **Start** to begin tracking
   - Click **Stop** after a few seconds

4. **Generate Invoice:**
   - Go to Invoices → + Generate Invoice
   - Select your project
   - Download PDF

5. **View Dashboard:**
   - See your stats and charts

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| MongoDB won't start | Verify installation, restart service |
| Port 5000 in use | Kill process or change PORT in `.env` |
| Frontend can't reach backend | Ensure backend is running on port 5000 |
| "Cannot register" error | Use unique email each test |

---

## Architecture Summary

- **Backend**: REST API on port 5000 (Node.js + Express + MongoDB)
- **Frontend**: React app on port 3000 (communicates via Axios)
- **Auth**: JWT tokens (valid for 7 days)
- **Storage**: MongoDB (local instance on 27017)

---

## File Locations

- Backend code: `/backend/`
- Frontend code: `/frontend/`
- Main README: `/README.md`
- .env example: `/backend/.env.example`

---

## Stopping Services

**Backend:**
- Press `Ctrl+C` in backend terminal

**Frontend:**
- Press `Ctrl+C` in frontend terminal

**MongoDB:**
```bash
# macOS
brew services stop mongodb-community

# Linux
sudo systemctl stop mongodb

# Windows: Use Services app or MongoDB Compass
```

---

Happy Tracking! 📊✨
