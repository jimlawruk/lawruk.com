# Generate Race Results Script

Automates fetching race results from Runsignup and generates HTML race files for lawruk.com.

## Requirements

```bash
pip install requests beautifulsoup4
```

## Usage

### Python (Direct)

```bash
python scripts/generate_race_results.py \
  --race-id 58384 \
  --result-set 664282 \
  --date 20260704 \
  --name "Visions 4 on the 4th" \
  --location "Endwell" \
  --state "NY" \
  --distance "4M" \
  --limit 100
```

### PowerShell

```powershell
.\scripts\Generate-RaceResults.ps1 `
  -RaceId 58384 `
  -ResultSetId 664282 `
  -Date 20260704 `
  -Name "Visions 4 on the 4th" `
  -Location "Endwell" `
  -State "NY" `
  -Distance "4M" `
  -Limit 100
```

## Parameters

- `--race-id` / `-RaceId`: Runsignup race ID (required)
- `--result-set` / `-ResultSetId`: Result set ID from URL (required)
- `--date` / `-Date`: Date in YYYYMMDD format (required)
- `--name` / `-Name`: Race name (required)
- `--location` / `-Location`: City/location (required)
- `--state` / `-State`: State abbreviation (required)
- `--distance` / `-Distance`: Race distance (default: 4M)
- `--output` / `-Output`: Custom output file path (optional)
- `--limit` / `-Limit`: Max results to include (default: 100)

## Finding the Race ID and Result Set ID

1. Go to the Runsignup results page
2. Look at the URL: `https://runsignup.com/Race/Results/{RACE_ID}#resultSetId-{RESULT_SET_ID}`
3. Extract both IDs from the URL

## Output

Generated files are saved to `races/` directory with naming convention:
```
YYYYMMDD-distance-race-name-location-state.html
```

Example: `20260704-4M-Visions_4_on_the_4th-Endwell-NY.html`
