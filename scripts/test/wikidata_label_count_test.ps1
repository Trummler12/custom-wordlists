# ==============================================================================
# CONFIGURATION & USER PARAMETERS (v5.5.2 - Pre-Count & Conditional Sorting)
# ==============================================================================

# Target criteria:
[string]$InstanceOfQID  = "Q3624078"    # Main class (e.g. Q3624078 = Sovereign State, Q5119 = Capital City)
[string]$ParentClassQID = ""            # Optional parent class (e.g. "Q3624078" = Sovereign State)

# Property Paths Array:
#   @("name", "1") -> NUR Sprach-Labels & Sprach-Properties direkt auf Ebene 1 des Zielobjekts
#   @("1")         -> Alle direkten Eigenschaften auf Ebene 1 (Standard / Schnell)
[string[]]$PropertyPaths = @(
   "name", "1"
)

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

# Limits & Processing Settings
[int]$Limit                 = 10000 # Max entities to process (0 = alle)
[int]$BatchSize             = 30
[int]$SleepBetweenBatchesMs = 400   # Pause zwischen SPARQL-Abfragen

# Prioritisiertes Sortier-Array (Lesbare Namen oder P-IDs)
# Bsp: @("population", "area") -> Sortiert primär nach Einwohnerzahl, bei Gleichstand/Fehlen nach Fläche.
[string[]]$SortBy        = @("population", "length", "area", "elevation", "gdp", "inception") 
[bool]$OrderDescending   = $true    # True = Höchster/Längster Wert zuerst

# MAPPING-DICTIONARY: Leserliche Begriffe -> Wikidata P-IDs
$SortPropertyMap = @{
    "population" = "P1082"  # Einwohnerzahl
    "length"     = "P2043"  # Länge
    "area"       = "P2046"  # Fläche
    "elevation"  = "P2044"  # Höhe über dem Meeresspiegel
    "gdp"        = "P2131"  # Bruttoinlandsprodukt
    "inception"  = "P571"   # Gründungsdatum / Entstehung
}

# Output Pfad
$ScriptDir  = if ($PSScriptRoot) { $PSScriptRoot } else { $PWD.Path }
$OutputFile = Join-Path $ScriptDir "Wikidata_Property_Counts.csv"
$UserAgent  = "WikidataGenericLabelCounter/5.5.2 (PowerShell/WikidataParser)"

# Blacklist
$BlacklistProperties = @(
    "http://schema.org/description"
)

# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================
function Invoke-WikidataSparql {
    param ([string]$Query)
    $uri = "https://query.wikidata.org/sparql?query=" + [Uri]::EscapeDataString($Query)
    $headers = @{ "User-Agent" = $UserAgent; "Accept" = "application/sparql-results+json" }
    
    $maxRetries = 5
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            $response = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get -TimeoutSec 60
            return $response.results.bindings
        }
        catch {
            $retryCount++
            $statusCode = 0
            if ($_.Exception.Response) { $statusCode = [int]$_.Exception.Response.StatusCode }

            if ($statusCode -in @(429, 500, 502, 503, 504) -or $_.Exception.Message -like "*429*" -or $_.Exception.Message -like "*503*") {
                $waitTime = $retryCount * 4
                Write-Warning "HTTP $statusCode / Server Busy. Waiting $waitTime seconds before retrying (Attempt $retryCount/$maxRetries)..."
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
# STEP 1: RESOLVE TARGET QID LIST (WITH PRE-COUNT & CONDITIONAL SORTING)
# ==============================================================================
Write-Host "Resolving target entities..." -ForegroundColor Cyan

$whereClauses = [System.Collections.Generic.List[string]]::new()

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
        $whereClauses.Add("?parent wdt:P31/wdt:P279* wd:$ParentClassQID .")
        $whereClauses.Add("?parent wdt:P36 ?entity .")
    } else {
        $whereClauses.Add("?parent wdt:P31/wdt:P279* wd:$ParentClassQID .")
        if ($InstanceOfQID) { $whereClauses.Add("?entity wdt:P31/wdt:P279* wd:$InstanceOfQID .") }
        $whereClauses.Add("?entity wdt:$resolvedRel ?parent .")
    }
}
elseif ($InstanceOfQID) {
    $whereClauses.Add("?entity wdt:P31/wdt:P279* wd:$InstanceOfQID .")
}

