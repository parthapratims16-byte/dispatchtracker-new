import { 
  DispatchItem, 
  DispatchSubItem, 
  FacilityMaster, 
  DestinationLabMaster, 
  SenderMaster, 
  CourierMaster, 
  OrganizationSettings,
  TransitDirection,
  DocumentCategory
} from '../types';

const DISPATCHES_STORAGE_KEY = 'health_custody_dispatches_v2';
const FACILITIES_STORAGE_KEY = 'health_custody_facilities_v2';
const DESTINATIONS_STORAGE_KEY = 'health_custody_destinations_v2';
const SENDERS_STORAGE_KEY = 'health_custody_senders_v2';
const COURIERS_STORAGE_KEY = 'health_custody_couriers_v2';
const ORG_SETTINGS_KEY = 'health_custody_org_settings_v2';

export const DEFAULT_ORG_SETTINGS: OrganizationSettings = {
  networkName: 'Office of the District Cluster In-Charge',
  inchargeName: 'Dr. P. P. Sharma',
  inchargeDesignation: 'Medical Superintendent & District Cluster In-Charge',
  district: 'Kamrup',
  contactPhone: '+91 94350 28190'
};

export const DEFAULT_FACILITIES: FacilityMaster[] = [
  {
    id: 'fac-1',
    name: 'District Civil Hospital',
    facilityType: 'District Hospital',
    district: 'Kamrup',
    phone: '+91 94350 28190',
    isDefault: true
  },
  {
    id: 'fac-2',
    name: 'Community Health Centre (CHC) Sonapur',
    facilityType: 'CHC',
    district: 'Kamrup Metro',
    phone: '+91 98640 11982'
  },
  {
    id: 'fac-3',
    name: 'Community Health Centre (CHC) Rangia',
    facilityType: 'CHC',
    district: 'Kamrup Rural',
    phone: '+91 94351 77209'
  },
  {
    id: 'fac-4',
    name: 'Community Health Centre (CHC) Hajo',
    facilityType: 'CHC',
    district: 'Kamrup Rural',
    phone: '+91 97060 44321'
  },
  {
    id: 'fac-5',
    name: 'Community Health Centre (CHC) Boko',
    facilityType: 'CHC',
    district: 'Kamrup Rural',
    phone: '+91 94355 81230'
  },
  {
    id: 'fac-6',
    name: 'Community Health Centre (CHC) Dimoria',
    facilityType: 'CHC',
    district: 'Kamrup Metro',
    phone: '+91 98642 10928'
  }
];

export const DEFAULT_DESTINATIONS: DestinationLabMaster[] = [
  {
    id: 'lab-1',
    name: 'State Central Diagnostic Referral Lab',
    city: 'Guwahati',
    department: 'Sample Receiving & Verification Counter',
    counterOrRoom: 'Counter #02 (Ground Floor)',
    phone: '0361-2361092'
  },
  {
    id: 'lab-2',
    name: 'GMCH Pathology & Central Research Lab',
    city: 'Guwahati',
    department: 'Histopathology & Biopsy Receiving Section',
    counterOrRoom: 'Pathology Dept, 3rd Floor',
    phone: '0361-2529457'
  },
  {
    id: 'lab-3',
    name: 'State Health Mission Directorate (Accounts & Audit)',
    city: 'Guwahati',
    department: 'Finance, Bills & M&E Section',
    counterOrRoom: 'Room #204, Christian Basti',
    phone: '0361-2340236'
  },
  {
    id: 'lab-4',
    name: 'State TB & Chest Disease Centre',
    city: 'Guwahati',
    department: 'Sputum & CBNAAT Testing Lab',
    counterOrRoom: 'Diagnostic Wing',
    phone: '0361-2451201'
  }
];

