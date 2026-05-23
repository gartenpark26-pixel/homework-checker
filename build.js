const fs = require('fs');
const version = `hw-checker-v${Date.now()}`;
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/const CACHE = 'hw-checker-v[\w-]+';/, `const CACHE = '${version}';`);
fs.writeFileSync('sw.js', sw);
console.log(`[build] SW cache version: ${version}`);
