#!/usr/bin/env node
// Scrapes DC Road Runners race results (2007-2014), downloads any result
// that contains "lawruk" and saves it to the races/ folder.

const fs = require('fs');
const path = require('path');

const BASE = 'https://old.dcroadrunners.org';
const START_YEAR = 2007;
const END_YEAR = 2014;
const RACES_DIR = path.join(__dirname, '..', 'races');

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.text();
}

// Skip labels that are pure navigation, not race links
const NAV_SKIP = new Set([
  '', 'races', 'upcoming races', 'race results', 'archives',
  'expense report', 'race rules/series', 'go to top',
  'about us', 'home', 'calendar', 'links', 'training',
  'membership information', 'race services', 'runner spotlight',
  'volunteer', 'financial information', 'weekly runs',
  'book club', 'board meeting minutes',
]);

function extractRaceLinks(html, baseUrl) {
  const links = [];
  const re = /<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = m[1].trim();
    const text = m[2].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    // Only follow .html links on the same host
    if (!href.endsWith('.html')) continue;
    if (href.startsWith('http') && !href.startsWith(BASE)) continue;
    if (href.startsWith('#')) continue;
    // Skip pure year numbers and nav items
    if (/^\d{4}$/.test(text)) continue;
    if (NAV_SKIP.has(text.toLowerCase())) continue;
    // Must be under /races/ path
    const abs = href.startsWith('http') ? href : new URL(href, baseUrl).href;
    if (!abs.includes('/races/')) continue;
    // Exclude the year-index pages themselves
    if (/\/races\/race-results\/\d{4}-results\.html$/.test(abs)) continue;
    links.push({ href: abs, text });
  }
  // Deduplicate by href
  const seen = new Set();
  return links.filter(l => {
    if (seen.has(l.href)) return false;
    seen.add(l.href);
    return true;
  });
}

const MONTH_MAP = {
  january:1, february:2, march:3, april:4, may:5, june:6,
  july:7, august:8, september:9, october:10, november:11, december:12,
  jan:1, feb:2, mar:3, apr:4, jun:6, jul:7, aug:8, sep:9, oct:10, nov:11, dec:12,
};

function parseDate(text) {
  const validYear = '(?:200[7-9]|201[0-9]|202[0-6])';
  const monthNames = 'January|February|March|April|May|June|July|August|September|October|November|December';

  // "01 February 2009" or "1 Feb 2009"
  let m = text.match(new RegExp(`\\b(\\d{1,2})\\s+(${monthNames})\\s+(${validYear})\\b`, 'i'));
  if (m) {
    const mon = MONTH_MAP[m[2].toLowerCase()];
    return `${m[3]}${String(mon).padStart(2,'0')}${String(m[1]).padStart(2,'0')}`;
  }
  // "February 1, 2009" or "February 1 2009"
  m = text.match(new RegExp(`\\b(${monthNames})\\s+(\\d{1,2}),?\\s+(${validYear})\\b`, 'i'));
  if (m) {
    const mon = MONTH_MAP[m[1].toLowerCase()];
    return `${m[3]}${String(mon).padStart(2,'0')}${String(m[2]).padStart(2,'0')}`;
  }
  // ISO "2009-02-01"
  m = text.match(new RegExp(`\\b(${validYear})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b`));
  if (m) return `${m[1]}${m[2]}${m[3]}`;

  return null;
}

