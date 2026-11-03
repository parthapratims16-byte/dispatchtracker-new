import React from 'react';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Layers
} from 'lucide-react';
import { DispatchItem } from '../types';
import { getOrgSettings } from '../lib/storage';

interface ProofOfDeliveryModalProps {
  dispatch: DispatchItem | null;
  onClose: () => void;
}

export const ProofOfDeliveryModal: React.FC<ProofOfDeliveryModalProps> = ({ dispatch, onClose }) => {
  if (!dispatch) return null;

  const ack = dispatch.acknowledgement;
  const orgSettings = getOrgSettings();

  const handlePrint = () => {
    window.print();
  };

  const bundledItems = dispatch.items && dispatch.items.length > 0 ? dispatch.items : [
    {
      id: 'default-sub',
      category: dispatch.documentCategory,
      title: dispatch.title,
      referenceNo: dispatch.referenceNo,
      itemsCount: dispatch.itemsCount,
      itemUnit: dispatch.itemUnit,
      description: dispatch.description
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh] sm:max-h-[85vh] animate-in slide-in-from-bottom duration-200">
        {/* Modal Top Actions (no-print) */}
        <div className="no-print bg-slate-900 text-white px-4 sm:px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="truncate">Proof of Delivery (PoD)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="min-h-[40px] px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors touch-manipulation"
            >
              <Printer className="w-4 h-4" />
              <span>Print PoD</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg touch-manipulation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body with scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-5 sm:space-y-6 text-slate-800">
          {/* Header */}
          <div className="text-center border-b border-slate-200 pb-5">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
              {orgSettings.networkName} · Central Custody Registry
            </div>
            <h1 className="text-xl font-bold font-display text-slate-900 mt-1">
              Certificate of Consignment Delivery &amp; Custody Handover
            </h1>
            <div className="text-xs text-slate-500 mt-1">
              Guwahati Central Diagnostic &amp; Healthcare Dispatch Verification Registry
            </div>
          </div>

          {/* Verification Badge & Hash */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                  Receipt Authenticated &amp; Locked
                </div>
                <div className="text-[11px] text-emerald-800">
                  {dispatch.transitDirection === 'lab_to_hospital'
                    ? `Acknowledged by Receiving Section at ${dispatch.destinationLab}`
                    : 'Acknowledged by Receiving Desk at Guwahati'}
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-[10px] text-slate-500 font-medium">Receipt Verification Hash:</div>
              <div className="text-xs font-mono font-bold text-slate-800 break-all">
                {ack?.receiptHash || 'SHA256:VERIFIED-IN-REGISTRY'}
              </div>
            </div>
          </div>

          {/* Consignment Metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div>
              <span className="text-slate-500 block">Tracking Number:</span>
              <span className="font-mono font-bold text-sm text-slate-900">{dispatch.trackingNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Total Items Bundled:</span>
              <span className="font-mono font-bold text-slate-900">
                {dispatch.totalItemsCount || dispatch.itemsCount} in {bundledItems.length} batches
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">
                {dispatch.transitDirection === 'lab_to_hospital' ? 'Dispatching Central Lab:' : 'Originating Hospital / CHC:'}
              </span>
              <span className="font-semibold text-slate-900">{dispatch.originFacility}</span>
              <span className="text-[11px] text-slate-500 block">Sender: {dispatch.senderName} ({dispatch.senderDesignation})</span>
            </div>
            <div>
              <span className="text-slate-500 block">
                {dispatch.transitDirection === 'lab_to_hospital' ? 'Destination Health Facility:' : 'Destination Central Facility:'}
              </span>
              <span className="font-semibold text-slate-900">{dispatch.destinationLab}</span>
              {dispatch.transitDirection === 'lab_to_hospital' && (
                <span className="text-[11px] text-slate-500 block">Attention: {orgSettings.inchargeName} (District In-Charge)</span>
              )}
            </div>
          </div>

          {/* Itemized Table of Covered Categories */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-50 px-3 py-2 font-semibold text-slate-700 flex items-center justify-between border-b border-slate-200">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Verified Bundled Documents Covered by this Receipt</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">{bundledItems.length} Batches</span>
            </div>
            <div className="divide-y divide-slate-100">
              {bundledItems.map((it, idx) => (
                <div key={it.id || idx} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/50">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900 flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        {it.category.replace('_', ' ')}
                      </span>
                      {it.pertainingFacility && (
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {it.pertainingFacility}
                        </span>
                      )}
                      <span>{it.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Ref / Invoice #: {it.referenceNo}
                      {it.description && <span className="text-slate-400"> · {it.description}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {it.itemsCount} {it.itemUnit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chain of Custody Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Chain-of-Custody Audit Trail
            </h3>
            <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 ml-2 text-xs">
              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white" />
                <div className="font-semibold text-slate-900">1. Dispatched from {dispatch.originFacility}</div>
                <div className="text-slate-500 text-[11px]">
                  Carrier: {dispatch.courierPersonName} ({dispatch.courierDocketOrVehicle}) on{' '}
                  {new Date(dispatch.dispatchedAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white" />
                <div className="font-semibold text-slate-900">2. Acknowledged &amp; Received at Guwahati</div>
                <div className="text-slate-500 text-[11px]">
                  Delivered to {ack?.receivedByName} ({ack?.receiverDesignation}) on{' '}
                  {ack?.verifiedTimestamp ? new Date(ack.verifiedTimestamp).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  }) : 'Verified'}
                </div>
              </div>
            </div>
          </div>

          {/* Condition & Signee Information Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <span className="font-semibold text-slate-700 uppercase text-[10px] tracking-wide block">
                Package Condition at Receipt
              </span>
              <div className="flex items-center gap-2">
                {ack?.packageCondition === 'intact_sealed' ? (
                  <span className="font-semibold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Intact &amp; Tamper-Seals Verified
                  </span>
                ) : (
                  <span className="font-semibold text-rose-800 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    {ack?.packageCondition?.replace('_', ' ').toUpperCase()}
                  </span>
                )}
              </div>
              {ack?.conditionRemarks && (
                <div className="text-slate-600 text-[11px] bg-slate-50 p-2 rounded border border-slate-100">
                  {ack.conditionRemarks}
                </div>
              )}
              <div className="text-[11px] text-slate-500 pt-1">
                Department: {ack?.receiverDepartment || 'Central Receiving Desk'}
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 text-xs space-y-2 text-center bg-slate-50/50">
              <span className="font-semibold text-slate-700 uppercase text-[10px] tracking-wide block text-left">
                Guwahati Receiving Officer Signature
              </span>
              <div className="h-16 flex items-center justify-center overflow-hidden border-b border-dashed border-slate-300 pb-1">
                {ack?.signatureDataUrl ? (
                  <img
                    src={ack.signatureDataUrl}
                    alt="Receiver Signature"
                    className="max-h-14 object-contain mx-auto"
                  />
                ) : (
                  <div className="text-slate-400 italic text-[11px]">Digitally verified &amp; logged</div>
                )}
              </div>
              <div className="font-semibold text-slate-900 text-xs">
                {ack?.receivedByName || 'Official Signee'}
              </div>
              <div className="text-[11px] text-slate-500">
                {ack?.receiverDesignation} {ack?.receiverPhone ? `· ${ack.receiverPhone}` : ''}
              </div>
            </div>
          </div>

          {/* Legal / Administrative Footnote */}
          <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-400 text-center leading-relaxed">
            This digital certificate serves as conclusive administrative evidence of consignment handover for {orgSettings.networkName}. Timestamp and identity parameters are permanently logged.
          </div>
        </div>
      </div>
    </div>
  );
};
