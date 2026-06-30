import React from 'react';
import SEO from '../components/SEO';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 bg-darkBg text-slate-100 min-h-screen">
      <SEO
        title="Terms of Service"
        description="NQTCoder Terms of Service. Review code submission rules, mock test honor code guidelines, anti-cheat policy, and acceptable usage."
        path="/terms"
      />
      
      <div className="space-y-4 border-b border-darkBorder pb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-wide">Terms of Service</h1>
        <p className="text-xs text-slate-400">Last updated: July 1, 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the NQTCoder platform, you agree to comply with and be bound by these Terms of Service. If you do not agree, you must immediately cease all access and use.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. User Accounts</h2>
          <p>
            You are responsible for safeguarding your account credentials. You agree to provide accurate information during registration. Sharing account credentials or executing malicious exploits against our servers will lead to immediate account termination.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Code Execution & Server Use</h2>
          <p>
            NQTCoder compiles and executes submitted source code on its host servers. You must not submit code containing system exploits, infinite loops designed to consume memory, or network calls attempting to scrape backend APIs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Mock Test Proctor System</h2>
          <p>
            Mock tests employ a proctoring system tracking window focus and tab changes. Attempting to bypass focus checks, tamper with front-end states, or spoof submission scores is a violation of the platform guidelines and can result in mock test banishment.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">5. Platform Disclaimer</h2>
          <p>
            NQTCoder is an educational tool. We do not guarantee employment, offer job placements, or represent official corporate recruitment bodies (including TCS, Wipro, Infosys, etc.). Questions are for practice and simulation only.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
