/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MetricsOverview } from './components/MetricsOverview';
import { DispatchList } from './components/DispatchList';
import { TransitAgingView } from './components/TransitAgingView';
import { LabReceiptPortal } from './components/LabReceiptPortal';
import { NewDispatchModal } from './components/NewDispatchModal';
import { ProofOfDeliveryModal } from './components/ProofOfDeliveryModal';
import { DispatchSlipModal } from './components/DispatchSlipModal';
import { SupabaseCloudflareModal } from './components/SupabaseCloudflareModal';
import { AdminDirectoryModal } from './components/AdminDirectoryModal';
import { DispatchItem, OrganizationSettings, TransitDirection } from './types';
import { getDispatches, getOrgSettings, resetStorage } from './lib/storage';
import { getStoredSupabaseConfig } from './lib/supabase';
import { 
  Building2, 
  Plus, 
  RotateCcw, 
  CheckCircle2, 
  ExternalLink,
  Users,
  FlaskConical
} from 'lucide-react';

export default function App() {
  const [dispatches, setDispatches] = useState<DispatchItem[]>([]);
  const [activeTab, setActiveTab] = useState<'dispatches' | 'aging' | 'lab_receipt' | 'settings'>('dispatches');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  
  // Organization / Header settings
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings>(getOrgSettings());

  // Modals state
  const [isNewDispatchOpen, setIsNewDispatchOpen] = useState(false);
  const [newDispatchDirection, setNewDispatchDirection] = useState<TransitDirection>('hospital_to_lab');
  const [isAdminDirectoryOpen, setIsAdminDirectoryOpen] = useState(false);
  const [activePoDDispatch, setActivePoDDispatch] = useState<DispatchItem | null>(null);
  const [activeSlipDispatch, setActiveSlipDispatch] = useState<DispatchItem | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [labPreselectedDispatch, setLabPreselectedDispatch] = useState<DispatchItem | null>(null);
  const [notification, setNotification] = useState<{ title: string; message: string; type: 'success' | 'info' } | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Load initial data and check URL parameters
  useEffect(() => {
    const loaded = getDispatches();
    setDispatches(loaded);
    setOrgSettings(getOrgSettings());

    const config = getStoredSupabaseConfig();
    setIsSupabaseConnected(config.isConnected);

    // Check for query parameters e.g. ?track=DISP-XXXX&mode=receive
    const params = new URLSearchParams(window.location.search);
    const trackParam = params.get('track');
    const modeParam = params.get('mode');

    if (trackParam) {
      const match = loaded.find(d => d.trackingNumber.toUpperCase() === trackParam.toUpperCase());
      if (match) {
        if (modeParam === 'receive') {
          setActiveTab('lab_receipt');
          setLabPreselectedDispatch(match);
        } else if (modeParam === 'pod' && match.status === 'delivered') {
          setActivePoDDispatch(match);
        } else if (modeParam === 'slip') {
          setActiveSlipDispatch(match);
        }
      }
    }
  }, []);

  const refreshDispatches = () => {
    const updated = getDispatches();
    setDispatches(updated);
    setOrgSettings(getOrgSettings());
  };

  const handleCreatedDispatch = (newItem: DispatchItem) => {
    refreshDispatches();
    setIsNewDispatchOpen(false);
    setActiveSlipDispatch(newItem);
    setNotification({
      title: 'Consignment Created Successfully',
      message: `Transit #${newItem.trackingNumber} generated with ${newItem.items?.length || 1} bundled categories. Printable voucher is ready.`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAcknowledgeSuccess = (acknowledgedItem: DispatchItem) => {
    refreshDispatches();
    setActiveTab('dispatches');
    setActivePoDDispatch(acknowledgedItem);
    setNotification({
      title: 'Proof of Delivery Locked & Authenticated',
      message: `Guwahati Central Lab confirmed receipt of ${acknowledgedItem.trackingNumber}. All bundled documents signed.`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 6000);
  };

  const handleClearAllDispatches = () => {
    if (window.confirm('Clear all dispatches? This will remove all records from this browser.')) {
      import('./lib/storage').then(({ clearAllDispatches }) => {
        clearAllDispatches();
        setDispatches([]);
        setNotification({
          title: 'Ledger Cleared',
          message: 'All sample and test dispatches removed. Ready for live records.',
          type: 'info'
        });
        setTimeout(() => setNotification(null), 4000);
      });
    }
  };

  // Metrics counts
  const inTransitCount = dispatches.filter(d => d.status === 'in_transit' || d.status === 'delayed').length;
  const overdueCount = dispatches.filter(d => {
    if (d.status === 'delivered') return false;
    const hours = (Date.now() - new Date(d.dispatchedAt).getTime()) / (1000 * 3600);
    return hours >= 24;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'settings') {
            setIsSupabaseModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenNewDispatch={() => {
          setNewDispatchDirection('hospital_to_lab');
          setIsNewDispatchOpen(true);
        }}
        onOpenLabDispatch={() => {
          setNewDispatchDirection('lab_to_hospital');
          setIsNewDispatchOpen(true);
        }}
        onOpenAdminDirectory={() => setIsAdminDirectoryOpen(true)}
        overdueCount={overdueCount}
        inTransitCount={inTransitCount}
        isSupabaseConnected={isSupabaseConnected}
        orgSettings={orgSettings}
      />

      {/* Toast Notification Banner */}
      {notification && (
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 pt-3 sm:pt-4 w-full">
          <div className="bg-emerald-600 text-white p-3 sm:p-3.5 rounded-xl shadow-xs flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <div>
                <span className="font-bold">{notification.title}:</span>{' '}
                <span>{notification.message}</span>
              </div>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-white/80 hover:text-white font-medium min-h-[36px] px-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Viewport Container (with pb-24 for fixed mobile bottom nav bar) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24 md:pb-8">
        {/* TAB 1: DISPATCHES & LEDGER */}
        {activeTab === 'dispatches' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Context Heading */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-lg sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
                  {orgSettings.networkName} Consignment Ledger
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Custody tracking for Invoices, Monthly KPIs, Patient Specimens, Bills, and Central Lab Test Reports.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsAdminDirectoryOpen(true)}
                  className="min-h-[40px] px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs font-medium touch-manipulation"
                  title="Manage hospitals, senders, labs, and couriers"
                >
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Admin Directory</span>
                </button>

                {dispatches.length > 0 && (
                  <button
                    onClick={handleClearAllDispatches}
                    className="min-h-[40px] px-3 py-1.5 text-xs text-slate-500 hover:text-rose-600 bg-white border border-slate-200 rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-1.5 shadow-2xs touch-manipulation"
                    title="Clear dispatches"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Records</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setNewDispatchDirection('lab_to_hospital');
                    setIsNewDispatchOpen(true);
                  }}
                  className="min-h-[40px] px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs touch-manipulation"
                  title="Open Central Lab outward dispatch window"
                >
                  <FlaskConical className="w-4 h-4 text-indigo-600" />
                  <span>Lab Dispatch Window</span>
                </button>

                <button
                  onClick={() => {
                    setNewDispatchDirection('hospital_to_lab');
                    setIsNewDispatchOpen(true);
                  }}
                  className="min-h-[40px] px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs touch-manipulation"
                >
                  <Plus className="w-4 h-4" />
                  <span>Record Dispatch</span>
                </button>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <MetricsOverview
              dispatches={dispatches}
              onSelectFilter={(status) => {
                setSelectedStatusFilter(status);
              }}
            />

            {/* Dispatches High Density Table */}
            <DispatchList
              dispatches={dispatches}
              selectedStatusFilter={selectedStatusFilter}
              onViewPoD={(item) => setActivePoDDispatch(item)}
              onPrintSlip={(item) => setActiveSlipDispatch(item)}
              onOpenLabCheckIn={(item) => {
                setLabPreselectedDispatch(item);
                setActiveTab('lab_receipt');
              }}
              onOpenNewDispatch={() => {
                setNewDispatchDirection('hospital_to_lab');
                setIsNewDispatchOpen(true);
              }}
              onOpenLabDispatch={() => {
                setNewDispatchDirection('lab_to_hospital');
                setIsNewDispatchOpen(true);
              }}
            />
          </div>
        )}

        {/* TAB 2: TRANSIT AGING & OVERDUE */}
        {activeTab === 'aging' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
                  Guwahati Transit Aging &amp; Overdue Monitor
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proactive tracking of elapsed transit hours to prevent receiving labs from claiming non-receipt.
                </p>
              </div>
            </div>

            <TransitAgingView
              dispatches={dispatches}
              onOpenLabCheckIn={(item) => {
                setLabPreselectedDispatch(item);
                setActiveTab('lab_receipt');
              }}
              onViewPoD={(item) => setActivePoDDispatch(item)}
            />
          </div>
        )}

        {/* TAB 3: GUWAHATI LAB RECEIVING DESK */}
        {activeTab === 'lab_receipt' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
                  Guwahati Central Referral Lab Receiving Desk
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Check-in portal for receiving clerks, pathologists, and finance officers in Guwahati to verify seals and sign receipts for all bundled documents.
                </p>
              </div>
            </div>

            <LabReceiptPortal
              dispatches={dispatches}
              preselectedDispatch={labPreselectedDispatch}
              onAcknowledgeSuccess={handleAcknowledgeSuccess}
              onCancel={() => setActiveTab('dispatches')}
              onOpenLabDispatch={() => {
                setNewDispatchDirection('lab_to_hospital');
                setIsNewDispatchOpen(true);
              }}
            />
          </div>
        )}
      </main>

      {/* Footer (Clean, configurable) */}
      <footer className="no-print bg-white border-t border-slate-200 mt-auto py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>{orgSettings.networkName} · Central Custody System</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAdminDirectoryOpen(true)}
              className="text-slate-600 hover:text-slate-900 font-medium hover:underline flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Admin Directory</span>
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1"
            >
              <span>Supabase SQL &amp; Cloudflare Pages Guide</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <span className="text-slate-300">·</span>
            <span>v2.0 (Multi-Document Audit)</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isNewDispatchOpen && (
        <NewDispatchModal
          initialDirection={newDispatchDirection}
          onClose={() => setIsNewDispatchOpen(false)}
          onCreated={handleCreatedDispatch}
        />
      )}

      {isAdminDirectoryOpen && (
        <AdminDirectoryModal
          onClose={() => setIsAdminDirectoryOpen(false)}
          onDataChanged={refreshDispatches}
        />
      )}

      {activePoDDispatch && (
        <ProofOfDeliveryModal
          dispatch={activePoDDispatch}
          onClose={() => setActivePoDDispatch(null)}
        />
      )}

      {activeSlipDispatch && (
        <DispatchSlipModal
          dispatch={activeSlipDispatch}
          onClose={() => setActiveSlipDispatch(null)}
        />
      )}

      {isSupabaseModalOpen && (
        <SupabaseCloudflareModal
          onClose={() => setIsSupabaseModalOpen(false)}
          onConnectionChange={(connected) => setIsSupabaseConnected(connected)}
        />
      )}
    </div>
  );
}