$baseWhereString = $whereClauses -join " `n  "

# --- SCHRITT 9: Vorab-Zählung der Gesamt-Items ---
Write-Host "Determining total available matching entities..." -ForegroundColor DarkGray
$countSparql = @"
SELECT (COUNT(DISTINCT ?entity) AS ?totalCount) WHERE {
  $baseWhereString
}
"@

$countResult = Invoke-WikidataSparql -Query $countSparql
$totalAvailable = 0
if ($countResult -and $countResult[0].totalCount) {
    $totalAvailable = [int]$countResult[0].totalCount.value
}

Write-Host "Total matching entities on Wikidata: $totalAvailable" -ForegroundColor Yellow

# --- SCHRITT 11: Bedingte Sortierung prüfen ---
# Sortierung ist NUR nötig, wenn ein Limit gesetzt IST UND die Treffermenge größer als das Limit ist.
$needsSorting = ($Limit -gt 0) -and ($totalAvailable -gt $Limit)

$sortVarOrders = [System.Collections.Generic.List[string]]::new()

if ($needsSorting) {
    Write-Host "Limit ($Limit) is smaller than total entities ($totalAvailable). Applying SPARQL priority sorting..." -ForegroundColor DarkGray
    $sortIdx = 0
    foreach ($sortItem in $SortBy) {
        $ppID = $null
        $cleanKey = $sortItem.Trim().ToLower()

        if ($SortPropertyMap.ContainsKey($cleanKey)) {
            $ppID = $SortPropertyMap[$cleanKey]
        } elseif ($sortItem -match "^P\d+$") {
            $ppID = $sortItem.ToUpper()
        }

        if ($ppID) {
            $varName = "sortVal_$sortIdx"
            $whereClauses.Add("OPTIONAL { ?entity wdt:$ppID ?$varName . }")
            $dir = if ($OrderDescending) { "DESC(?$varName)" } else { "ASC(?$varName)" }
            $sortVarOrders.Add($dir)
            $sortIdx++
        } else {
            Write-Warning "Sortier-Eigenschaft '$sortItem' wurde weder im Mapping noch als P-ID erkannt und wird ignoriert."
        }
    }
} else {
    if ($Limit -eq 0) {
        Write-Host "Limit is 0 (processing all entities). Skipping SPARQL ORDER BY." -ForegroundColor DarkGray
    } else {
        Write-Host "Limit ($Limit) >= total entities ($totalAvailable). Processing all matching entities, skipping SPARQL ORDER BY." -ForegroundColor DarkGray
    }
}

$orderClause = if ($needsSorting -and $sortVarOrders.Count -gt 0) { "ORDER BY " + ($sortVarOrders -join " ") } else { "" }
$limitClause = if ($Limit -gt 0) { "LIMIT $Limit" } else { "" }
$fullWhereString = $whereClauses -join " `n  "

$entitySparql = @"
SELECT DISTINCT ?entity WHERE {
  $fullWhereString
}
$orderClause
$limitClause
"@

$entityResults = Invoke-WikidataSparql -Query $entitySparql
if (-not $entityResults) { Write-Error "Could not retrieve target entities. Exiting."; exit }

$targetQIDs = $entityResults | ForEach-Object { 
    $_.entity.value -replace "http://www.wikidata.org/entity/", "" 
}
Write-Host "Retrieved $($targetQIDs.Count) target entities for processing." -ForegroundColor Green

