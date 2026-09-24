# Panduan Migrasi Database Supabase

Dokumentasi lengkap untuk backup dan migrasi database Supabase menggunakan workflow resmi yang direkomendasikan.

## 📋 Ringkasan

Workflow ini menggunakan **Supabase CLI** dengan perintah `db dump` untuk menghasilkan backup dalam format SQL yang kompatibel dengan PostgreSQL. Ini adalah metode resmi yang direkomendasikan Supabase untuk migrasi antar-project.

### Struktur Backup

```
BACKUP_SUPABASE/
├── backup_2026-09-24_18-30-00/
│   ├── schema.sql        ← Struktur database (tabel, constraint, function, trigger, RLS, policy, index)
│   ├── data.sql          ← SEMUA DATA (termasuk mock data)
│   ├── roles.sql         ← Database roles dan permissions
│   └── README.md         ← Dokumentasi backup ini
│
└── backup_2026-09-25_09-15-00/
    └── ...
```

## 🚀 Cara Menggunakan

### Prerequisites

1. **Supabase CLI** harus terinstall
2. **psql** (PostgreSQL client) untuk restore
3. **Database password** dari Supabase project

### Instalasi Tools

#### Install Supabase CLI

**Via npm (Recommended):**
```bash
npm install -g supabase
```

**Via Scoop (Windows):**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### Install psql (PostgreSQL Client)

**Via Chocolatey:**
```bash
choco install postgresql
```

**Manual Download:**
- Download dari: https://www.postgresql.org/download/windows/
- Install (pilih "Command Line Tools")

### Login ke Supabase

```bash
supabase login
```

Browser akan terbuka untuk autentikasi.

## 📦 Backup Database

### Metode 1: Menggunakan Script Otomatis (Recommended)

```powershell
.\scripts\backup-supabase.ps1
```

Script akan memandu Anda:
1. ✅ Cek Supabase CLI
2. ✅ Cek login status
3. ✅ Minta connection string
4. ✅ Backup schema
5. ✅ Backup data
6. ✅ Backup roles
7. ✅ Generate dokumentasi

### Metode 2: Manual via Command Line

#### Langkah 1: Dapatkan Connection String

1. Buka Supabase Dashboard: https://app.supabase.com
2. Pilih project Anda
3. **Settings** → **Database** → **Connection String**
4. Copy **URI** format
5. Ganti `[YOUR-PASSWORD]` dengan password database Anda

Format:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

Contoh:
```
postgresql://postgres:mySecretPassword123@db.qnepyfrogzzlnnmusyzs.supabase.co:5432/postgres
```

#### Langkah 2: Jalankan Backup Commands

```bash
# Buat folder backup
mkdir BACKUP_SUPABASE\backup_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')
cd BACKUP_SUPABASE\backup_TIMESTAMP

# 1. Backup Schema
supabase db dump --db-url "CONNECTION_STRING" -f schema.sql

# 2. Backup Data
supabase db dump --db-url "CONNECTION_STRING" -f data.sql --use-copy --data-only

# 3. Backup Roles
supabase db dump --db-url "CONNECTION_STRING" -f roles.sql --role-only
```

### Penjelasan Flags

| Flag | Keterangan |
|------|------------|
| `--db-url` | Connection string database sumber |
| `-f` | Output file name |
| `--use-copy` | Menggunakan PostgreSQL COPY untuk performa lebih cepat |
| `--data-only` | Hanya backup data, tanpa schema |
| `--role-only` | Hanya backup roles |

## 🔄 Restore Database

### Metode 1: Menggunakan Script Otomatis (Recommended)

```powershell
.\scripts\restore-supabase.ps1
```

Script akan:
1. ✅ Tampilkan daftar backup yang tersedia
2. ✅ Minta pilih backup
3. ✅ Minta connection string target
4. ✅ Konfirmasi sebelum restore
5. ✅ Restore schema → data → roles

### Metode 2: Manual via psql

#### Langkah 1: Persiapan Target Database

**PENTING:** Pastikan target database adalah:
- ✅ Database baru (kosong), ATAU
- ✅ Database yang sudah di-backup

**JANGAN** restore ke production database tanpa backup!

#### Langkah 2: Dapatkan Connection String Target

Sama seperti saat backup, dapatkan connection string dari project target.

#### Langkah 3: Restore Files

```bash
# Restore dalam urutan ini (PENTING!):

# 1. Schema dulu
psql "TARGET_CONNECTION_STRING" -f schema.sql

# 2. Kemudian data
psql "TARGET_CONNECTION_STRING" -f data.sql

# 3. Terakhir roles (optional)
psql "TARGET_CONNECTION_STRING" -f roles.sql
```

### Metode 3: Via Supabase Dashboard (Manual)

