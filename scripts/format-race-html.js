const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
if (!filePath) { console.error('Usage: node format-race-html.js <file>'); process.exit(1); }

const content = fs.readFileSync(filePath, 'utf8');

// Extract pre-table content (everything before <table)
const tableStart = content.indexOf('<table');
const tableEnd = content.lastIndexOf('</table>') + '</table>'.length;
const preTable = content.substring(0, tableStart).trimEnd();
const postTable = content.substring(tableEnd).trim();

// Extract header row <th> text (strip all tags and their contents for the icon, just get text nodes)
const theadMatch = content.match(/<thead>(.*?)<\/thead>/s);
const headers = [];
if (theadMatch) {
  const ths = [...theadMatch[1].matchAll(/<th[^>]*>(.*?)<\/th>/gs)];
  for (const th of ths) {
    // Remove all child tags (icons etc), keep text and <br/>
    let text = th[1]
      .replace(/<i[^>]*>.*?<\/i>/gs, '')  // remove icon elements
      .replace(/<br\s*\/?>/gi, '\x00BR\x00')  // placeholder for <br>
      .replace(/<[^>]+>/g, '')
      .replace(/\x00BR\x00/g, '<br/>')
      .trim();
    headers.push(text);
  }
}

// Extract tbody rows
const tbodyMatch = content.match(/<tbody>(.*?)<\/tbody>/s);
const rows = [];
if (tbodyMatch) {
  const trMatches = [...tbodyMatch[1].matchAll(/<tr[^>]*>(.*?)<\/tr>/gs)];
  for (const tr of trMatches) {
    const rowHtml = tr[1];

    // Extract place (first td)
    const placeMatch = rowHtml.match(/<td[^>]*class="place"[^>]*>(\d+)<\/td>/);
    const place = placeMatch ? placeMatch[1] : '';

    // Extract bib
    const bibMatch = rowHtml.match(/<td[^>]*class="bib"[^>]*>(\d+)<\/td>/);
    const bib = bibMatch ? bibMatch[1] : '';

    // Extract first and last name
    const firstNameMatch = rowHtml.match(/<div class="participantName__name__firstName">([^<]+)<\/div>/);
    const lastNameMatch = rowHtml.match(/<div class="participantName__name__lastName">([^<]+)<\/div>/);
    const name = [firstNameMatch ? firstNameMatch[1].trim() : '', lastNameMatch ? lastNameMatch[1].trim() : ''].filter(Boolean).join(' ');

    // After the participant div, extract remaining tds:
    // Gender, City, State, Country, Clock Time, Age, Age%, DivPlace, Division
    const afterDiv = rowHtml.match(/<\/div><\/td>(.*?)$/s);
    const remainingTds = afterDiv ? [...afterDiv[1].matchAll(/<td[^>]*>(.*?)<\/td>/gs)].map(m => m[1].trim()) : [];

    rows.push({ place, bib, name, remaining: remainingTds });
  }
}

// Build clean HTML
let out = '';
if (preTable) out += preTable + '\n';

out += '<table>\n';
out += '<thead><tr>\n';
for (const h of headers) {
  out += `<th>${h}</th>\n`;
}
out += '</tr></thead>\n';
out += '<tbody>\n';

for (const row of rows) {
  out += '<tr>\n';
  out += `<td>${row.place}</td>\n`;
  out += `<td>${row.bib}</td>\n`;
  out += `<td>${row.name}</td>\n`;
  for (const cell of row.remaining) {
    out += `<td>${cell}</td>\n`;
  }
  out += '</tr>\n';
}

out += '</tbody>\n';
out += '</table>\n';

if (postTable) out += postTable + '\n';

fs.writeFileSync(filePath, out, 'utf8');
console.log(`Done. ${rows.length} rows written.`);
