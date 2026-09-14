# 🏛️ MASTER IMPLEMENTATION PLAN & AI SYSTEM PROMPT — SIH 2026
## 🧪 Project: DRUG-SEAL AI (Digital Companion for Field Drug Testing)
### 📋 Problem Statement: **SIH26231** | **Ministry of Home Affairs (Narcotics Control Bureau - NCB)**

---

## 🎯 1. Executive Mission & System Aim

**DRUG-SEAL AI** is a mission-critical, offline-first forensic field companion designed for Narcotics Control Bureau (NCB) and State Anti-Narcotics Task Force (ANTF) officers. It eliminates subjectivity and human error in chemical colorimetric spot testing (NIK Pouches, Marquis, Scott, Duquenois-Levine reagents) during field interdictions on remote highways and border check-posts.

### Core Deliverables:
1. **Edge Colorimetry Engine (5ms, 100% Offline)**: Canvas-based CIELAB $\Delta E_{2000}$ spectrophotometric matching + Laplacian blur rejection + specular glare removal.
2. **Cloud Forensic Intelligence Tier**: Gemini 2.5 Flash Multimodal Vision API (`api/drug-review.ts`) executing deep OCR (pouch lot number, expiry, manufacturer verification), multi-reagent cross-validation, and adulterant flagging.
3. **Court-Admissible Chain of Custody**: Hardware satellite GPS lock, instant `SHA-256` client-side photo hashing, and 1-click generation of the statutory **Section 52 NDPS Act Form 'F' Seizure Panchnama PDF**.
4. **Resilient Offline Synchronization**: IndexedDB storage engine with automatic background sync when cellular/Wi-Fi connectivity is restored.

---

## 📚 2. Sourced Specifications & Reference File Paths

