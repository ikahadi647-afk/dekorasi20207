# 🫀 Supabase Database Heartbeat - Setup Guide

## 📋 Deskripsi

Fitur **Database Heartbeat** adalah mekanisme keep-alive otomatis yang menjaga database Supabase tetap aktif dengan menjalankan query ringan secara berkala.

### ⚠️ **DISCLAIMER PENTING**

**Heartbeat ini HANYA melakukan aktivitas database dan TIDAK MENJAMIN bahwa Supabase Free Tier akan mencegah automatic project pause.**

Supabase memiliki kebijakan platform sendiri untuk free tier projects yang mungkin tetap melakukan pause berdasarkan:
- Total inactivity (tidak hanya database activity)
- API requests
- Authentication activity
- Storage access
- Aturan platform Supabase yang dapat berubah sewaktu-waktu

Heartbeat ini **membantu** menjaga database aktif, tetapi **bukan solusi definitif** untuk mencegah project pause di free tier.

---

## ✅ Fitur Keamanan

- ✓ Tidak menghapus atau mengubah data existing
- ✓ Tidak menyentuh tabel bisnis
- ✓ Menggunakan tabel khusus `system_heartbeat`
- ✓ Idempotent (aman dijalankan berulang kali)
- ✓ Tidak mengganggu RLS, authentication, atau business logic
- ✓ Mencegah duplicate cron jobs
- ✓ Lightweight query dengan overhead minimal

---

## 🚀 Cara Setup

### 1. **Jalankan Migration**

Di Supabase Dashboard → SQL Editor, jalankan file:

```sql
-- File: migration/005_heartbeat.sql
```

**Atau** copy-paste isi file tersebut ke SQL Editor dan klik "Run".

### 2. **Verifikasi Setup**

Jalankan query verifikasi dari file:

```sql
-- File: migration/HEARTBEAT_VERIFICATION.sql
```

**Query penting untuk dijalankan:**

```sql
-- Cek status heartbeat
SELECT 
    'Heartbeat Table Status' as check_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM system_heartbeat) THEN '✓ Active'
        ELSE '✗ Not initialized'
    END as status,
    COUNT(*) as record_count
FROM system_heartbeat;

-- Cek cron job
SELECT 
    jobid,
    jobname,
    schedule,
    active,
    CASE 
        WHEN active THEN '✓ Job is active'
        ELSE '✗ Job is inactive'
    END as status
FROM cron.job
WHERE jobname = 'database_heartbeat';
```

### 3. **Test Manual**

Untuk test bahwa function bekerja dengan baik:

```sql
-- Trigger heartbeat secara manual
SELECT perform_heartbeat();

-- Cek hasilnya
SELECT * FROM system_heartbeat;
```

---

## 📊 Monitoring

### Cek Status Heartbeat

```sql
SELECT 
    last_beat,
    beat_count,
    AGE(NOW(), last_beat) as time_since_last_beat,
    EXTRACT(EPOCH FROM (NOW() - last_beat)) / 3600 as hours_since_last_beat
FROM system_heartbeat;
```

### Cek Execution History

```sql
SELECT 
    start_time,
    status,
    return_message,
    end_time - start_time as execution_time
FROM cron.job_run_details
WHERE command LIKE '%perform_heartbeat%'
ORDER BY start_time DESC
LIMIT 10;
```

### Health Check Komprehensif

```sql
-- Gunakan query #9 dari HEARTBEAT_VERIFICATION.sql
-- untuk melihat health status lengkap
```

---

## ⚙️ Konfigurasi

### Default Schedule

Secara default, heartbeat berjalan **setiap 24 jam pada pukul 03:00 UTC**.

### Mengubah Frekuensi

Jika ingin mengubah jadwal, edit di migration atau jalankan:

#### Every 12 Hours
```sql
SELECT cron.unschedule('database_heartbeat');
SELECT cron.schedule(
    'database_heartbeat', 
    '0 */12 * * *', 
    $$SELECT perform_heartbeat();$$
);
```

#### Every 6 Hours
```sql
SELECT cron.unschedule('database_heartbeat');
SELECT cron.schedule(
    'database_heartbeat', 
    '0 */6 * * *', 
    $$SELECT perform_heartbeat();$$
);
```

#### Every 4 Hours
```sql
SELECT cron.unschedule('database_heartbeat');
SELECT cron.schedule(
    'database_heartbeat', 
    '0 */4 * * *', 
    $$SELECT perform_heartbeat();$$
);
```

### Cron Expression Reference

| Expression | Meaning |
|------------|---------|
| `0 3 * * *` | Daily at 03:00 UTC |
| `0 */12 * * *` | Every 12 hours |
| `0 */6 * * *` | Every 6 hours |
| `0 */4 * * *` | Every 4 hours |
| `*/30 * * * *` | Every 30 minutes |

---

## 🛠️ Troubleshooting

### 1. **pg_cron tidak tersedia**

**Gejala:** Error `extension "pg_cron" does not exist`

