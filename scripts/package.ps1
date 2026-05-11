$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$manifestPath = Join-Path $root "manifest.json"
$distDir = Join-Path $root "dist"
$packagePath = Join-Path $distDir "dundam-sort-bar-v0.1.0.zip"
$stagingDir = Join-Path $distDir "dundam-sort-bar-package"

if (-not (Test-Path $manifestPath)) {
  throw "manifest.json was not found at $manifestPath"
}

if (Test-Path $stagingDir) {
  Remove-Item -LiteralPath $stagingDir -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $distDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $stagingDir "src") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $stagingDir "popup") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $stagingDir "icons") | Out-Null

Copy-Item -LiteralPath $manifestPath -Destination $stagingDir
Copy-Item -LiteralPath (Join-Path $root "README.md") -Destination $stagingDir
Copy-Item -LiteralPath (Join-Path $root "src\content.js") -Destination (Join-Path $stagingDir "src")
Copy-Item -LiteralPath (Join-Path $root "popup\popup.html") -Destination (Join-Path $stagingDir "popup")
Copy-Item -LiteralPath (Join-Path $root "popup\popup.css") -Destination (Join-Path $stagingDir "popup")
Copy-Item -LiteralPath (Join-Path $root "popup\popup.js") -Destination (Join-Path $stagingDir "popup")
Copy-Item -LiteralPath (Join-Path $root "icons\dundam-16.png") -Destination (Join-Path $stagingDir "icons")
Copy-Item -LiteralPath (Join-Path $root "icons\dundam-32.png") -Destination (Join-Path $stagingDir "icons")
Copy-Item -LiteralPath (Join-Path $root "icons\dundam-64.png") -Destination (Join-Path $stagingDir "icons")
Copy-Item -LiteralPath (Join-Path $root "icons\dundam-128.png") -Destination (Join-Path $stagingDir "icons")

if (Test-Path $packagePath) {
  Remove-Item -LiteralPath $packagePath -Force
}

Compress-Archive -Path (Join-Path $stagingDir "*") -DestinationPath $packagePath -Force
Remove-Item -LiteralPath $stagingDir -Recurse -Force

Write-Host "Created $packagePath"
