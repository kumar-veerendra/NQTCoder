# NQTCoder - Elite MERN Recruitment Practice Arena

NQTCoder is a production-ready, full-stack MERN coding assessment platform modeled after technical recruitment and competitive programming environments used by global enterprise recruiters (such as TCS NQT, Accenture, Wipro, Cognizant, etc.).

---

## 🚀 Core Architectural Features

* **Assessment UI (Split-Screen Arena):** A modern split-screen coding interface. The left panel houses the problem statement, parameters, examples, and constraints; the right panel incorporates the code editor and terminal.
* **Monaco Editor Integration:** Embedded with professional syntax highlighting for C++, Java 8, and Python 3. Supports standard libraries and full boilerplate structure imports.
* **Security-First Test Case Architecture:** Test cases are partitioned into visible and hidden types. Hidden test cases are completely stripped from client payloads and only verified securely on the server-side compiler.
* **Robust Sandbox Code Execution:** Supports dual compilation modes:
  * **Local Compiler Pipeline:** Executes code securely on the local operating system (ideal for development).
  * **Judge0 Sandbox Integration:** Leverages API-based remote compilers for safe execution in isolated sandbox environments.
* **Countdown Assessment Timer:** Exam-grade ticking countdown timer that automatically locks the editor and submits code upon expiration.
* **Dynamic Leaderboard & Solver Profiles:** Real-time global student solver ranking based on solving statistics (Easy, Medium, Hard breakdown) with page pagination.
* **Admin Dashboard:** Administrative interface to add, modify, or retire coding challenges, upload test cases, and review user analytics.
* **Google OAuth 2.0 Integration:** Direct one-click login and registration using Google Client authentication.

---

## 🛠️ Technology Stack

* **Frontend:** React, Tailwind CSS, Vite, Monaco Editor, React Router DOM, Axios.
* **Backend:** Node.js, Express.js, JSON Web Tokens (JWT), bcrypt.
* **Database:** MongoDB Atlas (Mongoose ODM).

---

## 📦 Directory Structure

```
NQTCoder/
├── backend/            # Express REST API & Code Compilation Suite
│   ├── config/         # Database and Seeder scripts
│   ├── controllers/    # Route controllers (Auth, Questions, Submissions)
│   ├── middleware/     # JWT Auth, admin boundaries, error handlers
│   ├── models/         # Database Schemas (User, Question, Submission)
│   ├── routes/         # Express API endpoints
│   ├── utils/          # Local runner and Judge0 sandbox integrations
│   └── server.js       # Main server entrypoint
└── frontend/           # React Single Page Application (SPA) client
    ├── src/
    │   ├── components/ # Shared UI components (Monaco Editor, Timer, Console)
    │   ├── context/    # Global Authentication State
    │   ├── pages/      # Dashboards, Practice Arena, Leaderboard, Profiles
    │   └── services/   # Axios HTTP request services
    └── vite.config.js  # Vite dev server and proxy config
```

---

## ⚙️ Environment Variables Setup

Configure the following variables to authenticate and boot the platform.

### Backend Config (`backend/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_token_secret

# OAuth Configurations
GOOGLE_CLIENT_ID=your_google_oauth_client_id
CLIENT_URL=http://localhost:5173

# Admin Setup (Will seed on first database connection)
ADMIN_EMAIL=your_desired_admin_email@domain.com
ADMIN_PASSWORD=your_desired_strong_admin_password

# Email SMTP Setup (For verification OTPs)
EMAIL_USER=your_smtp_email@gmail.com
EMAIL_PASS=your_smtp_app_password

# Compilation Mode ('local' or 'judge0')
RUN_MODE=local

# Local Java 8 Executable Path (Optional, if not in system PATH)
# JAVA_8_BIN=C:\Program Files\Java\jdk-1.8\bin
```

### Frontend Config (`frontend/.env`)
```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

---

## ⚡ Local Development & Setup

Follow these steps to run the platform locally on your computer:

### 1. Start the Backend API
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Boot the development server:
   ```bash
   npm run dev
   ```
   *Note: On first startup, if `ADMIN_EMAIL` and `ADMIN_PASSWORD` are configured in `.env`, the server will seed the initial Admin account and challenges.*

### 2. Start the Frontend Dev Server
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Boot the development server:
   ```bash
   npm run dev
   ```

---

## 🌐 Production Deployment Guide

To deploy this application for real-world production users:

### 1. Database (MongoDB Atlas)
1. Register a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Set up database access credentials and allow IP access (0.0.0.0/0 for deployment).
3. Copy the database connection string and use it as `MONGO_URI` in the backend environment.

### 2. Backend API (Render / Heroku)
1. Deploy the `backend/` subfolder.
2. In the deployment settings, configure the build command as `npm install` and start command as `node server.js` (or `npm start`).
3. Add all environment variables from `backend/.env` in the deployment settings dashboard.

### 3. Frontend UI (Vercel / Netlify / Render)
1. Deploy the `frontend/` subfolder.
2. Configure the build command as `npm run build` and publish directory as `dist/`.
3. Set the `VITE_GOOGLE_CLIENT_ID` in the deployment settings.

---

## 👥 Contributors

* **Veerendra Kumar** ([@kumar-veerendra](https://github.com/kumar-veerendra)) — System Architecture, Compiler Pipeline, & Backend Engineering.
* **Satyam Kumar** ([@vishen-satyamkumar](https://github.com/vishen-satyamkumar)) — Frontend Engineering, Monaco Editor Integration & Interface Design.

---

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.
