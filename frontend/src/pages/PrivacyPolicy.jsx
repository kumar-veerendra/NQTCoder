import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  FileText, 
  Eye, 
  Key, 
  Database, 
  Share2, 
  Lock, 
  UserCheck, 
  Calendar, 
  ShieldAlert, 
  Globe, 
  RefreshCw, 
  Mail,
  BookOpen,
  Clock
} from 'lucide-react';
import SEO from '../components/SEO';

const SECTIONS = [
  { id: 'introduction', label: '1. Introduction', icon: Shield },
  { id: 'info-collected', label: '2. Information We Collect', icon: FileText },
  { id: 'how-we-use', label: '3. How We Use Information', icon: Eye },
  { id: 'google-oauth', label: '4. Google OAuth Authentication', icon: Key },
  { id: 'cookies-storage', label: '5. Cookies & Local Storage', icon: Database },
  { id: 'third-parties', label: '6. Third-Party Services', icon: Share2 },
  { id: 'data-security', label: '7. Data Security', icon: Lock },
  { id: 'user-rights', label: '8. User Rights', icon: UserCheck },
  { id: 'data-retention', label: '9. Data Retention', icon: Calendar },
  { id: 'children-privacy', label: '10. Children’s Privacy', icon: ShieldAlert },
  { id: 'international-users', label: '11. International Users', icon: Globe },
  { id: 'policy-changes', label: '12. Changes to this Policy', icon: RefreshCw },
  { id: 'contact-info', label: '13. Contact Information', icon: Mail }
];

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('introduction');

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -65% 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    SECTIONS.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => {
      SECTIONS.forEach((sec) => {
        const el = document.getElementById(sec.id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90; // offset to clear sticky header navbar
      const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-darkBg text-slate-300 min-h-screen font-sans transition-colors duration-200">
      <SEO
        title="Privacy Policy"
        description="NQTCoder Privacy Policy. Review our data practices, security frameworks, sub-processors, and Google OAuth disclosures."
        path="/privacy"
      />

      {/* Hero Header Area */}
      <div className="border-b border-darkBorder py-14 px-4 bg-darkCard/20 select-none">
        <div className="max-w-6xl mx-auto flex flex-col space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Understand how NQTCoder collects, processes, and protects your personal and platform activity data. We prioritize security and transparency in our competitive assessment platform.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="bg-darkBg/60 border border-darkBorder text-slate-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-accentBlue" />
              <span>Last updated: July 5, 2026</span>
            </div>
            <div className="bg-darkBg/60 border border-darkBorder text-slate-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-accentBlue" />
              <span>Reading time: ~6 mins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Columns Wrapper */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 flex flex-col lg:flex-row gap-10">
        
        {/* Sticky Sidebar Navigation (Desktop) */}
        <aside className="w-full lg:w-64 shrink-0 hidden lg:block sticky top-28 h-fit max-h-[calc(100vh-160px)] overflow-y-auto pr-2 select-none">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-4 px-3">On this page</div>
          <nav className="space-y-1">
            {SECTIONS.map((sec) => {
              const IconComp = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-bold text-left transition-all ${
                    isActive 
                      ? 'bg-accentBlue/10 text-accentBlue' 
                      : 'text-slate-400 hover:bg-darkCard hover:text-slate-200'
                  }`}
                >
                  <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-accentBlue' : 'text-slate-500'}`} />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Document Body */}
        <main className="flex-grow max-w-[850px] space-y-6">
          <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 md:p-10 space-y-12 shadow-xl">

            {/* Section 1: Introduction */}
            <section id="introduction" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <Shield className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">1. Introduction</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  NQTCoder (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is a secure, recruitment-grade recruitment and placement preparation arena designed to evaluate user programming capabilities. We are deeply committed to protecting the privacy and personal data of our users.
                </p>
                <p>
                  This Privacy Policy describes our practices regarding the collection, processing, usage, disclosure, and protection of the information gathered when you access our website, applications, practice modules, mock testing interfaces, and other services (collectively, the &ldquo;Platform&rdquo;). By utilizing NQTCoder, you consent to the data practices outlined herein.
                </p>
              </div>
            </section>

            {/* Section 2: Information We Collect */}
            <section id="info-collected" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <FileText className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">2. Information We Collect</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  We collect information necessary to provision the services of the Platform, maintain security, compile leaderboard analytics, and enforce test integrity. This includes:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-300">
                  <li><strong>Account Identity Information:</strong> Full name, primary email address, user chosen username, and profile image URL.</li>
                  <li><strong>OAuth Authentication Metadata:</strong> Secure authentication tokens and credentials returned from authorized OAuth providers.</li>
                  <li><strong>Platform Metrics & Progress:</strong> Code submissions, compilation logs, execution success metrics, test case outcome statuses, total questions solved, time spent, and leaderboard statistics.</li>
                  <li><strong>Proctoring Audit Trails:</strong> Visual tab-switch counts, focus shifts, and submission timing logs generated dynamically during proctored Mock Tests to maintain honor codes.</li>
                  <li><strong>Technical Telemetry:</strong> Device metadata, browser type, operating system version, IP address, request histories, and authentication log timestamps.</li>
                </ul>
              </div>
            </section>

            {/* Section 3: How We Use Information */}
            <section id="how-we-use" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <Eye className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">3. How We Use Information</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  We process user data strictly for the following functional and legal purposes:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-300">
                  <li>To establish, verify, and authenticate user sessions on the Platform.</li>
                  <li>To execute, compile, and evaluate user-submitted code snippets safely against test cases.</li>
                  <li>To dynamically update user profiles, metrics, achievements, streak records, and global leaderboard rankings.</li>
                  <li>To conduct anti-cheat auditing via the Mock Test proctoring utility (e.g., logging tab-switching violations).</li>
                  <li>To secure infrastructure against brute forcing, scraping, reverse-engineering, and DDoS attacks.</li>
                  <li>To send critical notification emails (such as verification OTPs, password reset links, and system changes).</li>
                </ul>
                <p className="pt-2 text-white font-semibold">
                  Under no circumstances does NQTCoder sell, rent, or lease your personal information to third-party brokers, advertisers, or affiliates.
                </p>
              </div>
            </section>

            {/* Section 4: Google OAuth Authentication */}
            <section id="google-oauth" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <Key className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">4. Google OAuth Authentication</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  To offer simplified sign-in pathways, NQTCoder implements the Google Sign-in OAuth flow. When you choose to authenticate via Google, we request access only to standard, non-sensitive scopes:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                  <li>Your Google account email address.</li>
                  <li>Your public name.</li>
                  <li>Your Google account avatar/profile picture.</li>
                </ul>
                <p className="bg-darkBg/50 border border-darkBorder p-4 rounded-xl text-xs text-slate-400 mt-2 leading-relaxed">
                  <strong>⚠️ Critical Disclosure:</strong> NQTCoder does not request, store, or access private scopes associated with your Google account. We have absolutely no visibility into, nor do we request permissions for: your Gmail messages, Google Drive files, Contacts directories, Calendar appointments, or other secondary Google products.
                </p>
              </div>
            </section>

            {/* Section 5: Cookies & Local Storage */}
            <section id="cookies-storage" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <Database className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">5. Cookies & Local Storage</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  To maintain performance and persist user preferences, we utilize storage mechanisms on your local browser:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-300">
                  <li><strong>Session Cookies:</strong> Used to hold secure JSON Web Tokens (JWT) to preserve authentication status and bypass manual login screens on subsequent visits.</li>
                  <li><strong>Local Storage:</strong> Used to temporarily cache user configurations such as preferred editor font sizes, theme selections (light/dark mode toggles), and draft code inputs to prevent work loss on page refreshes.</li>
                </ul>
                <p>
                  You can disable cookies and clear local storage via browser configuration settings. Note that disabling cookies will prevent the Platform from authenticating your sessions, rendering active problem-solving and mock testing inaccessible.
                </p>
              </div>
            </section>

            {/* Section 6: Third-Party Services */}
            <section id="third-parties" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <Share2 className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">6. Third-Party Services</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  NQTCoder integrates secure ecosystem processors to handle databases, compiler execution, hosting, and transactional mail. Our primary subprocessors include:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-300">
                  <li><strong>MongoDB Atlas:</strong> Secure cloud-managed database clustering for user credentials, profiles, progress metrics, and records.</li>
                  <li><strong>Judge0:</strong> Isolated compiler container sandbox to verify programming solutions against test suites.</li>
                  <li><strong>Google OAuth:</strong> Profile authentication provider.</li>
                  <li><strong>Brevo (formerly Sendinblue):</strong> Transactional mail service hosting for secure verification codes (OTPs) and account recovery messaging.</li>
                  <li><strong>Vercel & Render:</strong> Dynamic serverless frontend static file hosting and backend API hosting clusters.</li>
                  <li><strong>Cloudinary:</strong> Content delivery network storage for optional user-provided profile media and static assets.</li>
                  <li><strong>Future Analytics Services:</strong> Internal metrics tracking engines designed to tune latency and navigation maps.</li>
                </ul>
              </div>
            </section>

            {/* Section 7: Data Security */}
            <section id="data-security" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <Lock className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">7. Data Security</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  NQTCoder implements industry-standard protocols to safeguard user data. Communication with our API is encrypted using secure Transport Layer Security (TLS/SSL). Sensitive credentials (passwords) are securely hashed using bcrypt before database storage.
                </p>
                <p className="text-xs text-slate-400 italic">
                  Disclaimer: While NQTCoder enforces rigorous defensive configurations, no method of transmission over the internet or method of electronic storage is absolute. We cannot guarantee complete protection against all coordinated, targeted cyber-threats or infrastructure-level breaches.
                </p>
              </div>
            </section>

            {/* Section 8: User Rights */}
            <section id="user-rights" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <UserCheck className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">8. User Rights</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  You possess the following rights regarding the personal information stored on NQTCoder:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                  <li><strong>Access:</strong> The right to review your registered profile data, historical submissions, mock test logs, and stats.</li>
                  <li><strong>Rectification:</strong> The right to update incorrect email addresses, usernames, passwords, or profile details in settings.</li>
                  <li><strong>Deletion (Right to be Forgotten):</strong> The right to request the complete deletion of your account and progress data.</li>
                </ul>
                <p>
                  Requests for account deletion or data exports can be initiated via your profile settings or by reaching out to support.
                </p>
              </div>
            </section>

            {/* Section 9: Data Retention */}
            <section id="data-retention" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <Calendar className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">9. Data Retention</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  We retain your profile data and progress logs for the duration of your active account. If an account is deleted, we scrub identify-specific records (e.g., name, email, credentials) within 30 days. Submission metadata (non-identifying code solutions and compile stats) may be anonymized and kept for platform analytical tuning.
                </p>
              </div>
            </section>

            {/* Section 10: Children's Privacy */}
            <section id="children-privacy" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <ShieldAlert className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">10. Children’s Privacy</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  Our services are directed to individuals of recruitment or competitive coding age. NQTCoder complies with the Children&rsquo;s Online Privacy Protection Act (COPPA). We do not knowingly collect, request, or compile personal data from children under the age of 13. In the event we discover that an individual under 13 has established an account, we will purge their data immediately.
                </p>
              </div>
            </section>

            {/* Section 11: International Users */}
            <section id="international-users" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <Globe className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">11. International Users</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  NQTCoder is managed globally, and database clusters are hosted on secured cloud infrastructure nodes located primarily in India, Europe, and the United States. If you access the Platform from other jurisdictions, please be advised that your information will be transferred to, stored, and processed in accordance with this Privacy Policy.
                </p>
              </div>
            </section>

            {/* Section 12: Changes to this Policy */}
            <section id="policy-changes" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <RefreshCw className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">12. Changes to this Policy</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  We reserve the right to amend this Privacy Policy at any time. When updates occur, we will adjust the &ldquo;Last updated&rdquo; timestamp at the top of this page. Significant changes affecting user rights or security details will be highlighted via site alerts, banner notices, or direct email communication.
                </p>
              </div>
            </section>

            {/* Section 13: Contact Information */}
            <section id="contact-info" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <Mail className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">13. Contact Information</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  If you have queries, concerns, or requests regarding this Privacy Policy or data deletion, please contact our administration team:
                </p>
                <div className="bg-darkBg/60 border border-darkBorder p-4 rounded-xl space-y-1 w-fit mt-3 select-none">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email Address</div>
                  <a 
                    href="mailto:veerendrakumartmsl@gmail.com" 
                    className="text-accentBlue hover:underline text-sm font-semibold flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>veerendrakumartmsl@gmail.com</span>
                  </a>
                </div>
              </div>
            </section>

          </div>
        </main>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
