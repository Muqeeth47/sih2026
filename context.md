# 🏛️ SAKSHYA AI (साक्ष्य AI) — Complete Project Context & Architecture
## 🧪 Project: Digital Companion for Field Drug Testing
### 📋 Problem Statement: **SIH 26231** | **Ministry of Home Affairs / Narcotics Control Bureau (NCB)**
### 🏷️ Team ID: **173635** | Team Name: **Sudophiles** | Theme: **MedTech / BioTech / HealthTech**
### 🌐 Live Production URL: `https://sih2026-rust.vercel.app`

---

## 🎯 1. Executive Summary & Core Mission
**SAKSHYA AI** is an offline-first forensic digital evidence companion built for the **Narcotics Control Bureau (NCB)** under the Ministry of Home Affairs, Government of India.

### The Problem It Solves:
Field interdiction officers rely on visual color changes in chemical test pouches (Marquis, Scott, Duquenois-Levine). Judging color visually under poor lighting leaves no verifiable digital record, making field test outcomes legally vulnerable in Special NDPS Courts.

### The Solution:
SAKSHYA AI transforms any standard smartphone camera into an objective, tamper-proof evidentiary companion:
1. **On-Device Instant Color Match**: 100% offline mathematical color reading and lighting normalization.
2. **Quality & Biometric Safeguards**: Filters out blurry frames, glare, and automatically rejects photos of human faces/skin or random objects.
3. **Cryptographic Proof**: Captures high-accuracy GPS coordinates, operator badge ID, timestamp, and generates an on-device **SHA-256 cryptographic seal** of the image.
4. **Cloud AI Verification**: Verifies test pouch authenticity, checks package seals for tampering, reads batch numbers, and drafts statutory statements.
5. **Section 52 NDPS / Form 'F' & Panchnama Export**: Instant 1-click generation of court-admissible PDF seizure memos and electronic evidence certificates.

---

## 🔐 2. 4-Tier Chain of Custody & Role-Based Access

| Role | Officer Title | Demo Credentials | Key Routes | Core Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| **Field IO** | Field Investigating Officer | `NCB-IO-4092` / `7731` | `/scanner`, `/panchnama`, `/field/vault` | On-spot testing, SHA-256 photo seal, GPS lock, Form 'F' Panchnama |
| **FSL Lab** | Forensic Lab Analyst | `FSL-DL-8812` / `9044` | `/fsl/vault`, `/fsl/calibration` | Physical sample intake, GC-MS confirmatory analysis, spectral calibration |
| **Zonal HQ** | Zonal Director (HQ) | `HQ-DIR-0001` / `1100` | `/analytics`, `/zonal/vault` | Real-time geospatial seizure map, regional intelligence, court escalation |
| **NDPS Court**| Special NDPS Judge | `JUD-NDPS-2026` / `4432` | `/court/legal`, `/court/vault` | Section 52 pre-trial disposal orders, Section 65B BSA digital certificates |

---

## 🎬 3. Video Pitch Cheat Sheet (3 Minutes)

### Excalidraw Diagram (0:00 – 0:30):
```
Team: Sudophiles (ID: 173635)  |  PS ID: 26231 (NCB / MHA)
"Sakshya AI — Digital Companion for Field Drug Testing"

Field Officer ──(Photo + GPS)──> Forensic Lab ──(Lab Test)──> Zonal HQ ──(Live Map)──> Court
```

### Video Flow & Screen Sitemap:
1. **0:00 - 0:30 | Excalidraw**: Introduce team (Sudophiles - 173635), state Problem Statement #26231, and explain why visual color tests fail in court.
2. **0:31 - 1:30 | Field Officer ([`/scanner`](https://sih2026-rust.vercel.app/scanner))**:
   - Demonstrate on-device offline color match + SHA-256 hash.
   - Show AI packaging & batch check.
   - Upload random photo to show automatic safety rejection.
   - Download Form 'F' Seizure Panchnama ([`/panchnama`](https://sih2026-rust.vercel.app/panchnama)).
3. **1:31 - 2:05 | Forensic Lab ([`/fsl/vault`](https://sih2026-rust.vercel.app/fsl/vault))**:
   - Verify incoming sample against field photo hash.
   - Escalate case to Zonal HQ.
4. **2:06 - 2:35 | Zonal HQ ([`/analytics`](https://sih2026-rust.vercel.app/analytics))**:
   - Show live interactive India seizure map.
   - Click a pin to show evidence photo & case metadata $\rightarrow$ submit to court.
5. **2:36 - 3:00 | NDPS Court ([`/court/legal`](https://sih2026-rust.vercel.app/court/legal))**:
   - Show Section 52 Disposal Certificate and Section 65B Electronic Evidence Certificate.
   - Conclude with zero new hardware and 100% statutory compliance.

---

## 🏗️ 4. Tech Stack & Key Files

- **Framework**: Next.js (App Router, Turbopack, React 19, TypeScript)
- **Styling**: Tailwind CSS + UX4G / GIGW Indian Government Design System
- **Database & Storage**: Supabase (PostgreSQL + Encrypted Evidence Storage)
- **Local Offline Engine**: IndexedDB (`ncb_drugseal_db`)
- **Interactive Maps**: Leaflet & React-Leaflet with OpenStreetMap tiles (`src/components/analytics/SeizureMap.tsx`)
- **PDF Generation**: `jspdf` & `jspdf-autotable` (`src/utils/assayPdf.ts`, `src/utils/panchnamaPdf.ts`)
- **AI Multimodal Vision**: Google Gemini API via `/api/drug-review` with automated failover:
  `gemini-3.1-flash-lite` $\rightarrow$ `gemini-flash-lite-latest` $\rightarrow$ `gemini-3.5-flash` $\rightarrow$ `gemini-3.6-flash`.
