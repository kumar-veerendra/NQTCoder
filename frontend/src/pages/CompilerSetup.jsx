import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Terminal, CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Download, Settings, Play, Coffee, Code2, Cpu, ArrowRight,
  ExternalLink, Info, Zap, Shield
} from 'lucide-react';

// ─── Data ───────────────────────────────────────────────────────────────────

const COMPILERS = [
  {
    id: 'java',
    name: 'Java (JDK 8)',
    icon: Coffee,
    color: 'amber',
    badge: 'Most Important',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    iconBg: 'bg-amber-500/15 border-amber-500/25 text-amber-400',
    steps: [
      {
        title: 'Download JDK 8',
        desc: 'Go to the official Adoptium (Eclipse Temurin) website and download JDK 8 for your OS.',
        action: { label: 'Download JDK 8 (Temurin)', url: 'https://adoptium.net/temurin/releases/?version=8' }
      },
      {
        title: 'Run the Installer',
        desc: 'Open the downloaded .msi (Windows) or .pkg (Mac) installer. Keep clicking "Next" with default settings. Make sure "Add to PATH" is checked during installation.',
      },
      {
        title: 'Set JAVA_HOME (Windows only)',
        desc: 'Search "Environment Variables" in Start Menu → Edit the system environment variables → New → Name: JAVA_HOME, Value: C:\\Program Files\\Java\\jdk-1.8 (or wherever JDK was installed).',
        code: 'JAVA_HOME = C:\\Program Files\\Java\\jdk-1.8'
      },
      {
        title: 'Add to PATH (Windows only)',
        desc: 'In the same Environment Variables window, find the "Path" variable → Edit → New → Add: %JAVA_HOME%\\bin',
        code: '%JAVA_HOME%\\bin'
      },
      {
        title: 'Update .env file',
        desc: 'Open the backend/.env file and update the JAVA_8_BIN path to match where your JDK bin folder is located.',
        code: 'JAVA_8_BIN=C:\\Program Files\\Java\\jdk-1.8\\bin'
      },
      {
        title: 'Verify Installation',
        desc: 'Open a new Command Prompt or Terminal and run these commands. Both should print version numbers.',
        code: 'java -version\njavac -version'
      }
    ]
  },
  {
    id: 'cpp',
    name: 'C++ (GCC / g++)',
    icon: Code2,
    color: 'blue',
    badge: 'Required for C++',
    badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
    iconBg: 'bg-sky-500/15 border-sky-500/25 text-sky-400',
    steps: [
      {
        title: 'Download MSYS2 (Windows)',
        desc: 'MSYS2 is the easiest way to get GCC/g++ on Windows. Download and install it from the official site.',
        action: { label: 'Download MSYS2', url: 'https://www.msys2.org/' }
      },
      {
        title: 'Install GCC via MSYS2',
        desc: 'Open the "MSYS2 MSYS" app from your Start Menu and run this command to install the MinGW GCC toolchain:',
        code: 'pacman -S mingw-w64-ucrt-x86_64-gcc'
      },
      {
        title: 'Add g++ to PATH (Windows)',
        desc: 'Open Environment Variables → Edit "Path" → Add the MSYS2 ucrt64 bin folder:',
        code: 'C:\\msys64\\ucrt64\\bin'
      },
      {
        title: 'Mac / Linux Alternative',
        desc: 'On Mac, install Xcode Command Line Tools. On Linux (Ubuntu/Debian), install via apt:',
        code: '# Mac:\nxcode-select --install\n\n# Linux:\nsudo apt-get install g++'
      },
      {
        title: 'Verify Installation',
        desc: 'Open a new terminal and run — you should see the g++ version number:',
        code: 'g++ --version'
      }
    ]
  },
  {
    id: 'python',
    name: 'Python 3',
    icon: Cpu,
    color: 'green',
    badge: 'Easiest to Install',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    iconBg: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400',
    steps: [
      {
        title: 'Download Python 3',
        desc: 'Download the latest Python 3 installer from the official Python website.',
        action: { label: 'Download Python 3', url: 'https://www.python.org/downloads/' }
      },
      {
        title: 'Run Installer — Check "Add to PATH"',
        desc: '⚠️ VERY IMPORTANT: On the first screen of the installer, check the box that says "Add python.exe to PATH" before clicking Install Now.',
      },
      {
        title: 'Verify Installation',
        desc: 'Open a new Command Prompt or Terminal and run:',
        code: 'python --version\n# or on Mac/Linux:\npython3 --version'
      }
    ]
  }
];

