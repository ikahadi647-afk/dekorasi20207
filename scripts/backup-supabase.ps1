# Script Backup Supabase Database
# Workflow yang direkomendasikan oleh Supabase

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   SUPABASE DATABASE BACKUP SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Cek apakah Supabase CLI sudah terinstall
Write-Host "Checking Supabase CLI..." -ForegroundColor Yellow
$supabaseCheck = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseCheck) {
    Write-Host "❌ Supabase CLI belum terinstall!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Untuk install Supabase CLI:" -ForegroundColor Yellow
    Write-Host "1. Via npm (recommended):" -ForegroundColor White
    Write-Host "   npm install -g supabase" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Via Scoop (Windows):" -ForegroundColor White
    Write-Host "   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git" -ForegroundColor Gray
    Write-Host "   scoop install supabase" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "✅ Supabase CLI detected" -ForegroundColor Green
Write-Host ""

# Login ke Supabase (jika belum)
Write-Host "Checking Supabase login status..." -ForegroundColor Yellow
$loginCheck = supabase projects list 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Belum login ke Supabase" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Silakan login terlebih dahulu:" -ForegroundColor White
    Write-Host "   supabase login" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "✅ Already logged in to Supabase" -ForegroundColor Green
Write-Host ""

# Minta Connection String
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONNECTION STRING DIPERLUKAN" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Format Connection String:" -ForegroundColor White
Write-Host "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" -ForegroundColor Gray
Write-Host ""
Write-Host "Cara mendapatkan Connection String:" -ForegroundColor Yellow
Write-Host "1. Buka Supabase Dashboard" -ForegroundColor White
Write-Host "2. Pilih project Anda" -ForegroundColor White
Write-Host "3. Settings → Database → Connection String" -ForegroundColor White
Write-Host "4. Copy 'URI' dan ganti [YOUR-PASSWORD] dengan password database" -ForegroundColor White
Write-Host ""

$connectionString = Read-Host "Paste Connection String"

if ([string]::IsNullOrWhiteSpace($connectionString)) {
    Write-Host "❌ Connection string tidak boleh kosong!" -ForegroundColor Red
    exit 1
}

# Validasi format connection string
if (-not $connectionString.StartsWith("postgresql://")) {
    Write-Host "❌ Format connection string tidak valid!" -ForegroundColor Red
    Write-Host "Harus dimulai dengan: postgresql://" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Connection string valid" -ForegroundColor Green
Write-Host ""

# Buat folder backup dengan timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFolder = "BACKUP_SUPABASE\backup_$timestamp"
New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MEMULAI BACKUP PROCESS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backup akan disimpan di: $backupFolder" -ForegroundColor White
Write-Host ""

# 1. Backup Schema
Write-Host "[1/4] 📦 Backing up SCHEMA..." -ForegroundColor Cyan
Write-Host "      (tables, constraints, functions, triggers, RLS, policies, indexes)" -ForegroundColor Gray

supabase db dump --db-url $connectionString -f "$backupFolder\schema.sql"

if ($LASTEXITCODE -eq 0) {
    $schemaSize = (Get-Item "$backupFolder\schema.sql").Length / 1KB
    Write-Host "      ✅ Schema backup completed: $([math]::Round($schemaSize, 2)) KB" -ForegroundColor Green
} else {
    Write-Host "      ❌ Schema backup failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Backup Data
Write-Host "[2/4] 📊 Backing up DATA..." -ForegroundColor Cyan
Write-Host "      (all table data including mock data)" -ForegroundColor Gray

supabase db dump --db-url $connectionString -f "$backupFolder\data.sql" --use-copy --data-only

if ($LASTEXITCODE -eq 0) {
    $dataSize = (Get-Item "$backupFolder\data.sql").Length / 1KB
    Write-Host "      ✅ Data backup completed: $([math]::Round($dataSize, 2)) KB" -ForegroundColor Green
} else {
    Write-Host "      ❌ Data backup failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 3. Backup Roles
Write-Host "[3/4] 👥 Backing up ROLES..." -ForegroundColor Cyan
Write-Host "      (database roles and permissions)" -ForegroundColor Gray

supabase db dump --db-url $connectionString -f "$backupFolder\roles.sql" --role-only

if ($LASTEXITCODE -eq 0) {
    $rolesSize = (Get-Item "$backupFolder\roles.sql").Length / 1KB
    Write-Host "      ✅ Roles backup completed: $([math]::Round($rolesSize, 2)) KB" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  Roles backup warning (might not have custom roles)" -ForegroundColor Yellow
}
Write-Host ""

# 4. Buat README untuk backup ini
Write-Host "[4/4] 📝 Creating backup documentation..." -ForegroundColor Cyan

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

### To New Supabase Project:

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

### Using Supabase CLI:

``````bash
# Link to new project
supabase link --project-ref YOUR_NEW_PROJECT_REF

# Push schema
supabase db push --linked

# Then restore data manually via SQL Editor
``````

## Important Notes

⚠️ **Storage Files Not Included**
This backup only includes database (metadata). If your app uses Storage for files (images, PDFs, documents), you need to backup Storage separately:

- Gallery photos
- Documents
- Invoices
- User uploads

To backup Storage:
1. Use Supabase Dashboard → Storage
2. Download each bucket
3. Or use Storage API to download programmatically

⚠️ **Secrets and Keys**
Backup does not include:
- API keys
- Service role keys
- JWT secrets
- Third-party integration keys

Make sure to note these separately!

## Backup Metadata

- Project: weddfinpoto
- Backup Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- Backup Method: Supabase CLI db dump
- Files Generated: 3

## Next Steps

1. ✅ Verify backup files are complete
2. ✅ Test restore in development environment
3. ✅ Store backup securely (encrypt if contains sensitive data)
4. ✅ Backup Storage files separately if needed
5. ✅ Document any custom environment variables

---
Generated by backup-supabase.ps1
"@

Set-Content -Path "$backupFolder\README.md" -Value $readmeContent
Write-Host "      ✅ Documentation created" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Green
Write-Host "   BACKUP COMPLETED SUCCESSFULLY! ✅" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backup Location:" -ForegroundColor White
Write-Host "  $backupFolder" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files Created:" -ForegroundColor White

Get-ChildItem $backupFolder | ForEach-Object {
    $size = if ($_.Length -gt 1MB) { "$([math]::Round($_.Length / 1MB, 2)) MB" } else { "$([math]::Round($_.Length / 1KB, 2)) KB" }
    Write-Host "  ✓ $($_.Name) - $size" -ForegroundColor Gray
}

Write-Host ""
Write-Host "⚠️  IMPORTANT REMINDERS:" -ForegroundColor Yellow
Write-Host "  • Storage files (photos, documents) are NOT included" -ForegroundColor White
Write-Host "  • Backup Storage buckets separately if needed" -ForegroundColor White
Write-Host "  • Keep backup secure (contains sensitive data)" -ForegroundColor White
Write-Host "  • Test restore in dev environment before using in production" -ForegroundColor White
Write-Host ""
Write-Host "To restore, read: $backupFolder\README.md" -ForegroundColor Cyan
Write-Host ""
