import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const files=[]; function walk(d){ for(const f of readdirSync(d)){ const p=join(d,f); if(['node_modules','dist','.git'].some(x=>p.includes(x))) continue; if(statSync(p).isDirectory()) walk(p); else if(/\.(js|jsx)$/.test(p)) files.push(p); }} walk('src'); walk('functions');
for (const file of files) { const text=readFileSync(file,'utf8'); if (/try\s*{\s*import/.test(text)) throw new Error(`try/catch import forbidden: ${file}`); }
console.log(`Checked ${files.length} JS files`);
