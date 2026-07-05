import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  UserCheck, 
  User, 
  AlertTriangle, 
  Terminal, 
  Eye, 
  Trophy, 
  Copyright, 
  Code, 
  Server, 
  UserX, 
  Info, 
  AlertOctagon, 
  Scale, 
  Mail,
  Calendar,
  Clock
} from 'lucide-react';
import SEO from '../components/SEO';

const SECTIONS = [
  { id: 'acceptance', label: '1. Acceptance of Terms', icon: CheckSquare },
  { id: 'eligibility', label: '2. Eligibility', icon: UserCheck },
  { id: 'accounts', label: '3. User Accounts', icon: User },
  { id: 'acceptable-use', label: '4. Acceptable Use', icon: AlertTriangle },
  { id: 'code-execution', label: '5. Code Execution Environment', icon: Terminal },
  { id: 'mock-tests', label: '6. Mock Test Rules', icon: Eye },
  { id: 'rankings', label: '7. Rankings & Leaderboards', icon: Trophy },
  { id: 'ip-rights', label: '8. Intellectual Property', icon: Copyright },
  { id: 'ugc', label: '9. User Generated Content', icon: Code },
  { id: 'availability', label: '10. Platform Availability', icon: Server },
  { id: 'suspension', label: '11. Account Suspension', icon: UserX },
  { id: 'affiliation-disclaimer', label: '12. Corporate Disclaimer', icon: Info },
  { id: 'liability', label: '13. Limitation of Liability', icon: AlertOctagon },
  { id: 'governing-law', label: '14. Governing Law', icon: Scale },
  { id: 'contact-info', label: '15. Contact Information', icon: Mail }
];

