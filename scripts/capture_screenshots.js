const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const possibleBrowsers = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
];

let browserPath = possibleBrowsers.find(p => fs.existsSync(p));
if (!browserPath) {
  console.error('No browser executable found.');
  process.exit(1);
}

const pages = [
  { name: '01_landing_hero.png', url: 'http://localhost:3000' },
  { name: '02_login_gateway.png', url: 'http://localhost:3000/login' },
  { name: '03_architecture.png', url: 'http://localhost:3000/architecture' },
  { name: '04_how_to_use.png', url: 'http://localhost:3000/how-to-use' },
  { name: '05_evidence_vault.png', url: 'http://localhost:3000/vault' },
  { name: '06_panchnama_generator.png', url: 'http://localhost:3000/panchnama' },
  { name: '07_zonal_analytics.png', url: 'http://localhost:3000/zonal/analytics' },
];

for (const p of pages) {
  const targetFile = path.join(outDir, p.name);
  console.log(`Capturing ${p.url} -> ${p.name}...`);
  try {
    const cmd = `"${browserPath}" --headless=new --disable-gpu --virtual-time-budget=5000 --hide-scrollbars --window-size=1280,850 --screenshot="${targetFile}" "${p.url}"`;
    execSync(cmd, { timeout: 25000 });
    if (fs.existsSync(targetFile)) {
      console.log(`[SUCCESS] Saved: ${p.name} (${fs.statSync(targetFile).size} bytes)`);
    } else {
      console.log(`[WARNING] Target file not created for ${p.name}`);
    }
  } catch (err) {
    console.error(`[ERROR] ${p.name}:`, err.message);
  }
}

console.log('Finished capturing process.');