**Solusi:**
- pg_cron hanya tersedia di Supabase Paid Plan
- Untuk Free Tier, Anda bisa:
  - Upgrade ke paid plan
  - Gunakan alternatif external cron (GitHub Actions, Cron-job.org)
  - Setup edge function dengan Supabase scheduled invocations

### 2. **Heartbeat tidak berjalan**

**Cek:**
```sql
-- Apakah job aktif?
SELECT * FROM cron.job WHERE jobname = 'database_heartbeat';

-- Apakah ada error di execution history?
SELECT * FROM cron.job_run_details
WHERE command LIKE '%perform_heartbeat%'
ORDER BY start_time DESC
LIMIT 5;
```

**Solusi:**
- Re-run migration 005_heartbeat.sql
- Test manual: `SELECT perform_heartbeat();`

### 3. **Duplicate jobs**

**Cek:**
```sql
SELECT COUNT(*) FROM cron.job WHERE jobname LIKE '%heartbeat%';
```

**Solusi:**
```sql
-- Hapus semua heartbeat jobs
DO $$
DECLARE
    job_id BIGINT;
BEGIN
    FOR job_id IN 
        SELECT jobid FROM cron.job WHERE jobname LIKE '%heartbeat%'
    LOOP
        PERFORM cron.unschedule(job_id);
    END LOOP;
END $$;

-- Re-create job
SELECT cron.schedule(
    'database_heartbeat', 
    '0 3 * * *', 
    $$SELECT perform_heartbeat();$$
);
```

---

## 🔄 Alternative: External Cron (Jika pg_cron tidak tersedia)

Jika Supabase Free Tier tidak memiliki pg_cron, gunakan external service:

### Option 1: GitHub Actions

Buat file `.github/workflows/heartbeat.yml`:

```yaml
name: Database Heartbeat

on:
  schedule:
    - cron: '0 3 * * *'  # Daily at 03:00 UTC
  workflow_dispatch:  # Manual trigger

jobs:
  heartbeat:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Database
        run: |
          curl -X POST '${{ secrets.SUPABASE_URL }}/rest/v1/rpc/perform_heartbeat' \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_KEY }}" \
            -H "Content-Type: application/json"
```

**Setup:**
1. Expose function via Supabase RPC
2. Add secrets di GitHub: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`
3. Enable workflow

### Option 2: Cron-job.org

1. Buat account di https://cron-job.org
2. Buat Supabase Edge Function untuk heartbeat
3. Schedule HTTP request ke edge function URL

### Option 3: Supabase Edge Function + Database Webhooks

Buat edge function yang di-trigger oleh webhook schedule.

---

## 📈 Best Practices

1. **Monitor Regularly**: Cek heartbeat status seminggu sekali
2. **Alert Setup**: Setup monitoring alert jika heartbeat gagal
3. **Backup Plan**: Jangan andalkan hanya heartbeat untuk mencegah pause
4. **Consider Paid Plan**: Jika project critical, pertimbangkan upgrade ke paid tier
5. **Test Before Production**: Test heartbeat di development environment dulu

---

## 🗑️ Cara Uninstall (Jika diperlukan)

```sql
-- 1. Remove cron job
SELECT cron.unschedule('database_heartbeat');

-- 2. Drop function
DROP FUNCTION IF EXISTS perform_heartbeat();

-- 3. Drop table (HATI-HATI: akan hilangkan history)
DROP TABLE IF EXISTS system_heartbeat CASCADE;
```

---

## 📚 Resources

- [Supabase pg_cron Documentation](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [PostgreSQL Cron Syntax](https://crontab.guru/)
- [Supabase Platform Limits](https://supabase.com/docs/guides/platform/resource-management)

---

## ❓ FAQ

### Q: Apakah heartbeat ini menggunakan banyak resource?
**A:** Tidak. Query sangat ringan (simple UPDATE) dan hanya berjalan 1x per hari (atau sesuai schedule).

### Q: Apakah heartbeat ini mengganggu RLS?
**A:** Tidak. Table `system_heartbeat` tidak memiliki RLS dan tidak terhubung dengan business logic.

### Q: Apakah saya perlu membuat API endpoint untuk heartbeat?
**A:** Tidak jika menggunakan pg_cron. Heartbeat berjalan internal di database. API hanya diperlukan untuk external cron.

### Q: Berapa lama data heartbeat disimpan?
**A:** Table hanya menyimpan 1 record yang di-update terus. Tidak ada akumulasi data.

### Q: Apakah heartbeat ini bisa mencegah project pause 100%?
**A:** **TIDAK.** Ini hanya membantu menjaga database activity. Supabase bisa tetap pause project berdasarkan kebijakan mereka.

### Q: Haruskah saya backup data sebelum install heartbeat?
**A:** Tidak wajib karena migration sangat aman, tetapi backup regular tetap best practice.

---

## 📞 Support

Jika ada masalah:
1. Cek troubleshooting section di atas
2. Jalankan verification queries
3. Review cron.job_run_details untuk error messages

---

**Created:** 2026-09-24  
**Version:** 1.0.0  
**Status:** Production Ready ✅