# ==============================================================================
# STEP 2: DISCOVER PROPERTIES & AGGREGATE COUNTS
# ==============================================================================
$totalEntities = $targetQIDs.Count
$PropertyCounts = @{}

$hasName   = $PropertyPaths -contains "name"
$hasLevel1 = ($PropertyPaths.Count -eq 0) -or ($PropertyPaths -contains "1")
$hasWild   = $PropertyPaths -contains "*"

$filterConditions = @()
$valueTypeFilter  = ""

if ($hasName) {
    $valueTypeFilter = "FILTER(isLiteral(?value) && lang(?value) != `"`")"
}

if ($hasLevel1 -or (-not $hasWild)) {
    $filterConditions += "?property = <http://www.w3.org/2000/01/rdf-schema#label>"
    $filterConditions += "?property = <http://www.w3.org/2004/02/skos/core#altLabel>"
    $filterConditions += "STRSTARTS(STR(?property), `"http://www.wikidata.org/prop/direct/`")"
}
elseif ($hasWild) {
    $filterConditions += "STRSTARTS(STR(?property), `"http://www.wikidata.org/prop/direct/`")"
}

foreach ($path in $PropertyPaths) {
    if ($path -ne "name" -and $path -ne "1" -and $path -ne "*") {
        $cleanProp = $path -replace "wdt:", "" -replace "http://www.wikidata.org/prop/direct/", ""
        $filterConditions += "?property = <http://www.wikidata.org/prop/direct/$cleanProp>"
    }
}

$propertyFilterClause = if ($filterConditions.Count -gt 0) {
    "FILTER(" + ($filterConditions -join " || ") + ")"
} else {
    ""
}

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
  $propertyFilterClause
  $valueTypeFilter
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
# STEP 3: RESOLVE PROPERTY LABELS (BATCHED)
# ==============================================================================
Write-Host "Resolving discovered property labels..." -ForegroundColor Cyan

$ppIDList = [System.Collections.Generic.List[string]]::new()
foreach ($uri in $PropertyCounts.Keys) {
    if ($uri -match "prop/(?:direct/)?(P\d+)") {
        $ppIDList.Add($Matches[1])
    }
}

$PropLabels = @{}
$labelBatchSize = 150

if ($ppIDList.Count -gt 0) {
    for ($j = 0; $j -lt $ppIDList.Count; $j += $labelBatchSize) {
        $endJ = [Math]::Min($j + $labelBatchSize - 1, $ppIDList.Count - 1)
        $pBatch = $ppIDList[$j..$endJ]
        
        $percentLabels = [math]::Round((($j + $pBatch.Count) / $ppIDList.Count) * 100)
        Write-Progress -Activity "Resolving Property Labels" -Status "Batch $([math]::Floor($j/$labelBatchSize) + 1)..." -PercentComplete $percentLabels

        $ppIDValues = ($pBatch | ForEach-Object { "wd:$_" }) -join " "
        $labelSparql = @"
SELECT ?prop ?propLabel WHERE {
  VALUES ?prop { $ppIDValues }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}
"@
        $labelResults = Invoke-WikidataSparql -Query $labelSparql
        if ($labelResults) {
            foreach ($row in $labelResults) {
                $ppIDString = $row.prop.value -replace "http://www.wikidata.org/entity/", ""
                $PropLabels[$ppIDString] = $row.propLabel.value
            }
        }
        Start-Sleep -Milliseconds $SleepBetweenBatchesMs
    }
    Write-Progress -Activity "Resolving Property Labels" -Completed
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
    } elseif ($uri -match "prop/(?:direct/)?(P\d+)") {
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

Write-Host "Found $($ReportData.Count) different properties."
Write-Host "Exporting report to $OutputFile..." -ForegroundColor Cyan
$ReportData | Export-Csv -Path $OutputFile -NoTypeInformation -Encoding UTF8
Write-Host "Done! Report generation complete." -ForegroundColor Green
