import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Building2, 
  FileText, 
  Truck, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Layers,
  User,
  Check,
  FlaskConical,
  ArrowRight,
  ShieldCheck,
  Info
} from 'lucide-react';
import { 
  DispatchItem, 
  DispatchSubItem, 
  DocumentCategory, 
  CourierMode, 
  UrgencyLevel, 
  TransitDirection,
  FacilityMaster, 
  DestinationLabMaster, 
  SenderMaster, 
  CourierMaster 
} from '../types';
import { 
  getFacilities, 
  getDestinations, 
  getSenders, 
  getCouriers, 
  getOrgSettings,
  createDispatch 
} from '../lib/storage';

interface NewDispatchModalProps {
  onClose: () => void;
  onCreated: (newDispatch: DispatchItem) => void;
  initialDirection?: TransitDirection;
}

export const NewDispatchModal: React.FC<NewDispatchModalProps> = ({ 
  onClose, 
  onCreated,
  initialDirection = 'hospital_to_lab'
}) => {
  const registeredFacilities = getFacilities();
  const registeredDestinations = getDestinations();
  const registeredSenders = getSenders();
  const registeredCouriers = getCouriers();
  const orgSettings = getOrgSettings();

  // Transit Direction: 'hospital_to_lab' or 'lab_to_hospital'
  const [direction, setDirection] = useState<TransitDirection>(initialDirection);

  // Routing state
  // 1. If hospital_to_lab:
  //    Origin = Hospital / CHC
  //    Destination = Central Lab in Guwahati
  //    Sender = Single District In-Charge (Unified for District Hospital & all CHCs)
  // 2. If lab_to_hospital:
  //    Origin = Central Lab in Guwahati
  //    Destination = Hospital / CHC (Attn: Single District In-Charge)
  //    Sender = Central Lab Officer / Pathologist
  const [selectedFacility, setSelectedFacility] = useState(registeredFacilities[0]?.name || 'District Civil Hospital');
  const [customFacility, setCustomFacility] = useState('');
  const [selectedLab, setSelectedLab] = useState(registeredDestinations[0]?.name || 'State Central Diagnostic Referral Lab');

  // Senders state
  const districtInchargeSender = registeredSenders.find(s => s.id === 'snd-district-ic') || {
    name: orgSettings.inchargeName,
    designation: orgSettings.inchargeDesignation,
    phone: orgSettings.contactPhone
  };

  const centralLabSender = registeredSenders.find(s => s.id === 'snd-lab-guwahati') || {
    name: 'Dr. R. Goswami',
    designation: 'Senior Pathologist & Central Lab In-Charge',
    phone: '+91 98640 44911'
  };

  const [senderName, setSenderName] = useState(
    direction === 'lab_to_hospital' ? centralLabSender.name : districtInchargeSender.name
  );
  const [senderDesignation, setSenderDesignation] = useState(
    direction === 'lab_to_hospital' ? centralLabSender.designation : districtInchargeSender.designation
  );

  // Multi-document items in this transit parcel
  const getInitialItems = (dir: TransitDirection): DispatchSubItem[] => {
    const defaultFac = registeredFacilities[0]?.name || 'District Civil Hospital';
    if (dir === 'lab_to_hospital') {
      return [
        {
          id: `sub-${Date.now()}-1`,
          category: 'test_report',
          title: 'Histopathology & Biopsy Diagnostic Reports',
          referenceNo: 'GHY-LAB/2026/089',
          itemsCount: 15,
          itemUnit: 'Patient Reports',
          pertainingFacility: defaultFac,
          description: 'Official verified biopsy & cytology reports'
        }
      ];
    }
    return [
      {
        id: `sub-${Date.now()}-1`,
        category: 'invoice',
        title: 'Diagnostic Reagents & Maintenance Invoices',
        referenceNo: 'INV/KAM/2026/041',
        itemsCount: 3,
        itemUnit: 'Original Invoices',
        pertainingFacility: registeredFacilities[1]?.name || 'Community Health Centre (CHC) Sonapur',
        description: 'Vendor bills for verification and clearance'
      }
    ];
  };

  const [items, setItems] = useState<DispatchSubItem[]>(getInitialItems(initialDirection));

  // Switch direction handler
  const handleToggleDirection = (newDir: TransitDirection) => {
    if (newDir === direction) return;
    setDirection(newDir);
    setItems(getInitialItems(newDir));
    if (newDir === 'lab_to_hospital') {
      setSenderName(centralLabSender.name);
      setSenderDesignation(centralLabSender.designation);
    } else {
      setSenderName(districtInchargeSender.name);
      setSenderDesignation(districtInchargeSender.designation);
    }
  };

  // General transit settings
  const [urgency, setUrgency] = useState<UrgencyLevel>('routine');
  const [courierMode, setCourierMode] = useState<CourierMode>('hospital_vehicle');
  const [selectedCourierId, setSelectedCourierId] = useState<string>(registeredCouriers[0]?.id || '');
  const [courierPersonName, setCourierPersonName] = useState(registeredCouriers[0]?.name || 'Biren Das');
  const [courierPhone, setCourierPhone] = useState(registeredCouriers[0]?.phone || '+91 94350 28190');
  const [courierDocketOrVehicle, setCourierDocketOrVehicle] = useState(registeredCouriers[0]?.vehicleOrDocket || 'AS-01-HC-4022');

  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle courier selector change
  const handleCourierSelect = (courierId: string) => {
    setSelectedCourierId(courierId);
    const found = registeredCouriers.find(c => c.id === courierId);
    if (found) {
      setCourierPersonName(found.name);
      setCourierMode(found.transitMode);
      setCourierDocketOrVehicle(found.vehicleOrDocket);
      setCourierPhone(found.phone);
    }
  };

  // Sub-items management
  const handleAddItem = (category: DocumentCategory) => {
    let defaultUnit = 'Items';
    let defaultTitle = 'Document Batch';
    
    if (category === 'invoice') { defaultUnit = 'Original Invoices'; defaultTitle = 'Reagent / Maintenance Bills'; }
    else if (category === 'kpi_report') { defaultUnit = 'Bound Reports'; defaultTitle = 'Monthly KPI Performance Dossier'; }
    else if (category === 'patient_sample') { defaultUnit = 'Cold-chain Vials'; defaultTitle = 'Diagnostic Biopsy / Blood Specimens'; }
    else if (category === 'bill') { defaultUnit = 'Certified Vouchers'; defaultTitle = 'Hospital Contingency Vouchers'; }
    else if (category === 'test_report') { defaultUnit = 'Patient Reports'; defaultTitle = 'Central Lab Diagnostic Test Reports'; }
    else if (category === 'qc_feedback') { defaultUnit = 'Assessment Sheets'; defaultTitle = 'Specimen QC / EQAS Evaluation Notes'; }
    else if (category === 'reimbursement_voucher') { defaultUnit = 'Approved Vouchers'; defaultTitle = 'Audited Reimbursement Clearance Slips'; }
    else if (category === 'official_memo') { defaultUnit = 'Official Files'; defaultTitle = 'Administrative Protocol & Advisories'; }

    const newItem: DispatchSubItem = {
      id: `sub-${Date.now()}-${Math.random()}`,
      category,
      title: defaultTitle,
      referenceNo: '',
      itemsCount: 1,
      itemUnit: defaultUnit,
      pertainingFacility: registeredFacilities[0]?.name || 'District Civil Hospital',
      description: ''
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      setErrorMsg('A consignment must contain at least one document or sample item.');
      return;
    }
    setItems(items.filter(it => it.id !== id));
  };

  const handleUpdateItem = (id: string, updates: Partial<DispatchSubItem>) => {
    setItems(items.map(it => {
      if (it.id === id) {
        const updated = { ...it, ...updates };
        if (updates.category && updates.category !== it.category) {
          if (updates.category === 'invoice') updated.itemUnit = 'Original Invoices';
          else if (updates.category === 'kpi_report') updated.itemUnit = 'Bound Reports';
          else if (updates.category === 'patient_sample') updated.itemUnit = 'Cold-chain Vials';
          else if (updates.category === 'bill') updated.itemUnit = 'Certified Vouchers';
          else if (updates.category === 'test_report') updated.itemUnit = 'Patient Reports';
          else if (updates.category === 'qc_feedback') updated.itemUnit = 'Assessment Sheets';
          else if (updates.category === 'reimbursement_voucher') updated.itemUnit = 'Approved Vouchers';
          else if (updates.category === 'official_memo') updated.itemUnit = 'Official Files';
        }
        return updated;
      }
      return it;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!senderName.trim()) {
      setErrorMsg('Please specify the authorized signatory / in-charge name.');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Please add at least one document category.');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.title.trim()) {
        setErrorMsg(`Item #${i + 1} requires a title/description.`);
        return;
      }
      if (!it.referenceNo.trim()) {
        setErrorMsg(`Item #${i + 1} (${it.title}) requires a Reference / Invoice / Batch number.`);
        return;
      }
    }

    if (!courierPersonName.trim()) {
      setErrorMsg('Please specify the carrier or driver name.');
      return;
    }

    // Determine Origin and Destination based on transit direction
    // Individual hospitals and CHCs do not send consignments to lab; only the Cluster In-Charge dispatches.
    const clusterOfficeName = orgSettings.networkName || 'Office of the District Cluster In-Charge (Kamrup)';
    const origin = direction === 'lab_to_hospital' ? selectedLab : clusterOfficeName;
    const destination = direction === 'lab_to_hospital' ? clusterOfficeName : selectedLab;

    const created = createDispatch({
      transitDirection: direction,
      originFacility: origin,
      originDistrict: orgSettings.district || 'Kamrup',
      destinationLab: destination,
      items,
      urgency,
      courierMode,
      courierPersonName: courierPersonName.trim(),
      courierPhone: courierPhone.trim(),
      courierDocketOrVehicle: courierDocketOrVehicle.trim() || 'N/A',
      senderName: senderName.trim(),
      senderDesignation: senderDesignation.trim(),
      notes: notes.trim() || undefined
    });

    onCreated(created);
  };

  const totalQuantity = items.reduce((sum, it) => sum + (Number(it.itemsCount) || 1), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh] sm:max-h-[85vh] animate-in slide-in-from-bottom duration-200">
        {/* Mobile Drag Handle Bar */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className={`text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0 ${
          direction === 'lab_to_hospital' ? 'bg-indigo-950' : 'bg-slate-900'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${
              direction === 'lab_to_hospital' ? 'bg-indigo-600' : 'bg-blue-600'
            }`}>
              {direction === 'lab_to_hospital' ? (
                <FlaskConical className="w-4 h-4 text-white" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </div>
            <div>
              <h2 className="font-display font-bold text-sm sm:text-base leading-tight">
                {direction === 'lab_to_hospital' 
                  ? 'Guwahati Central Lab · Outward Dispatch Window'
                  : 'Record Healthcare Consignment'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-1">
                {direction === 'lab_to_hospital'
                  ? 'Dispatch diagnostic test reports, QC feedback & audited vouchers to District Hospital or CHC'
                  : 'Multi-document transit to Guwahati central laboratory'}
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

        {/* TRANSIT DIRECTION SWITCHER TABS */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 grid grid-cols-2 gap-2 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => handleToggleDirection('hospital_to_lab')}
            className={`min-h-[44px] px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-2 touch-manipulation ${
              direction === 'hospital_to_lab'
                ? 'bg-white text-blue-700 shadow-xs font-bold border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="truncate">Hospital / CHC → Guwahati Lab</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleDirection('lab_to_hospital')}
            className={`min-h-[44px] px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-2 touch-manipulation ${
              direction === 'lab_to_hospital'
                ? 'bg-white text-indigo-700 shadow-xs font-bold border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-indigo-600" />
            <span className="truncate">Central Lab → Hospital / CHC</span>
          </button>
        </div>

        {/* Form Body with Scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs text-slate-800">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: ROUTING & AUTHORIZED IN-CHARGE */}
          <div className="space-y-3">
            <div className="font-semibold text-slate-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>
                1. {direction === 'lab_to_hospital' ? 'Central Lab Outward Routing' : 'District Cluster Authority & Routing'}
              </span>
            </div>

            {/* Banner explaining single district in-charge */}
            {direction === 'hospital_to_lab' ? (
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-semibold text-blue-950 text-xs">
                    Cluster In-Charge Exclusive Consignment Authority: {orgSettings.inchargeName}
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Official Protocol: Community Health Centres (CHCs) and District Hospitals do not dispatch documents directly to Guwahati Central Lab. All facility documents, samples, and bills are consolidated and dispatched exclusively under the authority of the District Cluster In-Charge. Select the pertaining CHC or hospital for each bundled batch in Section 2.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-semibold text-indigo-950 text-xs">
                    Return Dispatch to District Cluster Authority
                  </div>
                  <p className="text-[11px] text-indigo-800 leading-relaxed">
                    Central laboratory delivering diagnostic test results, QC feedback, and audited vouchers directly to the Office of the District Cluster In-Charge ({orgSettings.inchargeName}) for onward cluster distribution.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {direction === 'hospital_to_lab' ? (
                <>
                  {/* Origin Authority (Fixed to Cluster In-charge Office) */}
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Consignment Dispatching Authority *</label>
                    <div className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold flex items-center justify-between">
                      <span className="truncate">{orgSettings.networkName || 'Office of the District Cluster In-Charge'}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded shrink-0">
                        CLUSTER IN-CHARGE
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      CHCs &amp; hospitals do not send directly. Documents are consolidated here.
                    </div>
                  </div>

                  {/* Destination Lab */}
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Destination Central Lab in Guwahati *</label>
                    <select
                      value={selectedLab}
                      onChange={(e) => setSelectedLab(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {registeredDestinations.map(l => (
                        <option key={l.id} value={l.name}>{l.name} - {l.department}</option>
                      ))}
                    </select>
                  </div>

                  {/* Single District In-charge Sender */}
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">
                      District Cluster In-Charge (Signatory) *
                    </label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="e.g. Dr. P. P. Sharma"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Sender Designation */}
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Official Designation</label>
                    <input
                      type="text"
                      required
                      value={senderDesignation}
                      onChange={(e) => setSenderDesignation(e.target.value)}
                      placeholder="e.g. Medical Superintendent & District Cluster In-Charge"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Origin Lab */}
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Dispatching Central Lab in Guwahati *</label>
                    <select
                      value={selectedLab}
                      onChange={(e) => setSelectedLab(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {registeredDestinations.map(l => (
                        <option key={l.id} value={l.name}>{l.name} ({l.department})</option>
                      ))}
                    </select>
                  </div>

                  {/* Target Authority Destination */}
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Destination Health Authority *</label>
                    <div className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold flex items-center justify-between">
                      <span className="truncate">{orgSettings.networkName || 'Office of the District Cluster In-Charge'}</span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded shrink-0">
                        DISTRICT CLUSTER
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Addressed Attn: <span className="font-semibold text-slate-700">{orgSettings.inchargeName}</span> (District Cluster In-Charge)
                    </div>
                  </div>

                  {/* Central Lab Dispatching Officer */}
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Dispatching Lab Officer / Pathologist *</label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="e.g. Dr. R. Goswami"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Officer Designation */}
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Officer Designation</label>
                    <input
                      type="text"
                      required
                      value={senderDesignation}
                      onChange={(e) => setSenderDesignation(e.target.value)}
                      placeholder="e.g. Senior Pathologist & Central Lab In-Charge"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 2: MULTIPLE DOCUMENT CATEGORIES IN THIS TRANSIT */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="font-semibold text-slate-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  2. Bundled Documents in this Consignment ({items.length} {items.length === 1 ? 'Batch' : 'Batches'})
                </span>
              </div>

              {/* Quick Add Buttons tailored to direction */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Add Category:</span>
                {direction === 'hospital_to_lab' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleAddItem('invoice')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg font-medium text-[11px] transition-colors"
                    >
                      + Invoices
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddItem('kpi_report')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg font-medium text-[11px] transition-colors"
                    >
                      + KPIs
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddItem('patient_sample')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg font-medium text-[11px] transition-colors"
                    >
                      + Samples
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddItem('bill')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg font-medium text-[11px] transition-colors"
                    >
                      + Bills
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleAddItem('test_report')}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg font-medium text-[11px] transition-colors"
                    >
                      + Test Reports
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddItem('qc_feedback')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg font-medium text-[11px] transition-colors"
                    >
                      + QC Notes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddItem('reimbursement_voucher')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg font-medium text-[11px] transition-colors"
                    >
                      + Audited Bills
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddItem('official_memo')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg font-medium text-[11px] transition-colors"
                    >
                      + Lab Memo
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Itemized Cards List */}
            <div className="space-y-3">
              {items.map((it, idx) => (
                <div 
                  key={it.id} 
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <select
                        value={it.category}
                        onChange={(e) => handleUpdateItem(it.id, { category: e.target.value as DocumentCategory })}
                        className="font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="invoice">Diagnostic Reagent Invoices</option>
                        <option value="kpi_report">Monthly KPI Performance Dossier</option>
                        <option value="patient_sample">Patient Diagnostic Samples / Biopsy</option>
                        <option value="bill">Hospital Contingency Bills</option>
                        <option value="test_report">Diagnostic Patient Test Reports</option>
                        <option value="qc_feedback">Specimen QC &amp; Evaluation Feedback</option>
                        <option value="reimbursement_voucher">Approved Reimbursement Vouchers</option>
                        <option value="official_memo">Official Memo / Circular</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(it.id)}
                      disabled={items.length <= 1}
                      className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1.5 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Remove this batch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    {/* Facility / CHC source */}
                    <div className="sm:col-span-12">
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[10px] uppercase font-bold text-slate-600">
                          {direction === 'hospital_to_lab' 
                            ? 'Originating Health Facility / Pertaining CHC *' 
                            : 'Pertaining Facility / Target CHC *'}
                        </label>
                        <span className="text-[10px] text-blue-600 font-medium">
                          {direction === 'hospital_to_lab' 
                            ? 'Consolidated by Cluster In-Charge' 
                            : 'Cluster Delivery Intended For'}
                        </span>
                      </div>
                      <select
                        value={it.pertainingFacility || registeredFacilities[0]?.name || 'District Civil Hospital'}
                        onChange={(e) => handleUpdateItem(it.id, { pertainingFacility: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {registeredFacilities.map(f => (
                          <option key={f.id} value={f.name}>
                            {f.name} ({f.facilityType})
                          </option>
                        ))}
                        <option value="District Cluster (All CHCs & Hospital Consolidated)">
                          District Cluster (All CHCs &amp; Hospital Consolidated)
                        </option>
                      </select>
                    </div>

                    {/* Title */}
                    <div className="sm:col-span-6">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                        Title / Batch Content Description *
                      </label>
                      <input
                        type="text"
                        required
                        value={it.title}
                        onChange={(e) => handleUpdateItem(it.id, { title: e.target.value })}
                        placeholder="e.g. October 2026 Histopathology Reports"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Reference # */}
                    <div className="sm:col-span-6">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                        Reference # / Voucher / Batch # *
                      </label>
                      <input
                        type="text"
                        required
                        value={it.referenceNo}
                        onChange={(e) => handleUpdateItem(it.id, { referenceNo: e.target.value })}
                        placeholder="e.g. LAB/OCT/041"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Count */}
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                        Quantity / Pages / Tubes
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={it.itemsCount}
                        onChange={(e) => handleUpdateItem(it.id, { itemsCount: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Unit */}
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                        Unit Description
                      </label>
                      <input
                        type="text"
                        value={it.itemUnit}
                        onChange={(e) => handleUpdateItem(it.id, { itemUnit: e.target.value })}
                        placeholder="e.g. Patient Reports"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Notes */}
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                        Specific Notes
                      </label>
                      <input
                        type="text"
                        value={it.description || ''}
                        onChange={(e) => handleUpdateItem(it.id, { description: e.target.value })}
                        placeholder="e.g. Sealed tamper-evident pouch"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total items banner */}
            <div className="bg-slate-100/70 border border-slate-200 rounded-xl px-4 py-2 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Consolidated Consignment Volume:</span>
              <span className="font-mono font-bold text-slate-900">
                {totalQuantity} total items bundled into 1 tracking voucher
              </span>
            </div>
          </div>

          {/* Section 3: COURIER & TRANSIT DETAILS */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="font-semibold text-slate-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>3. Courier &amp; Transit Handover</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Carrier Selection */}
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Quick Select Carrier</label>
                <select
                  value={selectedCourierId}
                  onChange={(e) => handleCourierSelect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Custom Carrier / Driver --</option>
                  {registeredCouriers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.transitMode})</option>
                  ))}
                </select>
              </div>

              {/* Courier Mode */}
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Transit Mode *</label>
                <select
                  value={courierMode}
                  onChange={(e) => setCourierMode(e.target.value as CourierMode)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="hospital_vehicle">Hospital Utility Van / Ambulance</option>
                  <option value="dedicated_rider">Dedicated Courier Rider</option>
                  <option value="speed_post">India Post Speed Post</option>
                  <option value="courier_service">Private Courier</option>
                  <option value="staff_hand_carry">Deputed Health Staff Hand-Carry</option>
                </select>
              </div>

              {/* Carrier Name */}
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Driver / Carrier Name *</label>
                <input
                  type="text"
                  required
                  value={courierPersonName}
                  onChange={(e) => setCourierPersonName(e.target.value)}
                  placeholder="e.g. Biren Das"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Carrier Phone Number</label>
                <input
                  type="tel"
                  value={courierPhone}
                  onChange={(e) => setCourierPhone(e.target.value)}
                  placeholder="+91 94350 00000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Vehicle / Docket # */}
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Vehicle Plate or Docket #</label>
                <input
                  type="text"
                  value={courierDocketOrVehicle}
                  onChange={(e) => setCourierDocketOrVehicle(e.target.value)}
                  placeholder="AS-01-HC-4022"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Priority Level</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="routine">Routine (Delivery within 24h)</option>
                  <option value="urgent">Urgent (Delivery within 12h)</option>
                  <option value="critical_stat">Critical / STAT (Immediate Transit)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Remarks */}
          <div className="space-y-1 pt-2">
            <label className="block text-slate-600 font-medium">Transit Instructions / Package Seal Remarks</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Package sealed in official waterproof container. Barcode serial seal #9921 attached."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Sticky Bottom Actions Bar */}
          <div className="sticky bottom-0 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-4 sm:p-5 bg-white/95 backdrop-blur-md border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="text-slate-500 text-xs text-center sm:text-left">
              Generates legal barcode dispatch slip with QR verification for receiving desk.
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors touch-manipulation"
              >
                Cancel
              </button>

              <button
                type="submit"
                className={`flex-1 sm:flex-none min-h-[48px] px-6 py-2.5 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-transform active:scale-[0.98] flex items-center justify-center gap-2 touch-manipulation ${
                  direction === 'lab_to_hospital' 
                    ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800' 
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>
                  {direction === 'lab_to_hospital' 
                    ? 'Issue Central Lab Outward Dispatch' 
                    : 'Generate Official Dispatch Voucher'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