const FAQ_ITEMS = [
  {
    q: 'Why does the editor show "Offline" for compilers?',
    a: 'The code editor runs your code on the server machine using local compilers (Java, g++, Python). If those compilers are not installed on the server, the status shows "Offline". On Render deployment, the render-build.sh script installs them automatically. On a local machine, the admin installs them manually.'
  },
  {
    q: 'Do students need to install anything on their computer?',
    a: 'No! Students never install anything. Compilers run on the backend server (Render cloud or your local machine). Students just open the website in their browser, write code, and click Run — their computer is not involved in compilation at all.'
  },
  {
    q: 'Will the server crash if many students submit at the same time?',
    a: 'No — the system has a built-in compiler queue that processes one job at a time. If 10 students click Run simultaneously, jobs are queued and executed one after another. Students see a "Queued" status while waiting. This prevents server overload but means Java submissions may take a few extra seconds during peak usage.'
  },
  {
    q: 'Why is Java submission slow compared to Python or C++?',
    a: 'Java\'s JVM (Java Virtual Machine) takes 200-400MB of RAM just to start up, and it starts fresh for every submission. Python and C++ are much lighter (~30-50MB each). On the free Render tier (512MB total RAM), Java is the heaviest language and may take 3-8 seconds. This is normal behavior — not a bug.'
  },
  {
    q: 'How many students can use the platform at the same time on the free Render tier?',
    a: 'For browsing, leaderboards, mock tests, and reading — unlimited students can use the site simultaneously. For code execution (Run/Submit), the queue handles up to 5-20 concurrent students comfortably. Beyond that, wait times increase. For a college batch exam with 50+ students submitting simultaneously, consider upgrading to Render Starter ($7/month) for dedicated RAM.'
  },
  {
    q: 'The server wakes up slowly — first request takes 30-60 seconds. Why?',
    a: 'Render\'s free tier "spins down" the server after 15 minutes of no traffic to save resources. The first request after inactivity wakes it up, which takes 30-60 seconds. After that, all responses are fast. This is a free tier limitation. Upgrade to Render Starter to keep the server always awake.'
  },
  {
    q: 'I installed Java but it still shows offline. What now?',
    a: 'Make sure the JAVA_8_BIN path in the backend/.env file points to the correct JDK bin directory. After editing .env, restart the backend server (node server.js). Also open a fresh terminal window and run "javac -version" to confirm it is detected.'
  },
  {
    q: 'PATH variable is set but g++ still shows "not found". Why?',
    a: 'You must open a brand new terminal window after editing environment variables. Existing terminals do not reload PATH automatically. On Windows, also try restarting your computer after editing system environment variables.'
  }
];

// ─── Sub-components ─────────────────────────────────────────────────────────