Jika psql tidak tersedia, gunakan SQL Editor di Supabase Dashboard:

1. Buka **SQL Editor** di target project
2. Buka file `schema.sql` di text editor
3. Copy-paste isinya ke SQL Editor
4. Run query
5. Ulangi untuk `data.sql`

**Note:** Untuk file besar, metode ini bisa lambat atau timeout.

## ⚠️ Hal Penting yang Perlu Diperhatikan

### 1. Storage Files TIDAK Terbackup

Backup database hanya menyimpan **metadata** Storage, bukan file fisiknya.

Jika aplikasi Anda menggunakan Storage untuk:
- 📷 Gallery foto wedding
- 📄 Dokumen clients
- 🧾 Invoice/receipt
- 📎 File attachments

Anda perlu backup Storage secara terpisah!

#### Cara Backup Storage:

**Manual via Dashboard:**
1. Buka **Storage** di Supabase Dashboard
2. Pilih bucket (misal: `gallery`, `documents`)
3. Download semua file

**Programmatic (Node.js):**

```javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(URL, SERVICE_KEY);

async function backupBucket(bucketName) {
  // List all files
  const { data: files } = await supabase
    .storage
    .from(bucketName)
    .list();

  // Download each file
  for (const file of files) {
    const { data } = await supabase
      .storage
      .from(bucketName)
      .download(file.name);
    
    const buffer = Buffer.from(await data.arrayBuffer());
    fs.writeFileSync(`./storage-backup/${bucketName}/${file.name}`, buffer);
  }
}

backupBucket('gallery');
backupBucket('documents');
```

### 2. Secrets dan API Keys

Backup TIDAK termasuk:
- ❌ Supabase API keys (anon key, service role key)
- ❌ JWT secrets
- ❌ Third-party API keys (payment gateway, email service, dll)
- ❌ Environment variables

**Catat secara terpisah:**
- Keys dari Settings → API
- Environment variables dari `.env`

### 3. Urutan Restore Penting

Database memiliki foreign key constraints, jadi urutan restore harus benar:

```
1. schema.sql   ← Buat tabel dulu
2. data.sql     ← Insert data (mengikuti FK constraints)
3. roles.sql    ← Set permissions
```

Jika restore `data.sql` error "violates foreign key constraint", berarti ada masalah dengan urutan atau data.

### 4. Row Level Security (RLS)

RLS policies ter-restore otomatis dari `schema.sql`, tapi pastikan:
- ✅ Policies aktif setelah restore
- ✅ Test dengan user role yang berbeda
- ✅ Cek permissions di Supabase Dashboard

### 5. Functions dan Triggers

Custom functions dan triggers ter-restore dari `schema.sql`, verifikasi:
- ✅ Functions muncul di Database → Functions
- ✅ Triggers aktif di tabel yang sesuai
- ✅ Test functionality yang menggunakan trigger

## 🔍 Verifikasi Backup/Restore

### Cek Isi Backup

```powershell
# Lihat ukuran files
Get-ChildItem BACKUP_SUPABASE\backup_TIMESTAMP

# Lihat isi schema.sql (first 50 lines)
Get-Content BACKUP_SUPABASE\backup_TIMESTAMP\schema.sql -Head 50

# Count jumlah INSERT statements di data.sql
(Get-Content BACKUP_SUPABASE\backup_TIMESTAMP\data.sql | Select-String "INSERT" | Measure-Object).Count

# Cek tabel apa saja yang di-backup
Get-Content BACKUP_SUPABASE\backup_TIMESTAMP\schema.sql | Select-String "CREATE TABLE"
```

### Verifikasi Setelah Restore

```sql
-- Cek jumlah tabel
SELECT count(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- Cek jumlah data per tabel
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Cek RLS policies
SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public';

-- Cek functions
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public';
```

## 📅 Backup Otomatis

### Windows Task Scheduler

1. Buka **Task Scheduler**
2. Create Task
3. **General tab:**
   - Name: "Supabase Daily Backup"
   - Run whether user is logged on or not
4. **Triggers tab:**
   - New → Daily → 2:00 AM
5. **Actions tab:**
   - Program: `powershell.exe`
   - Arguments: `-File "D:\apliaksi 2027\weddfinpoto\scripts\backup-supabase.ps1"`
   - Start in: `D:\apliaksi 2027\weddfinpoto`

**Note:** Anda perlu simpan connection string di environment variable atau secure vault.

