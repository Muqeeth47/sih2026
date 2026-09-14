# 🏛️ DRUG-SEAL AI — Deployment, Supabase Realtime & AI Architecture Guide

---

## 🗄️ 1. Database & Realtime Architecture (Supabase + IndexedDB)

### Two-Tier Hybrid Synchronization Architecture:
1. **Edge Tier (In-Field Offline)**: **IndexedDB** (`ncb_drugseal_db` via `src/utils/offlineQueue.ts`).
   - Runs 100% in-browser on field devices.
   - Zero latency, zero cloud dependency, works during border/tunnel blackout.
2. **Cloud Tier (Central Command & Cross-Role Sync)**: **Supabase PostgreSQL 15+**.
   - URL: `https://prndinkwjyfphewqlhqv.supabase.co`
   - Realtime enabled (`supabase_realtime` publication) with `REPLICA IDENTITY FULL`.
   - **Cross-Role Live Handover**: When a Field IO captures an assay on `/scanner`, the record broadcasts in real-time to:
     - **FSL Analysts** on `/vault` & `/settings` for secondary verification.
     - **Zonal Directors** on `/analytics` for geospatial intelligence.
     - **Court Readers** on `/panchnama` & `/vault` with the downloadable certified PDF assay report.

### 📋 Master SQL Query to Run in Supabase SQL Editor
Open your **[Supabase Dashboard](https://supabase.com/dashboard/project/prndinkwjyfphewqlhqv)** → Click **SQL Editor** in the left sidebar → Paste and run the entire contents of [`supabase_schema.sql`](./supabase_schema.sql).

This query will automatically:
* Create `seizures`, `scan_assays`, `panchnama_records`, and `custody_chain` tables.
* Enable Supabase Realtime pub/sub on all 4 tables.
* Configure Row Level Security (RLS) policies for cross-role collaboration.
* Create a public `forensic_reports` Supabase Storage bucket for storing assay PDF files.
* Seed sample interdictions for instant demonstration across all roles.

---

## 🔬 2. OpenCV vs. Gemini AI: How Are We Differentiating Both Views?

The application provides an interactive **3-Tab Dual Forensic Analysis Interface** in `ReagentResultCard.tsx`:

| Feature | Tab 1: OpenCV / CIEDE2000 Engine (Edge) | Tab 2: Gemini 3.6 Flash Review (Cloud AI) |
|---|---|---|
| **Location & Engine** | **Client-Side** (OpenCV / HTML5 Canvas / ColorMath) | **Cloud API** (Google Gemini 3.6 Flash Vision Model) |
| **Connectivity** | **100% Offline** (0ms latency, zero API calls) | **Online Cloud Review** (with offline fallback) |
| **Core Methodology** | Spectrophotometric CIELAB coordinates $(L^*, a^*, b^*)$ under D65 standard illuminant | Multimodal Neural Vision + Document Packaging OCR |
| **Primary Metric** | Exact **CIEDE2000 ($\Delta E_{2000}$)** score against UNODC ST/NAR/13 standards (Pass $\le 15.0$) | Confidence percentage, purity range (e.g. 78–82%), and identified cutting agents |
| **Physical Quality Checks** | Laplacian blur variance ($Var(L) \ge 90$) & Specular glare percentage ($\le 8\%$) | Pouch package lot number OCR, expiration date, and ampoule tamper verification |
| **Legal Role under NDPS Act** | Certified chemical spectrophotometry under Section 52 NDPS Act | Formal court-admissible panchnama statement under Section 52 NDPS Act |
| **Tab 3: Comparative Audit** | Both engines displayed side-by-side in a **Dual Corroboration Matrix** proving mathematical and visual agreement for court admissibility under Section 65B Bharatiya Sakshya Adhiniyam (BSA). |

---

## 🔑 3. Environment Variables

Your local `.env.local` is configured with:

```env
# Google Gemini Multimodal Vision API Key
GEMINI_API_KEY=AQ.Ab8RN6LW41mwkChXxBKcWe2bRgfv0c_-ZiscyRdXCLTvzrE3wQ
GEMINI_MODEL=gemini-3.6-flash

# Supabase Credentials (Cloud Storage & Sync)
NEXT_PUBLIC_SUPABASE_URL=https://prndinkwjyfphewqlhqv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_VjR-8A7agzuvqk1lOfp4AQ_ZGinc0ht
SUPABASE_PROJECT_REF=prndinkwjyfphewqlhqv
```

---

## 🚀 4. Deployment: Getting a Short Vercel Link

### Option A: Deploy via Vercel CLI (Instant Short Link)
You can deploy directly from your command line:
```bash
# Install / Run Vercel CLI
npx vercel

# For production deployment with custom short link:
npx vercel --prod
```
During the prompt, select default settings. You will be given a live short link like `https://sih2026-muqeeth.vercel.app`.

In the **Vercel Project Dashboard** under **Settings → Environment Variables**, add:
* `GEMINI_API_KEY` = `AQ.Ab8RN6LW41mwkChXxBKcWe2bRgfv0c_-ZiscyRdXCLTvzrE3wQ`
* `NEXT_PUBLIC_SUPABASE_URL` = `https://prndinkwjyfphewqlhqv.supabase.co`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_VjR-8A7agzuvqk1lOfp4AQ_ZGinc0ht`

---

## 📦 5. GitHub Repository Push (When You Are Ready to Push)

> [!IMPORTANT]
> As instructed: **DO NOT PUSH YET UNTIL YOU HAVE TESTED LOCALLY**.

When you have thoroughly verified all features locally on `http://localhost:3000`, run this single sequence to push to your repository:

```bash
git add .
git commit -m "feat: complete DRUG-SEAL AI with OpenCV vs Gemini differentiation, Supabase realtime, and role manuals"
git remote set-url origin https://github.com/Muqeeth47/sih2026.git
git push -u origin main
```