const Terms = () => {
  const [activeSection, setActiveSection] = useState('acceptance');

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
        title="Terms of Service"
        description="NQTCoder Terms of Service. Review code submission rules, mock test honor code guidelines, anti-cheat policy, and acceptable usage."
        path="/terms"
      />

      {/* Hero Header Area */}
      <div className="border-b border-darkBorder py-14 px-4 bg-darkCard/20 select-none">
        <div className="max-w-6xl mx-auto flex flex-col space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Terms of Service</h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Review the terms, rules, and conditions for using the NQTCoder programming assessment platform. Compliance with these terms ensures a fair practicing environment for all coders.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="bg-darkBg/60 border border-darkBorder text-slate-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-accentBlue" />
              <span>Last updated: July 5, 2026</span>
            </div>
            <div className="bg-darkBg/60 border border-darkBorder text-slate-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-accentBlue" />
              <span>Reading time: ~7 mins</span>
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

            {/* Section 1: Acceptance of Terms */}
            <section id="acceptance" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <CheckSquare className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">1. Acceptance of Terms</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you and NQTCoder regarding your access to and use of our website, online coding terminal, practice modules, and test platforms.
                </p>
                <p>
                  By registering an account, compiling code, attempting mock tests, or browsing the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy. If you do not agree to these conditions, you must immediately terminate use of the Platform.
                </p>
              </div>
            </section>

            {/* Section 2: Eligibility */}
            <section id="eligibility" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <UserCheck className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">2. Eligibility</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  You must be at least 13 years of age to register an account on NQTCoder. If you are under the age of 18 (or the legal age of majority in your jurisdiction), you may only use NQTCoder under the supervision of a parent or legal guardian who agrees to be bound by these Terms.
                </p>
              </div>
            </section>

            {/* Section 3: User Accounts */}
            <section id="accounts" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <User className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">3. User Accounts</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  To unlock practice modules, save solution history, and participate in leaderboards, you must create a user profile. You agree to:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-300">
                  <li>Provide accurate, current, and complete registration information.</li>
                  <li>Maintain the security and confidentiality of your credentials (including OAuth tokens and account passwords).</li>
                  <li>Accept full responsibility for all activities, code runs, and mock test attempts carried out under your profile.</li>
                  <li>Notify us immediately of any unauthorized breach or suspicious activity on your account.</li>
                </ul>
              </div>
            </section>

            {/* Section 4: Acceptable Use */}
            <section id="acceptable-use" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <AlertTriangle className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">4. Acceptable Use</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  We host a collaborative and competitive learning environment. To preserve the integrity and stability of NQTCoder, you are strictly prohibited from engaging in the following behaviors:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-300">
                  <li>Attempting to probe, scan, test, or exploit vulnerabilities on our backend API endpoints or network layers.</li>
                  <li>Executing SQL injection attacks, Cross-Site Scripting (XSS) injections, or remote code execution exploits targeting our database or servers.</li>
                  <li>Uploading, inserting, or compiling code containing malware, viruses, trojans, or destructive scripts.</li>
                  <li>Abusing or spamming backend REST APIs with automated requests outside of standard human interface speeds.</li>
                  <li>Scraping Platform content, question statements, input test sets, or database records using automated bots, spiders, or scripts.</li>
                  <li>Reverse engineering, decompiling, or attempting to extract the core codebase of the Platform.</li>
                  <li>Establishing multiple fake or duplicate accounts to manipulation ratings or leaderboard scores.</li>
                  <li>Automating cheat mechanisms, browser scripts, or copy-paste routines to bypass Mock Test proctoring controls.</li>
                  <li>Launching Denial of Service (DoS/DDoS) attacks or otherwise degrading Platform performance for other users.</li>
                </ul>
              </div>
            </section>

            {/* Section 5: Code Execution Environment */}
            <section id="code-execution" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <Terminal className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">5. Code Execution Environment</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  When you execute or submit programming code on NQTCoder, your code is processed and compiled inside isolated sandbox containers on our compilation servers.
                </p>
                <p>
                  While the containers enforce virtual boundaries, any submission containing commands attempting sandbox escapes, root access modifications, persistent file writes outside allocated temp paths, or outbound socket connections will be flagged automatically. Users who write malicious execution blocks will face immediate and permanent account suspension.
                </p>
              </div>
            </section>

            {/* Section 6: Mock Test Rules */}
            <section id="mock-tests" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <Eye className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">6. Mock Test Rules</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  To prepare users for real corporate placement environments, Mock Tests on NQTCoder employ automated proctoring mechanisms. By starting a Mock Test, you agree to comply with the Honor Code rules:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-300">
                  <li><strong>Focus Monitoring:</strong> The testing tab tracks active window focus. If you switch tabs or minimize the browser, it is logged as a violation.</li>
                  <li><strong>Violation Limit:</strong> Accumulating three (3) tab switches or focus violations triggers an automatic submission of your exam in its current state and locks you out of further changes.</li>
                  <li><strong>Cheating Prevention:</strong> You must not seek external help, paste copied code, look up answers on separate devices, or share test questions during an active test session.</li>
                </ul>
              </div>
            </section>

            {/* Section 7: Rankings & Leaderboards */}
            <section id="rankings" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <Trophy className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">7. Rankings & Leaderboards</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  Leaderboards calculate student ranking dynamically based on accuracy, test cases passed, and solving speeds. NQTCoder reserves the absolute right to audit all database records, submission code blocks, and user statistics.
                </p>
                <p>
                  Any profile found containing submissions that were generated via bot automation, coordinate plagiarism, or score-spoofing API exploits will be scrubbed, and the associated user account will be barred from ranking.
                </p>
              </div>
            </section>

            {/* Section 8: Intellectual Property */}
            <section id="ip-rights" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <Copyright className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">8. Intellectual Property</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  The NQTCoder logo, graphics, design, portal interfaces, website source code, backend modules, database structures, and platform contents are the exclusive property of NQTCoder and its developers. They are protected under copyright, trademark, and intellectual property laws. You are not granted any rights to copy, redistribute, hotlink, or resell any part of the Platform layout, questions database, or branding.
                </p>
              </div>
            </section>

            {/* Section 9: User Generated Content */}
            <section id="ugc" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <Code className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">9. User Generated Content</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  You retain copyright ownership over any source code solutions, text inputs, and feedback comments you upload or write on the Platform.
                </p>
                <p>
                  However, by submitting code solutions to our practice modules or tests, you grant NQTCoder a worldwide, royalty-free, non-exclusive, sublicensable license to host, execute, parse, compile, verify, and store the code block solely for evaluation, scoring, anti-cheat detection, and ranking purposes.
                </p>
              </div>
            </section>

            {/* Section 10: Platform Availability */}
            <section id="availability" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <Server className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">10. Platform Availability</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  NQTCoder is provided to users on an &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis. We perform regular system maintenance and compiler tuning, which may cause temporary offline states. We do not warrant that compiler sandboxes, server responses, or practice statistics will always be uninterrupted, error-free, or devoid of compile delays.
                </p>
              </div>
            </section>

            {/* Section 11: Account Suspension */}
            <section id="suspension" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <UserX className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">11. Account Suspension & Termination</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  We reserve the right, without warning, notice, or liability, to suspend, disable, restrict, or delete user accounts if we determine, in our sole discretion, that:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                  <li>You have violated these Terms of Service or our code guidelines.</li>
                  <li>You have engaged in cheating, plagiarism, or leaderboard manipulation.</li>
                  <li>Your account activities present security risks to our host servers or compiler instances.</li>
                </ul>
              </div>
            </section>

            {/* Section 12: Corporate Disclaimer */}
            <section id="affiliation-disclaimer" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <Info className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">12. Corporate Affiliation Disclaimer</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3 bg-darkBg/50 border border-darkBorder p-5 rounded-xl">
                <p className="font-extrabold text-white mb-2 uppercase tracking-wider text-xs">⚠️ Important Notice regarding Affiliation:</p>
                <p className="mb-2">
                  NQTCoder is an independent, third-party educational preparation platform designed to help students sharpen programming skills for placement assessments.
                </p>
                <p className="mb-2">
                  Unless explicitly stated in writing, NQTCoder has <strong>no affiliation, sponsorship, endorsement, partnership, or official association</strong> with Tata Consultancy Services (TCS), Infosys, Wipro, Accenture, Cognizant, Capgemini, Deloitte, or any other corporate entity. All corporate trademark names referenced on the Platform are properties of their respective owners.
                </p>
                <p className="font-semibold text-white mt-3">
                  ⚠️ Using this Platform, practicing the coding challenges, or achieving high ranks on mock tests does not guarantee job placement, hiring, or recruitment by any company.
                </p>
              </div>
            </section>

            {/* Section 13: Limitation of Liability */}
            <section id="liability" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <AlertOctagon className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">13. Limitation of Liability</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  To the maximum extent permitted by law, NQTCoder, its developers, administrators, and hosts shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, opportunities, or usage arising out of or connected with your access to, or inability to access, the Platform.
                </p>
              </div>
            </section>

            {/* Section 14: Governing Law */}
            <section id="governing-law" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <Scale className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">14. Governing Law</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  These Terms of Service and any dispute arising from your use of NQTCoder shall be governed by, construed, and enforced in accordance with the laws of <strong>India</strong>, without regard to conflict of law principles. You agree to submit to the jurisdiction of the courts located in India for resolving all legal disputes.
                </p>
              </div>
            </section>

            {/* Section 15: Contact Information */}
            <section id="contact-info" className="space-y-4 scroll-mt-24">
              <div className="flex items-center space-x-3 pb-2 border-b border-darkBorder/40">
                <Mail className="w-5 h-5 text-accentBlue shrink-0" />
                <h2 className="text-xl font-bold text-white tracking-wide">15. Contact Information</h2>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  If you have queries, legal requests, or support needs regarding these Terms of Service, please contact the Platform administration:
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

export default Terms;
