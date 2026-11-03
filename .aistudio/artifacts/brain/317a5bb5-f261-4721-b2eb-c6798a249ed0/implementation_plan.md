# Medical Dispatch & Delivery Acknowledgement System (Guwahati Central Lab Chain-of-Custody)

A web portal and tracking system designed for the In-charge of District Civil Hospitals and Community Health Centres (CHCs) to record, track, and secure legally undeniable digital proof of delivery for invoices, monthly KPI reports, patient diagnostic samples, and bills sent to the Guwahati Central Referral Laboratory.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Key decisions confirmed from your responses and architectural requirements:
> - **Confirmed Scope**: Tracking specifically tailored for **Lab Invoices**, **Monthly KPI Reports**, **Patient Samples**, and **Official Hospital Bills** originating from District Hospitals and CHCs destined for Guwahati.
> - **Confirmed Database**: Direct Supabase client configuration with a ready-to-run PostgreSQL schema, automated table definitions, and row-level security (RLS) policies.
> - **Confirmed Hosting**: Cloudflare Pages / Workers static and edge deployment readiness (including build configurations and setup guide).
> - **Default Acknowledgement Flow**: Because Question 1 was skipped, the system implements a **dual receipt mechanism**:
>   1. **Direct Public/Lab QR Receipt Link**: The Guwahati lab receiver scans or opens a unique dispatch link, confirms package condition, enters receiver name & designation, draws their digital signature, and captures a stamped challan photo.
>   2. **In-Charge Dispatch & Dispute Dashboard**: Real-time status badges, transit aging alerts (>24h / >48h overdue warnings), exportable tamper-evident Proof-of-Delivery (PoD) receipts, and quick Supabase synchronization.

---

## 1. Overview & Core Concept

- **What It Does**: A specialized chain-of-custody tracking application that bridges healthcare dispatches between peripheral facilities (District Civil Hospitals, Sub-Divisional Hospitals, and Community Health Centres) and central facilities in Guwahati (such as the State Central Referral Lab, GMCH Pathology, and NHM Assam State Directorate). It records every consignment, generates QR-coded physical dispatch vouchers, alerts when packages are delayed in transit, and captures timestamped digital signatures with receiver credentials upon arrival.
- **Target Audience / Persona**:
  - *Hospital In-Charge & CHC Medical Officers*: Need immediate proof of dispatch and delivery to protect against delayed invoice clearance and lost diagnostic reports.
  - *Guwahati Central Lab Receiving Desk*: Needs an effortless 15-second mobile or desktop check-in screen to verify consignments, inspect seal integrity, and sign off.
- **Key Value**: Eliminates the "we never received it" dispute by replacing fragile physical registers with verifiable digital timestamps, geo-tagged delivery entries, digital signatures, and PDF-ready delivery certificates.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **New Dispatch Creation**:
   - The in-charge selects the Originating Facility (e.g. *District Civil Hospital, CHC Sonapur, CHC Rangia, CHC Dimoria*).
   - Chooses Category (*Lab Invoices*, *Monthly KPI Reports*, *Patient Diagnostic Samples*, *Hospital & Vendor Bills*).
   - Enters consignment details: Bill/Invoice reference numbers, courier/driver name, vehicle/transit docket number, urgency level, and optional photo upload of physical documents.
   - Submits to generate an instant Tracking Number (e.g., `AS-DISP-2026-0842`) and a printable Dispatch Slip with QR code.
2. **Transit Monitoring & Aging Dashboard**:
   - High-density tabular overview with filters by facility, document type, and delivery status (*In Transit*, *Acknowledged / Delivered*, *Delayed / Overdue*, *Condition Discrepancy*).
   - Real-time transit clock showing elapsed transit hours from dispatch time. Overdue items (>24h or >48h) highlighted for immediate telephone escalation.
3. **Guwahati Lab Receiving & Sign-Off Portal**:
   - Dedicated recipient view accessible via direct link or QR scan on the courier envelope.
   - The lab clerk or laboratory manager verifies contents, marks package status (*Intact / Sealed*, *Tampered Outer Envelope*, *Damaged / Broken Sample Vials*), enters their Full Name, Official Designation, and Phone/Emp ID, and signs in a touchscreen digital signature pad.
   - Submitting instantaneously marks the consignment as "Delivered & Acknowledged" with an immutable timestamp.
