# Force TLS 1.2
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$headers = @{
    "Accept"     = "application/sparql-results+json"
    "User-Agent" = "WikidataPowerShellCountryScraper/12.0 (mailto:your-email@example.com)"
}

# Helper function using GET + URL-encoding to prevent PowerShell POST redirect downgrade bugs
function Invoke-WikidataSparql {
    param ([string]$SparqlQuery)
    
    $encodedQuery = [System.Uri]::EscapeDataString($SparqlQuery)
    $fullUri = "https://query.wikidata.org/sparql?query=$encodedQuery"
    
    return Invoke-RestMethod -Uri $fullUri -Method Get -Headers $headers
}

$countries = @{}
$allContinentQIDs = [System.Collections.Generic.HashSet[string]]::new()
$allCapitalQIDs   = [System.Collections.Generic.HashSet[string]]::new()

try {
    # -------------------------------------------------------------------------
    # STAGE 1A: Fetch Country QIDs (~0.3s)
    # -------------------------------------------------------------------------
    Write-Host "Stage 1/5: Harvesting Country QIDs..." -ForegroundColor Cyan

    $queryQIDs = @"
SELECT DISTINCT ?country WHERE {
  { ?country wdt:P31 wd:Q3624078. }
  UNION
  { ?country wdt:P31 wd:Q6256. }
  UNION
  { ?country wdt:P31 wd:Q161243. }
  UNION
  { ?country wdt:P31 wd:Q133036. }
}
"@

    $resQIDs = Invoke-WikidataSparql -SparqlQuery $queryQIDs
    
    $countryQIDList = @()
    foreach ($row in $resQIDs.results.bindings) {
        $id = $row.country.value
        $qid = "wd:" + ($id -split '/')[-1]
        $countryQIDList += $qid

        $countries[$id] = @{
            wikidata_id   = $id
            population    = $null
            continentURIs = [System.Collections.Generic.HashSet[string]]::new()
            capitalURIs   = [System.Collections.Generic.HashSet[string]]::new()
            continents    = [System.Collections.Generic.HashSet[string]]::new()
            capitals      = [System.Collections.Generic.HashSet[string]]::new()
            namesRaw      = @{}
        }
    }

    Write-Host "Harvested $($countryQIDList.Count) target entities successfully." -ForegroundColor Green

    # -------------------------------------------------------------------------
    # STAGE 1B: Fetch Base Geo Data (~0.5s)
    # -------------------------------------------------------------------------
    Write-Host "Stage 2/5: Fetching Base Geo Data..." -ForegroundColor Cyan

    $valuesCountries = "VALUES ?country { " + ($countryQIDList -join " ") + " }"

    $queryBaseGeo = @"
SELECT ?country ?population ?continent ?capital WHERE {
  $valuesCountries
  OPTIONAL { ?country wdt:P1082 ?population. }
  OPTIONAL { ?country wdt:P30 ?continent. }
  OPTIONAL { ?country wdt:P36 ?capital. }
}
"@

    $resBaseGeo = Invoke-WikidataSparql -SparqlQuery $queryBaseGeo

    foreach ($row in $resBaseGeo.results.bindings) {
        $id = $row.country.value
        if (-not $countries.ContainsKey($id)) { continue }
        $c = $countries[$id]

        if ($row.population -and $row.population.value -match '^\d+$') {
            $c.population = [int64]$row.population.value
        }

        if ($row.continent) {
            [void]$c.continentURIs.Add($row.continent.value)
            $contQID = "wd:" + ($row.continent.value -split '/')[-1]
            [void]$allContinentQIDs.Add($contQID)
        }
        if ($row.capital) {
            [void]$c.capitalURIs.Add($row.capital.value)
            $capQID = "wd:" + ($row.capital.value -split '/')[-1]
            [void]$allCapitalQIDs.Add($capQID)
        }
    }

    # -------------------------------------------------------------------------
    # STAGE 2: Resolve English Labels for Continents and Capitals (~0.5s)
    # -------------------------------------------------------------------------
    Write-Host "Stage 3/5: Resolving Continent & Capital Labels..." -ForegroundColor Cyan

    $geoQIDs = ($allContinentQIDs + $allCapitalQIDs) -join " "
    if ($geoQIDs) {
        $queryGeoLabels = @"
SELECT ?item ?itemLabel WHERE {
  VALUES ?item { $geoQIDs }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
"@
        $resGeo = Invoke-WikidataSparql -SparqlQuery $queryGeoLabels
        $geoLabelMap = @{}
        foreach ($row in $resGeo.results.bindings) {
            $geoLabelMap[$row.item.value] = $row.itemLabel.value
        }

        foreach ($c in $countries.Values) {
            foreach ($uri in $c.continentURIs) {
                if ($geoLabelMap.ContainsKey($uri)) { [void]$c.continents.Add($geoLabelMap[$uri]) }
            }
            foreach ($uri in $c.capitalURIs) {
                if ($geoLabelMap.ContainsKey($uri)) { [void]$c.capitals.Add($geoLabelMap[$uri]) }
            }
        }
    }

    # -------------------------------------------------------------------------
    # STAGE 3: Fetch Multilingual Names in Batches of 25 Entities
    # -------------------------------------------------------------------------
    $chunkSize = 25
    $totalChunks = [math]::Ceiling($countryQIDList.Count / $chunkSize)

    Write-Host "Stage 4/5: Fetching Multilingual Names ($totalChunks batches)..." -ForegroundColor Cyan

    for ($i = 0; $i -lt $countryQIDList.Count; $i += $chunkSize) {
        $currentChunkIndex = [math]::Floor($i / $chunkSize) + 1
        $chunk = $countryQIDList[$i..[math]::Min($i + $chunkSize - 1, $countryQIDList.Count - 1)]
        $valuesChunk = "VALUES ?country { " + ($chunk -join " ") + " }"

        Write-Host "  -> Batch $currentChunkIndex of $totalChunks..." -ForegroundColor Gray

        $queryNamesChunk = @"
SELECT ?country ?term ?lang ?termType WHERE {
  $valuesChunk
  {
    ?country rdfs:label ?term.
    BIND(LANG(?term) AS ?lang)
    BIND("label" AS ?termType)
  } UNION {
    ?country skos:altLabel ?term.
    BIND(LANG(?term) AS ?lang)
    BIND("alias" AS ?termType)
  } UNION {
    ?country wdt:P1448 ?term.
    BIND(LANG(?term) AS ?lang)
    BIND("official" AS ?termType)
  } UNION {
    ?country wdt:P1813 ?term.
    BIND(LANG(?term) AS ?lang)
    BIND("short" AS ?termType)
  }
}
"@

        $resNames = Invoke-WikidataSparql -SparqlQuery $queryNamesChunk

        foreach ($row in $resNames.results.bindings) {
            $id = $row.country.value
            if (-not $countries.ContainsKey($id)) { continue }

            $c = $countries[$id]
            if ($row.term -and $row.lang) {
                $langCode = $row.lang.value
                $termValue = $row.term.value
                $termType = $row.termType.value

                if (-not $c.namesRaw.ContainsKey($langCode)) {
                    $c.namesRaw[$langCode] = @{}
                }

                if (-not $c.namesRaw[$langCode].ContainsKey($termValue)) {
                    $c.namesRaw[$langCode][$termValue] = @{ name = $termValue; pref = $false; short = $false; official = $false }
                }

                if ($termType -eq "label") { $c.namesRaw[$langCode][$termValue].pref = $true }
                if ($termType -eq "short") { $c.namesRaw[$langCode][$termValue].short = $true }
                if ($termType -eq "official") { $c.namesRaw[$langCode][$termValue].official = $true }
            }
        }

        Start-Sleep -Milliseconds 150
    }

    # -------------------------------------------------------------------------
    # STAGE 4: Export JSON
    # -------------------------------------------------------------------------
    Write-Host "Stage 5/5: Exporting JSON..." -ForegroundColor Yellow

    $outputData = @()
    foreach ($key in $countries.Keys) {
        $c = $countries[$key]

        $formattedNames = @{}
        foreach ($lang in $c.namesRaw.Keys) {
            $nameArray = @()
            foreach ($termKey in $c.namesRaw[$lang].Keys) {
                $nameObj = $c.namesRaw[$lang][$termKey]

                $cleanObj = @{ name = $nameObj.name }
                if ($nameObj.pref) { $cleanObj.pref = $true }
                if ($nameObj.short) { $cleanObj.short = $true }
                if ($nameObj.official) { $cleanObj.official = $true }

                $nameArray += $cleanObj
            }
            $formattedNames[$lang] = $nameArray
        }

        $outputData += @{
            wikidata_id = $key
            population  = $c.population
            continents  = [string[]]($c.continents)
            capitals    = [string[]]($c.capitals)
            names       = $formattedNames
        }
    }

    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    if (-not $scriptDir) { $scriptDir = "." }
    $outputPath = Join-Path $scriptDir "countries_data_advanced.json"

    $outputData | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputPath -Encoding utf8
    Write-Host "Success! Data saved to: $outputPath" -ForegroundColor Green
}
catch {
    Write-Error "Processing failed: $_"
}
