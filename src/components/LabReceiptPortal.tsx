import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  PenTool, 
  RotateCcw, 
  Search, 
  AlertTriangle, 
  Building2, 
  FileText,
  User,
  Phone,
  Camera,
  Check,
  FlaskConical,
  ArrowRight
} from 'lucide-react';
import { DispatchItem, PackageCondition } from '../types';

interface LabReceiptPortalProps {
  dispatches: DispatchItem[];
  preselectedDispatch?: DispatchItem | null;
  onAcknowledgeSuccess: (acknowledgedItem: DispatchItem) => void;
  onCancel?: () => void;
  onOpenLabDispatch?: () => void;
}

export const LabReceiptPortal: React.FC<LabReceiptPortalProps> = ({
  dispatches,
  preselectedDispatch,
  onAcknowledgeSuccess,
  onCancel,
  onOpenLabDispatch
}) => {
  const [selectedTracking, setSelectedTracking] = useState<string>(
    preselectedDispatch?.trackingNumber || ''
  );

  const selectedDispatch = dispatches.find(
    d => d.trackingNumber.toUpperCase() === selectedTracking.trim().toUpperCase()
  );

  const isLabToHospital = selectedDispatch?.transitDirection === 'lab_to_hospital';

  const [receiverName, setReceiverName] = useState('');
  const [receiverDesignation, setReceiverDesignation] = useState(
    isLabToHospital ? 'Hospital Store Officer / In-Charge Desk' : 'Laboratory Assistant / Receiving Clerk'
  );
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverDepartment, setReceiverDepartment] = useState(
    isLabToHospital 
      ? `${selectedDispatch?.destinationLab || 'District Health Facility'} Receiving Section`
      : 'Central Diagnostic Sample Reception Desk, Guwahati'
  );
  const [packageCondition, setPackageCondition] = useState<PackageCondition>('intact_sealed');
  const [conditionRemarks, setConditionRemarks] = useState('');
  const [hasSignature, setHasSignature] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stampedChallanUploaded, setStampedChallanUploaded] = useState(false);

  // Update default receiver fields when selectedDispatch changes
  useEffect(() => {
    if (selectedDispatch) {
      if (selectedDispatch.transitDirection === 'lab_to_hospital') {
        setReceiverDepartment(`${selectedDispatch.destinationLab} Receiving & Records`);
      } else {
        setReceiverDepartment(`${selectedDispatch.destinationLab} Reception Counter, Guwahati`);
        setReceiverDesignation('Laboratory Assistant / Receiving Clerk');
      }
    }
  }, [selectedDispatch]);

  // Canvas ref for signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  // In-transit items for quick lookup
  const inTransitItems = dispatches.filter(d => d.status !== 'delivered');

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0F172A';
  }, [selectedTracking]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e && e.cancelable) e.preventDefault();
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    if ('touches' in e && e.cancelable) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSimulatedPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setStampedChallanUploaded(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedDispatch) {
      setErrorMsg('Please select a valid consignment to acknowledge.');
      return;
    }

    if (selectedDispatch.status === 'delivered') {
      setErrorMsg('This consignment has already been acknowledged and signed for.');
      return;
    }

    if (!receiverName.trim()) {
      setErrorMsg('Please enter the Receiver Full Name.');
      return;
    }

    if (!hasSignature && !canvasRef.current) {
      setErrorMsg('Please provide your digital signature in the box below.');
      return;
    }

    setIsSubmitting(true);

    const canvas = canvasRef.current;
    const signatureDataUrl = canvas ? canvas.toDataURL('image/png') : '';

    try {
      // Import storage function dynamically or call callback
      import('../lib/storage').then(({ recordAcknowledgement }) => {
        const updated = recordAcknowledgement(selectedDispatch.trackingNumber, {
          receivedByName: receiverName.trim(),
          receiverDesignation: receiverDesignation.trim(),
          receiverPhone: receiverPhone.trim(),
          receiverDepartment: receiverDepartment.trim(),
          packageCondition,
          conditionRemarks: conditionRemarks.trim() || undefined,
          signatureDataUrl,
          stampedChallanPhoto: stampedChallanUploaded ? 'uploaded_challan_stamp.jpg' : undefined
        });

        setIsSubmitting(false);
        if (updated) {
          onAcknowledgeSuccess(updated);
        } else {
          setErrorMsg('Failed to record receipt. Please check details.');
        }
      });
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Error recording receipt');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display">
                Receipt Verification &amp; Custody Sign-Off Desk
              </h2>
              <p className="text-xs text-slate-300">
                Guwahati Central Lab &amp; District Health Facilities Digital Handover
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            {onOpenLabDispatch && (
              <button
                type="button"
                onClick={onOpenLabDispatch}
                className="min-h-[44px] px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-transform active:scale-[0.98] touch-manipulation"
              >
                <FlaskConical className="w-4 h-4" />
                <span>+ Dispatch from Lab</span>
              </button>
            )}

            <div className="text-right hidden md:block text-xs text-slate-400">
              <div>Official Registry</div>
              <div className="font-mono text-slate-200">
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Consignment Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
            1. Select or Enter Consignment Tracking Number *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                value={selectedTracking}
                onChange={(e) => setSelectedTracking(e.target.value.toUpperCase())}
                placeholder="e.g. AS-DISP-2026-1049"
                className="w-full text-sm font-mono font-bold uppercase px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Found on printed barcode label or courier delivery slip.
              </span>
            </div>

            <div>
              <select
                value={selectedTracking}
                onChange={(e) => setSelectedTracking(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">-- Quick Pick In-Transit Package --</option>
                {inTransitItems.map((item) => (
                  <option key={item.id} value={item.trackingNumber}>
                    {item.trackingNumber} · {item.originFacility} ({item.title.substring(0, 30)}...)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Selected Consignment Details Card */}
        {selectedDispatch ? (
          <div className="p-4 bg-blue-50/40 border border-blue-200/80 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 pb-2">
              <div className="font-mono font-bold text-sm text-blue-950 flex items-center gap-2">
                <span>{selectedDispatch.trackingNumber}</span>
                <span className="text-xs font-normal text-slate-500">
                  (Ref: {selectedDispatch.referenceNo})
                </span>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                selectedDispatch.status === 'delivered' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {selectedDispatch.status === 'delivered' ? 'Already Acknowledged' : 'Pending Sign-Off'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Originating Hospital / CHC:</span>
                <span className="font-semibold text-slate-900">{selectedDispatch.originFacility}</span>
                <span className="text-slate-500 text-[11px] block">In-charge: {selectedDispatch.senderName} ({selectedDispatch.senderDesignation})</span>
              </div>
              <div>
                <span className="text-slate-500 block">Destination Central Facility:</span>
                <span className="font-semibold text-slate-900">{selectedDispatch.destinationLab}</span>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-blue-100">
                <span className="text-slate-500 block font-medium">Bundled Consignment Documents ({selectedDispatch.items?.length || 1} Categories):</span>
                <div className="mt-1 space-y-1.5">
                  {(selectedDispatch.items && selectedDispatch.items.length > 0 ? selectedDispatch.items : [
                    {
                      id: '1',
                      category: selectedDispatch.documentCategory,
                      title: selectedDispatch.title,
                      referenceNo: selectedDispatch.referenceNo,
                      itemsCount: selectedDispatch.itemsCount,
                      itemUnit: selectedDispatch.itemUnit
                    }
                  ]).map((sub, i) => (
                    <div key={sub.id || i} className="bg-white/80 p-2 rounded border border-blue-200/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-900 uppercase text-[10px] bg-blue-100/70 text-blue-800 px-1.5 py-0.5 rounded mr-1.5">
                          {sub.category.replace('_', ' ')}
                        </span>
                        <span className="font-medium text-slate-800">{sub.title}</span>
                        <span className="text-slate-500 font-mono text-[11px] ml-1.5">Ref: {sub.referenceNo}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 tabular-nums shrink-0 ml-2">
                        {sub.itemsCount} {sub.itemUnit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 block">Handed over by Carrier / Driver:</span>
                <span className="font-medium text-slate-900">{selectedDispatch.courierPersonName}</span>
                <span className="text-slate-500 text-[11px] font-mono ml-2">
                  ({selectedDispatch.courierDocketOrVehicle} {selectedDispatch.courierPhone ? `· ${selectedDispatch.courierPhone}` : ''})
                </span>
              </div>
            </div>
          </div>
        ) : selectedTracking ? (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg">
            Consignment #{selectedTracking} not found in the local registry. Please re-check the number or scan again.
          </div>
        ) : null}

        {/* Step 2: Package Physical Condition Inspection */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
            2. Package Condition Upon Handover *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <label className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
              packageCondition === 'intact_sealed' 
                ? 'border-emerald-500 bg-emerald-50/30' 
                : 'border-slate-200 hover:border-slate-300'
            }`}>
              <input
                type="radio"
                name="condition"
                checked={packageCondition === 'intact_sealed'}
                onChange={() => setPackageCondition('intact_sealed')}
                className="mt-0.5 text-blue-600"
              />
              <div>
                <div className="font-semibold text-slate-900">Intact &amp; Tamper-Sealed</div>
                <div className="text-slate-500 text-[11px]">Envelopes / cold boxes sealed with no signs of tampering.</div>
              </div>
            </label>

            <label className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
              packageCondition === 'tampered_seal' 
                ? 'border-rose-500 bg-rose-50/30' 
                : 'border-slate-200 hover:border-slate-300'
            }`}>
              <input
                type="radio"
                name="condition"
                checked={packageCondition === 'tampered_seal'}
                onChange={() => setPackageCondition('tampered_seal')}
                className="mt-0.5 text-blue-600"
              />
              <div>
                <div className="font-semibold text-rose-900">Tampered Seal / Tape Open</div>
                <div className="text-slate-500 text-[11px]">Outer seal or adhesive tape shows signs of prior opening.</div>
              </div>
            </label>

            <label className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
              packageCondition === 'damaged_outer' 
                ? 'border-amber-500 bg-amber-50/30' 
                : 'border-slate-200 hover:border-slate-300'
            }`}>
              <input
                type="radio"
                name="condition"
                checked={packageCondition === 'damaged_outer'}
                onChange={() => setPackageCondition('damaged_outer')}
                className="mt-0.5 text-blue-600"
              />
              <div>
                <div className="font-semibold text-slate-900">Physical Damage to Packaging</div>
                <div className="text-slate-500 text-[11px]">Water/fluid damage, torn corner, or crushed specimen tube.</div>
              </div>
            </label>

            <label className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
              packageCondition === 'item_discrepancy' 
                ? 'border-amber-500 bg-amber-50/30' 
                : 'border-slate-200 hover:border-slate-300'
            }`}>
              <input
                type="radio"
                name="condition"
                checked={packageCondition === 'item_discrepancy'}
                onChange={() => setPackageCondition('item_discrepancy')}
                className="mt-0.5 text-blue-600"
              />
              <div>
                <div className="font-semibold text-slate-900">Quantity / Count Discrepancy</div>
                <div className="text-slate-500 text-[11px]">Fewer invoices, samples, or documents than stated on slip.</div>
              </div>
            </label>
          </div>

          {packageCondition !== 'intact_sealed' && (
            <div className="mt-2">
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Condition Discrepancy Notes (Mandatory for non-intact receipts):
              </label>
              <textarea
                value={conditionRemarks}
                onChange={(e) => setConditionRemarks(e.target.value)}
                placeholder="Explain the damage, missing document number, or condition discrepancy..."
                rows={2}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Step 3: Guwahati Receiving Officer Details */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
            3. Receiving Officer Information (Guwahati Lab) *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Receiver Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="e.g. Manash Pratim Sarma"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Official Designation *</label>
              <input
                type="text"
                required
                value={receiverDesignation}
                onChange={(e) => setReceiverDesignation(e.target.value)}
                placeholder="e.g. Lab Technician, Receiving Clerk"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Contact Phone / Extension</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  placeholder="+91 94350 00000"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Section / Department / Counter</label>
              <input
                type="text"
                value={receiverDepartment}
                onChange={(e) => setReceiverDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Touchscreen Digital Signature & Stamped Slip */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
              4. Recipient Digital Signature (Mandatory) *
            </label>
            <button
              type="button"
              onClick={clearSignature}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Signature</span>
            </button>
          </div>

          <div className="border border-slate-300 rounded-lg bg-slate-50 overflow-hidden relative touch-none">
            <canvas
              ref={canvasRef}
              width={650}
              height={140}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-32 bg-white cursor-crosshair block"
            />
            {!hasSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
                <PenTool className="w-4 h-4 mr-2 opacity-50" />
                Sign with finger (mobile) or mouse cursor here
              </div>
            )}
          </div>

          {/* Stamped Challan Photo (Optional proof) */}
          <div className="flex items-center justify-between pt-1">
            <label className="text-xs text-slate-600 flex items-center gap-2 cursor-pointer hover:text-blue-600">
              <Camera className="w-4 h-4 text-slate-500" />
              <span>{stampedChallanUploaded ? 'Stamped Challan Photo Attached' : 'Attach Photo of Stamped Physical Challan (Optional)'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleSimulatedPhotoUpload}
                className="hidden"
              />
            </label>
            {stampedChallanUploaded && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Photo Attached
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons (Full width on mobile with 48px height) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="order-2 sm:order-1 min-h-[44px] px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-center touch-manipulation"
            >
              Back to Ledger
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !selectedDispatch || selectedDispatch.status === 'delivered'}
            className="order-1 sm:order-2 min-h-[48px] px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-transform active:scale-[0.98] flex items-center justify-center gap-2 touch-manipulation"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Recording Proof of Delivery...' : 'Confirm Delivery & Record Legal Proof'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