4. **Proof-of-Delivery (PoD) Certificate & Dispute Dossier**:
   - Generate a print-ready or exportable Official Acknowledgement Certificate containing dispatch timestamp, transit duration, receiving officer's signature, and condition remarks.
5. **Supabase & Cloudflare Configuration Modal**:
   - An intuitive settings pane to configure your Supabase Project URL & Anon Key, test database connectivity, copy the PostgreSQL schema migration script, and view Cloudflare Pages deployment instructions.

### Visual Identity & Theme

- **Aesthetic Direction**: Utilitarian, reliable healthcare logistics interface. Clean medical slate surfaces, crisp typography, and high information density tailored for busy hospital superintendents.
- **Color Palette & Discipline**:
  - *Dominant Canvas (60%)*: Crisp off-white (`#F8FAFC` light) with clean card containers (`#FFFFFF`).
  - *Structural Surfaces (30%)*: Deep slate borders (`#E2E8F0`), charcoal headers (`#0F172A`), and dark slate navigation (`#1E293B`).
  - *Accent Budget (10%)*: Medical cobalt blue (`#2563EB`) for primary CTAs and active tabs; semantic emerald (`#16A34A`) for verified receipts, amber (`#D97706`) for pending transit, and crimson (`#DC2626`) for overdue consignments.
- **Typography & Hierarchy**:
  - *Headings & Navigation*: `Plus Jakarta Sans` for modern structural clarity.
  - *Body Prose & Form Fields*: `DM Sans` for high legibility at 13px–15px.
  - *Consignment IDs & Timestamps*: `JetBrains Mono` with `tabular-nums` for precise alignment of tracking numbers, docket codes, and timestamps.
- **Component Styling & Layout**:
  - Zero-pill metadata discipline: clean unboxed text separated by subtle bullet points (`·`) rather than colorful badge sandwiches.
  - Generous 1440px desktop baseline with collapsible mobile navigation for on-the-go dispatch checks.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual-Storage Architecture (Local Offline-First + Direct Supabase Integration)**
  - *Chosen Approach*: The application works immediately out-of-the-box using browser persistent storage (`IndexedDB` / `localStorage`) loaded with realistic Assam healthcare sample data, while providing seamless direct synchronization to Supabase via `@supabase/supabase-js`.
  - *Why*: Allows you to test and demonstrate the full portal right away without waiting for external cloud provisioning, while providing the exact SQL code and direct connection strings to go live with your Supabase project in minutes.
  - *Alternatives Considered*: Requiring valid Supabase credentials before running any feature would lock the user out during evaluation.
- **Decision 2: Public Mobile-Friendly Lab Acknowledgment Page**
  - *Chosen Approach*: The receiving workflow can be tested either from a dedicated tab in the dashboard or via an isolated standalone receipt URL route (`?track=AS-DISP-XXXX&mode=receive`) that mimics what the Guwahati lab technician sees on their mobile phone or PC.
  - *Why*: The receiving lab staff does not need complex administrative access or login credentials to confirm a delivery—they only need a swift, authenticated signature screen to confirm what they received.
- **Decision 3: Cloudflare Pages Deployment Ready**
  - *Chosen Approach*: Configure the app as a standard Vite React single-page app (SPA) with Cloudflare Pages `_redirects` routing file, pre-configured build command `npm run build`, and copy-ready `.env` settings.
  - *Why*: Cloudflare Pages offers free, ultra-fast edge hosting in India (including Cloudflare Kolkata and Mumbai edge locations closest to Guwahati), zero-maintenance deployments, and instant integration with custom domains (e.g. `tracker.districthospital.assam.gov.in`).

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                   HOSPITAL IN-CHARGE WORKSPACE                         │
│  [ District Civil Hospital & CHCs: Sonapur, Rangia, Hajo, Boko ]        │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼                                 ▼
   ┌───────────────────────────────┐ ┌──────────────────────────────────┐
   │ New Dispatch & Consignment    │ │ Real-Time Transit Monitor        │
   │ - Lab Invoices & Bills        │ │ - Hours in Transit               │
   │ - Monthly KPI Reports         │ │ - Overdue / Alert Badges         │
   │ - Diagnostic Samples          │ │ - Proof-of-Delivery Certificates │
   │ - QR Code & Slip Generator    │ └──────────────────────────────────┘
   └───────────────┬───────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  PHYSICAL TRANSIT & DISPATCH SLIP                      │
