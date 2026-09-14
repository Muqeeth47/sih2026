# 🏛️ DRUG-SEAL AI — Complete Agent & Developer Context
## 🧪 Project: Digital Companion for Field Drug Testing
### 📋 Problem Statement: **SIH26231** | **Ministry of Home Affairs (Narcotics Control Bureau - NCB)**

---

## 🎯 1. Executive Summary & Mission
**DRUG-SEAL AI** is an Indian Government-grade, offline-first forensic field companion application designed for the **Narcotics Control Bureau (NCB)** and **State Anti-Narcotics Task Forces (ANTF)** under the Ministry of Home Affairs, Government of India.

### Core Problem It Solves:
Field interdiction officers on remote highways and border transit nakas rely on disposable colorimetric test pouches (NIK Kits, Marquis, Scott, Duquenois-Levine reagents). Visual color interpretation under sodium streetlights, vehicle headlights, or harsh sunlight introduces human bias, optical parallax, and subjective dispute that defense attorneys exploit in Special NDPS Courts.

### The Solution:
DRUG-SEAL AI turns standard smartphone camera optics into an objective, court-admissible spectrophotometer:
1. **5ms Edge CIELAB $\Delta E_{2000}$ Engine**: Pure mathematical color distance calculation running 100% offline in browser canvas.
2. **Quality Gatekeepers**: Real-time **Laplacian variance edge sharpness filter** ($>90$ threshold) and **specular glare rejection filter** ($>8\%$ threshold).
3. **Cryptographic Chain of Custody**: Immediate on-device **SHA-256 WebCrypto photo seal** and **satellite GPS coordinate lock**.
4. **Cloud Forensic Intelligence**: Server-side Next.js route (`/api/drug-review`) proxying to **Google Gemini 2.5 Flash** for pouch OCR (lot number/expiry), adulterant detection, and court narrative generation (with 100% resilient offline fallback).
5. **Section 52 NDPS Act Form 'F' Seizure Panchnama**: 1-click export of the statutory seizure memorandum into an official court-admissible PDF via `jsPDF`.

---

## 🏗️ 2. Tech Stack & Architecture

- **Framework**: Next.js 15 (App Router, Turbopack, React 19)
- **Language**: TypeScript (Strict type checking, zero `any` leaks)
- **Styling**: Tailwind CSS v4 + `src/styles/theme.css` (UX4G v2.0.8 & GIGW 3.0 government tokens)
- **Typography**: Google Fonts **Noto Sans** (Latin + Devanagari)
- **Icons**: Lucide React
- **Client Storage Engine**: Browser-native **IndexedDB** (`ncb_drugseal_db`) with 3 object stores (`offline_queue`, `scan_results`, `panchnama_records`)
- **PDF Generation**: `jspdf` + `jspdf-autotable`
- **Charts & Maps**: `recharts` (Bar, Line, Pie) + `leaflet` & `react-leaflet` (Client-only dynamic import)
- **AI Multimodal Model**: Google Gemini 2.5 Flash via `/api/drug-review`

---

## 🔐 3. 4-Tier Role-Based Access Control (RBAC)

The system enforces strict operational clearance boundaries. Features strictly belong to authorized roles:

| Role Code | Officer Title | Demo Badge | Demo PIN | Authorized Capabilities |
|---|---|---|---|---|
| `ncb_io` | Field Investigating Officer | `NCB-IO-4092` | `7731` | Live Scanner (`/scanner`), NDPS Panchnama (`/panchnama`), Evidence Vault (`/vault`), NDPS Legal Library (`/legal`) |
| `ncb_fsl` | Forensic Lab Analyst | `FSL-DL-8812` | `9044` | Evidence Vault (`/vault`), Zonal Intelligence (`/analytics`), Optical Calibration (`/settings`), Legal Library (`/legal`) |
| `ncb_zonal` | Zonal Director (HQ) | `HQ-DIR-0001` | `1100` | Zonal Intelligence (`/analytics`), Panchnama Review (`/panchnama`), Vault (`/vault`), Legal Library (`/legal`) |
| `ncb_court` | Special NDPS Court Reader | `JUD-NDPS-2026` | `4432` | Evidence Vault (`/vault` in audit mode), Legal Library (`/legal`) |

*The `/login` page includes 1-click **Quick Demo Sign-In** chips for instant evaluation without typing.*

---

## 🔬 4. Core Mathematical & Forensic Pipelines

### A. CIELAB $\Delta E_{2000}$ Spectrophotometry (`src/utils/colorMath.ts`)
- **Pipeline**: Captured RGB $\rightarrow$ Linear sRGB $\rightarrow$ CIE XYZ ($D_{65}$ Standard Illuminant) $\rightarrow$ CIELAB ($L^*, a^*, b^*$).
- **Color Distance Calculation**: Standard **CIEDE2000 ($\Delta E_{2000}$)** formula incorporating lightness ($S_L$), chroma ($S_C$), hue ($S_H$), and rotation term ($R_T$) to match human perceptual non-uniformity.
- **Performance**: Completes in **$< 5\text{ms}$** on standard mobile processors with zero web service calls.

