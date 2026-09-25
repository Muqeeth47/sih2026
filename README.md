# SAKSHYA AI (साक्ष्य AI) — सत्यमेव साक्ष्यम्
### Digital Companion for Field Drug Testing & Cryptographic Evidence Sealing Protocol

---

## 📋 Smart India Hackathon 2026 Details

* **Problem Statement ID:** 26231
* **Problem Statement Title:** Digital Companion for Field Drug Testing
* **Theme:** MedTech / BioTech / HealthTech
* **PS Category:** Software
* **Organization:** Narcotics Control Bureau (NCB), Ministry of Home Affairs (MHA), Government of India
* **Team ID:** 173635
* **Team Name:** Sudophiles
* **Live Deployment URL:** [https://sih2026-rust.vercel.app](https://sih2026-rust.vercel.app/)

---

## 🎯 1. What is SAKSHYA AI (साक्ष्य AI)?

**SAKSHYA AI (साक्ष्य AI)** (*सत्यमेव साक्ष्यम् — Truth is the Sole Evidence*) is an offline-first, mobile-friendly digital forensics companion built for anti-narcotics field interdictions under **Section 43 & 52 of the NDPS Act, 1985** and **Section 65B of the Bharatiya Sakshya Adhiniyam (BSA), 2023**.

It eliminates subjective human guesswork from field drug testing by turning any standard smartphone camera into an objective, court-admissible colorimetric spot-test reader:

1. **Step 1 — Rapid Color Match (100% Offline On-Device):**
   - Extracts chemical reaction color using chromatic clustering to isolate reacted dyes from white plastic packaging and ambient reflections.
   - Measures perceptual color distance in under a second using standard CIELAB colorimetry.
   - Automatically filters out living human skin, selfies, portraits, and hands with real-time retake guidance.
2. **Step 2 — AI Visual Verification (Multimodal Inspection):**
   - Double-checks that an authentic UNODC-standard field kit is framed in the camera.
   - Performs OCR on printed batch lot numbers and expiry dates, inspects packaging seals for physical tampering, and drafts formal Section 52 NDPS court statements.
   - Rejects non-pouch or unrelated background images automatically.
3. **Cryptographic Chain of Custody:**
   - Locks satellite GPS coordinates, timestamp, and officer badge ID.
   - Generates an immutable **SHA-256 digital fingerprint** of the raw evidence photo directly on the device.
4. **1-Click Certified Panchnama & Statutory PDF:**
   - Instant generation of Section 52 NDPS Form 'F' seizure memoranda and court-ready assay certificates with witness signatures.

---

## 👥 2. The 4-Tier Chain of Custody & Roles

```
[Field Officer (IO)]  ──► Takes Photo → Offline Color Match + AI Check → SHA-256 Seal
        │
        ▼ (Physical Sample Sent with Digital Docket)
[Forensic Lab (FSL)]   ──► Matches Physical Evidence to Photo Hash → Confirmatory Testing
        │
        ▼ (Case Verified & Forwarded)
[Zonal Director (HQ)]  ──► Real-Time Nationwide Seizure Map & Contraband Analytics
        │
        ▼ (Final Trial Exhibit & Pre-Trial Disposal Order)
[Special NDPS Court]   ──► Reviews Tamper-Proof Audit Trail under Sec 52 NDPS Act
```

| Role | Demo Badge | Demo PIN | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **Field Officer (IO)** | `NCB-IO-4092` | `7731` | Highway & raid interdictions, live camera spot testing, drafting Panchnama Form 'F'. |
| **Forensic Lab (FSL)** | `FSL-DL-8812` | `9044` | Confirmatory bench testing, digital-to-physical hash verification, reagent calibration. |
| **Zonal Director (HQ)** | `HQ-DIR-0001` | `1100` | Strategic oversight, nationwide seizure hotspot maps, batch escalation. |
| **Special NDPS Court** | `JUD-NDPS-2026` | `4432` | Judicial review of tamper-proof electronic evidence dossiers under Sec 52/52A NDPS Act. |

---

## 💻 3. Tech Stack

* **Frontend & Backend Framework:** Next.js (App Router, Turbopack, React 19, TypeScript)
* **Styling & UI Tokens:** Tailwind CSS + UX4G / GIGW Indian Government Design System (`#0f5ca8` NCB Blue)
* **On-Device Vision Engine:** Client-side canvas spectrophotometry (CIELAB colorimetry, Laplacian sharpness filter, specular glare filter)
* **Multimodal AI:** Google Gemini Vision API via `/api/drug-review` with automated multi-model failover
* **Database & Cloud Storage:** Supabase (PostgreSQL, encrypted storage bucket `forensic_reports`, Row Level Security)
* **Offline Storage Engine:** Browser-native IndexedDB (`ncb_drugseal_db`) with auto-sync on reconnect
* **PDF Report Engine:** jsPDF + autoTable (Statutory Form 'F' Panchnama & Certified Electronic Assay PDFs)
* **Geospatial Mapping:** Leaflet & React-Leaflet with OpenStreetMap tiles (Client-side interactive seizure map)
* **Multi-Language Accessibility:** 9 Indian languages support (English, हिन्दी, বাংলা, తెలుగు, मराठी, தமிழ், ગુજરાતી, ಕನ್ನಡ, ਪੰਜਾਬੀ)

---

## 🚀 4. Quick Start (Run Locally)

```bash
# 1. Clone the repository
git clone https://github.com/Muqeeth47/sih2026.git
cd sih2026

# 2. Install dependencies
npm install

# 3. Set up environment variables (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://prndinkwjyfphewqlhqv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_VjR-8A7agzuvqk1lOfp4AQ_ZGinc0ht
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.1-flash-lite

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 5. How to Test the Platform

1. **1-Click Demo Login:** Go to `/login`, click any role tab (Field IO, Forensic Lab, Zonal HQ, NDPS Court), and click **Quick Demo Login**.
2. **Field Chemical Scanner:**
   * In Field IO login, navigate to `/scanner`.
   * Select a test reagent (e.g., *Marquis*).
   * Test an image upload or point the live camera at a test pouch.
   * *Anti-Fraud Test:* Upload a random photo (face or desk) $\rightarrow$ the AI rejects the image immediately.
   * *Offline Test:* Disconnect Wi-Fi / Data $\rightarrow$ on-device color matching, GPS capture, and SHA-256 seal execute 100% offline.
3. **Export Statutory PDF & Panchnama:**
   * Click **Download Certified PDF** on the scan result card.
   * Click **Commit to Vault** $\rightarrow$ go to `/panchnama` to view the auto-populated seizure memo and click **Export Form 'F' PDF**.
4. **FSL Lab Queue & Calibration:**
   * Log in as **Forensic Lab (FSL)** $\rightarrow$ open `/fsl/vault` to inspect incoming field cases and test sample hashes.
   * Open `/fsl/calibration` to review standardized reagent calibration curves.
5. **Geospatial Seizure Map:**
   * Log in as **Zonal Director (HQ)** $\rightarrow$ open `/analytics`.
   * Click on any interactive red/green pin on the India map to inspect seized evidence photos, officer details, and download case reports.
6. **Judicial Case Review:**
   * Log in as **Special NDPS Court** $\rightarrow$ open `/court/legal` to review unalterable audit trails, Section 52 disposal orders, and Section 65B electronic evidence certificates.

---

*Developed by Team **Sudophiles** (Team ID: 173635) for Smart India Hackathon 2026.*
