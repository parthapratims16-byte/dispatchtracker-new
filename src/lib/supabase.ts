import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DispatchItem, SupabaseConfig } from '../types';

const SUPABASE_CONFIG_KEY = 'assam_health_supabase_config_v1';

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed reading Supabase config', e);
  }

  // Fallback to Vite environment variables if available
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  return {
    supabaseUrl: envUrl,
    supabaseAnonKey: envKey,
    isConnected: false
  };
}

export function saveStoredSupabaseConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed storing Supabase config', e);
  }
}

export function getSupabaseClient(config?: SupabaseConfig): SupabaseClient | null {
  const currentConfig = config || getStoredSupabaseConfig();
  if (!currentConfig.supabaseUrl || !currentConfig.supabaseAnonKey) {
    return null;
  }
  try {
    return createClient(currentConfig.supabaseUrl, currentConfig.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  } catch (err) {
    console.error('Error creating Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  if (!url || !key) {
    return { success: false, message: 'Please provide both Supabase Project URL and Anon Key.' };
  }
  try {
    const client = createClient(url, key);
    // Attempt a light query to test connection
    const { data, error } = await client.from('dispatches').select('id').limit(1);
    
    if (error) {
      // If table doesn't exist yet, connection is still technically valid but tables need creation
      if (error.code === 'PGRST116' || error.message.includes('does not exist') || error.code === '42P01') {
        return { 
          success: true, 
          message: 'Connected to Supabase! (Note: tables not found yet; run the SQL schema script below to create them).' 
        };
      }
      return { success: false, message: `Supabase returned an error: ${error.message}` };
    }
    return { success: true, message: `Connected successfully! Table found with ${data?.length ?? 0} existing records.` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network connection failed' };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- ====================================================================
-- HEALTHCARE CHAIN-OF-CUSTODY & MULTI-DOCUMENT DISPATCH SCHEMA
-- Central Lab Delivery & Acknowledgment Audit Registry
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ====================================================================

-- 1. Dispatches Master Table (Supports multi-category documents in one transit)
CREATE TABLE IF NOT EXISTS public.dispatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number TEXT UNIQUE NOT NULL,
  origin_facility TEXT NOT NULL,
  origin_district TEXT NOT NULL DEFAULT 'Kamrup',
  destination_lab TEXT NOT NULL DEFAULT 'State Central Diagnostic Referral Lab, Guwahati',
  
  -- Multi-document items in this transit parcel
  items JSONB DEFAULT '[]'::jsonb NOT NULL,
  categories TEXT[] DEFAULT '{}'::text[] NOT NULL,
  total_items_count INTEGER DEFAULT 1 NOT NULL,

  -- Primary summary fields
  document_category TEXT NOT NULL CHECK (document_category IN ('invoice', 'kpi_report', 'patient_sample', 'bill', 'official_memo')),
  title TEXT NOT NULL,
  reference_no TEXT NOT NULL,
  description TEXT,
  items_count INTEGER DEFAULT 1 NOT NULL,
  item_unit TEXT DEFAULT 'Items',
  urgency TEXT DEFAULT 'routine' CHECK (urgency IN ('routine', 'urgent', 'critical_stat')),
  courier_mode TEXT NOT NULL,
  courier_person_name TEXT NOT NULL,
  courier_phone TEXT,
  courier_docket_or_vehicle TEXT,
  sender_name TEXT NOT NULL,
  sender_designation TEXT NOT NULL,
  status TEXT DEFAULT 'in_transit' CHECK (status IN ('in_transit', 'delivered', 'delayed', 'discrepancy')),
  notes TEXT,
  dispatched_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  estimated_delivery_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Master Directories: Facilities, Destinations, Senders, Couriers
CREATE TABLE IF NOT EXISTS public.facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  facility_type TEXT NOT NULL,
  district TEXT NOT NULL,
  default_incharge TEXT,
  incharge_designation TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Guwahati',
  department TEXT NOT NULL,
  counter_or_room TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.senders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  facility TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.couriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  transit_mode TEXT NOT NULL,
  vehicle_or_docket TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Delivery Acknowledgements Table (Proof of Delivery / Chain of Custody)
CREATE TABLE IF NOT EXISTS public.acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_id UUID REFERENCES public.dispatches(id) ON DELETE CASCADE,
  tracking_number TEXT NOT NULL,
  received_by_name TEXT NOT NULL,
  receiver_designation TEXT NOT NULL,
  receiver_phone TEXT,
  receiver_department TEXT,
  package_condition TEXT NOT NULL CHECK (package_condition IN ('intact_sealed', 'tampered_seal', 'damaged_outer', 'item_discrepancy')),
  condition_remarks TEXT,
  signature_data_url TEXT NOT NULL,
  stamped_challan_photo TEXT,
  receipt_hash TEXT NOT NULL,
  verified_timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Automatic Status Update Trigger
-- When an acknowledgement is saved, automatically mark the dispatch as delivered or discrepancy
CREATE OR REPLACE FUNCTION public.handle_acknowledgement_sync()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.dispatches
  SET status = CASE 
    WHEN NEW.package_condition = 'intact_sealed' THEN 'delivered'
    ELSE 'discrepancy'
  END
  WHERE tracking_number = NEW.tracking_number OR id = NEW.dispatch_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_acknowledgement_created ON public.acknowledgements;
CREATE TRIGGER on_acknowledgement_created
  AFTER INSERT ON public.acknowledgements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_acknowledgement_sync();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acknowledgements ENABLE ROW LEVEL SECURITY;

-- 5. Public / Hospital Staff Access Policies (Allows read & write with Anon Key)
CREATE POLICY "Allow public read access to dispatches"
  ON public.dispatches FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated and anonymous insert to dispatches"
  ON public.dispatches FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update to dispatches"
  ON public.dispatches FOR UPDATE
  USING (true);

CREATE POLICY "Allow public read access to acknowledgements"
  ON public.acknowledgements FOR SELECT
  USING (true);

CREATE POLICY "Allow insert to acknowledgements"
  ON public.acknowledgements FOR INSERT
  WITH CHECK (true);

-- 6. High-Performance Indexing for Tracking Number Lookups
CREATE INDEX IF NOT EXISTS idx_dispatches_tracking ON public.dispatches(tracking_number);
CREATE INDEX IF NOT EXISTS idx_dispatches_status ON public.dispatches(status);
CREATE INDEX IF NOT EXISTS idx_dispatches_origin ON public.dispatches(origin_facility);
CREATE INDEX IF NOT EXISTS idx_ack_tracking ON public.acknowledgements(tracking_number);
`;
