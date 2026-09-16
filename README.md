# SAKSHYA AI (साक्ष्य AI) — सत्यमेव साक्ष्यम्
### Narcotics Field Colorimetric Assay & Cryptographic Evidence Sealing Protocol

**Smart India Hackathon 2026**  
* **Team Name:** Sudophiles  
* **Problem Statement ID:** SIH26231  
* **Organization:** Narcotics Control Bureau (NCB), Ministry of Home Affairs (MHA), Government of India  
* **Live Deployment:** [https://drug-seal-ai.vercel.app](https://drug-seal-ai.vercel.app) | [https://sih2026-rust.vercel.app](https://sih2026-rust.vercel.app)

---

## 🎯 What is SAKSHYA AI (साक्ष्य AI)?
**SAKSHYA AI (साक्ष्य AI)** (*सत्यमेव साक्ष्यम् — Truth is the Sole Evidence*) is a field forensics companion built for narcotics interdictions under **Section 43 & 52 of the NDPS Act, 1985** and **Section 65B of the Bharatiya Sakshya Adhiniyam (BSA), 2023**. It turns any standard smartphone camera into a calibrated chemical spot-test reader:

1. **Step 1 — Rapid Color Match (On-Device OpenCV Colorimetry):**
   - Extracts chemical reaction color using **Chroma Clustering** ($C^* = \sqrt{a^2 + b^2}$) to isolate fluid dyes from white plastic packaging and background reflections.
   - Measures perceptual color distance using **CIELAB $\Delta E_{2000}$** in under 5ms, 100% offline.
   - Rejects living human tissue, selfies, portraits, and hands via an integrated **Skin-Locus Biometric Discriminator**.
2. **Step 2 — AI Visual Verification (Cloud Gemini Vision):**
   - Independent multimodal computer vision that verifies test kit presence, detects puncture/tear package tampering, performs OCR on batch lot/expiry numbers, and drafts statutory Section 52 NDPS court statements.
   - If cloud is unreachable, falls back seamlessly to an on-device safety engine.
3. **Cryptographic Chain of Custody:** Generates an immutable SHA-256 photo hash and records GPS coordinates at the moment of interdiction.
4. **1-Click Certified Panchnama & PDF:** Instant generation of Section 52 NDPS Form 'F' seizure memoranda and court-ready assay certificates with embedded photos.

---

## 👥 The 4 Roles & System Flow

```
[Field Officer (IO)]  ──► Takes photo → Step 1 Color Match + Step 2 AI Check → Seals evidence
        │
        ▼ (If disputed or physical re-test needed)
[Forensic Lab (FSL)]   ──► Compares digital assay to physical vial → Confirms or flags mismatch
        │
        ▼ (If digital ≠ physical mismatch found)
[Zonal Director (HQ)]  ──► Reviews full custody dossier + strategic statewide seizure heatmaps
        │
        ▼ (For final trial exhibit & disposal order)
[Special NDPS Court]   ──► Reads immutable SHA-256 dossier under Section 52A NDPS Act
```

| Role | Badge / ID | PIN | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **Field Officer (IO)** | `NCB-IO-4092` | `7731` | Highway interdictions, live camera spot testing, drafting Panchnama Form 'F'. |
| **Forensic Lab (FSL)** | `FSL-DL-8812` | `9044` | Confirmatory bench testing, escalation reviews, color calibration. |
| **Zonal Director (HQ)** | `HQ-DIR-0001` | `1100` | Strategic oversight, statewide interdiction heatmaps, disposal authorizations. |
| **NDPS Court Reader** | `JUD-NDPS-2026` | `4432` | Judicial review of tamper-proof evidence dossiers under Sec 52/52A NDPS Act. |

---

## 💻 Tech Stack
* **Framework:** Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
* **Styling:** Tailwind CSS + Custom Government Light Theme (`#0f5ca8` NCB Blue)
* **On-Device Vision:** Client-side canvas spectrophotometry (CIELAB $\Delta E_{2000}$, Laplacian sharpness, glare filter)
* **Cloud AI:** Google Gemini 1.5 Flash Multimodal API proxy (`/api/drug-review`)
* **Database & Storage:** Supabase (PostgreSQL, Storage bucket `forensic_reports`, Row Level Security)
* **Offline Queue:** IndexedDB with auto-sync
* **PDF Engine:** jsPDF + autoTable (Official Form 'F' Panchnama & Certified Assay PDF)
* **Maps:** Leaflet & React-Leaflet (Live GPS interdiction pin clusters)
* **Accessibility:** 9 Indian languages dropdown (EN, हिन्दी, বাংলা, తెలుగు, मराठी, தமிழ், ગુજરાતી, ಕನ್ನಡ, ਪੰਜਾਬੀ)

---

## 🚀 Quick Start (Run Locally)

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

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 How to Test Features One-by-One

1. **1-Click Demo Login:** Go to `/login`, tap any of the 4 role tabs (Field IO, Forensic FSL, Zonal HQ, NDPS Court), and tap **Quick Demo Login**.
2. **Field Scanner:** In Field IO login, go to `/scanner`. Select a reagent (e.g. *Marquis*), point camera or tap **Upload Image**.
   * *Blur Test:* Upload a blurry image $\rightarrow$ system automatically blocks analysis and displays the sharpness score.
   * *Clear Test:* Upload a test pouch photo $\rightarrow$ Step 1 (Color Match) and Step 2 (Gemini AI Review) will execute.
3. **Export Certified PDF:** On the result screen, click **Download Certified PDF** to download the official report with embedded photo and signature blocks.
4. **Draft Panchnama:** Click **Commit to Vault**, then go to `/panchnama` to view the auto-populated Form 'F' seizure memo and tap **Export Form 'F' PDF**.
5. **Evidence Vault & Escalation:** Go to `/vault`. See the case with photo thumbnail, Step 1 & Step 2 panels, and SHA-256 hash. Click **Escalate to FSL Lab** to forward the case.
6. **Zonal Intelligence Map:** Login as **Zonal Director (HQ)** and go to `/analytics`. View live statewide GPS pins on the Leaflet map; click any pin to see the photo and case details.
7. **Multi-Language Accessibility:** In the top navigation bar, click the Globe dropdown and switch to any of the 9 Indian languages.

---
*Developed with pride by Team **Sudophiles** for Smart India Hackathon 2026.*
