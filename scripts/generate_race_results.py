#!/usr/bin/env python3
"""
Generate race results HTML file from Runsignup results page.
Usage: python generate_race_results.py --race-id 58384 --result-set 664282 --date 20260704 --name "Visions 4 on the 4th" --location "Endwell" --state "NY" --distance "4M"
"""

import requests
from bs4 import BeautifulSoup
import re
import argparse
from pathlib import Path
from typing import List, Tuple

def fetch_runsignup_results(race_id: int, result_set_id: int, max_results: int = 5000) -> str:
    """Fetch HTML from Runsignup results page."""
    url = f"https://runsignup.com/Race/Results/{race_id}#resultSetId-{result_set_id};perpage:{max_results}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    response = requests.get(url, headers=headers, timeout=30)
    response.raise_for_status()
    return response.text

def parse_results_table(html: str) -> List[dict]:
    """Parse results from HTML table."""
    soup = BeautifulSoup(html, 'html.parser')
    results = []
    
    # Find the main results table
    tables = soup.find_all('table')
    if not tables:
        raise ValueError("No tables found in HTML")
    
    # Look for table with race results (typically has Place, Bib, Name columns)
    results_table = None
    for table in tables:
        headers = table.find('thead')
        if headers and 'Place' in headers.text and 'Name' in headers.text:
            results_table = table
            break
    
    if not results_table:
        raise ValueError("Could not find results table")
    
    tbody = results_table.find('tbody')
    if not tbody:
        raise ValueError("Table has no tbody")
    
    rows = tbody.find_all('tr')
    for row in rows:
        cells = row.find_all('td')
        if len(cells) >= 12:
            result = {
                'place': cells[0].text.strip(),
                'bib': cells[1].text.strip(),
                'name': cells[2].text.strip(),
                'gender': cells[3].text.strip(),
                'city': cells[4].text.strip(),
                'state': cells[5].text.strip(),
                'chip_time': cells[6].text.strip(),
                'pace': cells[7].text.strip(),
                'age': cells[8].text.strip(),
                'age_percentage': cells[9].text.strip(),
                'division_place': cells[10].text.strip(),
                'division': cells[11].text.strip(),
            }
            results.append(result)
    
    return results

def generate_html_file(
    date: str,
    race_name: str,
    location: str,
    state: str,
    results: List[dict],
    output_path: Path
) -> None:
    """Generate HTML race results file."""
    
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<title>{race_name} - {location}, {state}</title>
</head>
<body>
<h1>{race_name}</h1>
<h2>{location}, {state}</h2>
<h2>July 4, {date[:4]}</h2>
<table>
<thead><tr>
<th>Place</th>
<th>Bib</th>
<th>Name</th>
<th>Gender</th>
<th>City</th>
<th>State</th>
<th>Chip<br/>Time</th>
<th>Pace</th>
<th>Age</th>
<th>Age<br/>Percentage</th>
<th>Division<br/>Place</th>
<th>Division</th>
</tr></thead>
<tbody>
"""
    
    for result in results:
        html_content += f"""<tr><td>{result['place']}</td><td>{result['bib']}</td><td>{result['name']}</td><td>{result['gender']}</td><td>{result['city']}</td><td>{result['state']}</td><td>{result['chip_time']}</td><td>{result['pace']}</td><td>{result['age']}</td><td>{result['age_percentage']}</td><td>{result['division_place']}</td><td>{result['division']}</td></tr>
"""
    
    html_content += """</tbody>
</table>
</body>
</html>
"""
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(html_content)
    print(f"✓ Created {output_path}")

def main():
    parser = argparse.ArgumentParser(description='Generate race results HTML from Runsignup')
    parser.add_argument('--race-id', type=int, required=True, help='Runsignup race ID')
    parser.add_argument('--result-set', type=int, required=True, help='Result set ID')
    parser.add_argument('--date', type=str, required=True, help='Date in YYYYMMDD format')
    parser.add_argument('--name', type=str, required=True, help='Race name')
    parser.add_argument('--location', type=str, required=True, help='Race location')
    parser.add_argument('--state', type=str, required=True, help='State abbreviation')
    parser.add_argument('--distance', type=str, default='4M', help='Race distance (default: 4M)')
    parser.add_argument('--output', type=Path, help='Output file path (default: auto-generated)')
    parser.add_argument('--limit', type=int, default=100, help='Max results to include (default: 100)')
    
    args = parser.parse_args()
    
    print(f"Fetching results from Runsignup (race {args.race_id}, result set {args.result_set})...")
    html = fetch_runsignup_results(args.race_id, args.result_set)
    
    print("Parsing results table...")
    results = parse_results_table(html)
    
    if args.limit:
        results = results[:args.limit]
    
    print(f"Found {len(results)} results")
    
    if not args.output:
        # Auto-generate filename: YYYYMMDD-distance-name-location-state.html
        name_slug = args.name.replace(' ', '_')
        filename = f"{args.date}-{args.distance}-{name_slug}-{args.location}-{args.state}.html"
        args.output = Path(__file__).parent.parent / 'races' / filename
    
    generate_html_file(args.date, args.name, args.location, args.state, results, args.output)
    print(f"✓ Generated {len(results)} race results")

if __name__ == '__main__':
    main()
