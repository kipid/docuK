// Temporary generator: builds localized copies of "pure SEE.html".
// Only the listed prose lines are replaced; everything else (markup, code, LaTeX) is kept verbatim.
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const ROOT = path.dirname(DIR);
const SRC = path.join(ROOT, 'pure SEE.html');

// line-number (or "from-to" range) -> signature that must exist in the ORIGINAL line
const UNITS = {
  '27': 'name="description"',
  '30': '# pure SEE',
  '32': 'The docuK rendered',
  '34': 'I recommend you to',
  '42': 'Posting History is put here. This section',
  '45': 'docuK-prism.css',
  '46': 'New updates coming soon',
  '47-49': 'Codes to be pretty-printed',
  '50': 'Full SEE (Super Easy Edit) docuK codes',
  '51': '2023-05-18 : Update.',
  '52': 'First posting',
  '59': 'Abstract | Description',
  '61': 'Specific features are',
  '64': 'Changable mode',
  '65': 'Resizable font-size',
  '66': 'Table of contents',
  '67': 'Numbering of sections',
  '68': 'Citing references in bubble',
  '69': 'Refering figures and equations',
  '70': 'Refering anything with id',
  '71': 'Delayed(lazy)-loading',
  '72': 'Delayed(lazy)-rendering',
  '73': 'Auto code printing from',
  '76': 'Quite similar to LaTeX',
  '80': 'code only',
  '86': 'Full SEE code of docuK',
  '96': 'Categories of this document is put here',
  '107': '## Warning',
  '109': 'In this live demo',
  '111': 'k.docuKProcess()',
  '118': 'Details will be explained',
  '122': '## Statement',
  '124': 'Each statement or paragraph',
  '126': "If '#' and",
  '130': '## DocuK and sections',
  '132': "'#' indicates docuK",
  '134': "End of docuK: '#/'",
  '136': 'End of something can be used as comments.',
  '137': "Text after '#/' is ignored",
  '138': 'Or just <span class="emph">end of something',
  '140': 'The following is ignored',
  '142': 'End of something can be used as comments.',
  '143': "Text after '#/' is ignored",
  '144': 'Or just <span class="emph">end of something',
  '148': 'Section with class and id',
  '150': 'Section can have class and id',
  '152': 'Class and Id are asigned',
  '160': 'Predifined section',
  '162': 'There are three predefined sections',
  '164': 'See the predefined sections',
  '168': 'No section numbering (class',
  '170': 'To avoid section numbering',
  '178': 'SubSection of [.no-sec-N',
  '186': 'SubSubSection of [.no-sec-N',
  '194': 'Citing RRA and Refering',
  '238': 'There are the blow HTML elments',
  '309': 'Citing with inside HTML, and no matching',
  '323': 'Posting History is put here. This section',
  '326': 'Posting History is put here.',
  '327': '2014-06-18: First posting',
  '336': 'TOC is a self-closing section',
  '337': 'Next text will be out of TOC.',
  '340': 'Table will be automatically filled up.',
  '349': '<h3>Main</h3>',
  '353': 'Supported by',
  '360': 'API documentation',
  '363': 'Other markdown/markup languages',
  '364': 'ref-latex',
  '373': 'will be appended below',
  '351': '// Updated regularly',
  '355': '// JavaScript enhancer',
  '357': '// Math renderer.',
  '359': '// Code prettyfier.',
  '361': 'jQuery - contents()',
  '362': 'MDN - CSS full reference',
  '365': '// 다른 이런류의',
  '366': '// 그래도 문법은',
  '368': '// Wikipedia uses',
  '370': '// Stack Overflow uses',
  '372': '// This might be used in GitHub wiki.',
  '380': 'head (h2) of section',
  '382': 'section contents',
  '386': 'head (h3) of subsection',
  '388': 'contents of subsection',
  '392': 'head (h4) of subsubsection',
  '394': 'contents of subsubsection',
  '396': 'optional end of subsubsection',
  '398': 'optional end of subsection',
  '400': 'optional end of section',
  '404': 'Initially Hiden Section',
  '406': 'With hiden class',
  '410': '## Raw HTML',
  '412': 'Since learning and remembering',
  '415': 'Raw HTML can be added like this',
  '418': 'Raw text is appended as a paragraph',
  '422': 'This is default comment box',
  '424': 'You can put multiple paragraphs',
  '427': 'Unordered list 1.',
  '428': 'Unordered list 2.',
  '431': 'Ordered list 1.',
  '432': 'Ordered list 2.',
  '435': 'This is it.',
  '441': 'be careful',
  '447': 'Links | URLs to appropriate html',
  '449': 'Planning to implement this.',
  '457': '## Figures',
  '466': 'with (Not CSV',
  '477': 'to',
  '470-473': '오프라인 매장',
  '480': '제품',
  '481': '갤럭시 Watch 8 40mm',
  '482': '갤럭시 Watch 8 Classic',
  '483': '갤럭시 Watch 8 2025',
  '488': '## Maths or Equations',
  '490': 'Maths or Equations can be put',
  '492': 'The first two are converted',
  '508': '## Codes',
  '510': 'Codes can be pretty-printed',
  '512': 'Another example with',
  '518': 'Using <code class="lang-html">&lt;pre class=',
  '556': 'Using <code class="lang-html">```Codes',
  '598': 'For no linenums',
  '600': 'By default, there are linenums',
  '606': '// ETag 패턴',
  '609': '// 파일을 읽고',
  '612': '// 파일 읽기',
  '615': '// 현재 날짜로',
  '616': '// YYYY-MM-DD 형식',
  '619': '// 변경사항이 있는 경우에만',
  '631': '// 디렉토리를 재귀적으로',
  '641': '// 디렉토리인 경우',
  '644': '// 파일인 경우 ETag',
  '653': '// 메인 실행 함수',
  '655': 'const targetDirectory',
  '667': '// 스크립트가 직접 실행될 때만',
  '681': 'Fuzzy Search of Contents',
  '683': 'You can easily fuzzy-search',
  '687': 'Header, Footer',
  '689': 'In header and footer, there are promotions',
  '691': 'You can set the recoeve page',
  '693': 'You can disable these promotions',
  '695': 'In this page, I set the recoeve-related',
  '703': 'So the iframe pages in the header',
  '705': 'The default value of <code>k.recoeveUserId',
  '758': 'Description of this document',
  '768': '// Some codes used only in this document',
};

