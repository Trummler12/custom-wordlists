# ==============================================================================
# CONFIGURATION & USER PARAMETERS (v5.2 - Step 2: Relation Matrix)
# ==============================================================================

# Target Mode: 
#   "Instances"  -> Analyzes items matching the criteria below (e.g. all countries, rivers, capitals)
#   "DirectItem" -> Analyzes properties directly on a single Q-Item itself (e.g. Q3624078 itself)
[string]$TargetMode = "Instances"

# Item QID for "DirectItem" mode (e.g. "Q3624078" for Sovereign State concept item)
[string]$DirectItemQID = "Q3624078"

# Instance criteria for "Instances" mode:
[string]$InstanceOfQID = "Q3624078" # Main class (e.g. Q3624078 = Sovereign State, Q4022 = River, Q5119 = Capital)
[string]$ParentClassQID = ""         # Optional parent class (e.g. "Q3624078" = Sovereign State)

# RELATIONS-MATRIX (Automatische Ermittlung der Beziehung zwischen Child & Parent)
$RelationMatrix = @{
    # Child QID  | Parents: Continent | Sovereign State    | Subdivision 1
    "Q3624078"   = @{ "Q5107" = "P30" ; "Q3624078" = "x"   ; "Q10864048" = "x"   } # Sovereign State
    "Q10864048"  = @{ "Q5107" = "x"   ; "Q3624078" = "P17" ; "Q10864048" = "P131"} # First-level Subdivision
    "Q5119"      = @{ "Q5107" = "x"   ; "Q3624078" = "P36" ; "Q10864048" = "P36" } # Capital City
    "Q486972"    = @{ "Q5107" = "x"   ; "Q3624078" = "P17" ; "Q10864048" = "P131"} # Human Settlement
    "Q116126039" = @{ "Q5107" = "P30" ; "Q3624078" = "P17" ; "Q10864048" = "P131"} # Marine Water Body
    "Q23397"     = @{ "Q5107" = "P30" ; "Q3624078" = "P17" ; "Q10864048" = "P131"} # Lake
    "Q4022"      = @{ "Q5107" = "P30" ; "Q3624078" = "P17" ; "Q10864048" = "P131"} # River
    "Q8502"      = @{ "Q5107" = "P30" ; "Q3624078" = "P17" ; "Q10864048" = "P131"} # Mountain
}

# Limits & Sorting (0 = no limit)
[int]$Limit               = 0        # Max entities to process (e.g., 100 for Top 100)
[string]$OrderByProperty = ""       # Optional sort property QID (e.g., "P2043" = length, "P1082" = population)
[bool]$OrderDescending   = $true    # True = Highest/Longest first

# Processing & Rate Limiting Settings
[int]$BatchSize             = 30
[int]$SleepBetweenBatchesMs = 400  # Pause between queries to prevent HTTP 429

# Output path (saved right next to this script)
$ScriptDir  = if ($PSScriptRoot) { $PSScriptRoot } else { $PWD.Path }
$OutputFile = Join-Path $ScriptDir "Wikidata_Property_Counts.csv"
$UserAgent  = "WikidataGenericLabelCounter/5.2 (PowerShell/WikidataParser)"

# ------------------------------------------------------------------------------
# BLACKLIST: URIs to ignore (e.g. schema descriptions)
# ------------------------------------------------------------------------------
$BlacklistProperties = @(
    "http://schema.org/description"
    # "http://www.w3.org/2000/01/rdf-schema#label"
    # "http://www.w3.org/2004/02/skos/core#altLabel"
)

# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================
function Invoke-WikidataSparql {
    param ([string]$Query)
    $uri = "https://query.wikidata.org/sparql?query=" + [Uri]::EscapeDataString($Query)
    $headers = @{ "User-Agent" = $UserAgent; "Accept" = "application/sparql-results+json" }
    
    $maxRetries = 4
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            $response = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get -TimeoutSec 60
            return $response.results.bindings
        }
        catch {
            $retryCount++
            if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::TooManyRequests -or $_.Exception.Message -like "*429*") {
                $waitTime = $retryCount * 3
                Write-Warning "Rate limit hit (429). Waiting $waitTime seconds before retrying (Attempt $retryCount/$maxRetries)..."
                Start-Sleep -Seconds $waitTime
            } else {
                Write-Warning "SPARQL Request failed: $_"
                if ($retryCount -ge $maxRetries) { return $null }
                Start-Sleep -Seconds 2
            }
        }
    }
    return $null
}

# ==============================================================================
# STEP 1: RESOLVE TARGET QID LIST
# ==============================================================================
Write-Host "Resolving target entities..." -ForegroundColor Cyan

$targetQIDs = @()

if ($TargetMode -eq "DirectItem") {
    $targetQIDs = @($DirectItemQID)
    Write-Host "Direct item mode active. Analyzing single Q-Item: $DirectItemQID" -ForegroundColor Green
}
else {
    $whereClauses = [System.Collections.Generic.List[string]]::new()

    # Automatisches Bestimmen der Relation aus der Matrix bei gesetztem Parent
    if ($ParentClassQID) {
        if (-not $RelationMatrix.ContainsKey($InstanceOfQID) -or -not $RelationMatrix[$InstanceOfQID].ContainsKey($ParentClassQID)) {
            Write-Error "FEHLER: Die Kombination Child [$InstanceOfQID] + Parent [$ParentClassQID] ist nicht in `$RelationMatrix definiert!"
            exit
        }
        
        $resolvedRel = $RelationMatrix[$InstanceOfQID][$ParentClassQID]
        if ($resolvedRel -eq "x") {
            Write-Error "FEHLER: Die Kombination Child [$InstanceOfQID] in Parent [$ParentClassQID] ist logisch ungültig ('x')!"
            exit
        }

        if ($resolvedRel -eq "P36") {
            $whereClauses.Add("?parent wdt:P31 wd:$ParentClassQID .")
            $whereClauses.Add("?parent wdt:P36 ?entity .")
        } else {
            $whereClauses.Add("?parent wdt:P31 wd:$ParentClassQID .")
            if ($InstanceOfQID) { $whereClauses.Add("?entity wdt:P31/wdt:P279* wd:$InstanceOfQID .") }
            $whereClauses.Add("?entity wdt:$resolvedRel ?parent .")
        }
    }
    elseif ($InstanceOfQID) {
        $whereClauses.Add("?entity wdt:P31/wdt:P279* wd:$InstanceOfQID .")
    }

    $orderClause = ""
    if ($OrderByProperty) {
        $whereClauses.Add("OPTIONAL { ?entity wdt:$OrderByProperty ?orderVal . }")
        $direction = if ($OrderDescending) { "DESC(?orderVal)" } else { "ASC(?orderVal)" }
        $orderClause = "ORDER BY $direction"
    }

    $limitClause = if ($Limit -gt 0) { "LIMIT $Limit" } else { "" }
    $whereString = $whereClauses -join " `n  "

    $entitySparql = @"
SELECT DISTINCT ?entity WHERE {
  $whereString
}
$orderClause
$limitClause
"@

    $entityResults = Invoke-WikidataSparql -Query $entitySparql
    if (-not $entityResults) { Write-Error "Could not retrieve target entities. Exiting."; exit }

    $targetQIDs = $entityResults | ForEach-Object { 
        $_.entity.value -replace "http://www.wikidata.org/entity/", "" 
    }
    Write-Host "Found $($targetQIDs.Count) target entities." -ForegroundColor Green
}

# ==============================================================================
# STEP 2: DISCOVER PROPERTIES & AGGREGATE COUNTS
# ==============================================================================
$totalEntities = $targetQIDs.Count
$PropertyCounts = @{}