const Step = ({ num, title, desc, code, action }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center shrink-0">
      <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-black">
        {num}
      </div>
      <div className="w-px flex-1 bg-darkBorder/60 mt-2" />
    </div>
    <div className="pb-6 min-w-0 flex-1">
      <p className="text-sm font-bold text-white mb-1">{title}</p>
      <p className="text-xs text-slate-400 leading-relaxed mb-2">{desc}</p>
      {code && (
        <pre className="bg-darkBg border border-darkBorder rounded-lg p-3 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {code}
        </pre>
      )}
      {action && (
        <a
          href={action.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/25 text-indigo-300 text-xs font-bold rounded-lg transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          {action.label}
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
      )}
    </div>
  </div>
);

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${open ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-darkBorder bg-darkCard'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-3"
      >
        <span className="text-sm font-bold text-white">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
        }
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-xs text-slate-400 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

const CompilerSetup = () => {
  const [activeTab, setActiveTab] = useState('java');
  const active = COMPILERS.find(c => c.id === activeTab);

  return (
    <div className="min-h-screen bg-darkBg text-slate-100">

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-darkBorder">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/6 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-0 w-[400px] h-[400px] rounded-full bg-amber-600/6 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 py-16 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/10 text-indigo-400 text-xs font-black uppercase tracking-widest">
            <Settings className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            Compiler Setup Guide
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            How to Connect Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Local Compiler</span>
          </h1>

          <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed">
            NQTCoder runs your code using compilers installed directly on the server machine.
            This guide explains exactly what to install, how to configure it, and how to verify it's working —
            so the code editor shows <span className="text-emerald-400 font-bold">Online</span> instead of <span className="text-rose-400 font-bold">Offline</span>.
          </p>

          {/* Quick status explanation cards */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-xs font-bold text-rose-400">Offline = Compiler not installed on server</span>
            </div>
            <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400">Online = Compiler detected &amp; ready</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">

        {/* ── Important Notice ─────────────────────────────────── */}
        <div className="flex gap-4 bg-amber-500/8 border border-amber-500/20 rounded-2xl p-5">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-amber-300">Who needs to do this?</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Only the <strong className="text-white">admin / person running the backend server</strong> needs to install compilers.
              Students using the website <strong className="text-white">don't need to install anything</strong> —
              they just open the browser and start coding. The compilers run on the server, not on the student's computer.
            </p>
          </div>
        </div>

        {/* ── Deployment vs Local ───────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-white">Choose Your Setup Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Cloud Deployment Card */}
            <div className="relative bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/25 rounded-2xl p-6 space-y-4 overflow-hidden">
              <div className="absolute top-3 right-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Recommended</div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white mb-1">☁️ Deploy to Render.com (Free)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Compilers are <strong className="text-white">auto-installed automatically</strong> during deployment — no manual setup, no .env file on any user's computer. Students just open the website.
                </p>
              </div>
              <ul className="space-y-1.5 text-xs">
                {['✅ Zero user setup required', '✅ Auto-installs g++, Python, Java via build script', '✅ Set env vars in Render Dashboard (no .env file)', '✅ Free tier available', '✅ Students just open the website — nothing to install'].map((item, i) => (
                  <li key={i} className="text-slate-400 font-medium">{item}</li>
                ))}
              </ul>
              <a href="https://render.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/25 text-emerald-300 text-xs font-bold rounded-lg transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> Open Render.com
              </a>
            </div>

            {/* Local Dev Card */}
            <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 flex items-center justify-center">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white mb-1">💻 Local Development Only</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Running the backend on your own computer? Install compilers manually on <strong className="text-white">your machine</strong> and set <code className="bg-darkBg px-1 rounded">JAVA_8_BIN</code> in your local <code className="bg-darkBg px-1 rounded">.env</code>. Only the server host needs this.
                </p>
              </div>
              <ul className="space-y-1.5 text-xs">
                {['⚙️ Install Java JDK 8, g++, Python manually', '⚙️ Set JAVA_8_BIN path in backend/.env', '⚙️ Add compilers to system PATH', '⚙️ Restart server after install', '⚠️ Students using the website still need nothing'].map((item, i) => (
                  <li key={i} className="text-slate-400 font-medium">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Render Deployment Steps ──────────────────────────────── */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-5 border-b border-darkBorder bg-emerald-500/5">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              Deploy on Render — Compilers Auto-Install
            </h2>
            <p className="text-xs text-slate-400 mt-1">No code changes needed. Just follow these steps once.</p>
          </div>
          <div className="p-6">
            {[
              { title: 'Push code to GitHub', desc: 'Make sure your full project is pushed to GitHub. The render-build.sh file already exists in your backend folder — it handles auto-installing all compilers.' },
              { title: 'Sign up at Render.com', desc: 'Go to render.com and create a free account. Connect your GitHub account.', link: { label: 'Open Render.com', url: 'https://render.com' } },
              { title: 'Create a new Web Service', desc: 'Click "New +" → "Web Service" → Select your GitHub repo → Set root directory to backend.' },
              { title: 'Set Build & Start Commands', desc: 'In Render settings, set exactly:', code: 'Build Command:  chmod +x render-build.sh && ./render-build.sh\nStart Command:  node server.js\nRoot Directory: backend' },
              { title: 'Add Environment Variables in Render Dashboard', desc: 'Go to Environment tab → Add these (copy values from your local .env file — no file upload needed):', code: 'MONGO_URI        = mongodb+srv://veerendrakumarnqtcoder:...\nJWT_SECRET       = bfyp_jwt_secret_token_key_2026\nGOOGLE_CLIENT_ID = 749223881103-ucpf...\nCLIENT_URL       = https://your-frontend.vercel.app\nRUN_MODE         = local\nNODE_ENV         = production\nJAVA_8_BIN       = (leave empty — auto-detected on Linux)' },
              { title: 'Click Deploy — Done!', desc: 'Render runs render-build.sh which installs g++, Python 3, and Java on their Linux server automatically. The code editor will show Online for all languages after deploy.' },
              { title: 'Deploy Frontend to Vercel (Free)', desc: 'Go to vercel.com → Import your GitHub repo → Set root directory to frontend → Add one environment variable:', code: 'VITE_API_URL = https://your-backend-name.onrender.com', link: { label: 'Open Vercel.com', url: 'https://vercel.com' } },
            ].map((step, i, arr) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-black">{i + 1}</div>
                  {i < arr.length - 1 && <div className="w-px flex-1 bg-darkBorder/60 mt-2" />}
                </div>
                <div className={`min-w-0 flex-1 ${i < arr.length - 1 ? 'pb-6' : 'pb-2'}`}>
                  <p className="text-sm font-bold text-white mb-1">{step.title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">{step.desc}</p>
                  {step.code && (
                    <pre className="bg-darkBg border border-darkBorder rounded-lg p-3 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">{step.code}</pre>
                  )}
                  {step.link && (
                    <a href={step.link.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/25 text-indigo-300 text-xs font-bold rounded-lg transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" /> {step.link.label}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Compiler Tabs ─────────────────────────────────────── */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-white mb-1">Local Installation Guide</h2>
            <p className="text-xs text-slate-500">Only needed if running the backend on your own computer (not Render). Select a language for step-by-step instructions.</p>
          </div>

          {/* Tab selector */}
          <div className="flex flex-wrap gap-3">
            {COMPILERS.map(c => {
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  id={`tab-${c.id}`}
                  onClick={() => setActiveTab(c.id)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border text-sm font-bold transition-all ${
                    activeTab === c.id
                      ? 'bg-indigo-500/15 border-indigo-500/40 text-white shadow-lg shadow-indigo-500/10'
                      : 'bg-darkCard border-darkBorder text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {c.name}
                  {activeTab === c.id && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
                </button>
              );
            })}
          </div>

          {/* Active compiler panel */}
          {active && (
            <div className="bg-darkCard border border-darkBorder rounded-2xl overflow-hidden shadow-xl">
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-darkBorder bg-darkBg/40">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${active.iconBg}`}>
                    <active.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{active.name}</h3>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${active.badgeColor}`}>
                      {active.badge}
                    </span>
                  </div>
                </div>
                <Zap className="w-5 h-5 text-slate-600" />
              </div>

              {/* Steps */}
              <div className="p-6">
                {active.steps.map((step, i) => (
                  <Step
                    key={i}
                    num={i + 1}
                    title={step.title}
                    desc={step.desc}
                    code={step.code}
                    action={step.action}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── After Installation ────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-white">After Installing Compilers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Terminal,
                color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
                title: '1. Restart the Server',
                desc: 'Stop and restart the backend server (Ctrl+C → node server.js). The compiler detection runs at startup.'
              },
              {
                icon: Play,
                color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                title: '2. Open Code Editor',
                desc: 'Go to any practice problem. The compiler status bar should now show green "Online" dots for installed languages.'
              },
              {
                icon: CheckCircle2,
                color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                title: '3. Run a Test',
                desc: 'Write a simple "Hello World" in Java, C++, or Python and click Run Code to verify execution works end-to-end.'
              }
            ].map((card, i) => (
              <div key={i} className="bg-darkCard border border-darkBorder rounded-xl p-5 space-y-3">
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${card.color}`}>
                  <card.icon className="w-4.5 h-4.5" />
                </div>
                <p className="text-sm font-bold text-white">{card.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Server Performance Section ─────────────────────────── */}
        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-black text-white mb-1">Server Performance & Load</h2>
            <p className="text-xs text-slate-500">Understand how heavy each compiler is and what to expect on the free tier.</p>
          </div>

          {/* RAM usage per compiler */}
          <div className="bg-darkCard border border-darkBorder rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-darkBorder bg-darkBg/40">
              <p className="text-sm font-black text-white">RAM Usage Per Code Execution</p>
              <p className="text-xs text-slate-500 mt-0.5">Render free tier total: 512MB</p>
            </div>
            <div className="p-6 space-y-4">
              {[
                { lang: '🐍 Python', ram: 30, max: 512, color: 'bg-emerald-500', label: '~30 MB', verdict: 'Very Light ✅', verdictColor: 'text-emerald-400' },
                { lang: '⚙️ C++ (g++)', ram: 50, max: 512, color: 'bg-sky-500', label: '~50 MB', verdict: 'Light ✅', verdictColor: 'text-sky-400' },
                { lang: '☕ Java (JVM)', ram: 350, max: 512, color: 'bg-amber-500', label: '~300–400 MB', verdict: 'Heavy ⚠️', verdictColor: 'text-amber-400' },
              ].map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{item.lang}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono">{item.label}</span>
                      <span className={`font-bold ${item.verdictColor}`}>{item.verdict}</span>
                    </div>
                  </div>
                  <div className="w-full bg-darkBg rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${item.color} transition-all duration-700`}
                      style={{ width: `${(item.ram / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-slate-500 pt-2 border-t border-darkBorder/40">
                Node.js server itself uses ~150MB. Java takes up almost all remaining free-tier RAM — so only one Java job runs at a time (queue handles this automatically).
              </p>
            </div>
          </div>

          {/* Concurrent user capacity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                tier: '🆓 Free Tier (Render)',
                ram: '512 MB RAM',
                users: '5–20 students',
                note: 'Works great for college batches. Java may queue for a few seconds during peak.',
                color: 'border-slate-600 bg-darkCard',
                badge: 'Current Setup',
                badgeColor: 'bg-slate-700 text-slate-300'
              },
              {
                tier: '💰 Starter ($7/mo)',
                ram: '512 MB RAM',
                users: '20–50 students',
                note: 'Always-on server (no sleep). Faster cold starts. Good for active classrooms.',
                color: 'border-indigo-500/30 bg-indigo-500/5',
                badge: 'Recommended for Exams',
                badgeColor: 'bg-indigo-500/20 text-indigo-400'
              },
              {
                tier: '🚀 Standard ($25/mo)',
                ram: '2 GB RAM',
                users: '100+ students',
                note: 'Multiple Java jobs can run in parallel. Suitable for large-scale deployment.',
                color: 'border-violet-500/30 bg-violet-500/5',
                badge: 'For Large Scale',
                badgeColor: 'bg-violet-500/20 text-violet-400'
              }
            ].map((tier, i) => (
              <div key={i} className={`border rounded-2xl p-5 space-y-3 ${tier.color}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-black text-white">{tier.tier}</p>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${tier.badgeColor}`}>{tier.badge}</span>
                </div>
                <p className="text-xs font-mono text-slate-300">{tier.ram}</p>
                <p className="text-base font-black text-white">{tier.users} <span className="text-xs font-normal text-slate-400">concurrent</span></p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{tier.note}</p>
              </div>
            ))}
          </div>

          {/* Queue system note */}
          <div className="flex gap-3 bg-indigo-500/8 border border-indigo-500/15 rounded-xl px-5 py-4">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-white">Built-in Queue System:</strong> The backend automatically queues all compilation jobs and runs them one at a time. Students see a live "Queued (Position X)" status while waiting. This prevents crashes — but means heavy Java usage during peak hours may have 5–15 second wait times on the free tier.
            </p>
          </div>
        </div>

        {/* ── FAQ Section ───────────────────────────────────────── */}
        <div className="space-y-5" id="compiler-faq">
          <div>
            <h2 className="text-2xl font-black text-white mb-1">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500">Common issues and answers about the compiler system.</p>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>

        {/* ── Still stuck CTA ───────────────────────────────────── */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/20 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-black text-white">Still having trouble?</h3>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              If compilers are installed but the editor still shows offline, double-check that PATH variables are set correctly and you've restarted the server in a fresh terminal. Contact support if the issue persists.
            </p>
          </div>
          <Link
            to="/about"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
          >
            Contact Support
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default CompilerSetup;
