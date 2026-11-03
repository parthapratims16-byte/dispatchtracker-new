import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  UserCheck, 
  Truck, 
  Plus, 
  Trash2, 
  Save, 
  Settings, 
  Check, 
  ShieldCheck, 
  MapPin, 
  Phone
} from 'lucide-react';
import { 
  FacilityMaster, 
  DestinationLabMaster, 
  SenderMaster, 
  CourierMaster, 
  OrganizationSettings 
} from '../types';
import { 
  getFacilities, 
  saveFacilities, 
  getDestinations, 
  saveDestinations, 
  getSenders, 
  saveSenders, 
  getCouriers, 
  saveCouriers, 
  getOrgSettings, 
  saveOrgSettings 
} from '../lib/storage';

interface AdminDirectoryModalProps {
  onClose: () => void;
  onDataChanged: () => void;
}

export const AdminDirectoryModal: React.FC<AdminDirectoryModalProps> = ({ onClose, onDataChanged }) => {
  const [activeTab, setActiveTab] = useState<'hospitals' | 'senders' | 'destinations' | 'couriers' | 'settings'>('hospitals');
  
  // Data lists
  const [facilities, setFacilities] = useState<FacilityMaster[]>(getFacilities());
  const [destinations, setDestinations] = useState<DestinationLabMaster[]>(getDestinations());
  const [senders, setSenders] = useState<SenderMaster[]>(getSenders());
  const [couriers, setCouriers] = useState<CourierMaster[]>(getCouriers());
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings>(getOrgSettings());

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
    onDataChanged();
  };

  // Form states for new items
  // 1. Hospital/CHC
  const [newFacName, setNewFacName] = useState('');
  const [newFacType, setNewFacType] = useState<FacilityMaster['facilityType']>('CHC');
  const [newFacDistrict, setNewFacDistrict] = useState(orgSettings.district || 'Kamrup');
  const [newFacPhone, setNewFacPhone] = useState('');

  // 2. Sender
  const [newSenderName, setNewSenderName] = useState('');
  const [newSenderDesignation, setNewSenderDesignation] = useState('Medical Officer');
  const [newSenderFacility, setNewSenderFacility] = useState(facilities[0]?.name || 'District Civil Hospital');
  const [newSenderPhone, setNewSenderPhone] = useState('');

  // 3. Destination Lab
  const [newLabName, setNewLabName] = useState('');
  const [newLabCity, setNewLabCity] = useState('Guwahati');
  const [newLabDept, setNewLabDept] = useState('Sample Receiving & Verification Counter');
  const [newLabPhone, setNewLabPhone] = useState('');

  // 4. Courier
  const [newCourierName, setNewCourierName] = useState('');
  const [newCourierMode, setNewCourierMode] = useState<CourierMaster['transitMode']>('hospital_vehicle');
  const [newCourierVehicle, setNewCourierVehicle] = useState('');
  const [newCourierPhone, setNewCourierPhone] = useState('');

  // Actions
  const handleAddFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacName.trim()) return;
    const item: FacilityMaster = {
      id: `fac-${Date.now()}`,
      name: newFacName.trim(),
      facilityType: newFacType,
      district: newFacDistrict.trim() || orgSettings.district || 'Kamrup',
      phone: newFacPhone.trim()
    };
    const updated = [...facilities, item];
    setFacilities(updated);
    saveFacilities(updated);
    setNewFacName('');
    setNewFacPhone('');
    showToast(`Added ${item.name} to registered facilities.`);
  };

  const handleDeleteFacility = (id: string) => {
    const updated = facilities.filter(f => f.id !== id);
    setFacilities(updated);
    saveFacilities(updated);
    showToast('Facility removed.');
  };

  const handleAddSender = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSenderName.trim()) return;
    const item: SenderMaster = {
      id: `snd-${Date.now()}`,
      name: newSenderName.trim(),
      designation: newSenderDesignation.trim(),
      facility: newSenderFacility || facilities[0]?.name || 'District Hospital',
      phone: newSenderPhone.trim()
    };
    const updated = [...senders, item];
    setSenders(updated);
    saveSenders(updated);
    setNewSenderName('');
    setNewSenderPhone('');
    showToast(`Added sender ${item.name}.`);
  };

  const handleDeleteSender = (id: string) => {
    const updated = senders.filter(s => s.id !== id);
    setSenders(updated);
    saveSenders(updated);
    showToast('Sender removed.');
  };

  const handleAddDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabName.trim()) return;
    const item: DestinationLabMaster = {
      id: `lab-${Date.now()}`,
      name: newLabName.trim(),
      city: newLabCity.trim(),
      department: newLabDept.trim(),
      phone: newLabPhone.trim()
    };
    const updated = [...destinations, item];
    setDestinations(updated);
    saveDestinations(updated);
    setNewLabName('');
    setNewLabPhone('');
    showToast(`Added destination ${item.name}.`);
  };

  const handleDeleteDestination = (id: string) => {
    const updated = destinations.filter(d => d.id !== id);
    setDestinations(updated);
    saveDestinations(updated);
    showToast('Destination lab removed.');
  };

  const handleAddCourier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourierName.trim()) return;
    const item: CourierMaster = {
      id: `cr-${Date.now()}`,
      name: newCourierName.trim(),
      transitMode: newCourierMode,
      vehicleOrDocket: newCourierVehicle.trim() || 'N/A',
      phone: newCourierPhone.trim()
    };
    const updated = [...couriers, item];
    setCouriers(updated);
    saveCouriers(updated);
    setNewCourierName('');
    setNewCourierVehicle('');
    setNewCourierPhone('');
    showToast(`Added courier / carrier ${item.name}.`);
  };

  const handleDeleteCourier = (id: string) => {
    const updated = couriers.filter(c => c.id !== id);
    setCouriers(updated);
    saveCouriers(updated);
    showToast('Courier removed.');
  };

  const handleSaveOrgSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveOrgSettings(orgSettings);
    showToast('Hospital cluster settings updated successfully.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh] sm:max-h-[85vh] animate-in slide-in-from-bottom duration-200">
        {/* Mobile Drag Handle */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm sm:text-base leading-tight">
                Admin Directory &amp; Hospital Management
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-1">
                Register and manage hospitals, senders, labs, and couriers
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

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`pb-2.5 px-3 font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'hospitals'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Hospitals &amp; CHCs ({facilities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('senders')}
            className={`pb-2.5 px-3 font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'senders'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>District In-Charge &amp; Officers ({senders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('destinations')}
            className={`pb-2.5 px-3 font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'destinations'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Guwahati Central Labs ({destinations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('couriers')}
            className={`pb-2.5 px-3 font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'couriers'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Couriers &amp; Vehicles ({couriers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-2.5 px-3 font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Cluster Settings</span>
          </button>
        </div>

        {/* Toast */}
        {notification && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 px-6 py-2 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 text-xs text-slate-800 max-h-[75vh] overflow-y-auto space-y-6">
          {/* TAB 1: HOSPITALS & CHCS */}
          {activeTab === 'hospitals' && (
            <div className="space-y-6">
              {/* Add form */}
              <form onSubmit={handleAddFacility} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>Register New Hospital or Community Health Centre (CHC)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Facility Name *</label>
                    <input
                      type="text"
                      required
                      value={newFacName}
                      onChange={(e) => setNewFacName(e.target.value)}
                      placeholder="e.g. CHC Chaygaon"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Facility Classification *</label>
                    <select
                      value={newFacType}
                      onChange={(e) => setNewFacType(e.target.value as FacilityMaster['facilityType'])}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="District Hospital">District Civil Hospital</option>
                      <option value="CHC">Community Health Centre (CHC)</option>
                      <option value="SDCH">Sub-Divisional Hospital (SDCH)</option>
                      <option value="PHC">Primary Health Centre (PHC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">District</label>
                    <input
                      type="text"
                      value={newFacDistrict}
                      onChange={(e) => setNewFacDistrict(e.target.value)}
                      placeholder="e.g. Kamrup Rural"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Official Contact Phone</label>
                    <input
                      type="tel"
                      value={newFacPhone}
                      onChange={(e) => setNewFacPhone(e.target.value)}
                      placeholder="+91 94350 00000"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center text-xs text-slate-500 pt-5">
                    <span>* Governed under unified District In-Charge ({orgSettings.inchargeName}).</span>
                  </div>
                </div>

                <div className="text-right pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Facility</span>
                  </button>
                </div>
              </form>

              {/* List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-semibold uppercase">
                      <th className="p-3">Hospital / CHC Name</th>
                      <th className="p-3">Type &amp; District</th>
                      <th className="p-3">District Authority</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {facilities.map((fac) => (
                      <tr key={fac.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">
                          {fac.name}
                        </td>
                        <td className="p-3 text-slate-600">
                          <span className="font-medium text-slate-800">{fac.facilityType}</span>
                          <span className="text-slate-400"> · </span>
                          <span>{fac.district}</span>
                        </td>
                        <td className="p-3 text-slate-600">
                          <div className="font-medium text-slate-800">{orgSettings.inchargeName}</div>
                          <div className="text-[11px] text-slate-500">
                            {fac.phone ? `Ph: ${fac.phone}` : 'District Cluster Authority'}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteFacility(fac.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Remove facility"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SENDERS & IN-CHARGES */}
          {activeTab === 'senders' && (
            <div className="space-y-6">
              <form onSubmit={handleAddSender} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>Register Hospital In-Charge / Sender Doctor</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Doctor / Officer Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newSenderName}
                      onChange={(e) => setNewSenderName(e.target.value)}
                      placeholder="e.g. Dr. P. P. Sharma"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Official Designation *</label>
                    <input
                      type="text"
                      required
                      value={newSenderDesignation}
                      onChange={(e) => setNewSenderDesignation(e.target.value)}
                      placeholder="e.g. Medical Superintendent"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Assigned Facility *</label>
                    <select
                      value={newSenderFacility}
                      onChange={(e) => setNewSenderFacility(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {facilities.map(f => (
                        <option key={f.id} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Phone Number</label>
                    <input
                      type="tel"
                      value={newSenderPhone}
                      onChange={(e) => setNewSenderPhone(e.target.value)}
                      placeholder="+91 94350 00000"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-end justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save Sender</span>
                    </button>
                  </div>
                </div>
              </form>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-semibold uppercase">
                      <th className="p-3">Sender Officer Name</th>
                      <th className="p-3">Designation</th>
                      <th className="p-3">Assigned Hospital / CHC</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {senders.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{s.name}</td>
                        <td className="p-3 text-slate-600">{s.designation}</td>
                        <td className="p-3 text-slate-800">{s.facility}</td>
                        <td className="p-3 font-mono text-slate-600">{s.phone || 'N/A'}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteSender(s.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: GUWAHATI DESTINATIONS */}
          {activeTab === 'destinations' && (
            <div className="space-y-6">
              <form onSubmit={handleAddDestination} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>Register Guwahati Receiving Lab / Directorate</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Facility / Lab Name *</label>
                    <input
                      type="text"
                      required
                      value={newLabName}
                      onChange={(e) => setNewLabName(e.target.value)}
                      placeholder="e.g. State Central Diagnostic Referral Lab"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Department / Counter *</label>
                    <input
                      type="text"
                      required
                      value={newLabDept}
                      onChange={(e) => setNewLabDept(e.target.value)}
                      placeholder="e.g. Counter #02 (Receiving Desk)"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">City</label>
                    <input
                      type="text"
                      value={newLabCity}
                      onChange={(e) => setNewLabCity(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Contact Phone</label>
                    <input
                      type="tel"
                      value={newLabPhone}
                      onChange={(e) => setNewLabPhone(e.target.value)}
                      placeholder="0361-2361092"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="text-right pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Lab</span>
                  </button>
                </div>
              </form>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-semibold uppercase">
                      <th className="p-3">Lab / Directorate Name</th>
                      <th className="p-3">Department &amp; Counter</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {destinations.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{d.name}</td>
                        <td className="p-3 text-slate-600">{d.department} ({d.city})</td>
                        <td className="p-3 font-mono text-slate-600">{d.phone || 'N/A'}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteDestination(d.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: COURIERS */}
          {activeTab === 'couriers' && (
            <div className="space-y-6">
              <form onSubmit={handleAddCourier} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>Register Carrier, Ambulance/Vehicle, or Courier</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Carrier / Driver Name *</label>
                    <input
                      type="text"
                      required
                      value={newCourierName}
                      onChange={(e) => setNewCourierName(e.target.value)}
                      placeholder="e.g. Biren Das"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Transit Mode *</label>
                    <select
                      value={newCourierMode}
                      onChange={(e) => setNewCourierMode(e.target.value as CourierMaster['transitMode'])}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="hospital_vehicle">Hospital Utility Van / Ambulance</option>
                      <option value="dedicated_rider">Dedicated Rider</option>
                      <option value="speed_post">India Post Speed Post</option>
                      <option value="courier_service">Private Courier</option>
                      <option value="staff_hand_carry">Deputed Hospital Staff</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Vehicle / Docket Number</label>
                    <input
                      type="text"
                      value={newCourierVehicle}
                      onChange={(e) => setNewCourierVehicle(e.target.value)}
                      placeholder="e.g. AS-01-HC-4022"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Phone Number</label>
                    <input
                      type="tel"
                      value={newCourierPhone}
                      onChange={(e) => setNewCourierPhone(e.target.value)}
                      placeholder="+91 94350 00000"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="text-right pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Courier</span>
                  </button>
                </div>
              </form>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-semibold uppercase">
                      <th className="p-3">Carrier / Driver</th>
                      <th className="p-3">Mode &amp; Vehicle</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {couriers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{c.name}</td>
                        <td className="p-3 text-slate-600">
                          <span className="capitalize">{c.transitMode.replace('_', ' ')}</span>
                          <span className="text-slate-400"> · </span>
                          <span className="font-mono">{c.vehicleOrDocket}</span>
                        </td>
                        <td className="p-3 font-mono text-slate-600">{c.phone}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteCourier(c.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CLUSTER & HEADER SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveOrgSettings} className="space-y-4 max-w-xl">
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-1">
                <div className="font-semibold text-blue-950">
                  Customizable Header &amp; Hospital Network Settings
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Customize the organization and in-charge title shown in the top header and on printable delivery vouchers.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">
                  Hospital Cluster / Network Name
                </label>
                <input
                  type="text"
                  required
                  value={orgSettings.networkName}
                  onChange={(e) => setOrgSettings({ ...orgSettings, networkName: e.target.value })}
                  placeholder="e.g. District Civil Hospital &amp; CHC Network"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">
                  In-Charge Officer Full Name
                </label>
                <input
                  type="text"
                  required
                  value={orgSettings.inchargeName}
                  onChange={(e) => setOrgSettings({ ...orgSettings, inchargeName: e.target.value })}
                  placeholder="e.g. Dr. P. P. Sharma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">
                  In-Charge Designation
                </label>
                <input
                  type="text"
                  required
                  value={orgSettings.inchargeDesignation}
                  onChange={(e) => setOrgSettings({ ...orgSettings, inchargeDesignation: e.target.value })}
                  placeholder="e.g. Medical Superintendent &amp; In-charge"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">
                  District / Jurisdiction
                </label>
                <input
                  type="text"
                  required
                  value={orgSettings.district}
                  onChange={(e) => setOrgSettings({ ...orgSettings, district: e.target.value })}
                  placeholder="e.g. Kamrup"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-2 shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Header &amp; Cluster Profile</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>All hospitals and senders added here appear immediately across dispatch forms and slips.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