for ($i = 0; $i -lt $totalEntities; $i += $BatchSize) {
    $endIndex = [Math]::Min($i + $BatchSize - 1, $totalEntities - 1)
    $batch = $targetQIDs[$i..$endIndex]
    
    $percent = [math]::Round((($i + $batch.Count) / $totalEntities) * 100)
    Write-Progress -Activity "Discovering Properties" -Status "Processing batch $([math]::Floor($i/$BatchSize) + 1)..." -PercentComplete $percent

    $valuesClause = ($batch | ForEach-Object { "wd:$_" }) -join " "
    
    $batchSparql = @"
SELECT ?property (COUNT(?value) AS ?count) WHERE {
  VALUES ?entity { $valuesClause }
  ?entity ?property ?value .
  FILTER(isLiteral(?value) && LANG(?value) != "")
}
GROUP BY ?property
"@

    $batchResults = Invoke-WikidataSparql -Query $batchSparql

    if ($batchResults) {
        foreach ($row in $batchResults) {
            $uri = $row.property.value
            $count = [int]$row.count.value
            
            if ($BlacklistProperties -contains $uri) { continue }
            
            if (-not $PropertyCounts.ContainsKey($uri)) {
                $PropertyCounts[$uri] = 0
            }
            $PropertyCounts[$uri] += $count
        }
    }
    Start-Sleep -Milliseconds $SleepBetweenBatchesMs
}
Write-Progress -Activity "Discovering Properties" -Completed

# ==============================================================================
# STEP 3: RESOLVE PROPERTY LABELS
# ==============================================================================
Write-Host "Resolving discovered property labels..." -ForegroundColor Cyan

$pIdList = [System.Collections.Generic.List[string]]::new()
foreach ($uri in $PropertyCounts.Keys) {
    if ($uri -match "prop/direct/(P\d+)") {
        $pIdList.Add($Matches[1])
    }
}

$PropLabels = @{}
if ($pIdList.Count -gt 0) {
    $pIdValues = ($pIdList | ForEach-Object { "wd:$_" }) -join " "
    $labelSparql = @"
SELECT ?prop ?propLabel WHERE {
  VALUES ?prop { $pIdValues }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}
"@
    $labelResults = Invoke-WikidataSparql -Query $labelSparql
    if ($labelResults) {
        foreach ($row in $labelResults) {
            $pIdString = $row.prop.value -replace "http://www.wikidata.org/entity/", ""
            $PropLabels[$pIdString] = $row.propLabel.value
        }
    }
}

# ==============================================================================
# STEP 4: EXPORT REPORT
# ==============================================================================
$ReportData = [System.Collections.Generic.List[PSObject]]::new()

foreach ($uri in $PropertyCounts.Keys) {
    $label = "Unknown Property"
    $shortId = $uri
    
    if ($uri -match "rdf-schema#label") {
        $label = "Preferred Name (Base Label)"
        $shortId = "rdfs:label"
    } elseif ($uri -match "skos/core#altLabel") {
        $label = "Alias / Synonym"
        $shortId = "skos:altLabel"
    } elseif ($uri -match "prop/direct/(P\d+)") {
        $shortId = $Matches[1]
        if ($PropLabels.ContainsKey($shortId)) {
            $label = $PropLabels[$shortId]
        }
    }

    $ReportData.Add([PSCustomObject]@{
        PropertyID = $shortId
        Label      = $label
        TotalCount = $PropertyCounts[$uri]
        URI        = $uri
    })
}

$ReportData = $ReportData | Sort-Object TotalCount -Descending

Write-Host "Found $($ReportData.Count) different language properties."
Write-Host "Exporting report to $OutputFile..." -ForegroundColor Cyan
$ReportData | Export-Csv -Path $OutputFile -NoTypeInformation -Encoding UTF8
Write-Host "Done! Report generation complete." -ForegroundColor Green
