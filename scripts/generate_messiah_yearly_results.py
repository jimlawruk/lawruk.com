#!/usr/bin/env python3
"""Generate Messiah race HTML files from 2023/2024/2026 CSV results."""

import csv
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple

ROOT = Path(__file__).parent.parent
EVENTS = ['400m', '800m', '1600m']


def parse_cell(cell: str) -> Tuple[str, str]:
    cell = (cell or '').strip()
    if not cell or cell.lower() == 'x':
        return '', ''
    cell = cell.replace('  ', ' ').replace('  ', ' ')

    if ' - ' in cell:
        parts = cell.split(' - ', 1)
        if len(parts) == 2:
            left, right = [p.strip() for p in parts]
            if re.match(r'^(?:\d+:)?\d+(?:\.\d+)?$', left.replace('DNF', '').replace('DNS', '').strip()):
                return right.rstrip('-').strip(), left
            if re.match(r'^(?:\d+:)?\d+(?:\.\d+)?$', right.replace('DNF', '').replace('DNS', '').strip()):
                return left.rstrip('-').strip(), right

    if '-' in cell and not cell.startswith('-'):
        parts = [p.strip() for p in cell.split('-', 1)]
        if len(parts) == 2:
            left, right = parts
            if re.match(r'^(?:\d+:)?\d+(?:\.\d+)?$', left.replace('DNF', '').replace('DNS', '').strip()):
                return right.rstrip('-').strip(), left
            if re.match(r'^(?:\d+:)?\d+(?:\.\d+)?$', right.replace('DNF', '').replace('DNS', '').strip()):
                return left.rstrip('-').strip(), right

    match = re.search(r'\(([^()]+)\)$', cell)
    if match:
        time_text = match.group(1).strip()
        name = cell[:match.start(1)].strip().rstrip('(').strip()
        if re.match(r'^(?:\d+:)?\d+(?:\.\d+)?$', time_text):
            return name, time_text

    parts = cell.rsplit(' ', 1)
    if len(parts) == 2:
        name, time_text = [p.strip() for p in parts]
        if re.match(r'^(?:\d+:)?\d+(?:\.\d+)?$', time_text):
            return name, time_text

    if re.match(r'^(?:\d+:)?\d+(?:\.\d+)?$', cell.split()[-1]):
        return ' '.join(cell.split()[:-1]), cell.split()[-1]

    return cell, ''


def parse_time_to_seconds(time_text: str) -> float:
    value = (time_text or '').strip().replace('DNF', '').replace('DNS', '').strip()
    if not value:
        return float('inf')
    if ':' in value:
        parts = value.split(':')
        if len(parts) == 2:
            minutes, seconds = parts
            return int(minutes) * 60 + float(seconds)
        if len(parts) == 3:
            hours, minutes, seconds = parts
            return int(hours) * 3600 + int(minutes) * 60 + float(seconds)
    return float(value)


def parse_csv(path: Path, year: int) -> Dict[str, Dict[str, List[Tuple[str, str]]]]:
    results: Dict[str, Dict[str, List[Tuple[str, str]]]] = {}
    current_date = None
    with path.open(newline='', encoding='utf-8') as f:
        reader = csv.reader(f)
        for row in reader:
            if not row:
                continue
            event_name = row[0].strip()
            if event_name.endswith('Results'):
                month, day = event_name.split()[0].split('/')
                current_date = f'{year}{int(month):02d}{int(day):02d}'
                results[current_date] = {distance: [] for distance in EVENTS}
                continue
            if not current_date:
                continue
            for distance in EVENTS:
                simplified = event_name.lower().replace(' (m/w)', '').replace(' (m)', '').replace(' (w)', '').replace(' (f)', '')
                if simplified.startswith(distance.lower()):
                    for cell in row[1:]:
                        name, time_text = parse_cell(cell)
                        if name and time_text:
                            results[current_date][distance].append((name, time_text))
                    break
    for date_key, distances in results.items():
        for distance in EVENTS:
            distances[distance].sort(key=lambda item: parse_time_to_seconds(item[1]))
    return results


def format_date(yyyymmdd: str) -> str:
    dt = datetime.strptime(yyyymmdd, '%Y%m%d')
    return dt.strftime('%B %d, %Y')


def generate_html(date_key: str, distance: str, entries: List[Tuple[str, str]]) -> str:
    full_date = format_date(date_key)
    race_name = 'Messiah All Comers Meet'
    location = 'Grantham'
    state = 'PA'
    rows_html = ''
    for place, (name, time_text) in enumerate(entries, start=1):
        rows_html += f'  <tr>\n    <td>{place}</td>\n    <td>{name}</td>\n    <td>{time_text}</td>\n  </tr>\n'
    return f"""<!DOCTYPE html>
<html lang=\"en\">
<head>
<title>{race_name} - {location}, {state}</title>
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
    for year in [2023, 2024]:
        path = ROOT / f'Messiah - {year} Results.csv'
        if not path.exists():
            print(f'Skipping missing file {path}')
            continue
        results = parse_csv(path, year)
        created = 0
        for date_key, distances in results.items():
            for distance in EVENTS:
                entries = distances.get(distance, [])
                if not entries:
                    continue
                filename = f'{date_key}-{distance.upper()}-Messiah_All_Comers_Meet_{distance.upper()}-Grantham-PA.html'
                output_path = ROOT / 'races' / filename
                output_path.write_text(generate_html(date_key, distance, entries), encoding='utf-8')
                created += 1
                print(f'Created {output_path.name}')
        print(f'Finished {year}: {created} files')


if __name__ == '__main__':
    main()
