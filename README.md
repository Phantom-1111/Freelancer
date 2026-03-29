# Freelancer Time Tracking & Invoice Generator

A full-stack MERN application for freelancers to track time, manage clients and projects, and generate PDF invoices.

## Features

✅ User Authentication (Registration & Login with JWT)
✅ Client Management (Add, Edit, Delete)
✅ Project Management (Create projects with hourly rates)
✅ Live Time Tracker (Start/Stop timer with precise duration calculation)
✅ Manual Time Entry (Log past work hours)
✅ Invoice Generation (Auto-calculate from time logs)
✅ PDF Download (Generated invoices as PDF files)
✅ Dashboard (Stats & Charts: hours worked, earnings, client count, project count)
✅ Data Isolation (Each user sees only their own data)

## Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB (Local instance)
- JWT Authentication
- Bcryptjs (Password hashing)
- pdfkit (PDF generation)
- CORS

**Frontend:**
- React 18
- React Router v6
- Axios (API calls)
- Chart.js + react-chartjs-2 (Visualizations)
- CSS (Custom styling)

## Project Structure

```
Freelancer/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Client.js
│   │   ├── Project.js
│   │   ├── TimeLog.js
│   │   └── Invoice.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── clientController.js
│   │   ├── projectController.js
│   │   ├── timelogController.js
│   │   └── invoiceController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── clients.js
│   │   ├── projects.js
│   │   ├── timelogs.js
│   │   └── invoices.js
│   ├── middleware/
│   │   └── auth.js
│   ├── config/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js
    │   │   ├── Clients.js
    │   │   ├── Projects.js
    │   │   ├── TimeTracker.js
    │   │   └── Invoices.js
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   └── PrivateRoute.js
    │   ├── utils/
    │   │   ├── api.js
    │   │   └── authContext.js
    │   ├── styles/
    │   │   ├── global.css
    │   │   ├── navbar.css
    │   │   ├── auth.css
    │   │   ├── dashboard.css
    │   │   ├── clients.css
    │   │   ├── projects.css
    │   │   ├── timetracker.css
    │   │   └── invoices.css
    │   ├── App.js
    │   ├── index.js
    │   └── package.json
    └── .gitignore
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (running locally on port 27017)

## Installation & Setup

### 1. MongoDB Setup

Ensure MongoDB is installed and running on your machine:

```bash
# macOS (with Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Windows
# Download from: https://www.mongodb.com/try/download/community
# Run the installer and MongoDB will start automatically

# Linux (Ubuntu/Debian)
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from .env.example
cp .env.example .env

# (Optional) Edit .env if you want to change defaults
# Default: MongoDB at localhost:27017, JWT_SECRET is pre-filled

# Start backend server
npm start
# Server runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start frontend development server
npm start
# App opens at http://localhost:3000
```

## Usage Guide

### User Workflow

1. **Register**: Create a new account with username, email, and password
2. **Login**: Sign in with your credentials
3. **Add Clients**: Create client profiles with name, email, and company
4. **Create Projects**: Link projects to clients and set hourly rates
5. **Track Time**:
   - Select a project
   - Click "Start" to begin the timer
   - Click "Stop" to end tracking
   - Or use "Manual Entry" for past work
6. **Generate Invoices**: Create invoices from project time logs
7. **Download PDF**: Download invoice as PDF file
8. **View Dashboard**: Monitor total hours, earnings, and charts

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT token)

### Clients
- `POST /api/clients` - Create client
- `GET /api/clients` - List all clients
- `GET /api/clients/:id` - Get client details
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project (including status)
- `DELETE /api/projects/:id` - Delete project

### Time Logs
- `POST /api/timelogs` - Create time log (start/end times auto-calculate duration)
- `GET /api/timelogs` - List all time logs
- `GET /api/timelogs/:id` - Get time log details
- `GET /api/timelogs/project/:projectId` - Get time logs for a project

### Invoices
- `POST /api/invoices/generate` - Generate invoice from project
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/:id` - Get invoice details
- `GET /api/invoices/:id/download` - Download invoice as PDF

## Key Features Explained

### Timer
- Select a project before starting
- Timer counts up in real-time (HH:MM:SS format)
- Calculates duration in decimal hours when stopped
- Stores time log with exact start/end timestamps

### Manual Entry
- Log past work hours with specific start and end times
- Duration automatically calculated from timestamps

### Invoices
- Auto-generated from all time logs for a project
- Calculates: Total Hours × Hourly Rate = Invoice Amount
- PDF includes: Client info, project name, hours, rate, total
- Stored in MongoDB for historical records

### Dashboard
- **Total Hours**: Sum of all time log durations
- **Total Earnings**: Sum of all invoice amounts
- **Client Count**: Number of active clients
- **Project Count**: Number of active projects
- **Charts**: Visual breakdown per project (bar chart for hours, pie chart for earnings)

### Data Security
- JWT token required for all protected routes
- Passwords hashed with bcryptjs (10 salt rounds)
- Users only see their own data (userId isolation at DB level)
- No token persistence in localStorage (login required each session)

## Known Limitations & Future Enhancements

### Current Limitations
- No real-time sync (polling-based)
- No offline support
- Single user type (no client/admin roles)
- No file uploads besides invoice PDFs
- No email notifications

### Possible Enhancements
- WebSocket support for real-time updates
- User profile customization
- Time log editing/deletion with audit trail
- Recurring invoices
- Payment integration
- Multiple currencies
- Team collaboration features

## Troubleshooting

### MongoDB Connection Error
```
Error: MongoDB connection error
```
**Solution:** Ensure MongoDB is running:
```bash
# Check if MongoDB is running
mongo --version
# or
mongod
```

### Backend Port Already in Use
```
Error: EADDRINUSE: address already in use :::5000
```
**Solution:** Change PORT in `.env` to an available port, or kill process using port 5000

### Frontend Can't Connect to Backend
```
Error: Network request failed / API connection error
```
**Solution:** Ensure backend is running on port 5000. Check `src/utils/api.js` base URL

### Token Expired
**Solution:** Log in again (tokens expire after 7 days)

## Development Notes

### Adding New Features
1. Backend: Create models/controllers/routes in order
2. Frontend: Create pages/components with API calls
3. Test with Postman for API before frontend integration

### Database Models
- All models include `userId` for data isolation
- TimeLog: `durationHours` auto-calculated from start/end times
- Project: `status` enum (active/inactive/completed)
- Invoice: Stores calculated totals for history

### Authentication Flow
1. Frontend sends credentials to `/auth/login`
2. Backend verifies password and returns JWT token
3. Frontend stores token in context state (not localStorage)
4. All subsequent requests include header: `Authorization: Bearer <token>`
5. Backend middleware validates token on protected routes

## License

MIT

## Support

For issues or questions, refer to the code comments or review the plan.md file for architecture details.

---

**Built with ❤️ using MERN Stack**
