export type DocumentCategory = 
  | 'invoice' 
  | 'kpi_report' 
  | 'patient_sample' 
  | 'bill' 
  | 'official_memo'
  | 'test_report'
  | 'qc_feedback'
  | 'reimbursement_voucher';

export type TransitDirection = 'hospital_to_lab' | 'lab_to_hospital';

export type DispatchStatus = 
  | 'in_transit' 
  | 'delivered' 
  | 'delayed' 
  | 'discrepancy';

export type PackageCondition = 
  | 'intact_sealed' 
  | 'tampered_seal' 
  | 'damaged_outer' 
  | 'item_discrepancy';

export type CourierMode = 
  | 'hospital_vehicle' 
  | 'dedicated_rider' 
  | 'speed_post' 
  | 'courier_service' 
  | 'staff_hand_carry';

export type UrgencyLevel = 'routine' | 'urgent' | 'critical_stat';

export interface DispatchSubItem {
  id: string;
  category: DocumentCategory;
  title: string;
  referenceNo: string; // e.g. INV/2026/092, KPI/OCT/26, LAB/REP/4412
  itemsCount: number;
  itemUnit: string; // e.g. "Original Invoices", "Sample Tubes", "Reports"
  pertainingFacility?: string; // e.g. "Community Health Centre (CHC) Sonapur", "District Civil Hospital"
  description?: string;
}

export interface DispatchItem {
  id: string;
  trackingNumber: string; // e.g. DISP-2026-0842 or LAB-DISP-2026-0842
  transitDirection: TransitDirection; // 'hospital_to_lab' or 'lab_to_hospital'
  originFacility: string; // e.g. District Civil Hospital, CHC Sonapur, OR State Central Referral Lab
  originDistrict: string; // e.g. Kamrup
  destinationLab: string; // e.g. State Central Referral Lab, Guwahati OR District Civil Hospital, CHC Sonapur
  
  // Multiple document items in one transit consignment
  items: DispatchSubItem[];
  categories: DocumentCategory[];
  totalItemsCount: number;

  // Primary summary attributes for backwards compatibility & quick views
  documentCategory: DocumentCategory;
  title: string;
  referenceNo: string;
  description: string;
  itemsCount: number;
  itemUnit: string;

  urgency: UrgencyLevel;
  courierMode: CourierMode;
  courierPersonName: string;
  courierPhone: string;
  courierDocketOrVehicle: string;
  dispatchedAt: string; // ISO string
  estimatedDeliveryAt: string; // ISO string
  status: DispatchStatus;
  notes?: string;
  senderName: string;
  senderDesignation: string;
  acknowledgedAt?: string;
  acknowledgement?: {
    receivedByName: string;
    receiverDesignation: string;
    receiverPhone: string;
    receiverDepartment: string;
    packageCondition: PackageCondition;
    conditionRemarks?: string;
    signatureDataUrl: string; // Canvas base64 signature
    stampedChallanPhoto?: string;
    verifiedTimestamp: string;
    receiptHash: string;
  };
}

export interface FacilityMaster {
  id: string;
  name: string;
  facilityType: 'District Hospital' | 'CHC' | 'SDCH' | 'PHC' | 'Sub-Centre';
  district: string;
  phone?: string;
  isDefault?: boolean;
}

export interface DestinationLabMaster {
  id: string;
  name: string;
  city: string;
  department: string;
  counterOrRoom?: string;
  phone?: string;
}

export interface SenderMaster {
  id: string;
  name: string;
  designation: string;
  facility: string;
  phone?: string;
  email?: string;
}

export interface CourierMaster {
  id: string;
  name: string;
  transitMode: CourierMode;
  vehicleOrDocket: string;
  phone: string;
}

export interface OrganizationSettings {
  networkName: string; // e.g. "District Civil Hospital & CHC Cluster"
  inchargeName: string; // e.g. "Dr. P. P. Sharma"
  inchargeDesignation: string;
  district: string;
  contactPhone: string;
}

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConnected: boolean;
  lastTestedAt?: string;
  errorMessage?: string;
}
