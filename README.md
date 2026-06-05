# NQTCoder - TCS Practice Arena

NQTCoder is a full-stack MERN coding practice platform modeled after recruitment assessment environments used by companies like TCS, Infosys, Accenture, Wipro, Cognizant, etc.

## 🚀 Key Features

* **TCS Exam Environment Feel:** Split-screen layout. Left panel contains the problem statement, examples, and constraints; right panel contains the code editor and terminal console.
* **Monaco Code Editor:** Integrated with syntax highlights for C++, Java 8, and Python 3. Users write their program from scratch (including imports, `class Main`, and `Scanner` inputs).
* **Dual-Mode Code Runner:** Supports running code locally on your PC (100% free and fast) or connecting to a remote Judge0 API sandbox.
* **Exam Timer System:** Ticking countdown timer. Automatically locks the editor and submits code upon expiration.
* **Test Case Security:** Separates visible and hidden test cases. Hidden test cases are stripped from API payloads for regular users to prevent solution leakage.
* **Profile & Leaderboard:** Detailed stats tracker (Easy, Medium, Hard breakdown) and global student ranking based on questions solved.
* **Admin Dashboard:** Portal to add, edit, or delete questions, test cases, and configure custom timers.
* **Google Authentication:** One-click OAuth login and auto-registration using Google accounts.

---

## 🛠️ Tech Stack

* **Frontend:** React, Tailwind CSS, Vite, Monaco Editor, React Router.
* **Backend:** Node.js, Express.js, JWT, bcrypt.
* **Database:** MongoDB, Mongoose.

---

## 📦 Directory Structure

```
NQTCoder/
├── backend/            # Express REST API, Mongoose Schemas & Compilers
│   ├── config/         # Database and Seeder scripts
│   ├── controllers/    # Route controllers (Auth, Questions, Submissions)
│   ├── middleware/     # Auth checks, admin limits, error handlers
│   ├── models/         # User, Question, Submission schemas
│   ├── routes/         # Express API endpoints mapping
│   ├── utils/          # Local runner and Judge0 sandbox executors
│   └── server.js       # Entry point
└── frontend/           # React SPA client
    ├── src/
    │   ├── components/ # Navbar, Monaco Editor, Console, Timer
    │   ├── context/    # User session AuthContext
    │   ├── pages/      # Arena, Dashboards, Leaderboard, Profiles, Login
    │   └── services/   # Axios API wrappers
    └── vite.config.js  # Vite dev server and proxy definitions
```

---

## ⚡ Setup & Run Instructions

Ensure you have **MongoDB** running locally on your computer.

### 1. Launch Backend Server
```powershell
cd backend
npm install
npm run dev
```
The server will start on [http://localhost:5000](http://localhost:5000) and automatically seed **100 TCS NQT questions** and a **default admin account** into MongoDB.

### 2. Launch Frontend Client
```powershell
cd frontend
npm install
npm run dev
```
The Vite React client will start on [http://localhost:5173](http://localhost:5173).

---

## 🔑 Default Credentials

To log in as an administrator immediately:
* **URL:** [http://localhost:5173/login](http://localhost:5173/login)
* **Email:** `admin@nqtcoder.com`
* **Password:** `AdminPassword@123`

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/nqtcoder
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
RUN_MODE=local   # 'local' or 'judge0'
JAVA_8_BIN=      # (Optional) e.g., C:\Program Files\Java\jdk-1.8\bin
```

### Frontend (`frontend/.env`)
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```
