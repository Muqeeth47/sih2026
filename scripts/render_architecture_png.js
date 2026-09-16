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

const browserPath = possibleBrowsers.find(p => fs.existsSync(p));
if (!browserPath) {
  console.error('No browser executable found.');
  process.exit(1);
}

const htmlFile = 'http://localhost:3000/architecture-diagram.html';
const targets = [
  path.join(outDir, 'architecture_diagram_slide3.png'),
  path.join(__dirname, '..', 'public', 'architecture_diagram.png')
];

console.log('Rendering high-res architecture diagram from:', htmlFile);

for (const target of targets) {
  try {
    const cmd = `"${browserPath}" --headless=new --disable-gpu --virtual-time-budget=3000 --hide-scrollbars --window-size=1400,900 --screenshot="${target}" "${htmlFile}"`;
    execSync(cmd, { stdio: 'inherit', timeout: 20000 });
    if (fs.existsSync(target)) {
      console.log(`[SUCCESS] Saved high-res architecture PNG: ${target} (${fs.statSync(target).size} bytes)`);
    }
  } catch (err) {
    console.error('Error capturing diagram:', err.message);
  }
}

console.log('Done rendering architecture diagram.');
