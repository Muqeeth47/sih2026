const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'screenshots');
const packDir = path.join(baseDir, 'slide_pack');

[baseDir, packDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const possibleBrowsers = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
];

const browserPath = possibleBrowsers.find(p => fs.existsSync(p));
if (!browserPath) {
  console.error('No browser executable found.');
  process.exit(1);
}

console.log('Using browser:', browserPath);

const captures = [
  // Slide 1
  { file: 'slide1_01_landing_hero.png', url: 'http://localhost:3000', size: '1280,850' },
  { file: 'slide1_02_login_gateway.png', url: 'http://localhost:3000/login', size: '1280,850' },
  { file: 'slide1_03_mobile_view.png', url: 'http://localhost:3000', size: '420,880' },

  // Slide 2
  { file: 'slide2_01_reagent_simulator.png', url: 'http://localhost:3000#simulator', size: '1280,850' },
  { file: 'slide2_02_how_to_use_sop.png', url: 'http://localhost:3000/how-to-use', size: '1280,850' },

  // Slide 3
  { file: 'slide3_01_architecture_diagram.png', url: 'http://localhost:3000/architecture-diagram.html', size: '1400,900' },
  { file: 'slide3_02_architecture_page.png', url: 'http://localhost:3000/architecture', size: '1280,850' },

  // Slide 4
  { file: 'slide4_01_evidence_vault.png', url: 'http://localhost:3000/vault', size: '1280,850' },
  { file: 'slide4_02_field_locker.png', url: 'http://localhost:3000/field/vault', size: '1280,850' },

  // Slide 5
  { file: 'slide5_01_pan_india_heatmap.png', url: 'http://localhost:3000/zonal/analytics', size: '1280,850' },
  { file: 'slide5_02_panchnama_form_f.png', url: 'http://localhost:3000/panchnama', size: '1280,850' },
  { file: 'slide5_03_zonal_charts.png', url: 'http://localhost:3000/analytics', size: '1280,850' },

  // Slide 6
  { file: 'slide6_01_court_vault_ledger.png', url: 'http://localhost:3000/court/vault', size: '1280,850' },
  { file: 'slide6_02_terms_legal_policy.png', url: 'http://localhost:3000/terms', size: '1280,850' },
];

for (const item of captures) {
  const targetFile = path.join(packDir, item.file);
  const rootTarget = path.join(baseDir, item.file);
  console.log(`[CAPTURING] ${item.url} -> ${item.file} (${item.size})...`);
  try {
    const cmd = `"${browserPath}" --headless=new --disable-gpu --virtual-time-budget=4000 --hide-scrollbars --window-size=${item.size} --screenshot="${targetFile}" "${item.url}"`;
    execSync(cmd, { stdio: 'inherit', timeout: 25000 });
    if (fs.existsSync(targetFile)) {
      fs.copyFileSync(targetFile, rootTarget);
      console.log(`  ✓ Saved ${item.file} (${fs.statSync(targetFile).size} bytes)`);
    }
  } catch (err) {
    console.error(`  ✗ Failed ${item.file}:`, err.message);
  }
}

console.log('\nAll slide pack images captured successfully in screenshots/slide_pack/ and screenshots/!');