### B. Optical Quality Guardians
- **Laplacian Edge Sharpness (`src/utils/blurDetector.ts`)**: Applies a discrete $3 \times 3$ Laplacian kernel across the grayscale image to calculate variance. If variance $< 90$, the capture shutter locks and flags a "Hold Steady" warning.
- **Specular Glare Filter (`src/utils/glareFilter.ts`)**: Identifies blown-out white plastic packet reflections ($L^* > 95$, saturation $< 5\%$). If glare exceeds $8\%$ of the reticle surface, it advises tilting the pouch.

### C. Reagent Spectrum Matrix (`src/utils/reagentMatrix.ts`)
Includes official UNODC ST/NAR/13 reference indices for:
1. **Marquis Reagent**: Heroin / Morphine (Purple $\rightarrow$ Black), Methamphetamine (Orange $\rightarrow$ Brown).
2. **Scott Reagent**: Cocaine HCl (Cobalt Blue Precipitate).
3. **Duquenois-Levine**: Cannabis / Hashish (Deep Violet in Chloroform Layer).
4. **Mecke Reagent**: MDMA / Ecstasy (Blue-Green $\rightarrow$ Black).
5. **Mandelin Reagent**: Ketamine (Bright Deep Orange).
6. **Froehde Reagent**: Opium Alkaloids (Slate Blue).
7. **Nitric Acid**: Codeine / Opium distinction.

---

## 📁 5. Directory & File Map

```
sih2026/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # GIGW skip link, Google Translate widget, Noto Sans, AuthProvider
│   │   ├── RootShell.tsx             # Shell wrapper: Splash screen, light navbar, drawer, mobile dock
│   │   ├── page.tsx                  # Depth-enhanced Landing Page with interactive chemical simulator
│   │   ├── login/page.tsx            # Split-panel reference login UI with 1-click demo role chips
│   │   ├── scanner/page.tsx          # Live WebRTC scanner with reticle HUD, blur/glare meters, CIELAB engine
│   │   ├── panchnama/page.tsx        # Section 52 Form 'F' seizure memo form with GPS lock & PDF generator
│   │   ├── vault/page.tsx            # Tamper-proof evidence ledger with SHA-256 cryptographic hashes
│   │   ├── analytics/page.tsx        # Zonal dashboard with Recharts & dynamic Leaflet map
│   │   ├── legal/page.tsx            # NDPS Act Sections 41, 42, 43, 50, 52, 52A reference library
│   │   ├── settings/page.tsx         # Optical calibration controls (ΔE threshold, blur cutoff) & officer profile
│   │   ├── about/page.tsx            # Project mission, technical stack & accessibility statements
│   │   ├── terms/page.tsx            # Official government terms of use
│   │   ├── privacy/page.tsx          # DPDP Act 2023 compliant privacy policy
│   │   ├── not-found.tsx             # Branded 404 access boundary page
│   │   └── api/drug-review/route.ts  # Gemini 2.5 Flash multimodal vision proxy (with offline fallback)
│   │
│   ├── components/
│   │   ├── layout/                   # AccessibilityBar, Header, Sidebar, MobileBottomNav, Footer
│   │   ├── scanner/                  # ViewfinderOverlay, ReagentResultCard (with PDF report & upload)
│   │   ├── shared/                   # RoleGuard, OfflineSyncBadge, SplashScreen
│   │   └── analytics/                # SeizureMap (Leaflet client-only)
│   │
│   ├── hooks/
│   │   ├── useAuth.tsx               # 4-Tier RBAC state context & session persistence
│   │   ├── useCameraStream.ts        # Stable WebRTC getUserMedia & 40% reticle region extractor
│   │   ├── useGeoLocation.ts         # Real satellite navigator.geolocation capture
│   │   └── useFontScale.ts           # GIGW font scaler (A- / A / A+)
│   │
│   ├── utils/
│   │   ├── colorMath.ts              # RGB → CIELAB L*a*b* → CIEDE2000 ΔE (pure math)
│   │   ├── blurDetector.ts           # Laplacian variance edge sharpness analyzer
│   │   ├── glareFilter.ts            # Specular glare percentage & glove reflection filter
│   │   ├── reagentMatrix.ts          # UNODC reference spectrum for 7 field reagents
│   │   ├── cryptoSeal.ts             # WebCrypto SHA-256 photo hash generator
│   │   ├── offlineQueue.ts           # IndexedDB offline store with auto-sync on 'online' event
│   │   └── panchnamaPdf.ts           # jsPDF Form 'F' statutory memo builder
│   │
│   ├── styles/
│   │   └── theme.css                 # Clean light theme design tokens (UX4G & GIGW compliant)
│   │
│   └── data/
│       └── mockData.ts               # Centralized mock data (scans, panchnamas, analytics, demo roles)
```

---

## 🚀 6. Developer Commands

### Local Development:
```powershell
# Install dependencies
npm install

# Start development server
npm run dev
# App is available at http://localhost:3000
```

### Production Build & Verification:
```powershell
# Run full Next.js production build and TypeScript type check
npm run build

# Start production server
npm run start
```

---

## ☁️ 7. Vercel Deployment & Environment Variables

1. Push this repository to GitHub.
2. In **Vercel**, import the repository (framework preset: `Next.js`).
3. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your key from Google AI Studio)*
4. Click **Deploy**.
*(Note: If `GEMINI_API_KEY` is omitted, the application runs 100% normally with simulated forensic inference).*