### Via Cron (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Backup setiap hari jam 2 pagi
0 2 * * * cd /path/to/project && ./scripts/backup-supabase.sh
```

### Via GitHub Actions

```yaml
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        
      - name: Backup Database
        env:
          DB_CONNECTION: ${{ secrets.SUPABASE_DB_URL }}
        run: |
          mkdir -p backups
          supabase db dump --db-url "$DB_CONNECTION" -f backups/schema.sql
          supabase db dump --db-url "$DB_CONNECTION" -f backups/data.sql --use-copy --data-only
          
      - name: Upload Artifacts
        uses: actions/upload-artifact@v3
        with:
          name: database-backup
          path: backups/
          retention-days: 30
```

## 🛠️ Troubleshooting

### Error: "supabase: command not found"

**Solusi:**
```bash
# Install Supabase CLI
npm install -g supabase

# Atau via Scoop
scoop install supabase
```

### Error: "psql: command not found"

**Solusi:**
```bash
# Install PostgreSQL client
choco install postgresql

# Atau download manual
# https://www.postgresql.org/download/
```

### Error: "password authentication failed"

**Penyebab:** Password di connection string salah

**Solusi:**
1. Reset database password di Supabase Dashboard
2. Settings → Database → Database Password → Generate New Password
3. Update connection string dengan password baru

### Error: "could not connect to server"

**Penyebab:** 
- Network issue
- Connection string salah
- Database paused (Free tier)

**Solusi:**
1. Cek connection string (project ref, format)
2. Cek apakah database aktif di Dashboard
3. Test koneksi: `psql "CONNECTION_STRING" -c "SELECT 1"`

### Error: "violates foreign key constraint" saat restore

**Penyebab:** Data di-restore dalam urutan yang salah

**Solusi:**
```bash
# Restore harus dalam urutan:
psql "CONNECTION" -f schema.sql   # 1. Schema dulu
psql "CONNECTION" -f data.sql     # 2. Data mengikuti FK
```

### Warning: "already exists" saat restore schema

**Normal!** Jika restore ke database yang sudah ada tabel.

**Solusi:** 
- Abaikan warning jika struktur sama
- Atau drop semua tabel dulu sebelum restore

### Backup terlalu lambat

**Penyebab:** Database besar atau koneksi lambat

**Solusi:**
- Gunakan `--use-copy` flag (sudah ada di script)
- Backup di jam low-traffic
- Pertimbangkan backup per-tabel untuk database sangat besar

## 📊 Perbandingan dengan Metode Lain

| Metode | Kelebihan | Kekurangan |
|--------|-----------|------------|
| **Supabase CLI dump** (Ini) | ✅ Format SQL standar<br>✅ Kompatibel PostgreSQL<br>✅ Recommended oleh Supabase<br>✅ Backup complete (schema+data+roles) | ❌ Perlu install CLI<br>❌ Perlu database password |
| **Supabase JS Client** | ✅ Tidak perlu CLI<br>✅ Programmatic | ❌ Hanya backup data<br>❌ Tidak backup schema<br>❌ Lambat untuk data besar |
| **Supabase Dashboard** | ✅ GUI friendly<br>✅ No setup | ❌ Manual per tabel<br>❌ Tidak praktis untuk automation |
| **Point-in-Time Recovery** | ✅ Automatic<br>✅ Multiple points | ❌ Hanya Pro plan<br>❌ 7 days retention only |

## 🎯 Best Practices

### 1. Backup Reguler

- ✅ Daily backup untuk production
- ✅ Before/after major updates
- ✅ Before schema changes
- ✅ Simpan minimal 7 backup terakhir

### 2. Test Restore

- ✅ Test restore ke dev environment bulanan
- ✅ Verifikasi data integrity
- ✅ Measure restore time

### 3. Security

- ✅ Jangan commit backup ke Git (add `BACKUP_SUPABASE/` ke `.gitignore`)
- ✅ Encrypt backup jika contains sensitive data
- ✅ Store di secure location (encrypted drive, cloud storage)
- ✅ Rotate database passwords periodically

### 4. Documentation

- ✅ Document restore procedure
- ✅ Note dependencies (API keys, env vars)
- ✅ Update runbook saat ada schema changes

### 5. Monitoring

- ✅ Set alert jika backup fails
- ✅ Check backup size trends
- ✅ Verify backup completeness

## 📞 Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Database Backups Guide](https://supabase.com/docs/guides/platform/backups)
- [pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
- [Supabase Storage Backup](https://supabase.com/docs/guides/storage)

## 🆘 Butuh Bantuan?

Jika mengalami masalah:

1. Cek error message di terminal
2. Baca troubleshooting section di atas
3. Test koneksi database: `psql "CONNECTION_STRING" -c "SELECT version()"`
4. Cek Supabase status: https://status.supabase.com
5. Contact Supabase support atau community Discord

---

**Last Updated:** 24 September 2026  
**Project:** Weddfin Dashboard  
**Database:** qnepyfrogzzlnnmusyzs.supabase.co  
**Generated by:** backup-supabase.ps1
