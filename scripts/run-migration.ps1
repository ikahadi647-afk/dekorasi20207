# Script untuk menjalankan migration SQL ke Supabase

param(
    [Parameter(Mandatory=$true)]
    [string]$MigrationFile
)

Write-Host "========================================"
Write-Host "   RUN SUPABASE MIGRATION"
Write-Host "========================================"
Write-Host ""

# Validasi file exists
if (-not (Test-Path $MigrationFile)) {
    Write-Host "ERROR: File migration tidak ditemukan: $MigrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "Migration File: $MigrationFile" -ForegroundColor Cyan
Write-Host ""

# Baca isi file
$sqlContent = Get-Content $MigrationFile -Raw
$lineCount = ($sqlContent -split "`n").Count

Write-Host "File Preview:" -ForegroundColor Yellow
Write-Host "  Lines: $lineCount"
Write-Host "  Size: $((Get-Item $MigrationFile).Length / 1KB) KB"
Write-Host ""

# Tampilkan first 10 lines
Write-Host "First 10 lines:" -ForegroundColor Gray
($sqlContent -split "`n" | Select-Object -First 10) -join "`n"
Write-Host ""
Write-Host "..." -ForegroundColor Gray
Write-Host ""

# Minta Connection String
Write-Host "========================================"
Write-Host "CONNECTION STRING DIPERLUKAN"
Write-Host "========================================"
Write-Host ""
Write-Host "Format:"
Write-Host "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
Write-Host ""

$connectionString = Read-Host "Paste Connection String (atau tekan Enter untuk skip)"

if ([string]::IsNullOrWhiteSpace($connectionString)) {
    Write-Host ""
    Write-Host "SKIPPED: Connection string kosong" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Anda bisa menjalankan migration secara manual:" -ForegroundColor White
    Write-Host "1. Buka Supabase Dashboard" -ForegroundColor Gray
    Write-Host "2. SQL Editor" -ForegroundColor Gray
    Write-Host "3. Copy-paste isi file: $MigrationFile" -ForegroundColor Gray
    Write-Host "4. Run query" -ForegroundColor Gray
    Write-Host ""
    
    # Copy ke clipboard (Windows)
    try {
        Set-Clipboard -Value $sqlContent
        Write-Host "SUCCESS: SQL sudah di-copy ke clipboard!" -ForegroundColor Green
        Write-Host "Tinggal paste di SQL Editor" -ForegroundColor Green
    } catch {
        Write-Host "INFO: Buka file manual untuk copy" -ForegroundColor Yellow
    }
    
    exit 0
}

# Validasi format
if (-not $connectionString.StartsWith("postgresql://")) {
    Write-Host "ERROR: Format connection string tidak valid!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "OK: Connection string valid" -ForegroundColor Green
Write-Host ""

# Cek psql
$psqlCheck = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlCheck) {
    Write-Host "ERROR: psql (PostgreSQL client) tidak ditemukan!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install PostgreSQL client:" -ForegroundColor Yellow
    Write-Host "  choco install postgresql" -ForegroundColor Gray
    Write-Host "  atau download dari: https://www.postgresql.org/download/" -ForegroundColor Gray
    Write-Host ""
    Write-Host "ALTERNATIVE: Copy SQL ke clipboard dan paste di Supabase SQL Editor" -ForegroundColor Yellow
    
    try {
        Set-Clipboard -Value $sqlContent
        Write-Host "SQL sudah di-copy ke clipboard!" -ForegroundColor Green
    } catch {}
    
    exit 1
}

# Konfirmasi
Write-Host "========================================"
Write-Host "READY TO RUN MIGRATION"
Write-Host "========================================"
Write-Host ""
Write-Host "WARNING: Ini akan menjalankan SQL ke database!" -ForegroundColor Yellow
Write-Host "File: $MigrationFile" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Lanjutkan? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "CANCELLED" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Running migration..." -ForegroundColor Cyan

# Run migration
psql $connectionString -f $MigrationFile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================"
    Write-Host "   MIGRATION SUCCESS!"
    Write-Host "========================================"
    Write-Host ""
    Write-Host "OK: Migration berhasil dijalankan" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR: Migration gagal!" -ForegroundColor Red
    Write-Host "Cek error message di atas" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
