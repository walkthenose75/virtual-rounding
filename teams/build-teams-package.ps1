#Requires -Version 5.1
<#
  Builds a Microsoft Teams personal-tab app package for the deployed Virtual Rounding code app.
  - Tokenized template (manifest.template.json) keeps tenant/env IDs OUT of source control.
  - This script fills the concrete deployed URL and produces a sideloadable .zip in ./dist.
  The .zip is environment-specific (contains env + app IDs) and should NOT be published as-is.
#>
param(
  [string]$AppId          = "6765134d-f22e-43d8-9e24-348f20ef8e82",
  [string]$EnvironmentId  = "db02e4be-e8d1-e733-bbac-10384a8f4212",
  [string]$OutDir         = "$PSScriptRoot/dist"
)
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$playUrl = "https://apps.powerapps.com/play/e/$EnvironmentId/app/$AppId"
$domain  = "apps.powerapps.com"

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

# --- manifest.json (tokens replaced) ---------------------------------------
$manifest = Get-Content "$PSScriptRoot/manifest.template.json" -Raw
$manifest = $manifest.Replace("{{APP_PLAY_URL}}", $playUrl).Replace("{{APP_DOMAIN}}", $domain)
Set-Content -Path "$OutDir/manifest.json" -Value $manifest -Encoding UTF8
Write-Host "[OK] manifest.json (contentUrl -> $playUrl)" -ForegroundColor Green

# --- icons ------------------------------------------------------------------
function Save-Png($bmp, $path) {
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

# color.png 192x192: teal background, white ring + dot
$color = New-Object System.Drawing.Bitmap 192,192
$g = [System.Drawing.Graphics]::FromImage($color)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.ColorTranslator]::FromHtml("#0F766E"))
$white = [System.Drawing.Brushes]::White
$penW = New-Object System.Drawing.Pen ([System.Drawing.Color]::White), 10
$g.DrawEllipse($penW, 46, 46, 100, 100)
$g.FillEllipse($white, 86, 86, 20, 20)
$g.Dispose()
Save-Png $color "$OutDir/color.png"
Write-Host "[OK] color.png" -ForegroundColor Green

# outline.png 32x32: transparent, white ring (Teams shows this monochrome)
$outline = New-Object System.Drawing.Bitmap 32,32
$go = [System.Drawing.Graphics]::FromImage($outline)
$go.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$go.Clear([System.Drawing.Color]::Transparent)
$penO = New-Object System.Drawing.Pen ([System.Drawing.Color]::White), 3
$go.DrawEllipse($penO, 6, 6, 20, 20)
$go.Dispose()
Save-Png $outline "$OutDir/outline.png"
Write-Host "[OK] outline.png" -ForegroundColor Green

# --- zip --------------------------------------------------------------------
$zip = "$OutDir/VirtualRounding-Teams.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path "$OutDir/manifest.json","$OutDir/color.png","$OutDir/outline.png" -DestinationPath $zip
Write-Host "[OK] $zip" -ForegroundColor Green
Write-Host "`nSideload: Teams > Apps > Manage your apps > Upload an app > Upload a custom app > select the .zip" -ForegroundColor Cyan