│     Consignment Number: AS-DISP-2026-0842 | QR Code Link              │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                GUWAHATI CENTRAL LAB RECEIVING SCREEN                   │
│  - Verify Package Condition (Intact / Damaged / Missing items)         │
│  - Recipient Officer Name, Designation & Phone / Staff ID              │
│  - Canvas Touchscreen Digital Signature & Stamped Challan Photo        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   DATA PERSISTENCE & DEPLOYMENT LAYER                  │
│  ┌──────────────────────────────┐     ┌─────────────────────────────┐  │
│  │ Supabase Client (PostgreSQL) │     │ Cloudflare Pages Hosting    │  │
│  │ - RLS Policies               │     │ - SPA Redirects (_redirects)│  │
│  │ - Realtime Subscriptions     │     │ - Global Edge CDN           │  │
│  │ - SQL Migration Scripts      │     │ - Zero-Cold-Start Delivery  │  │
│  └──────────────────────────────┘     └─────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### PostgreSQL / Supabase Schema Design

The application will include the full, tested SQL script to run directly in your Supabase SQL Editor:

```sql
-- 1. Dispatches table
create table if not exists dispatches (
  id uuid primary key default gen_random_uuid(),
  tracking_number text unique not null,
  origin_facility text not null,       -- e.g. "District Civil Hospital", "CHC Sonapur"
  destination_lab text not null,       -- e.g. "State Central Diagnostic Lab, Guwahati"
  document_category text not null,     -- "invoice", "kpi_report", "patient_sample", "bill"
  title text not null,
  description text,
  items_count integer default 1,
  courier_mode text not null,          -- "Hospital Vehicle", "Dedicated Rider", "Speed Post", "Private Courier"
  courier_person_name text,
  courier_phone text,
  courier_docket_no text,
  status text not null default 'in_transit', -- 'in_transit', 'delivered', 'disputed'
  dispatched_at timestamp with time zone default timezone('utc'::text, now()) not null,
  estimated_delivery timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Delivery Acknowledgements table
create table if not exists acknowledgements (
  id uuid primary key default gen_random_uuid(),
  dispatch_id uuid references dispatches(id) on delete cascade,
  tracking_number text not null,
  received_by_name text not null,
  receiver_designation text not null,
  receiver_contact text,
  package_condition text not null,    -- "intact_sealed", "seal_broken", "partially_damaged", "discrepancy"
  condition_remarks text,
  signature_data_url text not null,   -- Base64 digital signature
  photo_proof_url text,               -- Photo of physical stamp / challan
  acknowledged_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Facilities Directory table
create table if not exists facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  facility_type text not null,        -- "District Hospital", "CHC", "Sub-Divisional Hospital", "Central Lab"
  district text not null default 'Kamrup',
  location text not null,
  incharge_name text,
  contact_phone text
);
```

### Interactive Component & State Mapping

1. **`Navbar`**: Single-line wordmark ("Assam Health Custody"), facility indicator, direct quick-switch between *Dispatch Console*, *Transit Board*, *Guwahati Lab Acknowledgment Screen*, and *Supabase / Cloudflare Setup*.
2. **`DispatchBoard`**: Multi-facility overview with quick counters for Active Transits, Overdue Dispatches, Delivered Today, and Discrepancies. High-density filterable table with search by Consignment #, Courier, or Document type.
3. **`NewDispatchModal`**: Comprehensive form with validation, automatic tracking ID generation, attachment preview, and print slip generator.
4. **`LabReceiptPortal`**: Interactive receiving interface with condition checkboxes, recipient validation, HTML5 canvas signature pad with clear/save actions, and instantaneous state confirmation.
5. **`ProofOfDeliveryModal`**: Official document view with QR code, tamper verification seal, timeline of custody transfer, and one-click "Print / Export PDF" trigger.
6. **`SupabaseCloudflareGuide`**: Interactive configuration panel allowing the user to paste their Supabase credentials, test the connection live, copy the SQL migration script with 1-click, and download Cloudflare Pages configuration files (`_redirects`, `wrangler.toml`).