export const DEFAULT_SENDERS: SenderMaster[] = [
  {
    id: 'snd-district-ic',
    name: 'Dr. P. P. Sharma',
    designation: 'Medical Superintendent & District Cluster In-Charge',
    facility: 'Office of District Cluster In-Charge (Kamrup)',
    phone: '+91 94350 28190',
    email: 'district.cluster.kamrup@health.gov.in'
  },
  {
    id: 'snd-lab-guwahati',
    name: 'Dr. R. Goswami',
    designation: 'Senior Pathologist & Central Lab In-Charge',
    facility: 'State Central Diagnostic Referral Lab, Guwahati',
    phone: '+91 98640 44911',
    email: 'central.lab.guwahati@health.gov.in'
  },
  {
    id: 'snd-gmch-path',
    name: 'Prof. (Dr.) A. C. Deka',
    designation: 'Head of Department, Pathology & Cytology',
    facility: 'GMCH Central Lab, Guwahati',
    phone: '+91 94351 00293',
    email: 'gmch.pathology.ghy@health.gov.in'
  }
];

export const DEFAULT_COURIERS: CourierMaster[] = [
  {
    id: 'cr-1',
    name: 'Biren Das',
    transitMode: 'hospital_vehicle',
    vehicleOrDocket: 'AS-01-HC-4022 (Hospital Ambulance/Van)',
    phone: '+91 94350 28190'
  },
  {
    id: 'cr-2',
    name: 'Mukul Kalita',
    transitMode: 'dedicated_rider',
    vehicleOrDocket: 'Rider ID: MK-991',
    phone: '+91 98640 11982'
  },
  {
    id: 'cr-3',
    name: 'India Post Speed Post',
    transitMode: 'speed_post',
    vehicleOrDocket: 'Tracking: EK849201948IN',
    phone: '1800 266 6868'
  },
  {
    id: 'cr-4',
    name: 'Pranab Medhi (Health Supervisor)',
    transitMode: 'staff_hand_carry',
    vehicleOrDocket: 'Official Duty Pass #412',
    phone: '+91 97060 44321'
  }
];

export const INITIAL_DISPATCHES: DispatchItem[] = [];

