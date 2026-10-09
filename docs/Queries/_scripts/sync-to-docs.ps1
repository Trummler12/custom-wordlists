# Mirrors this working copy (_untracked/docs/Queries) into docs/Queries, leaving out what
# git ignores there (_data/). Run by Trummler by hand only, never by an agent.
#
#   pwsh _untracked/docs/Queries/_scripts/sync-to-docs.ps1 [-WhatIf]
[CmdletBinding(SupportsShouldProcess)]
param()
$ErrorActionPreference = "Stop"
$OutputEncoding = [Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)

$src = Split-Path $PSScriptRoot -Parent
$repo = (git -C $src rev-parse --show-toplevel) -replace "/", "\"
$dst = Join-Path $repo "docs\Queries"

# Run from anywhere else (the synced copy in docs/Queries), it would clear itself and its source.
$expected = Join-Path $repo "_untracked\docs\Queries\_scripts\sync-to-docs.ps1"
if ($PSCommandPath -ne $expected) { throw "Run from $PSCommandPath, not from $expected`: aborted, nothing changed." }

# The branches that carry docs/Queries; anywhere else the folder is not ours to clear.
$branches = @("docs/wikidata_analysis")
$branch = git -C $repo branch --show-current
if ($branch -notin $branches) { throw "On '$branch', not on $($branches -join ', '): aborted, nothing changed." }

# The source's .gitignore decides what is left out, on both sides: the target's may be gone.
New-Item -ItemType Directory -Path $dst -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $src ".gitignore") -Destination $dst -Force
function Get-Synced([string]$root) {
  $rel = @(Get-ChildItem -LiteralPath $root -File -Recurse -Force | ForEach-Object { $_.FullName.Substring($root.Length + 1) })
  $asTarget = $rel | ForEach-Object { "docs/Queries/" + ($_ -replace "\\", "/") }
  $ignored = @((($asTarget -join "`0") + "`0") | git -C $repo check-ignore --no-index -z --stdin) -join "" -split "`0" | Where-Object { $_ }
  $skip = [Collections.Generic.HashSet[string]]::new([string[]]@($ignored))
  for ($i = 0; $i -lt $rel.Count; $i++) { if (-not $skip.Contains($asTarget[$i])) { $rel[$i] } }
}

# Clear whatever is on disk in the target and not ignored; ignored files stay untouched.
$old = @(Get-Synced $dst | Where-Object { $_ -ne ".gitignore" })
foreach ($f in $old) { Remove-Item -LiteralPath (Join-Path $dst $f) -Force }
Get-ChildItem -LiteralPath $dst -Directory -Recurse -Force | Sort-Object { $_.FullName.Length } -Descending |
  Where-Object { -not (Get-ChildItem -LiteralPath $_.FullName -Force) } | Remove-Item -Force

$new = @(Get-Synced $src)
foreach ($f in $new) {
  $to = Join-Path $dst $f
  New-Item -ItemType Directory -Path (Split-Path $to -Parent) -Force | Out-Null
  Copy-Item -LiteralPath (Join-Path $src $f) -Destination $to -Force
}
Write-Host "Branch '$branch': removed $($old.Count), copied $($new.Count)."
git -C $repo status --short -- docs/Queries
