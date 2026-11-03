import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  AlertTriangle, 
  FileCheck2, 
  Truck, 
  ArrowRight, 
  Layers,
  Share2,
  Inbox,
  Plus,
  FlaskConical,
  Building2
} from 'lucide-react';
import { DispatchItem, DocumentCategory, TransitDirection } from '../types';

interface DispatchListProps {
  dispatches: DispatchItem[];
  onViewPoD: (dispatch: DispatchItem) => void;
  onPrintSlip: (dispatch: DispatchItem) => void;
  onOpenLabCheckIn: (dispatch: DispatchItem) => void;
  onOpenNewDispatch: () => void;
  onOpenLabDispatch?: () => void;
  selectedStatusFilter?: string;
}

export const DispatchList: React.FC<DispatchListProps> = ({
  dispatches,
  onViewPoD,
  onPrintSlip,
  onOpenLabCheckIn,
  onOpenNewDispatch,
  onOpenLabDispatch,
  selectedStatusFilter: initialStatusFilter = 'all'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'to_lab' | 'from_lab'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [facilityFilter, setFacilityFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique facilities for dropdown (origin, destination, or pertaining CHC)
  const facilities = useMemo(() => {
    const facSet = new Set<string>();
    dispatches.forEach(d => {
      if (d.originFacility) facSet.add(d.originFacility);
      if (d.destinationLab) facSet.add(d.destinationLab);
      if (d.items) {
        d.items.forEach(it => {
          if (it.pertainingFacility) facSet.add(it.pertainingFacility);
        });
      }
    });
    return ['all', ...Array.from(facSet)];
  }, [dispatches]);

  const filteredDispatches = useMemo(() => {
    return dispatches.filter(d => {
      // Direction filter
      if (directionFilter === 'to_lab' && d.transitDirection === 'lab_to_hospital') return false;
      if (directionFilter === 'from_lab' && d.transitDirection !== 'lab_to_hospital') return false;

      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        d.trackingNumber.toLowerCase().includes(q) ||
        d.referenceNo.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.originFacility.toLowerCase().includes(q) ||
        d.destinationLab.toLowerCase().includes(q) ||
        d.courierPersonName.toLowerCase().includes(q) ||
        d.courierDocketOrVehicle.toLowerCase().includes(q) ||
        (d.items && d.items.some(it => 
          it.title.toLowerCase().includes(q) || 
          it.referenceNo.toLowerCase().includes(q) ||
          (it.pertainingFacility && it.pertainingFacility.toLowerCase().includes(q))
        ));

      // Category filter
      let matchesCategory = true;
      if (categoryFilter !== 'all') {
        if (d.categories && d.categories.length > 0) {
          matchesCategory = d.categories.includes(categoryFilter as DocumentCategory);
        } else {
          matchesCategory = d.documentCategory === categoryFilter;
        }
      }

      // Facility filter (consignment origin/destination OR enclosed item's pertaining facility)
      const matchesFacility = facilityFilter === 'all' || 
        d.originFacility === facilityFilter || 
        d.destinationLab === facilityFilter ||
        (d.items && d.items.some(it => it.pertainingFacility === facilityFilter));

      // Status filter
      let matchesStatus = true;
      if (statusFilter === 'in_transit') {
        matchesStatus = d.status === 'in_transit';
      } else if (statusFilter === 'delayed') {
        const hours = (Date.now() - new Date(d.dispatchedAt).getTime()) / (1000 * 3600);
        matchesStatus = d.status === 'delayed' || (d.status !== 'delivered' && hours >= 24);
      } else if (statusFilter === 'delivered') {
        matchesStatus = d.status === 'delivered';
      } else if (statusFilter === 'discrepancy') {
        matchesStatus = d.status === 'discrepancy';
      }

      return matchesSearch && matchesCategory && matchesFacility && matchesStatus;
    });
  }, [dispatches, directionFilter, searchQuery, categoryFilter, facilityFilter, statusFilter]);

  const handleCopyLink = (trackingNumber: string) => {
    const link = `${window.location.origin}${window.location.pathname}?track=${trackingNumber}&mode=receive`;
    navigator.clipboard.writeText(link);
    setCopiedId(trackingNumber);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const formatCategoryBadge = (cat: DocumentCategory) => {
    switch (cat) {
      case 'invoice': return 'Invoice';
      case 'kpi_report': return 'KPI Report';
      case 'patient_sample': return 'Sample';
      case 'bill': return 'Bill';
      case 'test_report': return 'Test Report';
      case 'qc_feedback': return 'QC Note';
      case 'reimbursement_voucher': return 'Audited Bill';
      case 'official_memo': return 'Memo';
      default: return cat;
    }
  };

  const getElapsedHours = (isoDate: string) => {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    return Math.floor(diffMs / (1000 * 3600));
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3">
        {/* Search & Facility Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracking #, test report, hospital, courier..."
              className="w-full pl-9 pr-3 py-2.5 text-sm sm:text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors min-h-[44px] sm:min-h-0"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 min-h-[44px] px-1 flex items-center"
              >
                Clear
              </button>
            )}
          </div>

          {/* Facility Filter */}
          {facilities.length > 2 && (
            <div className="flex items-center gap-2">
              <select
                value={facilityFilter}
                onChange={(e) => setFacilityFilter(e.target.value)}
                className="w-full sm:w-auto text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[44px] sm:min-h-0"
              >
                <option value="all">All Facilities ({dispatches.length})</option>
                {facilities.filter(f => f !== 'all').map(fac => (
                  <option key={fac} value={fac}>{fac}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Direction Segmented Control */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 touch-pan-x text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">
            Flow:
          </span>
          <button
            onClick={() => setDirectionFilter('all')}
            className={`min-h-[38px] px-3 rounded-lg font-medium whitespace-nowrap transition-colors touch-manipulation ${
              directionFilter === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Movements
          </button>
          <button
            onClick={() => setDirectionFilter('to_lab')}
            className={`min-h-[38px] px-3 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 touch-manipulation ${
              directionFilter === 'to_lab'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>To Guwahati Lab</span>
          </button>
          <button
            onClick={() => setDirectionFilter('from_lab')}
            className={`min-h-[38px] px-3 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 touch-manipulation ${
              directionFilter === 'from_lab'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>From Guwahati Lab (Return Reports)</span>
          </button>
        </div>

        {/* Filter Segmented Controls with Touch Scrolling */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1 touch-pan-x text-xs">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`min-h-[36px] px-2.5 rounded-lg font-medium whitespace-nowrap transition-colors touch-manipulation ${
                categoryFilter === 'all' 
                  ? 'bg-slate-800 text-white font-semibold' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setCategoryFilter('invoice')}
              className={`min-h-[36px] px-2.5 rounded-lg font-medium whitespace-nowrap transition-colors touch-manipulation ${
                categoryFilter === 'invoice' 
                  ? 'bg-blue-600 text-white font-semibold' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Invoices
            </button>
            <button
              onClick={() => setCategoryFilter('kpi_report')}
              className={`min-h-[36px] px-2.5 rounded-lg font-medium whitespace-nowrap transition-colors touch-manipulation ${
                categoryFilter === 'kpi_report' 
                  ? 'bg-blue-600 text-white font-semibold' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              KPIs
            </button>
            <button
              onClick={() => setCategoryFilter('patient_sample')}
              className={`min-h-[36px] px-2.5 rounded-lg font-medium whitespace-nowrap transition-colors touch-manipulation ${
                categoryFilter === 'patient_sample' 
                  ? 'bg-blue-600 text-white font-semibold' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Samples
            </button>
            <button
              onClick={() => setCategoryFilter('test_report')}
              className={`min-h-[36px] px-2.5 rounded-lg font-medium whitespace-nowrap transition-colors touch-manipulation ${
                categoryFilter === 'test_report' 
                  ? 'bg-indigo-600 text-white font-semibold' 
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              Test Reports
            </button>
            <button
              onClick={() => setCategoryFilter('reimbursement_voucher')}
              className={`min-h-[36px] px-2.5 rounded-lg font-medium whitespace-nowrap transition-colors touch-manipulation ${
                categoryFilter === 'reimbursement_voucher' 
                  ? 'bg-emerald-600 text-white font-semibold' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Audited Bills
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`min-h-[36px] px-2.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({dispatches.length})
            </button>
            <button
              onClick={() => setStatusFilter('in_transit')}
              className={`min-h-[36px] px-2.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                statusFilter === 'in_transit' ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              In Transit
            </button>
            <button
              onClick={() => setStatusFilter('delayed')}
              className={`min-h-[36px] px-2.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                statusFilter === 'delayed' ? 'bg-amber-600 text-white' : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              Overdue
            </button>
            <button
              onClick={() => setStatusFilter('delivered')}
              className={`min-h-[36px] px-2.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                statusFilter === 'delivered' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Delivered
            </button>
          </div>
        </div>
      </div>

      {/* DISPATCHES CONTAINER */}
      {filteredDispatches.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3.5">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold font-display text-slate-900">
            {dispatches.length === 0 ? 'No Consignments Recorded Yet' : 'No Matching Dispatches Found'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            {dispatches.length === 0 
              ? 'Start tracking invoices, KPI dossiers, patient samples, or central lab test reports with undeniable digital proof of delivery.'
              : 'Try clearing your search terms or filters to view your recorded dispatches.'}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={onOpenNewDispatch}
              className="min-h-[48px] px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-xl inline-flex items-center gap-2 shadow-sm transition-transform active:scale-[0.98] touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              <span>Record Hospital Dispatch</span>
            </button>

            {onOpenLabDispatch && (
              <button
                onClick={onOpenLabDispatch}
                className="min-h-[48px] px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium rounded-xl inline-flex items-center gap-2 shadow-sm transition-transform active:scale-[0.98] touch-manipulation"
              >
                <FlaskConical className="w-4 h-4" />
                <span>Open Lab Dispatch Window</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* MOBILE VIEW (CARD FEED): Touch-optimized for smartphones (< 768px) */}
          <div className="block md:hidden space-y-3">
            {filteredDispatches.map((item) => {
              const elapsedHours = getElapsedHours(item.dispatchedAt);
              const isOverdue = item.status !== 'delivered' && elapsedHours >= 24;
              const hasMulti = item.items && item.items.length > 1;
              const isLabReturn = item.transitDirection === 'lab_to_hospital';

              return (
                <div 
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3.5"
                >
                  {/* Card Header: Tracking Number & Direction Badge */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-slate-900">
                          {item.trackingNumber}
                        </span>
                        <button
                          onClick={() => handleCopyLink(item.trackingNumber)}
                          className="min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-400 hover:text-blue-600 active:bg-blue-50 rounded-lg touch-manipulation -my-2"
                          title="Copy Direct Receipt Link"
                        >
                          {copiedId === item.trackingNumber ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Direction Tag */}
                      <div className="flex items-center gap-1.5 mt-1">
                        {isLabReturn ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            <FlaskConical className="w-3 h-3" />
                            <span>Central Lab → Hospital</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                            <Building2 className="w-3 h-3" />
                            <span>Hospital → Central Lab</span>
                          </span>
                        )}

                        {(item.categories && item.categories.length > 0 ? item.categories : [item.documentCategory]).map((cat) => (
                          <span key={cat} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                            {formatCategoryBadge(cat)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Status Stamp */}
                    <div>
                      {item.status === 'delivered' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Delivered</span>
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Overdue ({elapsedHours}h)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5" />
                          <span>In Transit ({elapsedHours}h)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Route: Origin -> Destination */}
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isLabReturn ? 'bg-indigo-600' : 'bg-blue-600'}`} />
                      <span className="truncate">{item.originFacility}</span>
                    </div>
                    <div className="text-slate-500 flex items-center gap-1.5 pl-3.5">
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{item.destinationLab}</span>
                    </div>
                  </div>

                  {/* Consignment Title & Itemized Summary */}
                  <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-100">
                    <div className="font-medium text-slate-900">{item.title}</div>

                    {/* Itemized Batches with Pertaining CHC / Facility */}
                    {item.items && item.items.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {item.items.map((it) => (
                          <span 
                            key={it.id} 
                            className="inline-flex items-center gap-1 text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700 shadow-2xs"
                          >
                            {it.pertainingFacility && (
                              <span className="font-bold text-blue-700">[{it.pertainingFacility}]</span>
                            )}
                            <span className="capitalize text-slate-500 font-semibold">{it.category.replace('_', ' ')}:</span>
                            <span className="font-mono">{it.referenceNo}</span>
                            <span className="text-slate-400">({it.itemsCount} {it.itemUnit})</span>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="font-mono font-bold text-slate-800 tabular-nums">
                        {item.totalItemsCount || item.itemsCount} {item.items && item.items.length > 1 ? 'items total' : item.itemUnit}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono text-slate-500 truncate max-w-[200px]">
                        Ref: {item.referenceNo}
                      </span>
                    </div>
                  </div>

                  {/* Carrier & Sender Info */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.courierPersonName} ({item.courierDocketOrVehicle})</span>
                    </div>
                    <div className="shrink-0 text-slate-400">
                      {new Date(item.dispatchedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </div>
                  </div>

                  {/* Touch-Friendly Action Buttons (Min height 44px) */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                    {item.status === 'delivered' || item.status === 'discrepancy' ? (
                      <button
                        onClick={() => onViewPoD(item)}
                        className="col-span-1 min-h-[44px] px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs touch-manipulation"
                      >
                        <FileCheck2 className="w-4 h-4" />
                        <span>View PoD</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenLabCheckIn(item)}
                        className={`col-span-1 min-h-[44px] px-3 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs touch-manipulation ${
                          isLabReturn
                            ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
                            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isLabReturn ? 'Hospital Sign-Off' : 'Lab Sign-Off'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => onPrintSlip(item)}
                      className="col-span-1 min-h-[44px] px-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 touch-manipulation"
                    >
                      <Printer className="w-4 h-4 text-slate-600" />
                      <span>Print Slip</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP VIEW (HIGH-DENSITY TABLE) */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Tracking &amp; Direction</th>
                    <th className="py-3 px-4">Origin &amp; Destination</th>
                    <th className="py-3 px-4">Documents / Categories</th>
                    <th className="py-3 px-4">Transit Carrier</th>
                    <th className="py-3 px-4">Status &amp; SLA</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredDispatches.map((item) => {
                    const elapsedHours = getElapsedHours(item.dispatchedAt);
                    const isOverdue = item.status !== 'delivered' && elapsedHours >= 24;
                    const hasMulti = item.items && item.items.length > 1;
                    const isLabReturn = item.transitDirection === 'lab_to_hospital';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* 1. Tracking */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                            <span>{item.trackingNumber}</span>
                            <button
                              onClick={() => handleCopyLink(item.trackingNumber)}
                              title="Copy Direct Receipt Link"
                              className="text-slate-400 hover:text-blue-600 transition-colors p-0.5 rounded"
                            >
                              {copiedId === item.trackingNumber ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <div className="mt-1 flex items-center gap-1.5">
                            {isLabReturn ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                                <FlaskConical className="w-3 h-3" />
                                <span>Lab → Hospital</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                                <Building2 className="w-3 h-3" />
                                <span>Hospital → Lab</span>
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-600">
                            {(item.categories && item.categories.length > 0 ? item.categories : [item.documentCategory]).map(formatCategoryBadge).join(' · ')}
                          </div>
                        </td>

                        {/* 2. Facility Routing */}
                        <td className="py-3.5 px-4 align-top max-w-xs">
                          <div className="font-medium text-slate-900 truncate" title={item.originFacility}>
                            {item.originFacility}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1 truncate" title={item.destinationLab}>
                            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{item.destinationLab}</span>
                          </div>
                          <div className="mt-0.5 text-[10px] text-slate-400 truncate">
                            {isLabReturn ? `Attn: District In-Charge` : `By: ${item.senderName}`}
                          </div>
                        </td>

                        {/* 3. Document Details */}
                        <td className="py-3.5 px-4 align-top max-w-sm">
                          <div className="font-medium text-slate-800 line-clamp-1" title={item.title}>
                            {item.title}
                          </div>
                          {item.items && item.items.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.items.slice(0, 3).map((it) => (
                                <span key={it.id} className="inline-flex items-center gap-1 text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded text-slate-700">
                                  {it.pertainingFacility && (
                                    <span className="font-semibold text-blue-700">{it.pertainingFacility.replace('Community Health Centre (CHC) ', 'CHC ')}:</span>
                                  )}
                                  <span>{it.itemsCount} {it.itemUnit}</span>
                                </span>
                              ))}
                              {item.items.length > 3 && (
                                <span className="text-[10px] text-slate-500">+{item.items.length - 3} more</span>
                              )}
                            </div>
                          )}
                          <div className="mt-1 text-[11px] text-slate-500 flex flex-wrap items-center gap-1">
                            <span className="tabular-nums font-semibold text-slate-800 font-mono">
                              {item.totalItemsCount || item.itemsCount} {item.items && item.items.length > 1 ? 'items total' : item.itemUnit}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono text-slate-500 truncate max-w-[150px]">
                              Ref: {item.referenceNo}
                            </span>
                          </div>
                        </td>

                        {/* 4. Courier */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-medium text-slate-800">
                            {item.courierPersonName}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                            <span>{item.courierDocketOrVehicle}</span>
                          </div>
                        </td>

                        {/* 5. Status */}
                        <td className="py-3.5 px-4 align-top">
                          {item.status === 'delivered' ? (
                            <div>
                              <div className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Delivered</span>
                              </div>
                              <div className="text-[10px] text-slate-400 tabular-nums mt-0.5">
                                {new Date(item.acknowledgedAt!).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className={`inline-flex items-center gap-1 font-medium ${isOverdue ? 'text-amber-700' : 'text-blue-700'}`}>
                                <Clock className="w-3.5 h-3.5" />
                                <span>{isOverdue ? 'Overdue In Transit' : 'In Transit'}</span>
                              </div>
                              <div className="mt-0.5 text-[11px] text-slate-500 tabular-nums">
                                {elapsedHours}h elapsed
                              </div>
                            </div>
                          )}
                        </td>

                        {/* 6. Actions */}
                        <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status === 'delivered' || item.status === 'discrepancy' ? (
                              <button
                                onClick={() => onViewPoD(item)}
                                className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors flex items-center gap-1"
                              >
                                <FileCheck2 className="w-3.5 h-3.5" />
                                <span>View PoD</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onOpenLabCheckIn(item)}
                                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                                  isLabReturn 
                                    ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100' 
                                    : 'text-blue-700 bg-blue-50 hover:bg-blue-100'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{isLabReturn ? 'Hospital Sign-Off' : 'Lab Sign-Off'}</span>
                              </button>
                            )}

                            <button
                              onClick={() => onPrintSlip(item)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                              title="Print Slip"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
