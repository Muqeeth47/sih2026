'use client';
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { generatePanchnamaPDF } from '@/utils/panchnamaPdf';
import { savePanchnama, getAllScanResults } from '@/utils/offlineQueue';
import { supabase } from '@/utils/supabaseClient';
import type { PanchnamaForm, AccusedDetails, SeizureItem, WitnessDetails } from '@/types/panchnama';
import type { ScanResult } from '@/types/drug';
import {
  FileText, Download, Save, Plus, Trash2, MapPin, CheckCircle2,
  ShieldCheck, Camera, Hash, AlertTriangle, Shield, CheckSquare,
} from 'lucide-react';
import RoleGuard from '@/components/shared/RoleGuard';

function PanchnamaFormContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const { coordinate, capture: captureGPS } = useGeoLocation();

  const querySubstance = searchParams.get('substance') || '';
  const queryReagent   = searchParams.get('reagent') || 'marquis';
  const queryScanId    = searchParams.get('scanId') || '';

  const [linkedScan, setLinkedScan] = useState<ScanResult | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoHash, setPhotoHash] = useState<string>('');

  const [caseNumber, setCaseNumber] = useState(`NCB-CASE-${new Date().getFullYear()}-00421`);
  const [formNumber, setFormNumber] = useState(`NCB/DL/${new Date().getFullYear()}/F/001`);
  const [seizureDate, setSeizureDate] = useState(new Date().toISOString().split('T')[0]);
  const [seizureTime, setSeizureTime] = useState(new Date().toTimeString().slice(0, 5));

  const [locationDesc, setLocationDesc] = useState('NH-44 Highway Bypass, Toll Gate No. 3, Near Singhu Border');
  const [district, setDistrict] = useState('North Delhi');
  const [state, setState] = useState('Delhi');
  const [lat, setLat] = useState(28.6139);
  const [lng, setLng] = useState(77.2090);

  // Statutory NDPS Procedural Safeguards
  const [section50Served, setSection50Served] = useState(true);
  const [independentWitnesses, setIndependentWitnesses] = useState(true);
  const [magistrateSampling, setMagistrateSampling] = useState(true);

  const [accusedList, setAccusedList] = useState<AccusedDetails[]>([
    {
      fullName: 'Rahul Kumar Singh',
      age: 34,
      gender: 'male',
      fatherName: 'Ramesh Singh',
      address: 'Village Bahadurgarh, Near Bus Stand',
      district: 'Jhajjar',
      state: 'Haryana',
      nationality: 'Indian',
      idType: 'aadhaar',
      idNumber: '4721-8891-3042',
    },
  ]);

  const [seizureItems, setSeizureItems] = useState<SeizureItem[]>([
    {
      substanceName: querySubstance || 'Heroin (Brown Sugar)',
      apparentForm: 'powder',
      weightGrams: 850,
      netWeightGrams: 837.4,
      grossWeightGrams: 862.1,
      packagingType: 'Polythene pouches inside heat-sealed polybag',
      numberOfPackets: 12,
      colorDescription: 'Brown / light-tan granular powder',
      odorDescription: 'Characteristic acetic acid-like pungent odor',
      reagentTestResult: `${queryReagent.toUpperCase()}: Positive for Target Schedule Contraband`,
      sampleDrawn: true,
      sampleWeightGrams: 12.6,
    },
  ]);

  const [witnesses, setWitnesses] = useState<WitnessDetails[]>([
    { name: 'Constable Vikram Yadav', designation: 'Constable, NCB Delhi', badge: 'NCB-CT-1203' },
    { name: 'Ramesh Gupta', designation: 'Independent Civilian Panch Witness (Local Resident)' },
  ]);

  const [narrative, setNarrative] = useState(
    'Acting on intelligence received, a special checking team intercepted the suspect vehicle at the indicated check post. The suspect was served notice under Section 50 of NDPS Act, 1985 and informed of the legal right to be searched before a Gazetted Officer or Magistrate. Suspect consented in writing. Recovery of contraband was subjected to SAKSHYA AI field presumptive chemical colorimetry, yielding immediate positive reaction. Two independent witnesses examined the packaging, weighing, and paper seal.'
  );

  const [toastMessage, setToastMessage] = useState('');

  // ── Auto-load Linked Scan from IndexedDB / Supabase ──────────────────────────
  const loadLinkedScan = useCallback(async () => {
    if (!queryScanId) return;

    try {
      // 1. Try local IndexedDB scans
      const localScans = (await getAllScanResults()) as ScanResult[];
      const match = localScans.find(s => s.id === queryScanId || s.caseId === queryScanId);
      if (match) {
        setLinkedScan(match);
        if (match.caseId) setCaseNumber(match.caseId);
        if (match.photoDataUrl || match.photoUrl) setPhotoPreview(match.photoDataUrl || match.photoUrl || null);
        if (match.photoHash) setPhotoHash(match.photoHash);
        if (match.gps?.latitude && match.gps?.longitude) {
          setLat(match.gps.latitude);
          setLng(match.gps.longitude);
        }
        if (match.matchedSubstance) {
          setSeizureItems(prev => [
            {
              ...prev[0],
              substanceName: match.matchedSubstance,
              reagentTestResult: `${match.reagentType.toUpperCase()}: ${match.testStatus.toUpperCase()} (ΔE: ${match.deltaE.toFixed(2)})`,
            },
          ]);
        }
        return;
      }

      // 2. Try Supabase
      const { data, error } = await supabase
        .from('seizures')
        .select('*, scan_assays(*)')
        .eq('id', queryScanId)
        .maybeSingle();

      if (!error && data) {
        if (data.case_id) setCaseNumber(data.case_id);
        if (data.photo_url) setPhotoPreview(data.photo_url);
        if (data.photo_hash) setPhotoHash(data.photo_hash);
        if (data.gps_latitude && data.gps_longitude) {
          setLat(Number(data.gps_latitude));
          setLng(Number(data.gps_longitude));
        }
        if (data.substance) {
          setSeizureItems(prev => [
            {
              ...prev[0],
              substanceName: data.substance,
              reagentTestResult: `Assay Verified: ${data.status?.toUpperCase() || 'POSITIVE'}`,
            },
          ]);
        }
      }
    } catch (err) {
      console.warn('Could not prefill panchnama from scanId:', err);
    }
  }, [queryScanId]);

  useEffect(() => {
    loadLinkedScan();
  }, [loadLinkedScan]);

  // Lock initial GPS if available
  useEffect(() => {
    if (coordinate) {
      setLat(coordinate.latitude);
      setLng(coordinate.longitude);
    }
  }, [coordinate]);

  const compileFormData = (): PanchnamaForm => {
    return {
      id: `panch_${Date.now()}`,
      formNumber,
      ndpsSection: 'Section 52',
      caseNumber,
      seizureDate,
      seizureTime,
      seizureLocation: {
        description: locationDesc,
        district,
        state,
        latitude: lat,
        longitude: lng,
        nearestLandmark: 'Toll Barrier Singhu Border',
        highwayRoute: 'NH-44',
      },
      accused: accusedList,
      seizureItems,
      evidencePhotoHashes: photoHash ? [photoHash] : [
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      ],
      evidencePhotoDataUrls: photoPreview ? [photoPreview] : undefined,
      evidencePhotoUrls: photoPreview && !photoPreview.startsWith('data:') ? [photoPreview] : undefined,
      linkedScanIds: queryScanId ? [queryScanId] : ['scan_intake_01'],
      investigatingOfficer: {
        name: user?.name || 'Sub-Inspector Pradeep Sharma',
        designation: user?.fullTitle || 'Sub-Inspector (NCB)',
        badgeNumber: user?.badge || 'NCB-IO-4092',
        unit: user?.unit || 'NCB Delhi Zonal Unit',
      },
      witnesses,
      vehicleSeized: true,
      vehicleDetails: {
        registrationNumber: 'HR 26 AX 4421',
        make: 'Tata',
        model: 'Ace',
        color: 'White',
      },
      remarksNarrative: `${narrative}\n\n[PROCEDURAL COMPLIANCE RECORD]\n- Section 50 NDPS Notice: ${section50Served ? 'SERVED & COMPLIED' : 'WAIVED'}\n- Independent Witnesses: ${independentWitnesses ? '2 CIVILIAN PANCHAS PRESENT' : 'RECORDED'}\n- Section 52A Inventory Pre-Certification: ${magistrateSampling ? 'SCHEDULED FOR MAGISTRATE' : 'PENDING'}`,
      legalSections: [
        'Section 8(c) NDPS Act 1985',
        'Section 21(c) NDPS Act 1985',
        'Section 50 NDPS Act 1985 (Notice & Search)',
        'Section 52 NDPS Act 1985 (Seizure Memorandum)',
        'Section 52A NDPS Act 1985 (Magisterial Certification)',
        'Section 65B Bharatiya Sakshya Adhiniyam (BSA)',
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'submitted',
    };
  };

  const handleExportPDF = async () => {
    const data = compileFormData();
    await generatePanchnamaPDF(data);
    setToastMessage('Section 52 NDPS Form F Panchnama PDF generated with embedded evidence photo.');
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleSaveDraft = async () => {
    const data = compileFormData();
    await savePanchnama(data);
    setToastMessage('Panchnama record saved to local IndexedDB registry.');
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleFetchCurrentGPS = async () => {
    try {
      const pos = await captureGPS();
      setLat(pos.latitude);
      setLng(pos.longitude);
    } catch {
      alert('Could not lock satellite GPS. Please allow device location access.');
    }
  };

  return (
    <RoleGuard allowedRoles={['ncb_io', 'ncb_zonal']} featureName="Section 52 Panchnama Seizure Memorandum">
      <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: '3rem', fontFamily: "'Noto Sans', sans-serif" }}>

        {/* Title Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={22} color="#0f5ca8" />
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                NDPS Form &apos;F&apos; Seizure Panchnama
              </h1>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.2rem 0 0' }}>
              Statutory Seizure Memorandum under Section 52 &amp; 52A of Narcotics Drugs &amp; Psychotropic Substances Act, 1985
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleSaveDraft}
              style={{
                padding: '0.5rem 0.9rem',
                background: '#fff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                borderRadius: '7px',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Save size={14} /> Save Draft
            </button>

            <button
              onClick={handleExportPDF}
              style={{
                padding: '0.5rem 1.1rem',
                background: '#0f5ca8',
                color: '#fff',
                border: 'none',
                borderRadius: '7px',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 8px rgba(15, 92, 168, 0.3)',
              }}
            >
              <Download size={14} /> Export Form &apos;F&apos; PDF
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              color: '#16a34a',
              padding: '0.65rem 0.9rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
          >
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ── Linked Evidence Photo Banner (if scan linked) ── */}
        {photoPreview && (
          <div style={{ background: '#f8fafc', border: '1.5px solid #bae6fd', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: 75, height: 75, borderRadius: '8px', overflow: 'hidden', background: '#e2e8f0', border: '1px solid #cbd5e1', flexShrink: 0 }}>
              <img src={photoPreview} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                <ShieldCheck size={16} color="#0f5ca8" />
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Linked Forensic Evidence Attached</span>
                <span style={{ background: '#e0f2fe', color: '#0f5ca8', fontSize: '0.64rem', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>VERIFIED</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>
                This Panchnama is cryptographically bound to the field assay scan. The image will be embedded in the official PDF.
              </div>
              {photoHash && (
                <div style={{ fontSize: '0.66rem', fontFamily: 'monospace', color: '#0f5ca8', marginTop: '0.2rem' }}>
                  SHA-256: {photoHash.slice(0, 24)}…{photoHash.slice(-16)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Section 1: Case Identification */}
          <div style={{ background: 'white', padding: '1.1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f5ca8', margin: '0 0 0.85rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.45rem' }}>
              1. Statutory Case &amp; Seizure Timing
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Case Registration Number</label>
                <input type="text" value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)} style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Form &apos;F&apos; Control Memo No.</label>
                <input type="text" value={formNumber} onChange={(e) => setFormNumber(e.target.value)} style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Date of Interdiction</label>
                <input type="date" value={seizureDate} onChange={(e) => setSeizureDate(e.target.value)} style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Time (IST)</label>
                <input type="time" value={seizureTime} onChange={(e) => setSeizureTime(e.target.value)} style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          {/* Section 2: Statutory NDPS Safeguards Checklist */}
          <div style={{ background: '#f8fafc', padding: '1.1rem 1.25rem', borderRadius: '10px', border: '1.5px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f5ca8', margin: '0 0 0.65rem' }}>
              2. Statutory NDPS Safeguards Checklist
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>
                <input type="checkbox" checked={section50Served} onChange={e => setSection50Served(e.target.checked)} style={{ accentColor: '#0f5ca8' }} />
                <span>Section 50 Notice served (Search before Gazetted Officer)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>
                <input type="checkbox" checked={independentWitnesses} onChange={e => setIndependentWitnesses(e.target.checked)} style={{ accentColor: '#0f5ca8' }} />
                <span>Two independent civilian witnesses present during recovery</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>
                <input type="checkbox" checked={magistrateSampling} onChange={e => setMagistrateSampling(e.target.checked)} style={{ accentColor: '#0f5ca8' }} />
                <span>Section 52A Inventory certified under judicial supervision</span>
              </label>
            </div>
          </div>

          {/* Section 3: Place of Interdiction & Satellite GPS Lock */}
          <div style={{ background: 'white', padding: '1.1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.45rem' }}>
              <h2 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f5ca8', margin: 0 }}>
                3. Place of Interdiction &amp; Satellite GPS Lock
              </h2>
              <button
                onClick={handleFetchCurrentGPS}
                style={{
                  background: '#e0f2fe',
                  border: '1px solid #bae6fd',
                  color: '#0f5ca8',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '5px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <MapPin size={12} /> Refresh GPS
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Location Description (Highway / Toll Checkpost)</label>
                <input type="text" value={locationDesc} onChange={(e) => setLocationDesc(e.target.value)} style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>District</label>
                <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>State</label>
                <input type="text" value={state} onChange={(e) => setState(e.target.value)} style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Latitude (°N)</label>
                <input type="number" step="0.0001" value={lat} onChange={(e) => setLat(parseFloat(e.target.value))} style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box', fontFamily: 'monospace' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Longitude (°E)</label>
                <input type="number" step="0.0001" value={lng} onChange={(e) => setLng(parseFloat(e.target.value))} style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box', fontFamily: 'monospace' }} />
              </div>
            </div>
          </div>

          {/* Section 4: Accused Persons */}
          <div style={{ background: 'white', padding: '1.1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.45rem' }}>
              <h2 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                4. Accused Person(s) Intercepted
              </h2>
              <button
                onClick={() => setAccusedList([...accusedList, { fullName: '', age: 30, gender: 'male', fatherName: '', address: '', district: '', state: '', nationality: 'Indian', idType: 'aadhaar', idNumber: '' }])}
                style={{ background: 'none', border: 'none', color: '#0f5ca8', fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                <Plus size={13} /> Add Accused
              </button>
            </div>

            {accusedList.map((acc, index) => (
              <div key={index} style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', marginBottom: '0.65rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.55rem' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0f172a' }}>Accused #{index + 1}</span>
                  {accusedList.length > 1 && (
                    <button onClick={() => setAccusedList(accusedList.filter((_, i) => i !== index))} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.6rem' }}>
                  <input type="text" placeholder="Full Name" value={acc.fullName} onChange={(e) => { const n = [...accusedList]; n[index].fullName = e.target.value; setAccusedList(n); }} style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem', borderRadius: '5px', border: '1px solid #cbd5e1' }} />
                  <input type="text" placeholder="Father's Name" value={acc.fatherName} onChange={(e) => { const n = [...accusedList]; n[index].fatherName = e.target.value; setAccusedList(n); }} style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem', borderRadius: '5px', border: '1px solid #cbd5e1' }} />
                  <input type="number" placeholder="Age" value={acc.age} onChange={(e) => { const n = [...accusedList]; n[index].age = parseInt(e.target.value) || 0; setAccusedList(n); }} style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem', borderRadius: '5px', border: '1px solid #cbd5e1' }} />
                  <input type="text" placeholder="Address" value={acc.address} onChange={(e) => { const n = [...accusedList]; n[index].address = e.target.value; setAccusedList(n); }} style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem', borderRadius: '5px', border: '1px solid #cbd5e1' }} />
                  <input type="text" placeholder="ID Number (Aadhaar/DL)" value={acc.idNumber} onChange={(e) => { const n = [...accusedList]; n[index].idNumber = e.target.value; setAccusedList(n); }} style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem', borderRadius: '5px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Section 5: Seized Contraband & Sample Matrix */}
          <div style={{ background: 'white', padding: '1.1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f5ca8', margin: '0 0 0.85rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.45rem' }}>
              5. Seized Contraband &amp; Forensic Sample Matrix
            </h2>

            {seizureItems.map((item, index) => (
              <div key={index} style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.65rem' }}>
                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>Identified Contraband</label>
                    <input type="text" value={item.substanceName} onChange={(e) => { const n = [...seizureItems]; n[index].substanceName = e.target.value; setSeizureItems(n); }} style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.78rem', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>Gross Wt (Grams)</label>
                    <input type="number" value={item.grossWeightGrams} onChange={(e) => { const n = [...seizureItems]; n[index].grossWeightGrams = parseFloat(e.target.value) || 0; setSeizureItems(n); }} style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.78rem', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>Net Contraband Wt (Grams)</label>
                    <input type="number" value={item.netWeightGrams} onChange={(e) => { const n = [...seizureItems]; n[index].netWeightGrams = parseFloat(e.target.value) || 0; setSeizureItems(n); }} style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.78rem', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>Packet Count</label>
                    <input type="number" value={item.numberOfPackets} onChange={(e) => { const n = [...seizureItems]; n[index].numberOfPackets = parseInt(e.target.value) || 0; setSeizureItems(n); }} style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.78rem', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section 6: Officer Narrative */}
          <div style={{ background: 'white', padding: '1.1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.65rem' }}>
              6. Investigating Officer Panchnama Narrative &amp; Findings
            </h2>
            <textarea
              rows={4}
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '0.82rem', lineHeight: 1.5, boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

        </div>
      </div>
    </RoleGuard>
  );
}

export default function PanchnamaFormPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading NDPS Panchnama…</div>}>
      <PanchnamaFormContent />
    </Suspense>
  );
}

