# fetchRace.js

Usage:

```
node scripts/fetchRace.js <race-results-url> [outputFile]
```

Examples:

```
node scripts/fetchRace.js "https://runsignup.com/Race/Results/31179#resultSetId-651946;perpage:5000"

node scripts/fetchRace.js "https://runsignup.com/Race/Results/31179#resultSetId-651946;perpage:5000" races/20260522-1M-Carlisle_Mile-Carlisle-PA.html
```

Notes:
- This script uses the global `fetch` API available in Node 18+. If you run an older Node, upgrade or run under `node --experimental-fetch` where available.
- The script removes `<style>`, `<link rel=stylesheet>` and `<script>` blocks and extracts the first `<table>` element from the page. It strips attributes from tags to avoid pulling CSS classes.
- Output defaults to `races/YYYYMMDD-<sanitized-url>.html` when no output path is provided.
