// scripts/check_supabase.js
// Standalone pure HTTP inspector for Supabase tables and storage

const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.resolve(__dirname, '../.env.local');
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = trimmed.split('=')[1].trim().replace(/^["']|["']$/g, '');
    }
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = trimmed.split('=')[1].trim().replace(/^["']|["']$/g, '');
    }
  });
}

console.log('====================================================');
console.log('🏛️ DRUG-SEAL AI — Supabase Database Inspection Tool');
console.log('====================================================');
console.log('Endpoint:', supabaseUrl || '(missing)');
console.log('Key:', supabaseKey ? supabaseKey.slice(0, 16) + '...' : '(missing)');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase URL or Anon Key in .env.local');
  process.exit(1);
}

const headers = {
  'apikey': supabaseKey,
  'Authorization': `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'count=exact',
};

async function inspectTable(tableName) {
  const url = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${tableName}?select=*&limit=5`;
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return { status: `ERROR (${res.status})`, message: errText };
    }
    const data = await res.json();
    const contentRange = res.headers.get('content-range'); // e.g. "0-4/12"
    let total = data.length;
    if (contentRange && contentRange.includes('/')) {
      const parts = contentRange.split('/');
      total = parts[1] === '*' ? data.length : parseInt(parts[1], 10);
    }
    return {
      status: 'OK',
      totalCount: total,
      sampleRows: data.map(r => ({
        id: r.id,
        case_id: r.case_id,
        status: r.status,
        substance: r.substance,
        created_at: r.created_at,
      })),
    };
  } catch (err) {
    return { status: 'EXCEPTION', message: err.message };
  }
}

async function inspectStorage() {
  const url = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/bucket`;
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return { status: `ERROR (${res.status})`, message: errText };
    }
    const buckets = await res.json();
    const names = Array.isArray(buckets) ? buckets.map(b => b.name) : [];
    return {
      status: 'OK',
      buckets: names,
      hasForensicReports: names.includes('forensic_reports'),
    };
  } catch (err) {
    return { status: 'EXCEPTION', message: err.message };
  }
}

async function run() {
  const tables = ['seizures', 'scan_assays', 'panchnama_records', 'custody_chain'];
  const results = {};

  for (const t of tables) {
    results[t] = await inspectTable(t);
  }

  results['storage'] = await inspectStorage();

  console.log('\n📊 DATABASE SUMMARY:');
  for (const [key, val] of Object.entries(results)) {
    if (key === 'storage') {
      console.log(`\n📦 Storage: [${val.status}] Buckets: ${val.buckets ? val.buckets.join(', ') : val.message}`);
    } else {
      console.log(`\n📋 Table "${key}": [${val.status}] (Total Records: ${val.totalCount ?? 'N/A'})`);
      if (val.message) {
        console.log(`   ⚠️ Message: ${val.message}`);
      } else if (val.sampleRows && val.sampleRows.length > 0) {
        console.log(`   Sample Rows: ${val.sampleRows.map(r => r.case_id || r.id).join(', ')}`);
      }
    }
  }

  console.log('\n====================================================');
  console.log('📋 FULL JSON REPORT (Share this output with me):');
  console.log('====================================================\n');
  console.log(JSON.stringify(results, null, 2));
}

run();
