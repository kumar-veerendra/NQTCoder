import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { submitFeedback } from '../services/feedbackService';
import { 
  Terminal, Mail, Github, MessageSquare, Bug, HelpCircle, 
  Send, CheckCircle2, Award, Shield, BookOpen, ExternalLink, ArrowRight, Linkedin
} from 'lucide-react';
import SEO from '../components/SEO';

const AboutContact = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isContactPage = location.pathname === '/contact';

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'feedback', // 'feedback', 'bug', 'general'
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.username || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (type) => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await submitFeedback(formData);
      setSuccess(true);
      setFormData(prev => ({
        ...prev,
        subject: '',
        message: ''
      }));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Determine border/accent color based on type of report selected
  const getAccentColor = () => {
    switch (formData.type) {
      case 'bug':
        return {
          border: 'border-rose-500/30 focus:border-rose-500',
          bg: 'bg-rose-500/10',
          text: 'text-rose-400',
          glow: 'shadow-rose-500/10'
        };
      case 'general':
        return {
          border: 'border-sky-500/30 focus:border-sky-500',
          bg: 'bg-sky-500/10',
          text: 'text-sky-400',
          glow: 'shadow-sky-500/10'
        };
      case 'feedback':
      default:
        return {
          border: 'border-accentBlue/30 focus:border-accentBlue',
          bg: 'bg-accentBlue/10',
          text: 'text-accentBlue',
          glow: 'shadow-accentBlue/10'
        };
    }
  };

  const activeColor = getAccentColor();

  return (
    <div className="min-h-[calc(100vh-73px)] bg-darkBg text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* ── SEO ─────────────────────────────────────────────────────────── */}
      <SEO
        title={isContactPage ? 'Contact Us — Feedback & Bug Reports' : 'About NQTCoder — Platform, Team & Mission'}
        description={isContactPage
          ? 'Reach out to the NQTCoder team to submit feedback, report a bug, or ask a question. We respond to all queries from placement-aspiring students.'
          : 'Learn about NQTCoder — a placement coding practice platform built for students preparing for TCS NQT, Infosys, Wipro & more. Meet the team behind it.'}
        path={isContactPage ? '/contact' : '/about'}
        keywords="NQTCoder about, contact NQTCoder, feedback, bug report, placement platform team, coding platform India"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
              { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.nqtcoder.dev/' },
              { '@type': 'ListItem', 'position': 2, 'name': isContactPage ? 'Contact' : 'About', 'item': `https://www.nqtcoder.dev${isContactPage ? '/contact' : '/about'}` }
            ]
          },
          {
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            'name': 'NQTCoder — Contact & Feedback',
            'url': 'https://www.nqtcoder.dev/contact',
            'description': 'Submit feedback, bug reports, or questions to the NQTCoder team.'
          }
        ]}
      />
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Section 1: Page Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-accentBlue/10 text-accentBlue border border-accentBlue/20 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5" />
            <span>Connecting & Improving</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            About NQT<span className="text-accentBlue">Coder</span> & Support
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Welcome to the ultimate preparation arena. We are building a modern workspace to help students crack campus coding rounds. Submit feedback or report bugs to help us build a better platform.
          </p>
        </div>

        {/* Section 2: Split Content (About details & Form) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Side: About & Feature Cards */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              <h2 className="text-xl font-extrabold text-white tracking-wide">
                Our Mission & Goals
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                NQTCoder was designed to bridge the gap between classroom coding and exam pressure. We replicate exam interfaces (like TCS NQT) to give you authentic coding practice with strict timers, secure test cases, and multi-language support.
              </p>
            </div>

            {/* Visual Feature highlights */}
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 rounded-xl bg-darkCard border border-darkBorder hover:border-slate-700 transition-all">
                <div className="bg-indigo-500/10 p-2.5 rounded-xl text-indigo-400 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Exam Simulation</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Practice with the exact compiler UI, full imports, and custom class structures required by national recruiters.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-xl bg-darkCard border border-darkBorder hover:border-slate-700 transition-all">
                <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Secure Sandboxes</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Your code executes in isolated Docker environments to guarantee safety, speed, and standard test results.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-xl bg-darkCard border border-darkBorder hover:border-slate-700 transition-all">
                <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-400 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Learning Tracks</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Follow company-specific roadmaps for TCS, Accenture, Wipro, and topic-specific preparation plans.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Contact Details */}
            <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Direct Contacts</h3>
              
              <div className="space-y-3.5 text-xs text-slate-300">
                <a 
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=veerendrakumartmsl@gmail.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center space-x-3 p-2 rounded hover:bg-darkBg/50 transition-colors group"
                >
                  <Mail className="w-4 h-4 text-slate-400 group-hover:text-accentBlue transition-colors" />
                  <span>veerendrakumartmsl@gmail.com</span>
                </a>

                <a 
                  href="https://github.com/kumar-veerendra/NQTCoder" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center space-x-3 p-2 rounded hover:bg-darkBg/50 transition-colors group"
                >
                  <Github className="w-4 h-4 text-slate-400 group-hover:text-accentBlue transition-colors" />
                  <span className="flex items-center space-x-1">
                    <span>GitHub Repository</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </span>
                </a>

                <a 
                  href="https://linkedin.com/in/kumar-veerendra" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center space-x-3 p-2 rounded hover:bg-darkBg/50 transition-colors group"
                >
                  <Linkedin className="w-4 h-4 text-slate-400 group-hover:text-accentBlue transition-colors" />
                  <span className="flex items-center space-x-1">
                    <span>LinkedIn Profile</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </span>
                </a>

                <a 
                  href="https://t.me/nqtcodersupport" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center space-x-3 p-2 rounded hover:bg-darkBg/50 transition-colors group"
                >
                  <Send className="w-4 h-4 text-slate-400 group-hover:text-accentBlue transition-colors" />
                  <span className="flex items-center space-x-1">
                    <span>Telegram Channel</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Side: Form Card */}
          <div className="lg:col-span-7">
            <div className="bg-darkCard border border-darkBorder rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              
              {success ? (
                /* Success screen */
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 animate-fadeIn">
                  <div className="bg-emerald-500/10 p-5 rounded-full border border-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-white">Submission Successful</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Thank you for sharing your inputs. Our support team has received your ticket and is working on reviewing it.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => setSuccess(false)}
                      className="px-5 py-2.5 rounded-xl border border-darkBorder hover:border-slate-600 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all"
                    >
                      Submit Another Ticket
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="px-5 py-2.5 rounded-xl bg-accentBtn hover:bg-accentBtnHover text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1 shadow-lg shadow-accentBtn/20 transition-all"
                    >
                      <span>Return Home</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Form screen */
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white tracking-wide">Submit a Ticket</h2>
                    <p className="text-xs text-slate-400">Found a bug or have a feature idea? Let us know!</p>
                  </div>

                  {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs">
                      {error}
                    </div>
                  )}

                  {/* Submission type toggles */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Ticket Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      
                      {/* Feedback Tab */}
                      <button
                        type="button"
                        onClick={() => handleTypeSelect('feedback')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                          formData.type === 'feedback'
                            ? 'bg-accentBlue/10 border-accentBlue text-accentBlue shadow-lg shadow-accentBlue/5'
                            : 'bg-darkBg/60 border-darkBorder text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4 mb-1.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Feedback</span>
                      </button>

                      {/* Bug Tab */}
                      <button
                        type="button"
                        onClick={() => handleTypeSelect('bug')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                          formData.type === 'bug'
                            ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/5'
                            : 'bg-darkBg/60 border-darkBorder text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <Bug className="w-4 h-4 mb-1.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Report Bug</span>
                      </button>

                      {/* General Enquiry Tab */}
                      <button
                        type="button"
                        onClick={() => handleTypeSelect('general')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                          formData.type === 'general'
                            ? 'bg-sky-500/10 border-sky-500 text-sky-400 shadow-lg shadow-sky-500/5'
                            : 'bg-darkBg/60 border-darkBorder text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <HelpCircle className="w-4 h-4 mb-1.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Inquiry</span>
                      </button>

                    </div>
                  </div>

                  {/* Name and Email side by side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        disabled={user !== null}
                        placeholder="e.g. Rahul Kumar"
                        className="w-full bg-darkBg border border-darkBorder px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-accentBlue text-slate-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        disabled={user !== null}
                        placeholder="e.g. rahul@example.com"
                        className="w-full bg-darkBg border border-darkBorder px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-accentBlue text-slate-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g. Trouble running Python compilers, Feature request for mock tests"
                      className="w-full bg-darkBg border border-darkBorder px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-accentBlue text-slate-200 transition-colors"
                    />
                  </div>

                  {/* Message body */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Message details</label>
                    <textarea
                      name="message"
                      required
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Write your explanation or step-by-step bug reproduction here..."
                      className="w-full bg-darkBg border border-darkBorder px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-accentBlue text-slate-200 transition-colors"
                    />
                  </div>

                  {user && (
                    <div className="text-[10px] text-indigo-400 font-semibold bg-indigo-500/5 border border-indigo-500/10 px-3 py-2 rounded-lg flex items-center space-x-1.5">
                      <span>✓ Connected with your account: <strong>{user.username}</strong></span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white flex items-center justify-center space-x-2 transition-all shadow-lg ${
                      loading 
                        ? 'bg-slate-700 cursor-not-allowed' 
                        : formData.type === 'bug' 
                          ? 'bg-rose-500 hover:bg-rose-500/90 shadow-rose-500/10' 
                          : formData.type === 'general'
                            ? 'bg-sky-500 hover:bg-sky-500/90 shadow-sky-500/10'
                            : 'bg-accentBtn hover:bg-accentBtnHover shadow-accentBtn/10'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Submitting Ticket...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* ── Compiler Setup FAQ callout ── */}
        <div className="bg-gradient-to-br from-accentBlue/10 to-indigo-500/5 border border-accentBlue/20 rounded-2xl p-8 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accentBlue/15 border border-accentBlue/25 text-accentBlue flex items-center justify-center shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Code Editor Showing "Offline"?</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                NQTCoder's code editor uses <strong className="text-white">local compilers</strong> installed on the server machine to run your code.
                If the compiler status bar shows <span className="text-rose-400 font-bold">Offline</span>, it means Java, g++ (C++), or Python is not yet installed on the backend server.
                This is a one-time setup that only the server admin needs to do — students don't need to install anything.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { lang: '☕ Java (JDK 11)', note: 'Most important — needed for Java submissions' },
              { lang: '⚙️ C++ (GCC/g++)', note: 'Install MinGW (Windows) or GCC (Linux/Mac)' },
              { lang: '🐍 Python 3', note: 'Easiest to install — just download & check "Add to PATH"' }
            ].map((item, i) => (
              <div key={i} className="bg-darkBg/60 border border-darkBorder rounded-xl px-4 py-3 space-y-1">
                <p className="text-sm font-bold text-white">{item.lang}</p>
                <p className="text-[11px] text-slate-400">{item.note}</p>
              </div>
            ))}
          </div>

          <a
            href="/compiler-setup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accentBtn hover:bg-accentBtnHover text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-accentBtn/20 transition-all cursor-pointer"
          >
            <Terminal className="w-4 h-4" />
            Read Full Compiler Setup Guide
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
};

export default AboutContact;
