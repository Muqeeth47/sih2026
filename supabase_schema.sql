-- ======================================================================================
-- DRUG-SEAL AI: SUPABASE MASTER REALTIME & CROSS-ROLE SYNCHRONIZATION SCHEMA
-- Project: SIH26231 (Narcotics Control Bureau / Ministry of Home Affairs)
-- Database: PostgreSQL 15+ (Supabase Managed)
-- ======================================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. DROP PREVIOUS CONFLICTING TABLES (IF ANY)
DROP TABLE IF EXISTS public.custody_chain CASCADE;
DROP TABLE IF EXISTS public.panchnama_records CASCADE;
DROP TABLE IF EXISTS public.scan_assays CASCADE;
DROP TABLE IF EXISTS public.seizures CASCADE;

-- 3. MAIN SEIZURES INVENTORY TABLE
CREATE TABLE public.seizures (
    id TEXT PRIMARY KEY DEFAULT ('SEAL-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(GEN_RANDOM_UUID()::TEXT FROM 1 FOR 6)),
    case_id TEXT NOT NULL UNIQUE,
    officer_badge TEXT NOT NULL,
    officer_name TEXT NOT NULL,
    officer_role TEXT NOT NULL CHECK (officer_role IN ('ncb_io', 'ncb_fsl', 'ncb_zonal', 'ncb_court')),
    substance TEXT NOT NULL,
    reagent_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'vault_sealed' CHECK (status IN ('interdicted', 'vault_sealed', 'fsl_testing', 'fsl_verified', 'court_scrutiny', 'court_certified', 'disposal_scheduled', 'incinerated')),
    quantity_grams NUMERIC(10, 2) DEFAULT 0.00,
    gross_weight NUMERIC(10, 2) DEFAULT 0.00,
    gps_latitude DOUBLE PRECISION DEFAULT 28.6139,
    gps_longitude DOUBLE PRECISION DEFAULT 77.2090,
    gps_accuracy NUMERIC(6, 2) DEFAULT 5.0,
    photo_hash TEXT NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SCAN ASSAYS (DUAL-ENGINE: OPENCV + GEMINI 3.6 FLASH)
CREATE TABLE public.scan_assays (
    id TEXT PRIMARY KEY DEFAULT ('ASSAY-' || SUBSTRING(GEN_RANDOM_UUID()::TEXT FROM 1 FOR 8)),
    seizure_id TEXT REFERENCES public.seizures(id) ON DELETE CASCADE,
    case_id TEXT NOT NULL,
    reagent_type TEXT NOT NULL,
    
    -- PART A: OPENCV CLIENT-SIDE MATHEMATICAL METRICS
    opencv_delta_e NUMERIC(6, 2) NOT NULL,
    opencv_cielab JSONB NOT NULL DEFAULT '{"L": 0, "a": 0, "b": 0}',
    opencv_sharpness NUMERIC(8, 2) DEFAULT 95.0,
    opencv_glare_pct NUMERIC(5, 2) DEFAULT 2.1,
    opencv_confidence TEXT NOT NULL DEFAULT 'high',
    opencv_status TEXT NOT NULL DEFAULT 'positive',
    
    -- PART B: GEMINI 3.6 FLASH FORENSIC CLOUD MULTIMODAL REVIEW
    gemini_substance TEXT,
    gemini_confidence NUMERIC(4, 2) DEFAULT 0.92,
    gemini_purity TEXT,
    gemini_adulterants TEXT[] DEFAULT '{}',
    gemini_lot_number TEXT,
    gemini_expiry TEXT,
    gemini_court_summary TEXT,
    gemini_reason TEXT,
    tamper_detected BOOLEAN DEFAULT FALSE,
    
    -- CERTIFIED REPORT SHARING ACROSS ROLES
    pdf_report_url TEXT,
    pdf_base64 TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STATUTORY PANCHNAMA RECORDS (FORM F / NDPS ACT SEC 52)
CREATE TABLE public.panchnama_records (
    id TEXT PRIMARY KEY DEFAULT ('PANCHNAMA-' || SUBSTRING(GEN_RANDOM_UUID()::TEXT FROM 1 FOR 8)),
    seizure_id TEXT REFERENCES public.seizures(id) ON DELETE CASCADE,
    case_id TEXT NOT NULL UNIQUE,
    accused_name TEXT DEFAULT 'Suspect in Transit',
    accused_alias TEXT,
    accused_address TEXT,
    witness_one_name TEXT NOT NULL DEFAULT 'Panch Witness 1',
    witness_one_phone TEXT,
    witness_two_name TEXT NOT NULL DEFAULT 'Panch Witness 2',
    witness_two_phone TEXT,
    ndps_sections TEXT[] DEFAULT '{"Section 21", "Section 52"}',
    memo_text TEXT NOT NULL,
    fsl_sample_number TEXT,
    magistrate_certified BOOLEAN DEFAULT FALSE,
    magistrate_notes TEXT,
    certified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. IMMUTABLE CHAIN OF CUSTODY AUDIT TRAIL
CREATE TABLE public.custody_chain (
    id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    seizure_id TEXT REFERENCES public.seizures(id) ON DELETE CASCADE,
    case_id TEXT NOT NULL,
    actor_badge TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    notes TEXT,
    sha256_verification TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ENABLE FULL REPLICA IDENTITY FOR REALTIME BROADCASTING
ALTER TABLE public.seizures REPLICA IDENTITY FULL;
ALTER TABLE public.scan_assays REPLICA IDENTITY FULL;
ALTER TABLE public.panchnama_records REPLICA IDENTITY FULL;
ALTER TABLE public.custody_chain REPLICA IDENTITY FULL;

-- 8. PUBLICATION SETUP (ENABLE SUPABASE REALTIME PUB/SUB)
DO $
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END
$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.seizures;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_assays;
ALTER PUBLICATION supabase_realtime ADD TABLE public.panchnama_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.custody_chain;

-- 9. ROW LEVEL SECURITY (PERMISSIVE ACCESS FOR GOVERNMENT ROLES)
ALTER TABLE public.seizures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_assays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panchnama_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custody_chain ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on seizures" ON public.seizures FOR SELECT USING (true);
CREATE POLICY "Allow public insert on seizures" ON public.seizures FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on seizures" ON public.seizures FOR UPDATE USING (true);

CREATE POLICY "Allow public read on scan_assays" ON public.scan_assays FOR SELECT USING (true);
CREATE POLICY "Allow public insert on scan_assays" ON public.scan_assays FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on scan_assays" ON public.scan_assays FOR UPDATE USING (true);

CREATE POLICY "Allow public read on panchnama_records" ON public.panchnama_records FOR SELECT USING (true);
CREATE POLICY "Allow public insert on panchnama_records" ON public.panchnama_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on panchnama_records" ON public.panchnama_records FOR UPDATE USING (true);

CREATE POLICY "Allow public read on custody_chain" ON public.custody_chain FOR SELECT USING (true);
CREATE POLICY "Allow public insert on custody_chain" ON public.custody_chain FOR INSERT WITH CHECK (true);

-- 10. REAL-TIME CROSS-ROLE TRIGGER: AUTO-LOG CUSTODY EVENTS
CREATE OR REPLACE FUNCTION public.handle_seizure_status_transition()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO public.custody_chain (
    seizure_id,
    case_id,
    actor_badge,
    actor_role,
    action,
    notes,
    sha256_verification
  ) VALUES (
    NEW.id,
    NEW.case_id,
    NEW.officer_badge,
    NEW.officer_role,
    'STATUS_TRANSITION_TO_' || UPPER(NEW.status),
    'Case transitioned from ' || COALESCE(OLD.status, 'INITIAL') || ' to ' || NEW.status,
    NEW.photo_hash
  );
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_seizure_update_log_custody
AFTER INSERT OR UPDATE OF status ON public.seizures
FOR EACH ROW EXECUTE FUNCTION public.handle_seizure_status_transition();

-- 11. STORAGE BUCKET FOR PDF REPORTS & ASSAY CERTIFICATES
INSERT INTO storage.buckets (id, name, public)
VALUES ('forensic_reports', 'forensic_reports', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read access to forensic_reports"
ON storage.objects FOR SELECT USING (bucket_id = 'forensic_reports');

CREATE POLICY "Allow public insert access to forensic_reports"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'forensic_reports');

-- 12. SAMPLE SEED DATA FOR CROSS-ROLE COLLABORATION DEMO
INSERT INTO public.seizures (id, case_id, officer_badge, officer_name, officer_role, substance, reagent_type, status, quantity_grams, gross_weight, gps_latitude, gps_longitude, photo_hash)
VALUES
('SEAL-20260914-001', 'NCB-DEL-2026-1044', 'NCB-IO-4412', 'Insp. Rajesh Verma', 'ncb_io', 'Heroin (Diacetylmorphine)', 'marquis', 'fsl_testing', 1250.00, 1480.00, 28.6139, 77.2090, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'),
('SEAL-20260914-002', 'NCB-MUM-2026-2189', 'NCB-IO-8891', 'Sub-Insp. Priya Nair', 'ncb_io', 'Cocaine Hydrochloride', 'scott', 'court_scrutiny', 450.00, 520.00, 19.0760, 72.8777, 'a2c4e68198fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b899'),
('SEAL-20260914-003', 'NCB-KOL-2026-3401', 'NCB-IO-1204', 'Insp. Debasish Ray', 'ncb_io', 'Cannabis Resin (Hashish)', 'duquenois_levine', 'vault_sealed', 4800.00, 5100.00, 22.5726, 88.3639, 'f4d5b28198fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b112')
ON CONFLICT (case_id) DO NOTHING;

INSERT INTO public.scan_assays (seizure_id, case_id, reagent_type, opencv_delta_e, opencv_cielab, opencv_sharpness, opencv_glare_pct, gemini_substance, gemini_confidence, gemini_purity, gemini_adulterants, gemini_lot_number, gemini_expiry, gemini_court_summary, gemini_reason)
VALUES
('SEAL-20260914-001', 'NCB-DEL-2026-1044', 'marquis', 4.20, '{"L": 24.5, "a": 42.1, "b": -36.8}', 118.4, 2.1, 'Heroin (Diacetylmorphine)', 0.94, '65–70%', ARRAY['Caffeine', 'Paracetamol'], 'LOT-MQ-2024-089', '2027-12', 'Marquis reaction exhibited immediate purple-black coloration conforming to UNODC standards under Section 21 NDPS Act.', 'Purple-black opiate shift'),
('SEAL-20260914-002', 'NCB-MUM-2026-2189', 'scott', 5.80, '{"L": 31.8, "a": -14.2, "b": -54.6}', 104.2, 1.8, 'Cocaine Hydrochloride', 0.92, '78–82%', ARRAY['Lidocaine', 'Levamisole'], 'LOT-SC-2025-014', '2027-08', 'Scott reagent test produced cobalt blue precipitate in phase 1, soluble in chloroform layer in phase 3.', 'Cobalt blue lower precipitate')
ON CONFLICT DO NOTHING;

INSERT INTO public.panchnama_records (seizure_id, case_id, accused_name, accused_address, witness_one_name, witness_two_name, ndps_sections, memo_text, fsl_sample_number)
VALUES
('SEAL-20260914-001', 'NCB-DEL-2026-1044', 'Mohammad Tariq', 'Daryaganj, Old Delhi', 'Vikas Sharma', 'Manish Pandey', ARRAY['Section 21', 'Section 52'], 'Seized contraband from concealed vehicle trunk under Section 43 NDPS Act in public place.', 'FSL-DL-2026-HER-088')
ON CONFLICT (case_id) DO NOTHING;
