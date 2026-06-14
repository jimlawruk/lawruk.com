#!/usr/bin/env node
// Uses Playwright to render the page and extract the first populated <table>

const fs = require('fs');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node scripts/fetchRaceRender.js <url> [outputFile]');
    process.exit(2);
  }
  const url = args[0];
  const outFile = args[1] || defaultOutputPath(url);

  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  console.log('Loading', url);
  await page.goto(url, { waitUntil: 'networkidle' });

  // Wait for a table to be populated (at least one row besides header)
  try {
    await page.waitForFunction(() => {
      const t = document.querySelector('table');
      if (!t) return false;
      const rows = t.querySelectorAll('tr');
      return rows.length > 1;
    }, { timeout: 20000 });
  } catch (e) {
    console.warn('Timed out waiting for table population; will still try to extract first table.');
  }

  const html = await page.evaluate(() => {
    const titleEl = document.querySelector('title');
    const title = titleEl ? titleEl.innerText : document.location.href;
    const t = document.querySelector('table');
    const tableHtml = t ? t.outerHTML : '';
    return { title, tableHtml };
  });

  await browser.close();

  if (!html.tableHtml) {
    console.error('No table found in rendered page.');
    process.exit(5);
  }

  // Strip attributes from tags to remove CSS classes/styles
  let tableOnly = html.tableHtml.replace(/<([a-zA-Z0-9]+)(?:\s[^>]*)?>/g, '<$1>');

  const savedComment = `<!-- saved from url=(${String(url.length).padStart(4,'0')})${url} -->`;

  const meta = parseFilenameMeta(outFile);
  const docTitle = meta ? `${meta.title} - ${meta.city}, ${meta.state}` : html.title;

  let outHtml = `${savedComment}\r\n<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">\r\n<html lang=en>\r\n<head>\r\n  <title>${escapeHtml(docTitle)}</title>\r\n</head>\r\n<body>\r\n`;
  if (meta) {
    outHtml += `  <h1>${escapeHtml(meta.title)}</h1>\r\n  <h2>${escapeHtml(meta.city)}, ${escapeHtml(meta.state)}</h2>\r\n  <h2>${escapeHtml(meta.dateFormatted)}</h2>\r\n`;
  }
  outHtml += tableOnly + '\r\n</body>\r\n</html>';

  // Format HTML using js-beautify if available, then normalize to CRLF
  try {
    const { html: beautifyHtml } = require('js-beautify');
    outHtml = beautifyHtml(outHtml, { indent_size: 2 });
  } catch (e) {
    // continue without beautifier
  }
  outHtml = outHtml.replace(/\r?\n/g, '\r\n');

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, outHtml, 'utf8');
  console.log('Wrote', outFile);

function parseFilenameMeta(outFile) {
  try {
    const base = path.basename(outFile, path.extname(outFile));
    const parts = base.split('-');
    if (parts.length < 4) return null;
    const dateToken = parts[0];
    if (!/^\d{8}$/.test(dateToken)) return null;
    const state = parts[parts.length - 1].replace(/_/g, ' ');
    const city = parts[parts.length - 2].replace(/_/g, ' ');
    let titleParts = parts.slice(1, parts.length - 2);
    if (titleParts.length && /^\d+[A-Za-z]*$/.test(titleParts[0])) titleParts.shift();
    const title = titleParts.join('-').replace(/_/g, ' ');
    const year = parseInt(dateToken.slice(0, 4), 10);
    const month = parseInt(dateToken.slice(4, 6), 10) - 1;
    const day = parseInt(dateToken.slice(6, 8), 10);
    const d = new Date(Date.UTC(year, month, day));
    const dateFormatted = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return { title, city, state, date: d, dateFormatted };
  } catch (e) {
    return null;
  }
}
}

function defaultOutputPath(url) {
  const today = new Date();
  const yyyy = today.getFullYear().toString();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  let name = url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]+/g, '_');
  if (name.length > 60) name = name.slice(0, 60);
  const fname = `${yyyy}${mm}${dd}-${name}.html`;
  return path.join('races', fname);
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

main().catch(err => {
  console.error(err);
  process.exit(99);
});
