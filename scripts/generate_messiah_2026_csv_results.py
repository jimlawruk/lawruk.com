#!/usr/bin/env python3
"""Generate Messiah 2026 race HTML files from CSV results."""

import csv
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple

CSV_PATH = Path(__file__).parent.parent / 'Messiah - 2026 Results.csv'
OUTPUT_DIR = Path(__file__).parent.parent / 'races'
EVENTS = ['400m', '800m', '1600m']
DATE_FORMAT = '%B %d, %Y'

TIME_PATTERN = re.compile(r'^(?:\d+:)?\d+(?:\.\d+)?$')


def parse_cell(cell: str) -> Tuple[str, str]:
    cell = cell.strip()
    if not cell or cell.lower() == 'x':
        return '', ''
    parts = cell.rsplit(' ', 1)
    if len(parts) != 2:
        return cell, ''
    name, time = parts
    if TIME_PATTERN.match(time):
        return name.strip(), time.strip()
    return cell, ''


def parse_csv(path: Path) -> Dict[str, Dict[str, List[Tuple[str, str]]]]:
    results: Dict[str, Dict[str, List[Tuple[str, str]]]] = {}
    current_date: str = ''
    with path.open(newline='', encoding='utf-8') as f:
        reader = csv.reader(f)
        for row in reader:
            if not row:
                continue
            event_name = row[0].strip()
            if event_name.endswith('Results'):
                date_text = event_name.split()[0]
                month, day = date_text.split('/')
                current_date = f'2026{int(month):02d}{int(day):02d}'
                results[current_date] = {distance: [] for distance in EVENTS}
                continue

            if not current_date:
                continue

            for distance in EVENTS:
                if event_name.lower().startswith(distance):
                    entries = []
                    for cell in row[1:]:
                        name, time = parse_cell(cell)
                        if name and time:
                            entries.append((name, time))
                    if entries:
                        results[current_date][distance].extend(entries)
                    break

    return results


def format_date(yyyymmdd: str) -> str:
    dt = datetime.strptime(yyyymmdd, '%Y%m%d')
    return dt.strftime(DATE_FORMAT)


def distance_slug(distance: str) -> str:
    return distance.replace('m', 'M')


def generate_html(date_key: str, distance: str, entries: List[Tuple[str, str]]) -> str:
    full_date = format_date(date_key)
    race_name = 'Messiah All Comers Meet'
    location = 'Grantham'
    state = 'PA'
    title = f'{race_name} - {location}, {state}'

    rows_html = ''
    for place, (name, time) in enumerate(entries, start=1):
        rows_html += f'  <tr>\n    <td>{place}</td>\n    <td>{name}</td>\n    <td>{time}</td>\n  </tr>\n'

    return f"""<!DOCTYPE html>
<html lang=\"en\">
<head>
<title>{title}</title>
</head>
<body>
<h1>{race_name}</h1>
<h2>{location}, {state}</h2>
<h2>{full_date}</h2>
<table>
<thead>
<tr>
    <th>Place</th>
    <th>Name</th>
    <th>Time</th>
</tr>
</thead>
<tbody>
{rows_html}</tbody>
</table>
</body>
</html>
"""


def main() -> None:
    results = parse_csv(CSV_PATH)
    if not results:
        raise SystemExit(f'No event results found in {CSV_PATH}')

    created_files = []
    for date_key, distances in results.items():
        for distance in EVENTS:
            entries = distances.get(distance, [])
            if not entries:
                continue
            slug = distance_slug(distance)
            filename = f'{date_key}-{slug}-Messiah_All_Comers_Meet-Grantham-PA.html'
            output_path = OUTPUT_DIR / filename
            output_path.parent.mkdir(parents=True, exist_ok=True)
            html = generate_html(date_key, distance, entries)
            output_path.write_text(html, encoding='utf-8')
            created_files.append(output_path)
            print(f'Created {output_path.name} ({len(entries)} entries)')

    print(f'\nGenerated {len(created_files)} files in {OUTPUT_DIR}')


if __name__ == '__main__':
    main()
