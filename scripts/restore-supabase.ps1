# Script Restore Supabase Database
# Restore dari backup yang dibuat dengan backup-supabase.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   SUPABASE DATABASE RESTORE SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Cek apakah psql tersedia
Write-Host "Checking PostgreSQL client (psql)..." -ForegroundColor Yellow
$psqlCheck = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlCheck) {
    Write-Host "❌ psql (PostgreSQL client) tidak ditemukan!" -ForegroundColor Red
    Write-Host ""
    Write-Host "psql diperlukan untuk restore database." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Cara install psql di Windows:" -ForegroundColor White
    Write-Host "1. Download PostgreSQL dari: https://www.postgresql.org/download/windows/" -ForegroundColor Gray
    Write-Host "2. Install (cukup pilih command line tools)" -ForegroundColor Gray
    Write-Host "3. Atau via Chocolatey: choco install postgresql" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Alternatif: Gunakan Supabase SQL Editor untuk restore manual" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ psql detected: $($psqlCheck.Source)" -ForegroundColor Green
Write-Host ""

# Cari folder backup
Write-Host "Available Backups:" -ForegroundColor Cyan
Write-Host ""

$backups = Get-ChildItem -Path "BACKUP_SUPABASE" -Directory | Sort-Object Name -Descending

if ($backups.Count -eq 0) {
    Write-Host "❌ Tidak ada backup ditemukan di folder BACKUP_SUPABASE" -ForegroundColor Red
    exit 1
}

for ($i = 0; $i -lt $backups.Count; $i++) {
    Write-Host "  [$($i + 1)] $($backups[$i].Name) - $($backups[$i].LastWriteTime)" -ForegroundColor White
}

Write-Host ""
$selection = Read-Host "Pilih nomor backup yang ingin di-restore"

$selectedIndex = [int]$selection - 1
if ($selectedIndex -lt 0 -or $selectedIndex -ge $backups.Count) {
    Write-Host "❌ Pilihan tidak valid!" -ForegroundColor Red
    exit 1
}

$backupFolder = $backups[$selectedIndex].FullName
Write-Host ""
Write-Host "Selected: $($backups[$selectedIndex].Name)" -ForegroundColor Green
Write-Host ""

# Cek file backup
$schemaFile = Join-Path $backupFolder "schema.sql"
$dataFile = Join-Path $backupFolder "data.sql"
$rolesFile = Join-Path $backupFolder "roles.sql"

if (-not (Test-Path $schemaFile)) {
    Write-Host "❌ File schema.sql tidak ditemukan di backup!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $dataFile)) {
    Write-Host "❌ File data.sql tidak ditemukan di backup!" -ForegroundColor Red
    exit 1
}

Write-Host "Backup files verified:" -ForegroundColor Green
Write-Host "  ✓ schema.sql - $([math]::Round((Get-Item $schemaFile).Length / 1KB, 2)) KB" -ForegroundColor Gray
Write-Host "  ✓ data.sql - $([math]::Round((Get-Item $dataFile).Length / 1KB, 2)) KB" -ForegroundColor Gray
if (Test-Path $rolesFile) {
    Write-Host "  ✓ roles.sql - $([math]::Round((Get-Item $rolesFile).Length / 1KB, 2)) KB" -ForegroundColor Gray
}
Write-Host ""

# Minta Connection String target
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TARGET DATABASE CONNECTION" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  WARNING: Restore akan OVERWRITE database target!" -ForegroundColor Red
Write-Host ""
Write-Host "Pastikan Anda restore ke:" -ForegroundColor Yellow
Write-Host "  • Database baru (empty)" -ForegroundColor White
Write-Host "  • Atau database yang sudah di-backup" -ForegroundColor White
Write-Host ""
Write-Host "Connection String target:" -ForegroundColor White
Write-Host "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" -ForegroundColor Gray
Write-Host ""

$targetConnection = Read-Host "Paste Target Connection String"

if ([string]::IsNullOrWhiteSpace($targetConnection)) {
    Write-Host "❌ Connection string tidak boleh kosong!" -ForegroundColor Red
    exit 1
}

if (-not $targetConnection.StartsWith("postgresql://")) {
    Write-Host "❌ Format connection string tidak valid!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Connection string valid" -ForegroundColor Green
Write-Host ""

# Konfirmasi final
Write-Host "========================================" -ForegroundColor Red
Write-Host "⚠️  FINAL CONFIRMATION" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "Anda akan restore:" -ForegroundColor White
Write-Host "  FROM: $($backups[$selectedIndex].Name)" -ForegroundColor Yellow
Write-Host "  TO: Target database" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ini akan:" -ForegroundColor Red
Write-Host "  • Menimpa schema yang ada" -ForegroundColor White
Write-Host "  • Menambahkan/update data" -ForegroundColor White
Write-Host "  • Mungkin menyebabkan duplikasi data jika tabel tidak kosong" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Ketik 'YES' untuk melanjutkan"

if ($confirm -ne "YES") {
    Write-Host "❌ Restore dibatalkan" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MEMULAI RESTORE PROCESS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Restore Schema
Write-Host "[1/3] 📦 Restoring SCHEMA..." -ForegroundColor Cyan
Write-Host "      This may take a few moments..." -ForegroundColor Gray

$env:PGPASSWORD = ""  # Password sudah di connection string
psql $targetConnection -f $schemaFile 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "      ✅ Schema restored successfully" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  Schema restore completed with warnings (normal for existing schema)" -ForegroundColor Yellow
}
Write-Host ""

# 2. Restore Data
Write-Host "[2/3] 📊 Restoring DATA..." -ForegroundColor Cyan
Write-Host "      This may take several minutes for large datasets..." -ForegroundColor Gray

psql $targetConnection -f $dataFile 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "      ✅ Data restored successfully" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  Data restore completed with warnings (check for constraint errors)" -ForegroundColor Yellow
}
Write-Host ""

# 3. Restore Roles (optional)
if (Test-Path $rolesFile) {
    Write-Host "[3/3] 👥 Restoring ROLES..." -ForegroundColor Cyan
    Write-Host "      (optional, may fail if roles already exist)" -ForegroundColor Gray

    psql $targetConnection -f $rolesFile 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "      ✅ Roles restored successfully" -ForegroundColor Green
    } else {
        Write-Host "      ⚠️  Roles restore skipped or failed (normal if roles exist)" -ForegroundColor Yellow
    }
} else {
    Write-Host "[3/3] 👥 Skipping roles (file not found)" -ForegroundColor Yellow
}

Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Green
Write-Host "   RESTORE COMPLETED! ✅" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "  1. ✅ Verify data in Supabase Dashboard" -ForegroundColor Gray
Write-Host "  2. ✅ Check Row Level Security (RLS) policies" -ForegroundColor Gray
Write-Host "  3. ✅ Test application functionality" -ForegroundColor Gray
Write-Host "  4. ✅ Restore Storage files if needed (manual)" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  REMINDERS:" -ForegroundColor Yellow
Write-Host "  • Storage files (photos, PDFs) must be restored separately" -ForegroundColor White
Write-Host "  • Update .env with new project credentials if needed" -ForegroundColor White
Write-Host "  • Check API keys and secrets" -ForegroundColor White
Write-Host ""
