import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Database, 
  Plus, 
  Building2, 
  ShieldCheck, 
  AlertTriangle,
  Users,
  FlaskConical
} from 'lucide-react';
import { OrganizationSettings } from '../types';

interface NavbarProps {
  activeTab: 'dispatches' | 'aging' | 'lab_receipt' | 'settings';
  setActiveTab: (tab: 'dispatches' | 'aging' | 'lab_receipt' | 'settings') => void;
  onOpenNewDispatch: () => void;
  onOpenLabDispatch?: () => void;
  onOpenAdminDirectory: () => void;
  overdueCount: number;
  inTransitCount: number;
  isSupabaseConnected: boolean;
  orgSettings: OrganizationSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewDispatch,
  onOpenLabDispatch,
  onOpenAdminDirectory,
  overdueCount,
  inTransitCount,
  isSupabaseConnected,
  orgSettings,
}) => {
  return (
    <>
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        {/* Desktop-only Organization Context Ribbon */}
        <div className="hidden sm:flex bg-slate-900 text-slate-300 text-xs px-4 sm:px-6 py-1.5 items-center justify-between gap-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="font-semibold text-slate-100">{orgSettings.networkName}</span>
            <span className="text-slate-500">·</span>
            <span>In-charge: {orgSettings.inchargeName}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">{orgSettings.district}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <button
              onClick={onOpenAdminDirectory}
              className="text-xs text-blue-300 hover:text-white flex items-center gap-1 font-medium transition-colors"
            >
              <Users className="w-3 h-3 text-blue-400" />
              <span>Cluster CHCs &amp; Directory</span>
            </button>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5">
              <span className={`inline-block w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              <span>{isSupabaseConnected ? 'Supabase' : 'Offline Mode'}</span>
            </span>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold font-display shadow-xs">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="font-display font-bold text-base sm:text-lg text-slate-900 leading-tight">
                HealthDispatch<span className="text-blue-600">Proof</span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 truncate max-w-[170px] sm:max-w-none">
                {orgSettings.networkName}
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setActiveTab('dispatches')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'dispatches'
                  ? 'bg-slate-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Dispatches</span>
              {inTransitCount > 0 && (
                <span className="ml-1 text-xs font-mono font-semibold px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded">
                  {inTransitCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('aging')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'aging'
                  ? 'bg-slate-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Transit Aging</span>
              {overdueCount > 0 && (
                <span className="ml-1 text-xs font-mono font-semibold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded flex items-center gap-0.5">
                  <AlertTriangle className="w-3 h-3 inline" />
                  {overdueCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('lab_receipt')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'lab_receipt'
                  ? 'bg-slate-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-slate-500" />
              <span>Guwahati Check-In</span>
            </button>

            <button
              onClick={onOpenAdminDirectory}
              className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>Admin Directory</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'bg-slate-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Database className="w-4 h-4 text-slate-500" />
              <span>Cloud Setup</span>
            </button>
          </nav>

          {/* Action Buttons (Touch Target >= 44px on mobile) */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenLabDispatch && (
              <button
                onClick={onOpenLabDispatch}
                className="hidden sm:inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200 transition-colors whitespace-nowrap touch-manipulation"
                title="Dispatch reports and QC from Central Lab to Hospital/CHC"
              >
                <FlaskConical className="w-4 h-4 text-indigo-600" />
                <span>Lab Dispatch</span>
              </button>
            )}

            <button
              onClick={onOpenNewDispatch}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 min-h-[44px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors whitespace-nowrap touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              <span>Record Dispatch</span>
            </button>
          </div>
        </div>
      </header>

      {/* FIXED MOBILE BOTTOM TAB BAR (Pattern 1: Thumb-Zone Navigation Anchor) */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.35rem)' }}
      >
        <div className="grid grid-cols-4 items-center h-14">
          {/* Tab 1: Ledger */}
          <button
            onClick={() => setActiveTab('dispatches')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative touch-manipulation ${
              activeTab === 'dispatches' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <FileText className="w-5 h-5" />
              {inTransitCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {inTransitCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1">Ledger</span>
          </button>

          {/* Tab 2: Transit Aging */}
          <button
            onClick={() => setActiveTab('aging')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative touch-manipulation ${
              activeTab === 'aging' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Clock className="w-5 h-5" />
              {overdueCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {overdueCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1">Aging</span>
          </button>

          {/* Tab 3: Guwahati Sign-Off */}
          <button
            onClick={() => setActiveTab('lab_receipt')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors touch-manipulation ${
              activeTab === 'lab_receipt' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Lab Sign-Off</span>
          </button>

          {/* Tab 4: Admin Directory */}
          <button
            onClick={onOpenAdminDirectory}
            className="min-h-[44px] flex flex-col items-center justify-center text-slate-500 hover:text-slate-800 transition-colors touch-manipulation"
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Admin</span>
          </button>
        </div>
      </nav>
    </>
  );
};
