import React from 'react';
import { X, Printer, QrCode, Building2, Truck, AlertCircle, Layers } from 'lucide-react';
import { DispatchItem } from '../types';
import { getOrgSettings } from '../lib/storage';

interface DispatchSlipModalProps {
  dispatch: DispatchItem | null;
  onClose: () => void;
}

export const DispatchSlipModal: React.FC<DispatchSlipModalProps> = ({ dispatch, onClose }) => {
  if (!dispatch) return null;

  const orgSettings = getOrgSettings();

  const handlePrint = () => {
    window.print();
  };

  const receiptUrl = `${window.location.origin}${window.location.pathname}?track=${dispatch.trackingNumber}&mode=receive`;

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
        {/* Top Controls (no-print) */}
        <div className="no-print bg-slate-900 text-white px-4 sm:px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-medium">
            <QrCode className="w-4 h-4 text-blue-400" />
            <span className="truncate">Consignment Dispatch Voucher</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="min-h-[40px] px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors touch-manipulation"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg touch-manipulation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Slip Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4 sm:space-y-5 text-slate-900 bg-white">
          {/* Slip Header (Clean, professional, using custom cluster profile) */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <div className="text-[11px] font-bold tracking-widest uppercase text-slate-600">
              {dispatch.transitDirection === 'lab_to_hospital' 
                ? 'Central Referral Diagnostic Laboratory · Guwahati'
                : orgSettings.networkName}
            </div>
            <h2 className="text-lg font-bold font-display uppercase tracking-tight mt-0.5">
              {dispatch.transitDirection === 'lab_to_hospital'
                ? 'Central Lab Outward Consignment Voucher'
                : 'Official Consignment Dispatch Voucher'}
            </h2>
            <div className="text-xs text-slate-500">
              {dispatch.transitDirection === 'lab_to_hospital'
                ? 'Diagnostic Test Reports, QC Assessment & Audited Vouchers Delivery Slip to Health Facility'
                : 'Chain-of-Custody Delivery Slip for Central Laboratory & Directorate Reception, Guwahati'}
            </div>
          </div>

          {/* Tracking Barcode & QR Block */}
          <div className="border-2 border-slate-900 rounded-lg p-3.5 flex items-center justify-between gap-4 bg-slate-50">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                Consignment Tracking Code:
              </span>
              <div className="font-mono text-2xl font-black text-slate-900 tracking-wider">
                {dispatch.trackingNumber}
              </div>
              <div className="text-[11px] font-mono text-slate-600">
                Bundled Categories: {dispatch.categories?.join(', ') || dispatch.documentCategory}
              </div>
              <div className="text-[11px] text-slate-500">
                Total Items: {dispatch.totalItemsCount || dispatch.itemsCount} in 1 transit parcel
              </div>
            </div>

            {/* QR Code representation */}
            <div className="text-center shrink-0">
              <div className="w-20 h-20 bg-white border border-slate-300 p-1 rounded flex flex-col items-center justify-center">
                <QrCode className="w-14 h-14 text-slate-900" />
                <span className="text-[8px] font-mono font-bold">SCAN TO SIGN</span>
              </div>
            </div>
          </div>

          {/* Facilities Routing */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="border border-slate-300 rounded p-3">
              <div className="text-[10px] font-bold text-slate-500 uppercase">From (Originating Center):</div>
              <div className="font-bold text-slate-900 mt-1">{dispatch.originFacility}</div>
              <div className="text-slate-600 text-[11px] mt-0.5">District: {dispatch.originDistrict}</div>
              <div className="text-slate-600 text-[11px]">
                {dispatch.transitDirection === 'lab_to_hospital' ? 'Lab Officer: ' : 'District In-Charge: '}
                {dispatch.senderName} ({dispatch.senderDesignation})
              </div>
            </div>

            <div className="border border-slate-300 rounded p-3">
              <div className="text-[10px] font-bold text-slate-500 uppercase">To (Destination Facility):</div>
              <div className="font-bold text-slate-900 mt-1">{dispatch.destinationLab}</div>
              <div className="text-slate-600 text-[11px] mt-0.5">
                {dispatch.transitDirection === 'lab_to_hospital' ? `District: ${orgSettings.district}` : 'Destination City: Guwahati'}
              </div>
              <div className="text-slate-600 text-[11px]">
                {dispatch.transitDirection === 'lab_to_hospital' 
                  ? `Attn: ${orgSettings.inchargeName} (District In-Charge)` 
                  : 'Attn: Central Receiving Counter / Pathologist'}
              </div>
            </div>
          </div>

          {/* Itemized Table of Bundled Categories in this Transit */}
          <div className="border border-slate-300 rounded overflow-hidden text-xs">
            <div className="bg-slate-100 p-2 font-bold text-[11px] uppercase tracking-wide text-slate-700 flex items-center justify-between border-b border-slate-300">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Bundled Documents &amp; Specimens in this Consignment</span>
              </span>
              <span className="font-mono text-slate-600">{bundledItems.length} Category Batches</span>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] text-slate-600 border-b border-slate-200 uppercase font-semibold">
                  <th className="p-2 w-8">#</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Pertaining CHC / Facility</th>
                  <th className="p-2">Title &amp; Reference Number</th>
                  <th className="p-2 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {bundledItems.map((it, idx) => (
                  <tr key={it.id || idx}>
                    <td className="p-2 font-mono text-slate-500">{idx + 1}</td>
                    <td className="p-2 font-semibold text-slate-800 uppercase text-[10px]">
                      {it.category.replace('_', ' ')}
                    </td>
                    <td className="p-2 text-[11px] font-semibold text-blue-900">
                      {it.pertainingFacility || dispatch.originFacility}
                    </td>
                    <td className="p-2">
                      <div className="font-medium text-slate-900">{it.title}</div>
                      <div className="font-mono text-[10px] text-slate-500">Ref: {it.referenceNo}</div>
                      {it.description && <div className="text-[10px] text-slate-500">{it.description}</div>}
                    </td>
                    <td className="p-2 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {it.itemsCount} {it.itemUnit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Courier Handover Details */}
          <div className="border border-slate-300 rounded p-3 text-xs space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Transit Carrier Handover:</div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <span className="text-slate-500">Mode:</span> <span className="font-medium text-slate-800 capitalize">{dispatch.courierMode.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-slate-500">Carrier / Driver:</span> <span className="font-medium text-slate-800">{dispatch.courierPersonName}</span>
              </div>
              <div>
                <span className="text-slate-500">Docket/Vehicle:</span> <span className="font-mono text-slate-800">{dispatch.courierDocketOrVehicle}</span>
              </div>
              <div>
                <span className="text-slate-500">Dispatched:</span> <span className="text-slate-800">{new Date(dispatch.dispatchedAt).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Notice to Receiving Desk */}
          <div className="p-3 bg-amber-50/70 border border-amber-300 rounded text-xs space-y-1">
            <div className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
              <span>
                {dispatch.transitDirection === 'lab_to_hospital' 
                  ? 'MANDATORY RECEIPT INSTRUCTION FOR HOSPITAL / CHC DESK' 
                  : 'MANDATORY RECEIPT INSTRUCTION FOR GUWAHATI DESK'}
              </span>
            </div>
            <div className="text-[11px] text-amber-950 leading-relaxed">
              Upon receiving this package, please scan the QR code above or open the receipt tracking portal to record digital signature and verify parcel seal integrity.
            </div>
          </div>

          {/* Physical Signatures Row */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-300 text-xs text-center">
            <div className="space-y-6">
              <div className="h-8 border-b border-dashed border-slate-400"></div>
              <div className="font-bold text-slate-800 text-[11px]">
                {dispatch.transitDirection === 'lab_to_hospital' 
                  ? 'Central Lab Dispatching Officer' 
                  : 'Office of District Cluster In-Charge / Authorized Signatory'}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-8 border-b border-dashed border-slate-400"></div>
              <div className="font-bold text-slate-800 text-[11px]">
                Carrier Handover Signature
              </div>
            </div>
          </div>

          <div className="text-[9px] text-slate-500 text-center italic pt-1">
            * Administrative Note: Community Health Centres (CHCs) and District Hospitals do not dispatch consignments directly to Guwahati Central Lab. Consignments are consolidated and dispatched exclusively under the authority of the District Cluster In-Charge.
          </div>
        </div>
      </div>
    </div>
  );
};