// Extract metadata from the article div text and page title/meta
function deriveMeta(html, linkText, yearHint) {
  // --- Article text (strip tags) ---
  const articleM = html.match(/class="article[^"]*"[^>]*>([\s\S]*?)(?:<\/div>|<div\b)/i);
  const articleText = articleM
    ? articleM[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';

  // --- Race title from <meta name="title"> ---
  let raceTitle = '';
  const metaTitleM = html.match(/<meta[^>]*name=["']title["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']title["']/i);
  if (metaTitleM) {
    raceTitle = metaTitleM[1].replace(/^DCRRC?\s*/i, '').trim();
  }
  if (!raceTitle) {
    // Fall back to page <title>, strip "DC Road Runners - " prefix
    const pageTitleM = html.match(/<title>([\s\S]*?)<\/title>/i);
    if (pageTitleM) {
      raceTitle = pageTitleM[1].replace(/^DC Road Runners\s*[-–]\s*/i, '').replace(/^DCRRC?\s*/i, '').trim();
    }
  }
  if (!raceTitle && linkText) {
    raceTitle = linkText.replace(/^\d{4}\s+/, '').trim();
  }

  // --- Date: search article text first, then full page ---
  let dateStr = parseDate(articleText);
  if (!dateStr) dateStr = parseDate(html.replace(/<[^>]*>/g, ' '));
  // Fall back to year hint
  if (!dateStr && yearHint) dateStr = `${yearHint}0101`;

  // --- Distance ---
  const distanceMap = [
    [/\b50\s*k\b/i, '50K'],
    [/\b20\s*m(ile|iler)?\b/i, '20M'],
    [/\b15\s*m(ile|iler)?\b/i, '15M'],
    [/\bhalf[- ]marathon\b/i, 'HM'],
    [/\bmarathon\b/i, 'M'],
    [/\b15\s*k\b/i, '15K'],
    [/\b12\s*k\b/i, '12K'],
    [/\b10\s*m(ile|iler)?\b/i, '10M'],
    [/\b10\s*k\b/i, '10K'],
    [/\b8\s*k\b/i, '8K'],
    [/\b5\s*m(ile|iler)?\b/i, '5M'],
    [/\b5\s*k\b/i, '5K'],
    [/\b4\.5\s*m(ile|iler)?\b/i, '4_5M'],
    [/\b4\s*m(ile|iler)?\b/i, '4M'],
    [/\b3\s*m(ile|iler)?\b/i, '3M'],
    [/\b2\s*m(ile|iler)?\b/i, '2M'],
    [/\b1\s*m(ile|iler)?\b/i, '1M'],
  ];
  const distSrc = (raceTitle || '') + ' ' + linkText + ' ' + articleText.slice(0, 200);
  let distance = 'Race';
  for (const [re, code] of distanceMap) {
    if (re.test(distSrc)) { distance = code; break; }
  }

  // --- City/State from article text ---
  // Article body pattern: "Location Name, City ST" e.g. "Bluemont Park, Arlington VA"
  // or "City, ST" like "Washington, DC"
  let city = '';
  let state = '';

  // Helper: try to extract city+state from a text string
  function extractCityState(src) {
    // "Location, City ST" — location before comma, then "City ST" (no comma before state)
    const m3 = src.match(/([A-Za-z][A-Za-z\s']+),\s+([A-Za-z][A-Za-z\s']+?)\s+([A-Z]{2})\b/);
    if (m3) return { city: m3[2].trim(), state: m3[3] };
    // "City, ST" — comma then 2-letter state
    const m2 = src.match(/\b([A-Za-z][A-Za-z\s']+),\s*([A-Z]{2})\b/);
    if (m2) return { city: m2[1].trim(), state: m2[2] };
    return null;
  }

  const cs = extractCityState(articleText) || extractCityState(html.replace(/<[^>]*>/g,' '));
  if (cs) { city = cs.city; state = cs.state; }

  if (!city) city = 'Unknown_City';
  if (!state) state = 'XX';

  return { dateStr, distance, raceTitle: raceTitle || 'Unknown_Race', city, state };
}

function slugify(s) {
  return s.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function buildFilename(meta) {
  const d = meta.dateStr || '00000000';
  const dist = slugify(meta.distance);
  const title = slugify(meta.raceTitle);
  const city = slugify(meta.city);
  const state = slugify(meta.state);
  return `${d}-${dist}-${title}-${city}-${state}.html`;
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Find the best results table: prefer the one containing "lawruk", else the
// largest table, else the first table with xl63-style cells.
function findResultsTable(html) {
  const tables = [];
  const re = /<table\b[\s\S]*?<\/table>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    tables.push(m[0]);
  }
  if (!tables.length) return null;

  // Prefer table containing "lawruk"
  const withLawruk = tables.find(t => /lawruk/i.test(t));
  if (withLawruk) return withLawruk;

  // Prefer table with xl63 class (Excel-exported results)
  const excelTable = tables.find(t => /xl6\d/i.test(t));
  if (excelTable) return excelTable;

  // Largest table by character count
  return tables.reduce((a, b) => (b.length > a.length ? b : a));
}

function buildOutputHtml(rawHtml, meta, url) {
  // Strip style/script/link but KEEP the rest so we can find the table
  let clean = rawHtml.replace(/<style[\s\S]*?<\/style>/gi, '');
  clean = clean.replace(/<link[^>]*rel=["']?stylesheet["']?[^>]*>/gi, '');
  clean = clean.replace(/<script[\s\S]*?<\/script>/gi, '');

  let tableHtml = findResultsTable(clean);
  if (!tableHtml) return null;

  // Strip all attributes from tags
  tableHtml = tableHtml.replace(/<([a-zA-Z0-9]+)(?:\s[^>]*)?>/g, '<$1>');

  const savedComment = `<!-- saved from url=(${String(url.length).padStart(4,'0')})${url} -->`;
  const docTitle = `${meta.raceTitle} - ${meta.city}, ${meta.state}`;

  let dateFormatted = '';
  if (meta.dateStr && meta.dateStr !== '00000000' && /^\d{8}$/.test(meta.dateStr)) {
    const yr = parseInt(meta.dateStr.slice(0,4),10);
    const mo = parseInt(meta.dateStr.slice(4,6),10) - 1;
    const dy = parseInt(meta.dateStr.slice(6,8),10);
    if (yr >= 2000 && yr <= 2030) {
      dateFormatted = new Date(Date.UTC(yr,mo,dy))
        .toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'});
    }
  }

  let out = `${savedComment}\r\n<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">\r\n<html lang=en>\r\n<head>\r\n  <title>${escapeHtml(docTitle)}</title>\r\n</head>\r\n<body>\r\n`;
  out += `  <h1>${escapeHtml(meta.raceTitle)}</h1>\r\n`;
  out += `  <h2>${escapeHtml(meta.city)}, ${escapeHtml(meta.state)}</h2>\r\n`;
  if (dateFormatted) out += `  <h2>${escapeHtml(dateFormatted)}</h2>\r\n`;
  out += tableHtml + '\r\n</body>\r\n</html>';

  try {
    const { html: beautifyHtml } = require('js-beautify');
    out = beautifyHtml(out, { indent_size: 2 });
  } catch (e) { /* continue */ }
  out = out.replace(/\r?\n/g, '\r\n');
  return out;
}

async function main() {
  if (typeof fetch !== 'function') {
    console.error('Requires Node 18+ (global fetch).');
    process.exit(3);
  }

  fs.mkdirSync(RACES_DIR, { recursive: true });

  let totalFetched = 0;
  let totalMatched = 0;

  for (let yr = START_YEAR; yr <= END_YEAR; yr++) {
    const yearUrl = `${BASE}/races/race-results/${yr}-results.html`;
    console.log(`\n=== ${yr} === ${yearUrl}`);

    let yearHtml;
    try {
      yearHtml = await fetchText(yearUrl);
    } catch (e) {
      console.warn(`  Could not fetch year page: ${e.message}`);
      continue;
    }

    const links = extractRaceLinks(yearHtml, yearUrl);
    console.log(`  Found ${links.length} race links`);

    for (const { href, text } of links) {
      totalFetched++;
      process.stdout.write(`  Checking [${text.slice(0,60)}] ... `);

      let raceHtml;
      try {
        raceHtml = await fetchText(href);
      } catch (e) {
        console.log(`SKIP (${e.message})`);
        continue;
      }

      const hasLawruk = /lawruk/i.test(raceHtml);
      if (!hasLawruk) {
        console.log('no match');
        continue;
      }

      console.log('*** LAWRUK FOUND ***');
      totalMatched++;

      const meta = deriveMeta(raceHtml, text, yr);
      const filename = buildFilename(meta);
      const outPath = path.join(RACES_DIR, filename);

      if (fs.existsSync(outPath)) {
        console.log(`  -> Already exists: ${filename}`);
        continue;
      }

      const outHtml = buildOutputHtml(raceHtml, meta, href);
      if (!outHtml) {
        console.warn(`  -> No table found; skipping ${filename}`);
        continue;
      }

      fs.writeFileSync(outPath, outHtml, 'utf8');
      console.log(`  -> Saved: ${filename}`);
      console.log(`     date=${meta.dateStr} dist=${meta.distance} title="${meta.raceTitle}" city="${meta.city}" state=${meta.state}`);
    }
  }

  console.log(`\nDone. Checked ${totalFetched} race pages, found lawruk in ${totalMatched}.`);
}

main().catch(err => {
  console.error(err);
  process.exit(99);
});
