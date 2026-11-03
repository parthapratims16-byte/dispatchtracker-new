import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Phone, 
  Send, 
  CheckCircle2, 
  Building2, 
  ShieldAlert, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { DispatchItem } from '../types';

interface TransitAgingViewProps {
  dispatches: DispatchItem[];
  onOpenLabCheckIn: (dispatch: DispatchItem) => void;
  onViewPoD: (dispatch: DispatchItem) => void;
}

export const TransitAgingView: React.FC<TransitAgingViewProps> = ({
  dispatches,
  onOpenLabCheckIn,
  onViewPoD
}) => {
  const activeDispatches = dispatches.filter(d => d.status !== 'delivered');

  const getHours = (isoDate: string) => {
    return Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 3600));
  };

  const criticalOverdue = activeDispatches.filter(d => getHours(d.dispatchedAt) >= 48);
  const warningOverdue = activeDispatches.filter(d => {
    const h = getHours(d.dispatchedAt);
    return h >= 24 && h < 48;
  });
  const normalInTransit = activeDispatches.filter(d => getHours(d.dispatchedAt) < 24);

  const orgSettings = (import.meta as any).glob ? undefined : null; // lazy access or direct import
  const generateWhatsAppEscalation = (item: DispatchItem) => {
    const elapsed = getHours(item.dispatchedAt);
    const text = encodeURIComponent(
      `*URGENT TRANSIT & DELIVERY INQUIRY*\n` +
      `Consignment ID: ${item.trackingNumber}\n` +
      `From: ${item.originFacility}\n` +
      `Destination: ${item.destinationLab}\n` +
      `Contents: ${item.title} (Ref: ${item.referenceNo})\n` +
      `Carrier/Driver: ${item.courierPersonName} (${item.courierDocketOrVehicle})\n` +
      `Dispatched: ${new Date(item.dispatchedAt).toLocaleString('en-IN')}\n` +
      `Elapsed Transit Time: ${elapsed} hours.\n` +
      `Please confirm receipt with the central receiving counter immediately to prevent document/sample denial.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-amber-500/10 border border-amber-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">
              Guwahati Central Lab Transit Aging &amp; Denial Prevention Monitor
            </h2>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              When invoices, KPI reports, and patient samples are left unacknowledged in transit for more than 24 hours, receiving departments are more likely to misplace or deny receipt. This monitor highlights pending shipments so your hospital administration can follow up before billing deadlines.
            </p>
          </div>
        </div>
      </div>

      {/* Aging Stage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stage 1: Critical Overdue (> 48h) */}
        <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wide">High Risk: &gt; 48 Hours Unacknowledged</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-rose-100 text-rose-800 rounded">
              {criticalOverdue.length} Consignments
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Immediate phone escalation to Guwahati Lab In-charge required.
          </p>
        </div>

        {/* Stage 2: Warning (24h - 48h) */}
        <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Attention: 24h – 48h in Transit</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
              {warningOverdue.length} Consignments
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Should have arrived at receiving desk. Contact courier or driver.
          </p>
        </div>

        {/* Stage 3: Normal (< 24h) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Within Normal Window (&lt; 24h)</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
              {normalInTransit.length} Consignments
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            En route via scheduled hospital vehicle or courier dispatch.
          </p>
        </div>
      </div>

      {/* Actionable Overdue Items List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-slate-900">
              Active Pending Dispatches Awaiting Guwahati Sign-Off
            </h3>
            <p className="text-xs text-slate-500">
              Ranked by transit duration (longest pending first)
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {activeDispatches.length} pending consignments
          </span>
        </div>

        {activeDispatches.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">All dispatches have been acknowledged!</p>
            <p className="mt-1">No consignments are currently stuck in transit or overdue.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activeDispatches
              .sort((a, b) => new Date(a.dispatchedAt).getTime() - new Date(b.dispatchedAt).getTime())
              .map((item) => {
                const hours = getHours(item.dispatchedAt);
                const isCrit = hours >= 48;
                const isWarn = hours >= 24 && hours < 48;

                return (
                  <div key={item.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Metadata */}
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900">
                            {item.trackingNumber}
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs font-medium text-slate-700">
                            {item.title}
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs font-mono text-slate-500">
                            Ref: {item.referenceNo}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                          <span className="font-medium text-slate-800">{item.originFacility}</span>
                          <span className="text-slate-400">→</span>
                          <span>{item.destinationLab}</span>
                          <span className="text-slate-400">·</span>
                          <span>Courier: {item.courierPersonName} ({item.courierDocketOrVehicle})</span>
                          {item.courierPhone && (
                            <>
                              <span className="text-slate-400">·</span>
                              <span className="font-mono">{item.courierPhone}</span>
                            </>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500">
                          Dispatched on {new Date(item.dispatchedAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>

                      {/* Right: Aging Status & Escalation Actions */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {/* Transit Duration Indicator */}
                        <div className={`text-center sm:text-right px-3 py-1.5 rounded-xl border ${
                          isCrit 
                            ? 'bg-rose-50 border-rose-200 text-rose-800' 
                            : isWarn 
                            ? 'bg-amber-50 border-amber-200 text-amber-800' 
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}>
                          <div className="text-xs font-mono font-bold tabular-nums">
                            {hours} Hours Elapsed
                          </div>
                          <div className="text-[10px] font-medium">
                            {isCrit ? 'CRITICAL DELAY' : isWarn ? 'OVERDUE' : 'In Transit'}
                          </div>
                        </div>

                        {/* WhatsApp / SMS Escalation */}
                        <button
                          onClick={() => generateWhatsAppEscalation(item)}
                          className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center justify-center gap-2 touch-manipulation"
                          title="Generate WhatsApp Escalation Notice to Guwahati Lab"
                        >
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
                          <span>WhatsApp Notice</span>
                        </button>

                        {/* Direct Lab Sign-off Trigger */}
                        <button
                          onClick={() => onOpenLabCheckIn(item)}
                          className="min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors flex items-center justify-center gap-2 touch-manipulation"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Record Sign-Off</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Guwahati Directory for In-Charges */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="font-semibold text-sm text-slate-900 mb-2 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>Guwahati Central Lab &amp; Directorate Contact Points</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Direct telephone numbers for tracing disputed or delayed consignments:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-semibold text-slate-800">State Central Diagnostic Lab</div>
            <div className="text-slate-500 text-[11px] mt-0.5">Khanapara / Six Mile, Guwahati</div>
            <div className="mt-2 font-mono text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>0361-2361092 / Ext. 104</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Receiving Counter: 08:00 AM – 06:00 PM</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-semibold text-slate-800">GMCH Central Pathology Desk</div>
            <div className="text-slate-500 text-[11px] mt-0.5">Bhangagarh, Guwahati</div>
            <div className="mt-2 font-mono text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>0361-2529457</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Histopathology &amp; Biopsy Section</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-semibold text-slate-800">NHM State Directorate (Accounts)</div>
            <div className="text-slate-500 text-[11px] mt-0.5">Saikia Commercial Complex, Christian Basti</div>
            <div className="mt-2 font-mono text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>0361-2340236</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Finance, Audit &amp; KPI Desk</div>
          </div>
        </div>
      </div>
    </div>
  );
};