This blueprint integrates and conforms strictly to the following workspace files:
* 📄 **Indian Govt Design System & UX4G Spec**: [`c:\Users\basit\Dropbox\My PC (LAPTOP-L7PDQOB1)\Downloads\Code\protohub\indian-govt-design-system-prompt.md`](file:///c:/Users/basit/Dropbox/My%20PC%20(LAPTOP-L7PDQOB1)/Downloads/Code/protohub/indian-govt-design-system-prompt.md)
* 📄 **Landing Page & Hero Layout Engine**: [`c:\Users\basit\Dropbox\My PC (LAPTOP-L7PDQOB1)\Downloads\Code\study\landing-page-spec.md`](file:///c:/Users/basit/Dropbox/My%20PC%20(LAPTOP-L7PDQOB1)/Downloads/Code/study/landing-page-spec.md)
* 📄 **3-Tier Shell & Offline Queue Architecture**: [`c:\Users\basit\Dropbox\My PC (LAPTOP-L7PDQOB1)\Downloads\Code\study\UI_CONTEXT_TOFEI.md`](file:///c:/Users/basit/Dropbox/My%20PC%20(LAPTOP-L7PDQOB1)/Downloads/Code/study/UI_CONTEXT_TOFEI.md)
* 📄 **Truthful System Validation Rules**: [`c:\Users\basit\Dropbox\My PC (LAPTOP-L7PDQOB1)\Downloads\Code\study\anti glaze prompt.md`](file:///c:/Users/basit/Dropbox/My%20PC%20(LAPTOP-L7PDQOB1)/Downloads/Code/study/anti%20glaze%20prompt.md)

---

## 🎨 3. Design System, Color Tokens & Typography

Conforms to **UX4G v2.0.8**, **GIGW 3.0**, and **WCAG 2.1 AA** standards. All UI icons are strictly SVG **Lucide-React** icons (zero emojis in navigation and telemetry).

### 3.1 CSS Design Tokens (`src/styles/ncb-theme.css`)
```css
:root {
  /* NCB & National Tricolor Palette */
  --ncb-navy-dark: #0a192f;        /* Deep Tactical Navy (Header & Sidebar) */
  --ncb-navy-primary: #17375e;     /* National Ashoka Navy */
  --ncb-blue-accent: #0284c7;      /* Interactive Focus & Links */
  --ncb-saffron: #ff9933;          /* India Saffron (Accents & Warnings) */
  --ncb-green: #138808;            /* India Green (Positive Chemical Match) */
  --ncb-green-subtle: #e8f5e9;     /* Verified Pill Fill */
  --ncb-crimson: #dc2626;          /* Danger / Seizure Threshold Breach */
  --ncb-crimson-subtle: #fef2f2;   /* Alert Fill */
  --ncb-gold: #f59e0b;             /* High Purity / Badge Highlight */
  
  /* Neutral Surfaces & Ink */
  --ncb-bg: #f8fafc;               /* Slate Canvas */
  --ncb-surface: #ffffff;          /* Card Container */
  --ncb-surface-2: #f1f5f9;        /* Input Backdrop */
  --ncb-border: #cbd5e1;           /* Crisp Field Outlines */
  --ncb-text-main: #0f172a;        /* 100% High Contrast Ink */
  --ncb-text-muted: #475569;       /* Secondary Captions */

  /* Sizing & Layout Tokens */
  --sidebar-width: 250px;
  --header-height: 68px;
  --mobile-nav-height: 62px;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;

  font-family: 'Noto Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}
```

---

## 🔐 4. Authentication, 4-Tier RBAC & 1-Click Presentation Bypass

To ensure a flawless live presentation without typing delays, the login portal features **1-Click Auto-Fill Demo Role Chips**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        NCB DIGITAL GATEWAY (1-CLICK DEMO BYPASS)                       │
├──────────────────┬──────────────────────┬──────────────────────────────────────────────┤
│ Role Code        │ Title                │ Demo 1-Click Credentials                     │
├──────────────────┼──────────────────────┼──────────────────────────────────────────────┤
│ `ncb_io`         │ Investigating Officer│ Badge: `NCB-IO-4092` (PIN: `7731`)          │
│ `ncb_fsl`        │ Forensic Lab Analyst │ Badge: `FSL-DL-8812` (PIN: `9044`)          │
│ `ncb_zonal`      │ Zonal Director (HQ)  │ Badge: `HQ-DIR-0001` (PIN: `1100`)          │
│ `ncb_court`      │ Special Court Reader │ Badge: `JUD-NDPS-2026` (PIN: `4432`)        │
└──────────────────┴──────────────────────┴──────────────────────────────────────────────┘
```

```jsx
// Quick 1-Click Chip Handler in LoginPage.tsx
const DEMO_ROLES = [
  { role: 'ncb_io', label: 'Field Officer (IO)', badge: 'NCB-IO-4092', pin: '7731' },
  { role: 'ncb_fsl', label: 'Forensic Lab (FSL)', badge: 'FSL-DL-8812', pin: '9044' },
  { role: 'ncb_zonal', label: 'Zonal Director (HQ)', badge: 'HQ-DIR-0001', pin: '1100' },
  { role: 'ncb_court', label: 'NDPS Court Reader', badge: 'JUD-NDPS-2026', pin: '4432' },
];
```

---

## 📱 5. UI Architecture: Landing, Splash, Sidebar & Mobile Dock

```
+-----------------------------------------------------------------------------------+
|  [Accessibility Bar] Font: A- A A+ | English / हिंदी | Screen Reader | Dark Mode   |
+-----------------------------------------------------------------------------------+
|  [Tricolor Strip] 4px Saffron / White / Green Bar                                 |
+-----------------------------------------------------------------------------------+
|  [Header] Government of India Emblem | Narcotics Control Bureau | Role Switcher   |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [Desktop View (>900px)]                     [Mobile View (<=900px)]              |
|  ┌──────────────────┬─────────────────────┐  ┌──────────────────────────────────┐ |
|  │ Fixed Sidebar    │ Scrollable Content  │  │ Scrollable Full-Width View       │ |
|  │ • Viewfinder     │ • Live Camera HUD   │  │                                  │ |
|  │ • Panchnama Form │ • CIELAB Match Card │  │                                  │ |
|  │ • Evidence Vault │ • Seizure Timeline  │  │                                  │ |
|  │ • Zonal Heatmap  │ • PDF Exporter      │  │                                  │ |
|  │ • System Audits  │                     │  └──────────────────────────────────┘ |
|  │                  │                     │  [Fixed Mobile Bottom Bar (Dock)]   |
|  │                  │                     │  [Scan] [Panchnama] [Vault] [User]  |
|  └──────────────────┴─────────────────────┘  └──────────────────────────────────┘ |
+-----------------------------------------------------------------------------------+
```

### 5.1 Desktop Sidebar Items (Lucide SVG Icons Only)
* 📷 `Camera` — **Live Field Scanner** (`/scanner`)
* 📝 `FileText` — **NDPS Panchnama Form** (`/panchnama`)
* 🗄️ `ShieldCheck` — **Tamper-Proof Evidence Vault** (`/vault`)
* 🗺️ `MapPin` — **Zonal Seizure Heatmap** (`/analytics`)
* ⚖️ `Scale` — **NDPS Act Legal Library** (`/legal`)
* ⚙️ `Settings` — **Offline Calibration Settings** (`/settings`)

### 5.2 Mobile Native Bottom Bar Dock (`MobileBottomNav.tsx`)
Fixed at `position: fixed; bottom: 0; z-index: 1000; height: 62px;` with safe-area bottom padding:
* `Camera` (Active Viewfinder Reticle)
* `FilePlus2` (Quick Seizure Memo Entry)
* `Clock3` (Offline Sync Queue Counter Badge)
* `UserCheck` (Officer Badge & Status)

---

## 📁 6. Complete Project Directory Structure

```
ncb-field-companion/
├── index.html                           # UX4G CDN + Noto Sans + Camera Permissions
├── package.json                         # React 19, TypeScript, Lucide, jsPDF
├── tsconfig.json                        # Strict Type Checking
├── tailwind.config.ts                   # Custom NCB color tokens
│
├── src/
│   ├── types/
│   │   ├── drug.ts                      # Reagent, Substance, & ScanResult types
│   │   └── panchnama.ts                 # Form 'F' Seizure Memo schema
│   │
│   ├── styles/
│   │   └── ncb-theme.css                # UX4G tokens, tricolor bar, animations
│   │
│   ├── utils/
│   │   ├── colorMath.ts                 # RGB -> CIELAB Delta-E (0ms math)
│   │   ├── blurDetector.ts              # Laplacian Variance edge analyzer (<50 lines)
│   │   ├── glareFilter.ts               # Specular reflection & glove pixel mask
│   │   ├── reagentMatrix.ts             # UNODC Marquis, Scott, Duquenois-Levine specs
│   │   ├── offlineQueue.ts              # IndexedDB store with background auto-sync
│   │   ├── cryptoSeal.ts                # WebCrypto SHA-256 photo hash generator
│   │   └── panchnamaPdf.ts              # jsPDF Section 52 Form 'F' memo builder
│   │
│   ├── hooks/
│   │   ├── useCameraStream.ts           # WebRTC camera feed with target reticle
│   │   ├── useGeoLocation.ts            # Satellite GPS capture (offline ready)
│   │   └── useAuth.tsx                  # 4-Tier Role State & 1-click bypass
│   │
│   ├── components/
│   │   ├── Header.tsx                   # Tricolor strip, Emblem, Accessibility Bar
│   │   ├── Sidebar.tsx                  # Desktop collapsible sidebar (Lucide icons)
│   │   ├── MobileBottomNav.tsx          # Mobile native bottom navigation dock
│   │   ├── ViewfinderOverlay.tsx        # Camera HUD, reticle box, blur/glare meters
│   │   ├── ReagentResultCard.tsx        # Confidence pill, color swatch, delta-E score
│   │   ├── OfflineSyncBadge.tsx         # Green (Online) vs. Amber (Queued) status
│   │   └── SplashScreen.tsx             # Animated NCB golden emblem badge
│   │
│   ├── pages/
│   │   ├── LandingPage.tsx              # Public portal with Hero, Metrics & Workflow
│   │   ├── LoginPage.tsx                # 1-Click Role demo chip bypass gateway
│   │   ├── ScannerPage.tsx              # Field Officer Live Test Scanner
│   │   ├── PanchnamaFormPage.tsx        # Accused details, weight, witness signatures
│   │   ├── EvidenceVaultPage.tsx        # SHA-256 tamper-proof evidence timeline
│   │   └── ZonalDashboard.tsx           # Headquarters analytics & seizure heatmaps
│   │
│   └── App.tsx                          # Root Router Shell & Offline Listeners
│
└── api/
    └── drug-review.ts                   # Gemini 2.5 Flash Multimodal Proxy with JSON Schema
```

---

## 🤖 7. Master System Construction Prompt (Copy-Paste for AI Generator)

```markdown
You are an expert Principal Fullstack Systems Architect building a production-ready, Indian Government-grade React + TypeScript application for the Narcotics Control Bureau (NCB), Ministry of Home Affairs.

### PROJECT CONTEXT & DESIGN SPECIFICATIONS:
Build the "DRUG-SEAL AI" application conforming to UX4G v2.0.8, GIGW 3.0, and the architectural specifications detailed in `implementation plansih.md`:

1. DESIGN SYSTEM & ACCESSIBILITY:
   - Primary colors: Deep Navy (#0a192f), Saffron (#FF9933), India Green (#138808), Surface (#ffffff).
   - Top 4px tricolor strip + Accessibility toolbar (Font scaler A-/A/A+, Language toggle EN/HI).
   - All navigation and UI icons MUST use Lucide-React SVG icons (strictly no emojis in buttons or nav).

2. 4-TIER LOGIN WITH 1-CLICK DEMO BYPASS:
   - Provide 4 instant 1-click role chips on LoginPage: Investigating Officer (`ncb_io`), Forensic Lab (`ncb_fsl`), Zonal Director (`ncb_zonal`), and NDPS Court Reader (`ncb_court`).

3. DUAL-TIER FORENSIC COMPUTER VISION PIPELINE:
   - Tier 1 (On-Device Client Math): Viewfinder reticle (center 40%), Laplacian blur detection (<90 warns retake), Specular glare removal, and CIELAB Delta-E chemical matching against UNODC Marquis, Scott, and Duquenois-Levine standards.
   - Tier 2 (Cloud AI /api/drug-review.ts): Google Gemini 2.5 Flash Proxy enforcing structured JSON responseSchema for batch verification, tampering detection, and court summary prose.

4. OFFLINE QUEUE & EVIDENCE TAMPER-PROOFING:
   - Browser IndexedDB stores raw photo blobs, GPS tags, and SHA-256 image hashes when offline.
   - Auto-syncs via window.addEventListener('online') when network restores.
   - 1-Click Section 52 NDPS Act Form 'F' Seizure Panchnama PDF generator using jsPDF.

5. RESPONSIVE NAVIGATION:
   - Desktop: Collapsible sidebar navigation.
   - Mobile (<=900px): Fixed bottom navigation dock with Scanner, Panchnama, Vault, and Profile tabs.

Generate the modular TypeScript code for the core utilities, hooks, components, pages, and API proxy routes.
```

---

## ⚡ 8. Terminal Commands to Initialize & Run in 30 Seconds

```powershell
npm create vite@latest ncb-companion -- --template react-ts
cd ncb-companion
npm install lucide-react react-router-dom jspdf jspdf-autotable browser-image-compression clsx tailwind-merge @supabase/supabase-js
npm install -D @types/node tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm run dev
```
