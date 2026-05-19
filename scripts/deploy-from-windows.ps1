# Sincroniza código local al VPS y ejecuta deploy-on-server.sh
# Uso:
#   cd c:\wamp64\www\app10_ecommerce
#   .\scripts\deploy-from-windows.ps1 -SshConfigHost jobshours-droplet
#   .\scripts\deploy-from-windows.ps1 -Server 64.23.199.180
param(
  [string]$Server = "",
  [string]$User = "root",
  [string]$SshConfigHost = "jobshours-droplet",
  [string]$RemoteDir = "/var/www/app10_ecommerce",
  [switch]$SkipSync
)

$ErrorActionPreference = "Stop"
$localApp = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if (-not (Test-Path (Join-Path $localApp "artisan"))) {
  throw "No se encuentra artisan en $localApp"
}

if ($SshConfigHost -ne "") {
  $target = $SshConfigHost
} elseif ($Server -ne "") {
  $target = "${User}@${Server}"
} else {
  throw "Indica -SshConfigHost o -Server"
}

$sshArgs = @()
if (Test-Path "$env:USERPROFILE\.ssh\config") {
  $sshArgs += "-F", "$env:USERPROFILE\.ssh\config"
}

function Invoke-Ssh($cmd) {
  & ssh @sshArgs -o ConnectTimeout=60 $target $cmd
}

function Invoke-Scp($src, $dst) {
  & scp @sshArgs -r $src "${target}:${dst}"
}

if (-not $SkipSync) {
  Write-Host "Sincronizando $localApp -> $RemoteDir ..."
  $excludes = @(
    "--exclude=node_modules",
    "--exclude=vendor",
    "--exclude=.git",
    "--exclude=storage/logs",
    "--exclude=storage/framework/cache",
    "--exclude=storage/framework/sessions",
    "--exclude=storage/framework/views",
    "--exclude=.env",
    "--exclude=frontend-ecommerce/.next"
  )
  $rsync = Get-Command rsync -ErrorAction SilentlyContinue
  if ($rsync) {
    $ex = $excludes -join " "
    & rsync -avz -e "ssh $($sshArgs -join ' ') -o StrictHostKeyChecking=accept-new" $ex "$localApp/" "${target}:${RemoteDir}/"
  } else {
    Write-Host "rsync no encontrado; usando tarball + scp..."
    $tgz = Join-Path $env:TEMP "dm-deploy.tgz"
    Push-Location $localApp
    tar -czf $tgz --exclude=node_modules --exclude=vendor --exclude=.git --exclude=.env --exclude=frontend-ecommerce/.next --exclude=storage/logs --exclude=public/fotos_productos .
    Pop-Location
    & scp @sshArgs $tgz "${target}:/tmp/dm-deploy.tgz"
    Invoke-Ssh "cd $RemoteDir && tar -xzf /tmp/dm-deploy.tgz && rm -f /tmp/dm-deploy.tgz"
    Remove-Item $tgz -Force -ErrorAction SilentlyContinue
  }
}

$deployScript = Join-Path $PSScriptRoot "deploy-on-server.sh"
$body = ([System.IO.File]::ReadAllText($deployScript) -replace "`r", "").TrimEnd() + "`n"
Write-Host "Ejecutando deploy en servidor..."
if (Test-Path "$env:USERPROFILE\.ssh\config") {
  $body | ssh -F $env:USERPROFILE\.ssh\config -o ConnectTimeout=60 $target "tr -d '\r' | bash -s"
} else {
  $body | ssh -o ConnectTimeout=60 $target "tr -d '\r' | bash -s"
}
Write-Host "Deploy DondeMorales finalizado."
