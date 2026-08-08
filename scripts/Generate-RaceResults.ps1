<#
.SYNOPSIS
Generate race results HTML file from Runsignup data.

.DESCRIPTION
Fetches race results from Runsignup, parses the table, and generates an HTML file
suitable for lawruk.com race archives.

.PARAMETER RaceId
The Runsignup race ID (from URL: /Race/Results/{RaceId})

.PARAMETER ResultSetId
The result set ID (from URL: #resultSetId-{ResultSetId})

.PARAMETER Date
Race date in YYYYMMDD format

.PARAMETER Name
Race name (e.g., "Visions 4 on the 4th")

.PARAMETER Location
Race location/city

.PARAMETER State
State abbreviation (e.g., "NY")

.PARAMETER Distance
Race distance (default: "4M")

.PARAMETER Limit
Maximum number of results to include (default: 100)

.PARAMETER Output
Custom output file path (optional)

.EXAMPLE
.\Generate-RaceResults.ps1 -RaceId 58384 -ResultSetId 664282 -Date 20260704 -Name "Visions 4 on the 4th" -Location "Endwell" -State "NY"

.EXAMPLE
.\Generate-RaceResults.ps1 -RaceId 58384 -ResultSetId 664282 -Date 20260704 -Name "Visions 4 on the 4th" -Location "Endwell" -State "NY" -Limit 200
#>

param(
    [Parameter(Mandatory=$true)]
    [int]$RaceId,
    
    [Parameter(Mandatory=$true)]
    [int]$ResultSetId,
    
    [Parameter(Mandatory=$true)]
    [string]$Date,
    
    [Parameter(Mandatory=$true)]
    [string]$Name,
    
    [Parameter(Mandatory=$true)]
    [string]$Location,
    
    [Parameter(Mandatory=$true)]
    [string]$State,
    
    [string]$Distance = "4M",
    
    [int]$Limit = 100,
    
    [string]$Output = ""
)

# Ensure Python is available
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Error "Python is not installed or not in PATH. Please install Python 3.x first."
    exit 1
}

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Build the Python command
$pythonScript = Join-Path $scriptDir "generate_race_results.py"

if (-not (Test-Path $pythonScript)) {
    Write-Error "Python script not found: $pythonScript"
    exit 1
}

# Build arguments
$args = @(
    $pythonScript,
    "--race-id", $RaceId,
    "--result-set", $ResultSetId,
    "--date", $Date,
    "--name", $Name,
    "--location", $Location,
    "--state", $State,
    "--distance", $Distance,
    "--limit", $Limit
)

if ($Output) {
    $args += "--output", $Output
}

Write-Host "Running: python $($args -join ' ')"
& python @args

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Race results generated successfully" -ForegroundColor Green
} else {
    Write-Error "Script failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}
