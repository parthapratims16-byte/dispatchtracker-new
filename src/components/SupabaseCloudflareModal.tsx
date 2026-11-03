import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Cloud, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Terminal,
  ShieldCheck,
  FileCode
} from 'lucide-react';
import { 
  getStoredSupabaseConfig, 
  saveStoredSupabaseConfig, 
  testSupabaseConnection, 
  SUPABASE_SQL_SCHEMA 
} from '../lib/supabase';
import { 
  CLOUDFLARE_REDIRECTS, 
  WRANGLER_TOML, 
  CLOUDFLARE_DEPLOYMENT_STEPS 
} from '../lib/cloudflareGuide';

interface SupabaseCloudflareModalProps {
  onClose: () => void;
  onConnectionChange: (connected: boolean) => void;
}

export const SupabaseCloudflareModal: React.FC<SupabaseCloudflareModalProps> = ({ 
  onClose,
  onConnectionChange
}) => {
  const [activeTab, setActiveTab] = useState<'supabase' | 'cloudflare' | 'schema'>('supabase');
  const [config, setConfig] = useState(getStoredSupabaseConfig());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testSupabaseConnection(config.supabaseUrl, config.supabaseAnonKey);
    setIsTesting(false);
    setTestResult(result);

    const updatedConfig = {
      ...config,
      isConnected: result.success,
      lastTestedAt: new Date().toISOString(),
      errorMessage: result.success ? undefined : result.message
    };
    setConfig(updatedConfig);
    saveStoredSupabaseConfig(updatedConfig);
    onConnectionChange(result.success);
  };

  const handleSaveConfig = () => {
    saveStoredSupabaseConfig(config);
    setTestResult({ success: true, message: 'Supabase configuration saved to browser cache.' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh] sm:max-h-[85vh] animate-in slide-in-from-bottom duration-200">
        {/* Mobile Drag Handle */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold shrink-0">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm sm:text-base leading-tight">
                Database (Supabase) &amp; Cloudflare
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-1">
                PostgreSQL schema, live testing &amp; Cloudflare Pages guide
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('supabase')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'supabase'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Connection</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>PostgreSQL Schema (SQL)</span>
          </button>

          <button
            onClick={() => setActiveTab('cloudflare')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'cloudflare'
                ? 'border-orange-500 text-orange-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloudflare Pages Deploy</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 text-xs text-slate-800 max-h-[75vh] overflow-y-auto space-y-5">
          {/* TAB 1: SUPABASE CONFIG */}
          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-1">
                <div className="font-semibold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Direct Supabase Connection</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Enter your Supabase Project URL and Anon (Public) Key below. All consignment dispatches and delivery acknowledgements will persist directly to your Supabase PostgreSQL instance. If left blank, the portal continues to work locally in offline demo mode.
                </p>
              </div>

              {testResult && (
                <div className={`p-3.5 rounded-lg border flex items-start gap-2.5 ${
                  testResult.success 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="text-xs leading-relaxed">{testResult.message}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={config.supabaseUrl}
                    onChange={(e) => setConfig({ ...config, supabaseUrl: e.target.value.trim() })}
                    placeholder="https://xyzabcdefghijklm.supabase.co"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Found in your Supabase Dashboard under <strong>Project Settings &gt; API</strong>.
                  </span>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Supabase Anon / Public API Key
                  </label>
                  <input
                    type="text"
                    value={config.supabaseAnonKey}
                    onChange={(e) => setConfig({ ...config, supabaseAnonKey: e.target.value.trim() })}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-[11px]"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Safe for browser client use; protected by Supabase Row-Level Security (RLS).
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting || !config.supabaseUrl || !config.supabaseAnonKey}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Testing Connection...' : 'Test Supabase Connection'}</span>
                  </button>

                  <button
                    onClick={handleSaveConfig}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                  >
                    Save Credentials
                  </button>

                  <button
                    onClick={() => setActiveTab('schema')}
                    className="px-3 py-2 text-blue-700 hover:underline font-medium text-xs ml-auto flex items-center gap-1"
                  >
                    <span>View SQL Migration Script</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POSTGRESQL SCHEMA */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">PostgreSQL Database Schema</h3>
                  <p className="text-[11px] text-slate-500">
                    Copy and run this in your Supabase Project &gt; SQL Editor.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(SUPABASE_SQL_SCHEMA, 'schema')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {copiedKey === 'schema' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy SQL Schema</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-96 border border-slate-800">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: CLOUDFLARE PAGES */}
          {activeTab === 'cloudflare' && (
            <div className="space-y-5">
              <div className="p-4 bg-orange-50/50 border border-orange-200 rounded-xl space-y-1">
                <div className="font-semibold text-orange-950 flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-orange-600" />
                  <span>Cloudflare Pages &amp; Edge CDN Deployment</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Cloudflare Pages hosts your frontend at edge data centers located in Kolkata, Mumbai, and Delhi, providing sub-50ms latency across Assam districts.
                </p>
              </div>

              {/* 5-Step Deployment Walkthrough */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 uppercase text-[11px] tracking-wide">
                  Step-by-Step Deployment Guide
                </h4>
                <div className="space-y-2">
                  {CLOUDFLARE_DEPLOYMENT_STEPS.map((step) => (
                    <div key={step.step} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                        {step.step}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{step.title}</div>
                        <div className="text-slate-600 text-[11px] mt-0.5">{step.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ready-to-use SPA Rewrite rule */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Cloudflare Pages SPA Rule (public/_redirects)</span>
                  <button
                    onClick={() => handleCopy(CLOUDFLARE_REDIRECTS, 'redirects')}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                  >
                    {copiedKey === 'redirects' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'redirects' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Already included in this project under <code className="bg-slate-200 px-1 rounded">public/_redirects</code> so routes like <code className="bg-slate-200 px-1 rounded">?track=...</code> resolve cleanly.
                </p>
                <pre className="bg-white p-2.5 rounded border border-slate-200 font-mono text-xs">
                  {CLOUDFLARE_REDIRECTS}
                </pre>
              </div>

              {/* Wrangler.toml */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Wrangler Configuration (wrangler.toml)</span>
                  <button
                    onClick={() => handleCopy(WRANGLER_TOML, 'wrangler')}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                  >
                    {copiedKey === 'wrangler' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'wrangler' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="bg-white p-2.5 rounded border border-slate-200 font-mono text-xs overflow-x-auto">
                  {WRANGLER_TOML}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Assam Health Services · Guwahati Lab Delivery Audit</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
