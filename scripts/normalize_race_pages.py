from pathlib import Path
from html import escape, unescape
import re

files = [
    Path('races/20260715-1M-Harrisburg_Mile-Harrisburg-PA.html'),
    Path('races/20250716-1M-Harrisburg_Mile-Harrisburg-PA.html'),
]

for path in files:
    text = path.read_text(encoding='utf-8', errors='replace')

    title = 'Harrisburg Mile - Harrisburg, PA'
    title_match = re.search(r'<title>(.*?)</title>', text, flags=re.I | re.S)
    if title_match:
        title = title_match.group(1).strip()

    h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', text, flags=re.I | re.S)
    if h1_match:
        h1_text = re.sub(r'<[^>]+>', '', h1_match.group(1))
        h1_text = unescape(h1_text).strip()
    else:
        h1_text = 'Harrisburg Mile'

    h2_matches = re.findall(r'<h2[^>]*>(.*?)</h2>', text, flags=re.I | re.S)
    h2_texts = [re.sub(r'<[^>]+>', '', m) for m in h2_matches]
    h2_texts = [unescape(x).strip() for x in h2_texts if unescape(x).strip()]

    if not h2_texts:
        h2_texts = ['Harrisburg, PA', 'July 15, 2026'] if 'July 15, 2026' in text else ['Harrisburg, PA', 'July 16, 2025']

    # Use the first h2 as city and the last as date if there are two.
    city_text = h2_texts[0] if h2_texts else 'Harrisburg, PA'
    date_text = h2_texts[-1] if len(h2_texts) > 1 else (h2_texts[0] if h2_texts else 'July 15, 2026')

    table_match = re.search(r'<table\b[^>]*>(.*?)</table>', text, flags=re.I | re.S)
    if not table_match:
        raise SystemExit(f'No table found in {path}')

    rows = re.findall(r'<tr\b[^>]*>(.*?)</tr>', table_match.group(1), flags=re.I | re.S)
    parsed_rows = []

    for row in rows:
        cells = re.findall(r'<t[dh]\b[^>]*>(.*?)</t[dh]>', row, flags=re.I | re.S)
        if not cells:
            continue
        cleaned = []
        for cell in cells:
            c = re.sub(r'<br\s*/?>', ' ', cell, flags=re.I)
            c = re.sub(r'<[^>]+>', '', c)
            c = unescape(c).strip()
            c = re.sub(r'\s+', ' ', c)
            cleaned.append(c)
        if not any(cleaned):
            continue
        if len(cleaned) == 1 and any(k in cleaned[0].lower() for k in ['mile run', 'overall finish list', 'elite mile']):
            continue
        if cleaned and all(c in {'Place', 'Name', 'City', 'Bib No', 'Age', 'Gender', 'Age Group', 'Div', 'Div ', 'Total Time'} for c in cleaned):
            continue
        parsed_rows.append(cleaned)

    if not parsed_rows:
        raise SystemExit(f'No rows parsed from {path}')

    header = parsed_rows[0]
    data_rows = parsed_rows[1:]

    # If the first data row still looks like a header, drop it.
    if data_rows and len(data_rows[0]) == len(header) and data_rows[0][0] == 'Place':
        data_rows = data_rows[1:]

    lines = []
    lines.append('<!DOCTYPE html>')
    lines.append('<html lang="en">')
    lines.append('<head>')
    lines.append(f'<title>{escape(title)}</title>')
    lines.append('</head>')
    lines.append('<body>')
    lines.append(f'<h1>{escape(h1_text)}</h1>')
    lines.append(f'<h2>{escape(city_text)}</h2>')
    lines.append(f'<h2>{escape(date_text)}</h2>')
    lines.append('<table>')
    lines.append('<thead>')
    lines.append('<tr>')
    for cell in header:
        lines.append(f'  <th>{escape(cell)}</th>')
    lines.append('</tr>')
    lines.append('</thead>')
    lines.append('<tbody>')
    for row in data_rows:
        lines.append('<tr>')
        for cell in row:
            lines.append(f'  <td>{escape(cell)}</td>')
        lines.append('</tr>')
    lines.append('</tbody>')
    lines.append('</table>')
    lines.append('</body>')
    lines.append('</html>')

    path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(f'Wrote {path}')
