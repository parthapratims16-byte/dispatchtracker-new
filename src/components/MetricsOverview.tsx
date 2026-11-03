import React from 'react';
import { Send, Clock, CheckCircle2, AlertOctagon } from 'lucide-react';
import { DispatchItem } from '../types';

interface MetricsOverviewProps {
  dispatches: DispatchItem[];
  onSelectFilter?: (status: string) => void;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ dispatches, onSelectFilter }) => {
  const inTransitCount = dispatches.filter(d => d.status === 'in_transit' || d.status === 'delayed').length;
  const overdueCount = dispatches.filter(d => {
    if (d.status === 'delivered') return false;
    const hours = (Date.now() - new Date(d.dispatchedAt).getTime()) / (1000 * 3600);
    return hours >= 24;
  }).length;
  const deliveredCount = dispatches.filter(d => d.status === 'delivered').length;
  const discrepancyCount = dispatches.filter(d => d.status === 'discrepancy').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* 1. Active In-Transit */}
      <div 
        onClick={() => onSelectFilter?.('in_transit')}
        className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 hover:border-blue-300 transition-colors cursor-pointer group shadow-2xs active:scale-[0.98] touch-manipulation"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">In Transit</span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tabular-nums">
            {inTransitCount}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400">active</span>
        </div>
        <div className="mt-1 text-[10px] sm:text-xs text-slate-500 truncate">
          En route to Guwahati
        </div>
      </div>

      {/* 2. Overdue & Transit Aging */}
      <div 
        onClick={() => onSelectFilter?.('delayed')}
        className={`bg-white border rounded-2xl p-3 sm:p-4 transition-colors cursor-pointer group shadow-2xs active:scale-[0.98] touch-manipulation ${
          overdueCount > 0 ? 'border-amber-300 bg-amber-50/20 hover:border-amber-400' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue (&gt;24h)</span>
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${overdueCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
          <span className={`text-2xl sm:text-3xl font-display font-bold tabular-nums ${overdueCount > 0 ? 'text-amber-800' : 'text-slate-900'}`}>
            {overdueCount}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400">pending</span>
        </div>
        <div className="mt-1 text-[10px] sm:text-xs text-amber-700 font-medium truncate">
          {overdueCount > 0 ? 'Follow-up needed' : 'All on schedule'}
        </div>
      </div>

      {/* 3. Confirmed Proof of Delivery */}
      <div 
        onClick={() => onSelectFilter?.('delivered')}
        className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 hover:border-emerald-300 transition-colors cursor-pointer group shadow-2xs active:scale-[0.98] touch-manipulation"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivered</span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tabular-nums">
            {deliveredCount}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400">signed</span>
        </div>
        <div className="mt-1 text-[10px] sm:text-xs text-slate-500 truncate">
          Proof of Delivery locked
        </div>
      </div>

      {/* 4. Condition Discrepancy / Issues */}
      <div 
        onClick={() => onSelectFilter?.('discrepancy')}
        className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 hover:border-rose-300 transition-colors cursor-pointer group shadow-2xs active:scale-[0.98] touch-manipulation"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Exceptions</span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertOctagon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tabular-nums">
            {discrepancyCount}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400">issues</span>
        </div>
        <div className="mt-1 text-[10px] sm:text-xs text-slate-500 truncate">
          Damage / seal remarks
        </div>
      </div>
    </div>
  );
};
