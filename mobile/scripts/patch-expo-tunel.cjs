const fs = require('fs');
const path = require('path');

const cliPath = path.join(__dirname, '..', 'node_modules', 'expo', 'bin', 'cli');
const patchLine = "process.argv = process.argv.map((arg) => (arg === '--tunel' ? '--tunnel' : arg));";

if (!fs.existsSync(cliPath)) {
  console.warn('[patch-expo-tunel] Expo CLI not found; skipping.');
  process.exit(0);
}

const source = fs.readFileSync(cliPath, 'utf8');

if (source.includes(patchLine)) {
  process.exit(0);
}

const patched = source.replace(
  '#!/usr/bin/env node\n\n',
  `#!/usr/bin/env node\n\n${patchLine}\n\n`
);

if (patched === source) {
  console.warn('[patch-expo-tunel] Unexpected Expo CLI format; skipping.');
  process.exit(0);
}

fs.writeFileSync(cliPath, patched);
console.log('[patch-expo-tunel] Added --tunel compatibility.');
