// Temporary verification of generated localized copies (ASCII-only console output).
const fs = require('fs');
const path = require('path');

const ROOT = path.dirname(__dirname);
const langs = 'en,ko,zh,ja,de,fr,es,hi,ar,pt,nl,ru'.split(',');
const src = fs.readFileSync(path.join(ROOT, 'pure SEE.html'), 'utf8').split(/\r?\n/);
let fail = 0;

for (const code of langs) {
  const file = path.join(ROOT, `pure SEE.${code}.html`);
  const raw = fs.readFileSync(file, 'utf8');
  const lines = raw.split(/\r?\n/);
  const metaOk = lines[26].startsWith('<meta charset="utf-8" name="description" content="') && lines[26].endsWith('"/>');
  const titleOk = lines[29] === `# pure SEE.${code}`;
  const idCount = (raw.match(new RegExp(`"pure-SEE\\.${code}"`, 'g')) || []).length;
  const plain = (raw.match(/"pure-SEE"/g) || []).length;
  const bad = (raw.match(/\ufffd/g) || []).length;
  const nul = (raw.match(/\u0000/g) || []).length;
  const undef = (raw.match(/>undefined</g) || []).length;
  const lineCount = lines.length;
  const sameAsSrc = raw === src.join(raw.includes('\r\n') ? '\r\n' : '\n');
  const ok = metaOk && titleOk && idCount === 2 && plain === 0 && bad === 0 && nul === 0 && undef === 0 && lineCount === src.length;
  if (!ok) fail++;
  console.log(
    `${code}: ${ok ? 'PASS' : 'FAIL'} meta=${metaOk} title=${titleOk} id=${idCount} plain=${plain} ` +
      `badchars=${bad} nul=${nul} undefined=${undef} lines=${lineCount} identicalToSource=${sameAsSrc}`
  );
}
console.log(fail === 0 ? 'ALL PASS' : `${fail} file(s) FAILED`);

