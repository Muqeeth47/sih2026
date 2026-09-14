'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { generatePanchnamaPDF } from '@/utils/panchnamaPdf';
import { savePanchnama } from '@/utils/offlineQueue';
import type { PanchnamaForm, AccusedDetails, SeizureItem, WitnessDetails } from '@/types/panchnama';
import { FileText, Download, Save, Plus, Trash2, MapPin, CheckCircle2 } from 'lucide-react';
import RoleGuard from '@/components/shared/RoleGuard';

export default function PanchnamaFormPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const { coordinate, capture: captureGPS } = useGeoLocation();

  const querySubstance = searchParams.get('substance') || 'Heroin (Brown Sugar)';
  const queryReagent = searchParams.get('reagent') || 'marquis';
  const queryScanId = searchParams.get('scanId') || '';

  const [caseNumber, setCaseNumber] = useState(`NCB-CASE-${new Date().getFullYear()}-00421`);
  const [formNumber, setFormNumber] = useState(`NCB/DL/${new Date().getFullYear()}/F/001`);
  const [seizureDate, setSeizureDate] = useState(new Date().toISOString().split('T')[0]);
  const [seizureTime, setSeizureTime] = useState(new Date().toTimeString().slice(0, 5));

  const [locationDesc, setLocationDesc] = useState('NH-44 Highway Bypass, Toll Gate No. 3, Near Singhu Border');
  const [district, setDistrict] = useState('North Delhi');
  const [state, setState] = useState('Delhi');
  const [lat, setLat] = useState(28.6139);
  const [lng, setLng] = useState(77.2090);

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
      substanceName: querySubstance,
      apparentForm: 'powder',
      weightGrams: 850,
      netWeightGrams: 837.4,
      grossWeightGrams: 862.1,
      packagingType: 'Polythene pouches inside jute bag',
      numberOfPackets: 12,
      colorDescription: 'Brown/light brown granular powder',
      odorDescription: 'Characteristic acetic acid-like odor',
      reagentTestResult: `${queryReagent.toUpperCase()}: Positive for Target Schedule Contraband`,
      sampleDrawn: true,
      sampleWeightGrams: 12.6,
    },
  ]);

  const [witnesses, setWitnesses] = useState<WitnessDetails[]>([
    { name: 'Constable Vikram Yadav', designation: 'Constable, NCB Delhi', badge: 'NCB-CT-1203' },
    { name: 'Ramesh Gupta', designation: 'Panch Witness (Civilian Trader)' },
  ]);

  const [narrative, setNarrative] = useState(
    'Acting on intelligence received, a special checking team intercepted a transport vehicle at the indicated check post. The driver was searched under Section 50 of NDPS Act after explaining legal rights. Recovery of contraband was subjected to on-device field chemical test via DRUG-SEAL AI, yielding positive spot reaction. Two independent witnesses examined the packaging and affixation of NCB forensic paper seal.'
  );

  const [toastMessage, setToastMessage] = useState('');

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
        nearestLandmark: 'Toll Barrier Check Post',
        highwayRoute: 'NH-44',
      },
      accused: accusedList,
      seizureItems,
      evidencePhotoHashes: [
        'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
      ],
      linkedScanIds: queryScanId ? [queryScanId] : ['scan_mock_01'],
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
      remarksNarrative: narrative,
      legalSections: [
        'Section 8(c) NDPS Act 1985',
        'Section 21(c) NDPS Act 1985',
        'Section 52 NDPS Act 1985',
        'Section 67 NDPS Act 1985',
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'submitted',
    };
  };

  const handleExportPDF = () => {
    const data = compileFormData();
    generatePanchnamaPDF(data);
    setToastMessage('Section 52 NDPS Form F Panchnama PDF generated and downloaded.');
    setTimeout(() => setToastMessage(''), 4000);
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
      alert('Could not lock satellite GPS. Please allow browser location access.');
    }
  };

  return (
    <RoleGuard allowedRoles={['ncb_io', 'ncb_zonal']} featureName="Section 52 Panchnama Seizure Memorandum">
      <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={24} color="var(--ncb-navy-primary)" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ncb-navy-dark)', margin: 0 }}>
              NDPS Form &apos;F&apos; Seizure Panchnama
            </h1>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--ncb-text-muted)', margin: '0.2rem 0 0' }}>
            Statutory Seizure Memorandum under Section 52 of Narcotics Drugs & Psychotropic Substances Act, 1985
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            onClick={handleSaveDraft}
            style={{
              padding: '0.6rem 1rem',
              background: 'white',
              border: '1px solid var(--ncb-border)',
              color: 'var(--ncb-text-main)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Save size={16} />
            Save Draft
          </button>

          <button
            onClick={handleExportPDF}
            style={{
              padding: '0.6rem 1.25rem',
              background: 'var(--ncb-navy-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <Download size={16} />
            Export Form &apos;F&apos; PDF
          </button>
        </div>
      </div>

      {toastMessage && (
        <div
          style={{
            background: 'var(--ncb-green-subtle)',
            border: '1px solid #86efac',
            color: 'var(--ncb-green)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Form Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Section 1: Case Identification */}
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ncb-navy-primary)', margin: '0 0 1rem', borderBottom: '1px solid var(--ncb-border-subtle)', paddingBottom: '0.5rem' }}>
            1. Statutory Case & Seizure Timing
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ncb-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Case Registration Number</label>
              <input type="text" value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ncb-border)', fontSize: '0.85rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ncb-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Form &apos;F&apos; Control Memo No.</label>
              <input type="text" value={formNumber} onChange={(e) => setFormNumber(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ncb-border)', fontSize: '0.85rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ncb-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Date of Interdiction</label>
              <input type="date" value={seizureDate} onChange={(e) => setSeizureDate(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ncb-border)', fontSize: '0.85rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ncb-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Time (IST)</label>
              <input type="time" value={seizureTime} onChange={(e) => setSeizureTime(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ncb-border)', fontSize: '0.85rem', boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>

        {/* Section 2: Location & GPS */}
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--ncb-border-subtle)', paddingBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ncb-navy-primary)', margin: 0 }}>
              2. Place of Interdiction & Satellite GPS Lock
            </h2>
            <button
              onClick={handleFetchCurrentGPS}
              style={{
                background: 'rgba(2, 132, 199, 0.1)',
                border: '1px solid var(--ncb-blue-accent)',
                color: 'var(--ncb-blue-accent)',
                padding: '0.3rem 0.7rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <MapPin size={14} /> Refresh GPS
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ncb-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Location Description (Highway/Border Checkpost)</label>
              <input type="text" value={locationDesc} onChange={(e) => setLocationDesc(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ncb-border)', fontSize: '0.85rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ncb-text-muted)', display: 'block', marginBottom: '0.3rem' }}>District</label>
              <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ncb-border)', fontSize: '0.85rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ncb-text-muted)', display: 'block', marginBottom: '0.3rem' }}>State</label>
              <input type="text" value={state} onChange={(e) => setState(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ncb-border)', fontSize: '0.85rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ncb-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Latitude (°N)</label>
              <input type="number" step="0.0001" value={lat} onChange={(e) => setLat(parseFloat(e.target.value))} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ncb-border)', fontSize: '0.85rem', boxSizing: 'border-box', fontFamily: 'monospace' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ncb-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Longitude (°E)</label>
              <input type="number" step="0.0001" value={lng} onChange={(e) => setLng(parseFloat(e.target.value))} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--ncb-border)', fontSize: '0.85rem', boxSizing: 'border-box', fontFamily: 'monospace' }} />
            </div>
          </div>
        </div>

        {/* Section 3: Accused Persons */}
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--ncb-border-subtle)', paddingBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ncb-navy-primary)', margin: 0 }}>
              3. Accused Person(s) Intercepted
            </h2>
            <button
              onClick={() => setAccusedList([...accusedList, { fullName: '', age: 30, gender: 'male', fatherName: '', address: '', district: '', state: '', nationality: 'Indian', idType: 'aadhaar', idNumber: '' }])}
              style={{ background: 'none', border: 'none', color: 'var(--ncb-blue-accent)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              <Plus size={14} /> Add Accused
            </button>
          </div>

          {accusedList.map((acc, index) => (
            <div key={index} style={{ background: 'var(--ncb-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--ncb-text-main)' }}>Accused #{index + 1}</span>
                {accusedList.length > 1 && (
                  <button onClick={() => setAccusedList(accusedList.filter((_, i) => i !== index))} style={{ background: 'none', border: 'none', color: 'var(--ncb-crimson)', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <input type="text" placeholder="Full Name" value={acc.fullName} onChange={(e) => { const n = [...accusedList]; n[index].fullName = e.target.value; setAccusedList(n); }} style={{ padding: '0.45rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                <input type="text" placeholder="Father's Name" value={acc.fatherName} onChange={(e) => { const n = [...accusedList]; n[index].fatherName = e.target.value; setAccusedList(n); }} style={{ padding: '0.45rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                <input type="number" placeholder="Age" value={acc.age} onChange={(e) => { const n = [...accusedList]; n[index].age = parseInt(e.target.value) || 0; setAccusedList(n); }} style={{ padding: '0.45rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                <input type="text" placeholder="Address" value={acc.address} onChange={(e) => { const n = [...accusedList]; n[index].address = e.target.value; setAccusedList(n); }} style={{ padding: '0.45rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                <input type="text" placeholder="ID Number (Aadhaar/DL)" value={acc.idNumber} onChange={(e) => { const n = [...accusedList]; n[index].idNumber = e.target.value; setAccusedList(n); }} style={{ padding: '0.45rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Section 4: Contraband Details */}
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ncb-navy-primary)', margin: '0 0 1rem', borderBottom: '1px solid var(--ncb-border-subtle)', paddingBottom: '0.5rem' }}>
            4. Seized Contraband & Sample Matrix
          </h2>

          {seizureItems.map((item, index) => (
            <div key={index} style={{ background: 'var(--ncb-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ncb-text-muted)' }}>Identified Contraband</label>
                  <input type="text" value={item.substanceName} onChange={(e) => { const n = [...seizureItems]; n[index].substanceName = e.target.value; setSeizureItems(n); }} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ncb-text-muted)' }}>Gross Wt (Grams)</label>
                  <input type="number" value={item.grossWeightGrams} onChange={(e) => { const n = [...seizureItems]; n[index].grossWeightGrams = parseFloat(e.target.value) || 0; setSeizureItems(n); }} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ncb-text-muted)' }}>Net Contraband Wt (Grams)</label>
                  <input type="number" value={item.netWeightGrams} onChange={(e) => { const n = [...seizureItems]; n[index].netWeightGrams = parseFloat(e.target.value) || 0; setSeizureItems(n); }} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ncb-text-muted)' }}>Packet Count</label>
                  <input type="number" value={item.numberOfPackets} onChange={(e) => { const n = [...seizureItems]; n[index].numberOfPackets = parseInt(e.target.value) || 0; setSeizureItems(n); }} style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section 5: Officer Narrative */}
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--ncb-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ncb-navy-primary)', margin: '0 0 1rem', borderBottom: '1px solid var(--ncb-border-subtle)', paddingBottom: '0.5rem' }}>
            5. Investigating Officer Panchnama Narrative
          </h2>
          <textarea
            rows={4}
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--ncb-border)', fontSize: '0.85rem', lineHeight: 1.5, boxSizing: 'border-box' }}
          />
        </div>
      </div>
      </div>
    </RoleGuard>
  );
}