const LANGS = (process.env.LANGS || 'en,ko,zh,ja,de,fr,es,hi,ar,pt,nl,ru').split(',');
const IN_TEMPLATE = new Set(['758', '768']); // inside a JS template literal

const raw = fs.readFileSync(SRC, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
const base = raw.split(/\r?\n/);

// ---- validate the source itself -------------------------------------------
const starts = new Map();
for (const key of Object.keys(UNITS)) {
  const [from, to] = key.includes('-') ? key.split('-').map(Number) : [Number(key), Number(key)];
  const line = base[from - 1];
  if (line === undefined) throw new Error(`source has no line ${from}`);
  if (!line.includes(UNITS[key])) {
    throw new Error(`signature mismatch at line ${from}: expected ${JSON.stringify(UNITS[key])} in ${JSON.stringify(line)}`);
  }
  starts.set(from, { to });
}
if (base.length < 790) throw new Error(`unexpected source line count: ${base.length}`);

// ---- build ----------------------------------------------------------------
const report = [];
for (const code of LANGS) {
  const mod = require(path.join(DIR, code + '.cjs'));
  const lines = new Map();
  for (const [key, text] of Object.entries(mod.lines)) {
    if (!(key in UNITS)) throw new Error(`${code}: unknown unit ${key}`);
    if (typeof text !== 'string' || !text.length) throw new Error(`${code}: empty text for ${key}`);
    if (IN_TEMPLATE.has(key) && (text.includes('`') || text.includes('${'))) {
      throw new Error(`${code}: unit ${key} is inside a template literal, remove backtick or dollar-brace`);
    }
    lines.set(key, text);
  }
  const HANDLED = new Set(['27', '30']); // desc / title
  const missing = Object.keys(UNITS).filter((k) => !HANDLED.has(k) && !lines.has(k));
  if (missing.length && !mod.partial) throw new Error(`${code}: missing units ${missing.join(',')}`);

  const metaLine = `<meta charset="utf-8" name="description" content="${mod.desc}"/>`;

  const out = [];
  for (let i = 0; i < base.length; i++) {
    const no = i + 1;
    if (no === 27) {
      out.push(metaLine);
      continue;
    }
    if (no === 30) {
      out.push(mod.title || `# pure SEE.${mod.code}`);
      continue;
    }
    const hit = starts.get(no);
    if (hit) {
      let text =
        lines.get(String(no)) || lines.get(`${no}-${hit.to}`) || base.slice(no - 1, hit.to).join(eol.includes('\r') ? '\r\n' : '\n');
      // Guard: keep a trailing list-closing tag when a translation omits it.
      const tail = (base[hit.to - 1].match(/<\/li>\s*$/) || [])[0];
      if (tail && !text.endsWith(tail)) text += tail;
      i = hit.to - 1;
      out.push(...text.split('\n'));
      continue;
    }
    if (i === 724 || i === 780) {
      const replaced = base[i].replace('"pure-SEE"', `"${mod.identifier}"`);
      if (!replaced.includes(`"${mod.identifier}"`)) throw new Error(`${code}: cannot set identifier at line ${no}`);
      out.push(replaced);
      continue;
    }
    out.push(base[i]);
  }

  const dest = path.join(ROOT, `pure SEE.${code}.html`);
  fs.writeFileSync(dest, out.join(eol), 'utf8');
  report.push(`${code}: lines=${out.length} translated=${lines.size} missing=${missing.length}${missing.length ? ' -> ' + missing.join(',') : ''}`);
}

fs.writeFileSync(path.join(DIR, '_report.txt'), report.join('\n'), 'utf8');
console.log(report.join('\n'));
