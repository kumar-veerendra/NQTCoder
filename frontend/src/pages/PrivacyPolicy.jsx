import React from 'react';
import SEO from '../components/SEO';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 bg-darkBg text-slate-100 min-h-screen">
      <SEO
        title="Privacy Policy"
        description="NQTCoder Privacy Policy. Learn about how we handle user accounts, coding submissions, cookies, and Google OAuth credentials."
        path="/privacy"
      />
      
      <div className="space-y-4 border-b border-darkBorder pb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-wide">Privacy Policy</h1>
        <p className="text-xs text-slate-400">Last updated: July 1, 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
          <p>
            We collect information when you register an account, sign in via Google OAuth, submit code solutions, or interact with mock tests. This includes your email address, username, profile picture, and platform activity data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. How We Use Your Information</h2>
          <p>
            Your information is used solely to maintain your user account, calculate leaderboard rankings, log mock test results (including tab-switching warning logs), and show personal learning progress. We do not sell or share your data with third parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Google OAuth & Third Parties</h2>
          <p>
            If you log in with Google, we access only your basic public profile information (name, email, profile picture) to automatically provision your NQTCoder profile. We do not request or store any other Google account permissions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Cookies</h2>
          <p>
            We use standard session cookies and local storage tokens to keep you logged in across browser sessions. You can disable cookies in your browser settings, though doing so will break authentication state persistence.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">5. Contact Info</h2>
          <p>
            If you have questions about this Privacy Policy, please reach out via our feedback page or contact us at: 
            <a href="mailto:veerendrakumartmsl@gmail.com" className="text-accentBlue hover:underline ml-1">veerendrakumartmsl@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