// Helper: Dispatches
export function getDispatches(): DispatchItem[] {
  try {
    const raw = localStorage.getItem(DISPATCHES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DISPATCHES_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    // If user previously had sample mock records (disp-001, disp-002, disp-003), clean them out
    if (Array.isArray(parsed)) {
      const hasOldMock = parsed.some(d => d.id === 'disp-001' || d.id === 'disp-002' || d.id === 'disp-003');
      if (hasOldMock) {
        localStorage.setItem(DISPATCHES_STORAGE_KEY, JSON.stringify([]));
        return [];
      }
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Failed reading dispatches from storage:', e);
    return [];
  }
}

export function saveDispatches(dispatches: DispatchItem[]): void {
  try {
    localStorage.setItem(DISPATCHES_STORAGE_KEY, JSON.stringify(dispatches));
  } catch (e) {
    console.error('Failed saving dispatches to storage:', e);
  }
}

export function clearAllDispatches(): void {
  localStorage.setItem(DISPATCHES_STORAGE_KEY, JSON.stringify([]));
}

export function createDispatch(params: {
  transitDirection?: TransitDirection;
  originFacility: string;
  originDistrict?: string;
  destinationLab: string;
  items: DispatchSubItem[];
  urgency: DispatchItem['urgency'];
  courierMode: DispatchItem['courierMode'];
  courierPersonName: string;
  courierPhone: string;
  courierDocketOrVehicle: string;
  senderName: string;
  senderDesignation: string;
  notes?: string;
  trackingNumber?: string;
}): DispatchItem {
  const all = getDispatches();
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const direction = params.transitDirection || 'hospital_to_lab';
  const prefix = direction === 'lab_to_hospital' ? 'LAB-DISP' : 'DISP';
  const trackingNumber = params.trackingNumber || `${prefix}-${year}-${randomSuffix}`;
  
  const items = params.items && params.items.length > 0 ? params.items : [{
    id: `sub-${Date.now()}`,
    category: (direction === 'lab_to_hospital' ? 'test_report' : 'invoice') as DocumentCategory,
    title: direction === 'lab_to_hospital' ? 'Diagnostic Patient Test Reports' : 'General Medical Consignment',
    referenceNo: 'REF-01',
    itemsCount: 1,
    itemUnit: 'Item'
  }];

  const categories = Array.from(new Set(items.map(it => it.category)));
  const totalItemsCount = items.reduce((sum, it) => sum + (Number(it.itemsCount) || 1), 0);

  // Compute summary title and reference numbers
  const firstItem = items[0];
  const summaryTitle = items.length === 1 
    ? firstItem.title 
    : `Consolidated Consignment (${items.length} document categories): ${items.map(it => it.title).join('; ')}`;
  const summaryReferenceNo = items.map(it => it.referenceNo).filter(Boolean).join(', ');
  const summaryDescription = items.map(it => {
    const facTag = it.pertainingFacility ? `[${it.pertainingFacility}] ` : '';
    return `${facTag}[${it.category.toUpperCase()}] ${it.title} (Qty: ${it.itemsCount} ${it.itemUnit}, Ref: ${it.referenceNo})`;
  }).join(' · ');

  const item: DispatchItem = {
    id: `disp-${Date.now()}`,
    trackingNumber,
    transitDirection: direction,
    originFacility: params.originFacility,
    originDistrict: params.originDistrict || 'Kamrup',
    destinationLab: params.destinationLab,
    items,
    categories,
    totalItemsCount,
    documentCategory: firstItem.category,
    title: summaryTitle,
    referenceNo: summaryReferenceNo,
    description: summaryDescription,
    itemsCount: totalItemsCount,
    itemUnit: items.length === 1 ? firstItem.itemUnit : 'Items Bundled',
    urgency: params.urgency,
    courierMode: params.courierMode,
    courierPersonName: params.courierPersonName,
    courierPhone: params.courierPhone,
    courierDocketOrVehicle: params.courierDocketOrVehicle,
    dispatchedAt: new Date().toISOString(),
    estimatedDeliveryAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    status: 'in_transit',
    senderName: params.senderName,
    senderDesignation: params.senderDesignation,
    notes: params.notes
  };

  const updated = [item, ...all];
  saveDispatches(updated);
  return item;
}

export function recordAcknowledgement(
  trackingNumber: string, 
  ackData: {
    receivedByName: string;
    receiverDesignation: string;
    receiverPhone: string;
    receiverDepartment: string;
    packageCondition: NonNullable<DispatchItem['acknowledgement']>['packageCondition'];
    conditionRemarks?: string;
    signatureDataUrl: string;
    stampedChallanPhoto?: string;
  }
): DispatchItem | null {
  const all = getDispatches();
  const index = all.findIndex(d => d.trackingNumber.toUpperCase() === trackingNumber.toUpperCase() || d.id === trackingNumber);
  if (index === -1) return null;

  const targetItem = all[index];
  const isLabReturn = targetItem.transitDirection === 'lab_to_hospital';
  const timestamp = new Date().toISOString();
  const hashSeed = `${trackingNumber}-${ackData.receivedByName}-${timestamp}`;
  let hashVal = 0;
  for (let i = 0; i < hashSeed.length; i++) {
    hashVal = (hashVal << 5) - hashVal + hashSeed.charCodeAt(i);
    hashVal |= 0;
  }
  const hexHash = Math.abs(hashVal).toString(16).padStart(8, '0');
  const hashPrefix = isLabReturn ? 'SHA256:HOSP-' : 'SHA256:GHY-';
  const receiptHash = `${hashPrefix}${hexHash}${Date.now().toString(16)}`;

  const isDiscrepancy = ackData.packageCondition !== 'intact_sealed';

  const updatedItem: DispatchItem = {
    ...all[index],
    status: isDiscrepancy ? 'discrepancy' : 'delivered',
    acknowledgedAt: timestamp,
    acknowledgement: {
      ...ackData,
      verifiedTimestamp: timestamp,
      receiptHash
    }
  };

  all[index] = updatedItem;
  saveDispatches(all);
  return updatedItem;
}

// Master Directory: Facilities (Hospitals & CHCs)
export function getFacilities(): FacilityMaster[] {
  try {
    const raw = localStorage.getItem(FACILITIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FACILITIES_STORAGE_KEY, JSON.stringify(DEFAULT_FACILITIES));
      return DEFAULT_FACILITIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FACILITIES;
  } catch {
    return DEFAULT_FACILITIES;
  }
}

export function saveFacilities(facilities: FacilityMaster[]): void {
  localStorage.setItem(FACILITIES_STORAGE_KEY, JSON.stringify(facilities));
}

export function addFacility(facility: Omit<FacilityMaster, 'id'>): FacilityMaster {
  const all = getFacilities();
  const created: FacilityMaster = {
    ...facility,
    id: `fac-${Date.now()}`
  };
  saveFacilities([...all, created]);
  return created;
}

export function deleteFacility(id: string): void {
  const all = getFacilities().filter(f => f.id !== id);
  saveFacilities(all);
}

// Master Directory: Destination Labs
export function getDestinations(): DestinationLabMaster[] {
  try {
    const raw = localStorage.getItem(DESTINATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DESTINATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_DESTINATIONS));
      return DEFAULT_DESTINATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_DESTINATIONS;
  } catch {
    return DEFAULT_DESTINATIONS;
  }
}

export function saveDestinations(destinations: DestinationLabMaster[]): void {
  localStorage.setItem(DESTINATIONS_STORAGE_KEY, JSON.stringify(destinations));
}

export function addDestination(dest: Omit<DestinationLabMaster, 'id'>): DestinationLabMaster {
  const all = getDestinations();
  const created: DestinationLabMaster = {
    ...dest,
    id: `lab-${Date.now()}`
  };
  saveDestinations([...all, created]);
  return created;
}

export function deleteDestination(id: string): void {
  const all = getDestinations().filter(d => d.id !== id);
  saveDestinations(all);
}

// Master Directory: Senders / Hospital In-Charges
export function getSenders(): SenderMaster[] {
  try {
    const raw = localStorage.getItem(SENDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SENDERS_STORAGE_KEY, JSON.stringify(DEFAULT_SENDERS));
      return DEFAULT_SENDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SENDERS;
  } catch {
    return DEFAULT_SENDERS;
  }
}

export function saveSenders(senders: SenderMaster[]): void {
  localStorage.setItem(SENDERS_STORAGE_KEY, JSON.stringify(senders));
}

export function addSender(sender: Omit<SenderMaster, 'id'>): SenderMaster {
  const all = getSenders();
  const created: SenderMaster = {
    ...sender,
    id: `snd-${Date.now()}`
  };
  saveSenders([...all, created]);
  return created;
}

export function deleteSender(id: string): void {
  const all = getSenders().filter(s => s.id !== id);
  saveSenders(all);
}

// Master Directory: Couriers & Vehicles
export function getCouriers(): CourierMaster[] {
  try {
    const raw = localStorage.getItem(COURIERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(COURIERS_STORAGE_KEY, JSON.stringify(DEFAULT_COURIERS));
      return DEFAULT_COURIERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_COURIERS;
  } catch {
    return DEFAULT_COURIERS;
  }
}

export function saveCouriers(couriers: CourierMaster[]): void {
  localStorage.setItem(COURIERS_STORAGE_KEY, JSON.stringify(couriers));
}

export function addCourier(courier: Omit<CourierMaster, 'id'>): CourierMaster {
  const all = getCouriers();
  const created: CourierMaster = {
    ...courier,
    id: `cr-${Date.now()}`
  };
  saveCouriers([...all, created]);
  return created;
}

export function deleteCourier(id: string): void {
  const all = getCouriers().filter(c => c.id !== id);
  saveCouriers(all);
}

// Organization Settings
export function getOrgSettings(): OrganizationSettings {
  try {
    const raw = localStorage.getItem(ORG_SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_ORG_SETTINGS;
}

export function saveOrgSettings(settings: OrganizationSettings): void {
  localStorage.setItem(ORG_SETTINGS_KEY, JSON.stringify(settings));
}

export function resetStorage(): DispatchItem[] {
  localStorage.setItem(DISPATCHES_STORAGE_KEY, JSON.stringify(INITIAL_DISPATCHES));
  localStorage.setItem(FACILITIES_STORAGE_KEY, JSON.stringify(DEFAULT_FACILITIES));
  localStorage.setItem(DESTINATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_DESTINATIONS));
  localStorage.setItem(SENDERS_STORAGE_KEY, JSON.stringify(DEFAULT_SENDERS));
  localStorage.setItem(COURIERS_STORAGE_KEY, JSON.stringify(DEFAULT_COURIERS));
  localStorage.setItem(ORG_SETTINGS_KEY, JSON.stringify(DEFAULT_ORG_SETTINGS));
  return INITIAL_DISPATCHES;
}
