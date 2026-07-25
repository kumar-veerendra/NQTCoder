import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Key, ShieldCheck, Cpu, Play, CheckCircle2, AlertTriangle, 
  Trash2, Plus, Sparkles, HelpCircle, Eye, EyeOff, Check, X, RefreshCw 
} from 'lucide-react';
import { aiClient } from '../services/aiClient';
import { Helmet } from 'react-helmet-async';

const AISettings = () => {
  const [config, setConfig] = useState(() => aiClient.getConfig());
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Modal Fields
  const [provider, setProvider] = useState('gemini');
  const [keyName, setKeyName] = useState('');
  const [keyValue, setKeyValue] = useState('');
  const [showKeyText, setShowKeyText] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  
  // Validation / Testing States
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }
  const [saveError, setSaveError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const providerKeys = config.providers?.[provider]?.keys || [];

  const triggerToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleTestConnection = async (e) => {
    e.preventDefault();
    if (!keyValue.trim()) {
      setTestResult({ success: false, message: 'API Key cannot be empty.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const isValid = await aiClient.validateKey(keyValue, provider);
      if (isValid) {
        setTestResult({ success: true, message: 'Successfully connected to Google Gemini!' });
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveKey = async (e) => {
    e.preventDefault();
    setSaveError('');
    if (!keyName.trim()) {
      setSaveError('API Key Name is required.');
      return;
    }
    if (!keyValue.trim()) {
      setSaveError('API Key value is required.');
      return;
    }

    // Duplicate Check
    const isDuplicate = providerKeys.some(k => k.value.trim() === keyValue.trim());
    if (isDuplicate) {
      setSaveError('This API Key is already registered in NQTCoder.');
      return;
    }

    // Limit check (Max 5 keys)
    if (providerKeys.length >= 5) {
      setSaveError('Maximum limit of 5 API Keys per provider reached.');
      return;
    }

    setTesting(true);
    try {
      const isValid = await aiClient.validateKey(keyValue, provider);
      if (!isValid) throw new Error('Invalid key verification response.');

      const newKey = {
        id: 'key_' + Date.now(),
        name: keyName.trim(),
        value: keyValue.trim(),
        model: selectedModel,
        isActive: true,
        isPrimary: providerKeys.length === 0, // make primary if first key
        createdDate: new Date().toISOString(),
        lastUsed: null
      };

      const updatedKeys = [...providerKeys, newKey];
      const updatedConfig = {
        ...config,
        providers: {
          ...config.providers,
          [provider]: {
            ...config.providers[provider],
            keys: updatedKeys
          }
        }
      };

      aiClient.saveConfig(updatedConfig);
      setConfig(updatedConfig);
      triggerToast(`Key "${keyName}" saved successfully.`);
      
      // Reset Modal
      setKeyName('');
      setKeyValue('');
      setTestResult(null);
      setShowAddModal(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setTesting(false);
    }
  };

  const handleDeleteKey = (keyId, name) => {
    if (!window.confirm(`Are you sure you want to delete the key "${name}"?`)) return;

    const keys = providerKeys.filter(k => k.id !== keyId);
    
    // If we deleted the primary key, assign the next active key as primary
    if (keys.length > 0 && !keys.some(k => k.isPrimary)) {
      const activeIdx = keys.findIndex(k => k.isActive);
      if (activeIdx !== -1) {
        keys[activeIdx].isPrimary = true;
      } else {
        keys[0].isPrimary = true;
      }
    }

    const updatedConfig = {
      ...config,
      providers: {
        ...config.providers,
        [provider]: {
          ...config.providers[provider],
          keys
        }
      }
    };

    aiClient.saveConfig(updatedConfig);
    setConfig(updatedConfig);
    triggerToast(`Key "${name}" deleted.`);
  };

  const handleToggleActive = (keyId) => {
    const keys = providerKeys.map(k => {
      if (k.id === keyId) {
        return { ...k, isActive: !k.isActive };
      }
      return k;
    });

    const updatedConfig = {
      ...config,
      providers: {
        ...config.providers,
        [provider]: {
          ...config.providers[provider],
          keys
        }
      }
    };

    aiClient.saveConfig(updatedConfig);
    setConfig(updatedConfig);
  };

  const handleMakePrimary = (keyId) => {
    const keys = providerKeys.map(k => ({
      ...k,
      isPrimary: k.id === keyId,
      isActive: k.id === keyId ? true : k.isActive // Force active if primary
    }));

    const updatedConfig = {
      ...config,
      providers: {
        ...config.providers,
        [provider]: {
          ...config.providers[provider],
          keys
        }
      }
    };

    aiClient.saveConfig(updatedConfig);
    setConfig(updatedConfig);
    triggerToast('Primary key updated.');
  };

  const handleRenameKey = (keyId, currentName) => {
    const newName = window.prompt('Enter a new name for this key:', currentName);
    if (!newName || !newName.trim()) return;

    const keys = providerKeys.map(k => {
      if (k.id === keyId) {
        return { ...k, name: newName.trim() };
      }
      return k;
    });

    const updatedConfig = {
      ...config,
      providers: {
        ...config.providers,
        [provider]: {
          ...config.providers[provider],
          keys
        }
      }
    };

    aiClient.saveConfig(updatedConfig);
    setConfig(updatedConfig);
    triggerToast('Key renamed successfully.');
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 py-12 px-4 sm:px-6 lg:px-8 select-none">
      <Helmet>
        <title>AI Settings | NQTCoder Extensible Playground</title>
        <meta name="description" content="Configure Bring Your Own AI Key (BYOK) for NQTCoder Email Writing Lab." />
      </Helmet>

      {/* Success Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider">{successToast}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-bold uppercase tracking-wider">
          <Link to="/" className="hover:text-accentBlue transition-colors">Home</Link>
          <span>/</span>
          <Link to="/aptitude" className="hover:text-accentBlue transition-colors">Aptitude</Link>
          <span>/</span>
          <span className="text-slate-400">AI Configuration</span>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-accentBlue/10 to-violet-500/10 border border-darkBorder rounded-3xl p-8 relative overflow-hidden space-y-6">
          <div className="absolute right-0 top-0 w-64 h-64 bg-accentBlue/5 rounded-full filter blur-3xl -z-10" />
          <div className="flex items-center space-x-3 text-accentBlue">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-3xl font-black tracking-wide text-white">AI Provider Configuration</h1>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
            NQTCoder supports a hybrid execution architecture. You can connect your personal Google Gemini API keys to practice unlimited Email Writing and Verbal Reasoning assessments. Your keys are processed on-the-fly and never saved on our databases.
          </p>
        </div>

        {/* Feature Highlights cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-accentBlue/10 flex items-center justify-center text-accentBlue border border-accentBlue/25">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wide">Unlimited Practice</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Bypass the daily 10-evaluation shared limit. Practice as much as you need using your own API quota.
            </p>
          </div>

          <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-400/10 flex items-center justify-center text-violet-400 border border-violet-400/25">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wide">100% Secure & Private</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Your keys reside entirely inside browser local storage and are never written to server logs or MongoDB.
            </p>
          </div>

          <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400 border border-emerald-400/25">
              <Play className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wide">Completely Free</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Google AI Studio provides developer API keys free of charge with generous request bounds.
            </p>
          </div>
        </div>

        {/* NQTCoder Commitment Panel */}
        <div className="bg-darkCard border border-darkBorder/80 rounded-3xl p-6 relative overflow-hidden space-y-4">
          <div className="flex items-center space-x-3 text-violet-400">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
            <h2 className="text-sm font-black tracking-widest uppercase text-white">NQTCoder Commitment</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-300 leading-relaxed select-none">
            <div className="flex items-start gap-2.5 bg-darkBg/30 p-3 rounded-xl border border-darkBorder/40">
              <span className="text-emerald-400 text-sm">✅</span>
              <span>We use only the free Gemini quota for shared AI.</span>
            </div>
            <div className="flex items-start gap-2.5 bg-darkBg/30 p-3 rounded-xl border border-darkBorder/40">
              <span className="text-emerald-400 text-sm">✅</span>
              <span>We will never charge you for AI features.</span>
            </div>
            <div className="flex items-start gap-2.5 bg-darkBg/30 p-3 rounded-xl border border-darkBorder/40">
              <span className="text-emerald-400 text-sm">✅</span>
              <span>We do not automatically enable paid usage.</span>
            </div>
            <div className="flex items-start gap-2.5 bg-darkBg/30 p-3 rounded-xl border border-darkBorder/40">
              <span className="text-emerald-400 text-sm">✅</span>
              <span>If the free quota is exhausted, you'll be notified and can either use your own free API key or wait for the quota to reset.</span>
            </div>
          </div>
        </div>

        {/* Step-by-Step Setup Guide */}
        <div className="space-y-6">
          <h2 className="text-lg font-black uppercase text-white tracking-widest flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-accentBlue" />
            Step-by-Step Setup Guide
          </h2>
          
          <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-slate-300">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accentBlue text-white flex items-center justify-center shrink-0 font-extrabold text-[10px]">1</span>
                  <div>
                    <h4 className="font-extrabold text-white text-sm mb-1">Open Google AI Studio</h4>
                    <p className="text-slate-400 leading-relaxed">
                      Go to Google AI Studio. Sign in using your standard Google/Gmail account.
                    </p>
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1.5 text-accentBlue font-bold hover:underline mt-2 text-[10px]"
                    >
                      Open Google AI Studio Website ➜
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accentBlue text-white flex items-center justify-center shrink-0 font-extrabold text-[10px]">2</span>
                  <div>
                    <h4 className="font-extrabold text-white text-sm mb-1">Generate API Key</h4>
                    <p className="text-slate-400 leading-relaxed">
                      Click the blue **"Get API key"** button on the top sidebar. Select "Create API key" and link it to a project.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accentBlue text-white flex items-center justify-center shrink-0 font-extrabold text-[10px]">3</span>
                  <div>
                    <h4 className="font-extrabold text-white text-sm mb-1">Copy and Save Below</h4>
                    <p className="text-slate-400 leading-relaxed">
                      Copy the generated string (which starts with `AIzaSy...` or `AQ....`). Click "Add New Key" below, paste it, and save.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accentBlue text-white flex items-center justify-center shrink-0 font-extrabold text-[10px]">4</span>
                  <div>
                    <h4 className="font-extrabold text-white text-sm mb-1">Multiple Keys Fallback</h4>
                    <p className="text-slate-400 leading-relaxed">
                      Add up to 5 keys if you hit request limits. The client rotates to backup keys automatically on 429 errors.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* New Key Quota Setup Alert Box */}
            <div className="bg-amber-500/10 border border-amber-500/25 text-amber-400 p-4 rounded-xl flex items-start gap-3 select-none text-xs leading-relaxed font-semibold border-t">
              <span className="text-lg">⚠️</span>
              <div>
                <h4 className="font-extrabold text-amber-300 mb-0.5 uppercase tracking-wide">Important: New "AQ." Keys Rate Limits</h4>
                <p className="font-medium text-slate-300">
                  Google's newer security keys starting with the <strong className="text-white">AQ.</strong> prefix default to a limit of <strong className="text-white">0 requests</strong> per day for brand new accounts. To activate the key, you must click <strong className="text-white">"Set up billing"</strong> next to your key in AI Studio. 
                </p>
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium italic">
                  * Note: Using your key remains 100% free under Google's standard free-tier limits, but linking billing validates the project to unlock the 0-quota limit.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* API Manager Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg font-black uppercase text-white tracking-widest flex items-center gap-2">
              <Key className="w-5 h-5 text-accentBlue" />
              API Key Manager
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-accentBlue hover:bg-accentBlue/90 text-white font-bold uppercase tracking-wider text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-accentBlue/10"
            >
              <Plus className="w-4 h-4" />
              Add New API Key
            </button>
          </div>

          <div className="bg-darkCard border border-darkBorder rounded-2xl overflow-hidden">
            {providerKeys.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <AlertTriangle className="w-12 h-12 mx-auto text-slate-700 animate-pulse" />
                <p className="text-slate-400 font-bold text-sm">No personal API keys found.</p>
                <p className="text-slate-500 text-xs max-w-sm mx-auto">
                  NQTCoder is currently falling back to Shared AI mode (limited to 10 evaluations per day). Connect your key for unlimited runs.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-darkBg border-b border-darkBorder text-slate-400 font-bold uppercase tracking-wider select-none">
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Masked Key</th>
                      <th className="py-4 px-6">Model Scope</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-darkBorder/50 font-medium">
                    {providerKeys.map((keyObj) => (
                      <tr 
                        key={keyObj.id} 
                        className={`hover:bg-slate-800/10 transition-colors ${
                          !keyObj.isActive ? 'opacity-50' : ''
                        }`}
                      >
                        {/* Name & Priority Indicator */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white">{keyObj.name}</span>
                            {keyObj.isPrimary ? (
                              <span className="bg-accentBlue/10 text-accentBlue border border-accentBlue/25 px-2 py-0.5 rounded text-[8px] uppercase font-black tracking-wider select-none">
                                Primary
                              </span>
                            ) : (
                              <span className="bg-slate-800 text-slate-500 border border-slate-700/40 px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider select-none">
                                Backup
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Masked API string */}
                        <td className="py-4 px-6 font-mono text-slate-400">
                          {aiClient.maskKey(keyObj.value)}
                        </td>

                        {/* Configured model scope */}
                        <td className="py-4 px-6">
                          <span className="bg-darkBg border border-darkBorder px-2.5 py-1 rounded-md text-[10px] text-slate-400 font-semibold select-none">
                            {keyObj.model || 'gemini-2.5-flash'}
                          </span>
                        </td>

                        {/* Active toggle */}
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleToggleActive(keyObj.id)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-black border transition-all cursor-pointer select-none ${
                              keyObj.isActive 
                                ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/20' 
                                : 'bg-rose-500/10 border-rose-500/35 text-rose-400 hover:bg-rose-500/20'
                            }`}
                          >
                            {keyObj.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* Actions group */}
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-3 select-none">
                            {!keyObj.isPrimary && keyObj.isActive && (
                              <button
                                onClick={() => handleMakePrimary(keyObj.id)}
                                className="hover:text-accentBlue text-slate-400 font-bold transition-colors cursor-pointer"
                                title="Make Primary"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleRenameKey(keyObj.id, keyObj.name)}
                              className="hover:text-violet-400 text-slate-400 font-bold transition-colors cursor-pointer"
                              title="Rename"
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteKey(keyObj.id, keyObj.name)}
                              className="hover:text-rose-400 text-slate-400 font-bold transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Privacy Lock Banner */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 select-none">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6 shrink-0" />
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Device Privacy Protection</h4>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
              NQTCoder stores credentials strictly in local storage. They are sent directly to the LLM evaluation gateway only during assessment requests and are immediately stripped.
            </p>
          </div>
        </div>
      </div>

      {/* Add Key Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-darkBg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-darkCard border border-darkBorder rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            {/* Close trigger */}
            <button
              onClick={() => {
                setShowAddModal(false);
                setSaveError('');
                setTestResult(null);
                setKeyName('');
                setKeyValue('');
              }}
              className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 text-accentBlue select-none">
              <Sparkles className="w-6 h-6" />
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Connect Provider Key</h3>
            </div>

            <form onSubmit={handleSaveKey} className="space-y-4 text-xs font-semibold">
              {/* Provider Selection */}
              <div className="space-y-1.5">
                <label className="text-slate-400 uppercase tracking-wider font-bold">AI Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl p-3 text-slate-200 focus:border-accentBlue focus:outline-none"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openai" disabled>OpenAI (Coming Soon)</option>
                  <option value="claude" disabled>Anthropic Claude (Coming Soon)</option>
                </select>
              </div>

              {/* API Name */}
              <div className="space-y-1.5">
                <label className="text-slate-400 uppercase tracking-wider font-bold">Key Friendly Name</label>
                <input
                  type="text"
                  placeholder="e.g. My Personal Key"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl p-3 text-slate-200 focus:border-accentBlue focus:outline-none"
                  required
                />
              </div>

              {/* Model Choice */}
              <div className="space-y-1.5">
                <label className="text-slate-400 uppercase tracking-wider font-bold">AI Model Selection</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl p-3 text-slate-200 focus:border-accentBlue focus:outline-none"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash (Fast & Recommended)</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro (High Quality)</option>
                  <option value="gemini-1.5-flash">gemini-1.5-flash (Fallback)</option>
                </select>
              </div>

              {/* API Key */}
              <div className="space-y-1.5 relative">
                <label className="text-slate-400 uppercase tracking-wider font-bold">API Key Value</label>
                <div className="relative">
                  <input
                    type={showKeyText ? 'text' : 'password'}
                    placeholder="AIzaSy..."
                    value={keyValue}
                    onChange={(e) => setKeyValue(e.target.value)}
                    className="w-full bg-darkBg border border-darkBorder rounded-xl p-3 pr-10 text-slate-200 focus:border-accentBlue focus:outline-none font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyText(!showKeyText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {showKeyText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Validation / Connection Output block */}
              {testResult && (
                <div className={`p-3 rounded-xl border flex items-start gap-2 select-none ${
                  testResult.success 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}>
                  {testResult.success ? <Check className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                  <span className="text-[10px] leading-relaxed">{testResult.message}</span>
                </div>
              )}

              {saveError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl flex items-start gap-2 select-none">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="text-[10px] leading-relaxed">{saveError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 select-none">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="flex-1 border border-darkBorder hover:bg-slate-800 text-slate-300 font-bold uppercase tracking-wider rounded-xl py-2.5 transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
                  Test Connection
                </button>
                <button
                  type="submit"
                  disabled={testing}
                  className="flex-1 bg-accentBlue hover:bg-accentBlue/90 text-white font-bold uppercase tracking-wider rounded-xl py-2.5 transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-lg shadow-accentBlue/10"
                >
                  {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Validate & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISettings;
