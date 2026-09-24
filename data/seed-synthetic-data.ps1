#Requires -Version 5.1
<#
  Seeds a small, coherent, FICTITIOUS demo dataset for Virtual Rounding.
  No real patient data. Idempotent (checks by name). Requires `az login` to the target tenant.
#>
param([string]$EnvironmentUrl = "https://orgfd452920.crm.dynamics.com")
$ErrorActionPreference = "Stop"
$token = az account get-access-token --resource $EnvironmentUrl --query accessToken -o tsv
if (-not $token) { throw "No token. Run: az login --tenant <target>" }
$baseUrl = "$EnvironmentUrl/api/data/v9.2"
$headers = @{ "Authorization"="Bearer $token"; "OData-MaxVersion"="4.0"; "OData-Version"="4.0"; "Prefer"="return=representation" }
function Get-Dv($u){ Invoke-RestMethod -Uri $u -Headers $headers }
function Post-Dv($u,$o){ Invoke-RestMethod -Uri $u -Method Post -Headers $headers -Body ($o | ConvertTo-Json -Depth 15) -ContentType "application/json" }
function Esc($s){ return ($s -replace "'","''") }

function Ensure-Location($name){
  $q = Get-Dv "$baseUrl/sh_locations?`$filter=sh_name eq '$(Esc $name)'&`$select=sh_locationid"
  if($q.value.Count -gt 0){ return $q.value[0].sh_locationid }
  (Post-Dv "$baseUrl/sh_locations" @{ sh_name=$name }).sh_locationid
}
function Ensure-SubLocation($name,$locId){
  $q = Get-Dv "$baseUrl/sh_sublocations?`$filter=sh_name eq '$(Esc $name)'&`$select=sh_sublocationid"
  if($q.value.Count -gt 0){ return $q.value[0].sh_sublocationid }
  (Post-Dv "$baseUrl/sh_sublocations" @{ sh_name=$name; "sh_LocationId@odata.bind"="/sh_locations($locId)" }).sh_sublocationid
}
function Ensure-Room($r,$locId,$subId){
  $q = Get-Dv "$baseUrl/sh_rooms?`$filter=sh_name eq '$(Esc $r.name)'&`$select=sh_roomid"
  if($q.value.Count -gt 0){ Write-Host "  [SKIP] room $($r.name)" -ForegroundColor Yellow; return }
  $body = @{
    sh_name=$r.name; sh_roomupn=$r.upn; sh_meetinglink=$r.link; sh_patientname=$r.patient
    sh_status=$r.status; sh_shareexternally=$r.share; sh_sharedwith=$r.sharedwith
    "sh_LocationId@odata.bind"="/sh_locations($locId)"; "sh_SubLocationId@odata.bind"="/sh_sublocations($subId)"
  }
  Post-Dv "$baseUrl/sh_rooms" $body | Out-Null
  Write-Host "  [OK] room $($r.name)  ($($r.patient))" -ForegroundColor Green
}

# --- Fictitious demo model --------------------------------------------------
$data = @(
  @{ location="Fabrikam Medical Center"; sublocations=@(
      @{ name="3 West"; rooms=@(
          @{ name="Room 301"; upn="room301@fabrikam.example"; patient="Jordan Rivera";  status=2; share=$true;  sharedwith=1; link="https://teams.microsoft.com/l/meetup-join/demo-301" }
          @{ name="Room 302"; upn="room302@fabrikam.example"; patient="";               status=1; share=$false; sharedwith=0; link="https://teams.microsoft.com/l/meetup-join/demo-302" }
          @{ name="Room 303"; upn="room303@fabrikam.example"; patient="Priya Nair";      status=2; share=$false; sharedwith=0; link="https://teams.microsoft.com/l/meetup-join/demo-303" }
        )}
      @{ name="ICU"; rooms=@(
          @{ name="ICU 1"; upn="icu1@fabrikam.example"; patient="Marcus Bello"; status=2; share=$true;  sharedwith=2; link="https://teams.microsoft.com/l/meetup-join/demo-icu1" }
          @{ name="ICU 2"; upn="icu2@fabrikam.example"; patient="";             status=3; share=$false; sharedwith=0; link="https://teams.microsoft.com/l/meetup-join/demo-icu2" }
        )}
    )}
  @{ location="Contoso Children's Hospital"; sublocations=@(
      @{ name="Pediatrics 2"; rooms=@(
          @{ name="Peds 201"; upn="peds201@contoso.example"; patient="Emma Larsson"; status=2; share=$true;  sharedwith=3; link="https://teams.microsoft.com/l/meetup-join/demo-p201" }
          @{ name="Peds 202"; upn="peds202@contoso.example"; patient="";             status=1; share=$false; sharedwith=0; link="https://teams.microsoft.com/l/meetup-join/demo-p202" }
        )}
    )}
)

foreach($loc in $data){
  Write-Host "Location: $($loc.location)" -ForegroundColor Cyan
  $locId = Ensure-Location $loc.location
  foreach($sub in $loc.sublocations){
    Write-Host "  SubLocation: $($sub.name)" -ForegroundColor Cyan
    $subId = Ensure-SubLocation $sub.name $locId
    foreach($room in $sub.rooms){ Ensure-Room $room $locId $subId }
  }
}
Write-Host "Synthetic data seeded." -ForegroundColor Green
