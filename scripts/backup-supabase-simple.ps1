# Script Backup Supabase Database - Simple Version
# Workflow yang direkomendasikan oleh Supabase

Write-Host "========================================"
Write-Host "   SUPABASE DATABASE BACKUP SCRIPT"
Write-Host "========================================"
Write-Host ""

# Cek Supabase CLI
Write-Host "Checking Supabase CLI..." -ForegroundColor Yellow
$supabaseCheck = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseCheck) {
    Write-Host "ERROR: Supabase CLI belum terinstall!" -ForegroundColor Red
    Write-Host "Install dengan: npm install -g supabase"
    exit 1
}

Write-Host "OK: Supabase CLI detected" -ForegroundColor Green
Write-Host ""

# Cek login status
Write-Host "Checking Supabase login status..." -ForegroundColor Yellow
$loginCheck = supabase projects list 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Belum login ke Supabase" -ForegroundColor Red
    Write-Host "Jalankan: supabase login"
    exit 1
}

Write-Host "OK: Already logged in" -ForegroundColor Green
Write-Host ""

# Minta Connection String
Write-Host "========================================"
Write-Host "CONNECTION STRING DIPERLUKAN"
Write-Host "========================================"
Write-Host ""
Write-Host "Format:"
Write-Host "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
Write-Host ""
Write-Host "Cara mendapatkan:"
Write-Host "1. Buka https://app.supabase.com"
Write-Host "2. Pilih project Anda"
Write-Host "3. Settings -> Database -> Connection String"
Write-Host "4. Copy URI dan ganti [YOUR-PASSWORD]"
Write-Host ""

$connectionString = Read-Host "Paste Connection String"

if ([string]::IsNullOrWhiteSpace($connectionString)) {
    Write-Host "ERROR: Connection string tidak boleh kosong!" -ForegroundColor Red
    exit 1
}

if (-not $connectionString.StartsWith("postgresql://")) {
    Write-Host "ERROR: Format connection string tidak valid!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "OK: Connection string valid" -ForegroundColor Green
Write-Host ""

# Buat folder backup
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFolder = "BACKUP_SUPABASE\backup_$timestamp"
New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null

Write-Host "========================================"
Write-Host "MEMULAI BACKUP PROCESS"
Write-Host "========================================"
Write-Host ""
Write-Host "Backup Location: $backupFolder"
Write-Host ""

# 1. Backup Schema
Write-Host "[1/4] Backing up SCHEMA..." -ForegroundColor Cyan
Write-Host "      (tables, constraints, functions, triggers, RLS, policies, indexes)"

supabase db dump --db-url $connectionString -f "$backupFolder\schema.sql"

if ($LASTEXITCODE -eq 0) {
    $schemaSize = (Get-Item "$backupFolder\schema.sql").Length / 1KB
    Write-Host "      OK: Schema backup completed ($([math]::Round($schemaSize, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "      ERROR: Schema backup failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Backup Data
Write-Host "[2/4] Backing up DATA..." -ForegroundColor Cyan
Write-Host "      (all table data including mock data)"

supabase db dump --db-url $connectionString -f "$backupFolder\data.sql" --use-copy --data-only

if ($LASTEXITCODE -eq 0) {
    $dataSize = (Get-Item "$backupFolder\data.sql").Length / 1KB
    Write-Host "      OK: Data backup completed ($([math]::Round($dataSize, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "      ERROR: Data backup failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 3. Backup Roles
Write-Host "[3/4] Backing up ROLES..." -ForegroundColor Cyan
Write-Host "      (database roles and permissions)"

supabase db dump --db-url $connectionString -f "$backupFolder\roles.sql" --role-only

if ($LASTEXITCODE -eq 0) {
    $rolesSize = (Get-Item "$backupFolder\roles.sql").Length / 1KB
    Write-Host "      OK: Roles backup completed ($([math]::Round($rolesSize, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "      WARNING: Roles backup warning" -ForegroundColor Yellow
}
Write-Host ""

# 4. Buat README
Write-Host "[4/4] Creating documentation..." -ForegroundColor Cyan

$readmeContent = @"
# Supabase Database Backup
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Backup Contents

### 1. schema.sql
- Database schema (structure)
- Tables, columns, constraints
- Functions and triggers
- Row Level Security (RLS) policies
- Indexes and sequences

### 2. data.sql
- All table data
- Uses COPY command for faster restore
- Includes all mock/test data

### 3. roles.sql
- Database roles
- User permissions
- Access controls

## How to Restore

To new Supabase project:

1. Create new Supabase project
2. Get connection string from new project
3. Run in order:

``````powershell
# 1. Restore schema
psql "NEW_CONNECTION_STRING" -f schema.sql

# 2. Restore data
psql "NEW_CONNECTION_STRING" -f data.sql

# 3. Restore roles (optional)
psql "NEW_CONNECTION_STRING" -f roles.sql
``````

## Important Notes

### Storage Files Not Included
This backup only includes database metadata. If your app uses Storage for files (images, PDFs, documents), you need to backup Storage separately.

### Secrets and Keys
Backup does not include:
- API keys
- Service role keys
- JWT secrets
- Third-party integration keys

## Backup Metadata

- Project: weddfinpoto
- Backup Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- Backup Method: Supabase CLI db dump
- Files Generated: 3

---
Generated by backup-supabase-simple.ps1
"@

Set-Content -Path "$backupFolder\README.md" -Value $readmeContent
Write-Host "      OK: Documentation created" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "========================================"
Write-Host "   BACKUP COMPLETED SUCCESSFULLY!"
Write-Host "========================================"
Write-Host ""
Write-Host "Backup Location:" -ForegroundColor White
Write-Host "  $backupFolder" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files Created:" -ForegroundColor White

Get-ChildItem $backupFolder | ForEach-Object {
    $size = if ($_.Length -gt 1MB) { "$([math]::Round($_.Length / 1MB, 2)) MB" } else { "$([math]::Round($_.Length / 1KB, 2)) KB" }
    Write-Host "  - $($_.Name) - $size"
}

Write-Host ""
Write-Host "IMPORTANT REMINDERS:" -ForegroundColor Yellow
Write-Host "  * Storage files (photos, documents) are NOT included"
Write-Host "  * Backup Storage buckets separately if needed"
Write-Host "  * Keep backup secure (contains sensitive data)"
Write-Host "  * Test restore in dev environment first"
Write-Host ""
Write-Host "To restore, read: $backupFolder\README.md" -ForegroundColor Cyan
Write-Host ""
