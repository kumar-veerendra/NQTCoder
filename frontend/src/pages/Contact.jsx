import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { submitFeedback } from '../services/feedbackService';
import { 
  Terminal, Mail, Github, MessageSquare, Bug, HelpCircle, 
  Send, CheckCircle2, ArrowRight, Linkedin
} from 'lucide-react';
import SEO from '../components/SEO';

const Contact = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

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

  return (
    <div className="min-h-[calc(100vh-73px)] bg-darkBg text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <SEO
        title="Contact Us — Feedback & Bug Reports"
        description="Reach out to the NQTCoder team to submit feedback, report a bug, or ask a question."
        path="/contact"
        keywords="contact NQTCoder, feedback, bug report, platform support"
      />
      <div className="max-w-6xl mx-auto space-y-16 animate-fadeIn">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-accentBlue/10 text-accentBlue border border-accentBlue/20 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider select-none">
            <Terminal className="w-3.5 h-3.5" />
            <span>Connect With Us</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white select-none">
            Support & Feedback
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Need help, found a compiler bug, or want to suggest a new practice feature? Send a message and the admin team will get back to you!
          </p>
        </div>

        {/* Split Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Side: Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-white tracking-wide">Direct Contacts</h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Connect with the engineering team behind NQTCoder. We appreciate bug reports and platform feedback!
              </p>
            </div>

            <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-4 shadow-xl select-none relative overflow-hidden">
              <div className="premium-shine rounded-2xl"></div>

              <div className="space-y-3.5 text-xs text-slate-300 relative z-10">
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
                    <span>Telegram Support</span>
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:col-span-7">
            <div className="bg-darkCard border border-darkBorder rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="premium-shine rounded-3xl"></div>

              {success ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 animate-fadeIn relative z-10">
                  <div className="bg-emerald-500/10 p-5 rounded-full border border-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-white">Submission Successful</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Thank you for sharing your feedback. Our support team has received your ticket and is working on reviewing it.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => setSuccess(false)}
                      className="px-5 py-2.5 rounded-xl border border-darkBorder hover:border-slate-600 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all cursor-pointer"
                    >
                      Submit Another Ticket
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="px-5 py-2.5 rounded-xl bg-accentBtn hover:bg-accentBtnHover text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1 shadow-lg shadow-accentBtn/20 transition-all cursor-pointer"
                    >
                      <span>Return Home</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
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
                  <div className="space-y-2 select-none">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Ticket Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => handleTypeSelect('feedback')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          formData.type === 'feedback'
                            ? 'bg-accentBlue/10 border-accentBlue text-accentBlue shadow-lg'
                            : 'bg-darkBg/60 border-darkBorder text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4 mb-1.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Feedback</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTypeSelect('bug')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          formData.type === 'bug'
                            ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-lg'
                            : 'bg-darkBg/60 border-darkBorder text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <Bug className="w-4 h-4 mb-1.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Report Bug</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTypeSelect('general')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          formData.type === 'general'
                            ? 'bg-sky-500/10 border-sky-500 text-sky-400 shadow-lg'
                            : 'bg-darkBg/60 border-darkBorder text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <HelpCircle className="w-4 h-4 mb-1.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Inquiry</span>
                      </button>
                    </div>
                  </div>

                  {/* Name and Email */}
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
                        className="w-full bg-darkBg border border-darkBorder px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-accentBlue text-slate-200 disabled:opacity-60 transition-colors"
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
                        className="w-full bg-darkBg border border-darkBorder px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-accentBlue text-slate-200 disabled:opacity-60 transition-colors"
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
                      placeholder="e.g. Compiler Offline notification, Mock test tabswitch issue"
                      className="w-full bg-darkBg border border-darkBorder px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-accentBlue text-slate-200 transition-colors"
                    />
                  </div>

                  {/* Message details */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Message details</label>
                    <textarea
                      name="message"
                      required
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Write your explanation or bug reproduction steps..."
                      className="w-full bg-darkBg border border-darkBorder px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-accentBlue text-slate-200 transition-colors"
                    />
                  </div>

                  {user && (
                    <div className="text-[10px] text-accentBlue font-semibold bg-accentBlue/5 border border-accentBlue/10 px-3 py-2 rounded-lg flex items-center space-x-1.5">
                      <span>✓ Connected with your account: <strong>{user.username}</strong></span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white flex items-center justify-center space-x-2 transition-all shadow-lg cursor-pointer ${
                      loading 
                        ? 'bg-slate-700 cursor-not-allowed' 
                        : formData.type === 'bug' 
                          ? 'bg-rose-500 hover:bg-rose-500/90' 
                          : formData.type === 'general'
                            ? 'bg-sky-500 hover:bg-sky-500/90'
                            : 'bg-accentBtn hover:bg-accentBtnHover'
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
        <div className="bg-gradient-to-br from-accentBlue/10 to-indigo-500/5 border border-accentBlue/20 rounded-2xl p-8 space-y-5 shadow relative overflow-hidden select-none">
          <div className="premium-shine rounded-2xl"></div>
          <div className="flex items-start gap-4 relative z-10">
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
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

          <div className="relative z-10">
            <a
              href="/compiler-setup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accentBtn hover:bg-accentBtnHover text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-accentBtn/20 transition-all cursor-pointer w-fit"
            >
              <Terminal className="w-4 h-4" />
              Read Full Compiler Setup Guide
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
