#!/usr/bin/env node
// Simple script to fetch the first <table> from a race results page
// and write a minimal HTML file containing that table with CSS removed.

const fs = require('fs');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node scripts/fetchRace.js <url> [outputFile]');
    process.exit(2);
  }
  const url = args[0];
  const outFile = args[1] || defaultOutputPath(url);

  if (typeof fetch !== 'function') {
    console.error('This script requires Node 18+ (global fetch).');
    process.exit(3);
  }

  console.log('Fetching', url);
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    console.error('Fetch failed:', res.status, res.statusText);
    process.exit(4);
  }
  const text = await res.text();

  // Remove <style>, <link rel=stylesheet> and <script> blocks
  let clean = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  clean = clean.replace(/<link[^>]*rel=["']?stylesheet["']?[^>]*>/gi, '');
  clean = clean.replace(/<script[\s\S]*?<\/script>/gi, '');

  // Extract first table
  const tableMatch = clean.match(/<table\b[^>]*>[\s\S]*?<\/table>/i);
  if (!tableMatch) {
    console.error('No <table> found on page.');
    process.exit(5);
  }
  let tableHtml = tableMatch[0];

  // Strip attributes from tags to remove CSS classes/styles
  tableHtml = tableHtml.replace(/<([a-zA-Z0-9]+)(?:\s[^>]*)?>/g, '<$1>');

  // Derive title from page <title> if available
  const titleMatch = text.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : url;

  const savedComment = `<!-- saved from url=(${String(url.length).padStart(4,'0')})${url} -->`;

  // If output filename follows pattern date-title-city-state, derive title/city/state
  const meta = parseFilenameMeta(outFile);
  const docTitle = meta ? `${meta.title} - ${meta.city}, ${meta.state}` : title;

  let outHtml = `${savedComment}\r\n<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">\r\n<html lang=en>\r\n<head>\r\n  <title>${escapeHtml(docTitle)}</title>\r\n</head>\r\n<body>\r\n`;
  if (meta) {
    outHtml += `  <h1>${escapeHtml(meta.title)}</h1>\r\n  <h2>${escapeHtml(meta.city)}, ${escapeHtml(meta.state)}</h2>\r\n  <h2>${escapeHtml(meta.dateFormatted)}</h2>\r\n`;
  }
  outHtml += tableHtml + '\r\n</body>\r\n</html>';

  // Format HTML (requires js-beautify). Normalize to CRLF for Windows.
  try {
    const { html: beautifyHtml } = require('js-beautify');
    outHtml = beautifyHtml(outHtml, { indent_size: 2 });
  } catch (e) {
    // if beautifier missing, continue with unformatted output
  }
  outHtml = outHtml.replace(/\r?\n/g, '\r\n');

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, outHtml, 'utf8');
  console.log('Wrote', outFile);
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
    // drop leading tokens that look like an event code (e.g., '1M')
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

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

main().catch(err => {
  console.error(err);
  process.exit(99);
});
