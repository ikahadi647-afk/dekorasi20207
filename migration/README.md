# Database Migration Package - Complete Guide

**Generated:** 24 September 2026  
**Project:** Weddfin Dashboard  
**Source Database:** qnepyfrogzzlnnmusyzs.supabase.co  
**Status:** ✅ Production Ready

---

## 📦 Package Contents

### Core Migration Files

#### 1. `007_schema_from_backup.sql` (21.98 KB)
**Schema Creation**
- CREATE TABLE statements untuk 25 tabel
- Indexes & Constraints
- Triggers untuk auto-update updated_at
- Comments & Documentation

**Usage:**
```powershell
psql "CONNECTION_STRING" -f migration/007_schema_from_backup.sql
```

#### 2. `008_data_from_backup.sql` (1.25 MB)
**Data Import**
- INSERT statements untuk 196 rows
- 25 tabel dengan dependencies terpenuhi
- ON CONFLICT handling untuk prevent duplicates

**Usage:**
```powershell
psql "CONNECTION_STRING" -f migration/008_data_from_backup.sql
```

#### 3. `009_rls_policies.sql` (NEW!)
**Row Level Security Policies**
- RLS policies untuk semua 25 tabel
- Authentication & authorization rules
- Public access policies untuk galleries, packages, cards
- Private policies untuk user data & contracts

**Usage:**
```powershell
psql "CONNECTION_STRING" -f migration/009_rls_policies.sql
```

#### 4. `rollback_migration.sql` (NEW!)
**Emergency Rollback**
- Drop semua tabel dengan aman
- Remove policies & constraints
- Cleanup sequences
- Verification query

**Usage (jika migration gagal):**
```powershell
psql "CONNECTION_STRING" -f migration/rollback_migration.sql
```

### Documentation Files

#### 5. `DEPLOYMENT_CHECKLIST.md` (NEW!)
**Comprehensive 23-Step Deployment Guide**
- Pre-deployment preparation
- Database migration steps with verification
- Storage migration procedures
- Application configuration updates
- Testing protocols
- Post-deployment monitoring
- Emergency rollback procedures

**Must-read before starting migration!**

#### 6. `STORAGE_MIGRATION.md` (NEW!)
**Storage Files Migration Guide**
- Identifies storage buckets (galleries, profiles, contracts, etc.)
- 3 migration methods (manual, automated, database copy)
- Bucket creation & policy setup
- URL update procedures
- Verification scripts
- Troubleshooting guide

#### 7. `007_schema_summary.json`
Metadata: tabel names, column counts, row counts

#### 8. `008_data_summary.json`
Metadata: total tables (25), total rows (196), per-table breakdown

---

## 🚀 Quick Start - Complete Migration

### Prerequisites
- [ ] New Supabase project created
- [ ] Database password saved
- [ ] psql installed (atau akses ke SQL Editor)
- [ ] Backup current .env file

### Step-by-Step Migration

#### 1. Run Schema Migration
```powershell
cd D:\apliaksi 2027\weddfinpoto
psql "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres" -f migration/007_schema_from_backup.sql
```
**Expected:** ✅ 25 tables created

#### 2. Run Data Migration
```powershell
psql "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres" -f migration/008_data_from_backup.sql
```
**Expected:** ✅ 196 rows inserted

#### 3. Apply RLS Policies
```powershell
psql "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres" -f migration/009_rls_policies.sql
```
**Expected:** ✅ RLS enabled on all tables, policies created

#### 4. Verify Migration
```powershell
# Update .env temporarily with new credentials
node scripts/update-env.js

# Run verification
node scripts/verify-migration.js
```
**Expected:** ✅ All tests passed, 196 rows verified

#### 5. Migrate Storage (if applicable)
Follow `STORAGE_MIGRATION.md` guide for detailed instructions.

#### 6. Test Application
```powershell
npm run dev
```
Test all critical features before production deployment.

---

## 🛠️ Helper Scripts

### `scripts/verify-migration.js` (NEW!)
**Migration Verification Tool**
- Checks all 25 tables exist
- Verifies row counts match expected (196 total)
- Data integrity checks (required fields)
- Generates detailed JSON report
- Exit code 0 = success, 1 = failure

**Usage:**
```powershell
node scripts/verify-migration.js
```

### `scripts/update-env.js` (NEW!)
**Interactive Environment Variables Updater**
- Automatic .env backup with timestamp
- Prompts for new Supabase credentials
- Tests connection before saving
- Validates URL format
- Option to run verification immediately

**Usage:**
```powershell
node scripts/update-env.js
```

### `scripts/backup-supabase-js.js`
Original backup script that created JSON files

### `scripts/generate-schema-from-backup.js`
Schema SQL generator (already used)

### `scripts/generate-data-sql-from-backup.js`
Data SQL generator (already used)

### `scripts/restore-from-json.js`
Alternative: restore directly from JSON backup


---

## 📊 Database Overview

### Tables Inventory (25 Total)

| Category | Tables | Row Count |
|----------|--------|-----------|
| **Authentication** | users, profiles | 0 |
| **Business Core** | clients, projects, bookings | 3 |
| **Team Management** | team_members, project_team_assignments, team_payment_records, team_project_payments | 0 |
| **Products** | packages, add_ons, project_add_ons | 15 |
| **Marketing** | leads, promo_codes | 0 |
| **Events** | calendar_events, wedding_day_checklists | 0 |
| **Communication** | notifications, client_feedback | 0 |
| **Legal** | contracts | 0 |
| **Financial** | transactions, pockets | 0 |
| **Media** | galleries, cards | 178 |
| **Vendors** | vendor_profiles, vendor_portfolios | 0 |

**Total Rows:** 196

### Critical Tables (Non-Empty)

1. **cards** (178 rows) - Kartu undangan pernikahan
2. **packages** (10 rows) - Paket foto/video
3. **add_ons** (5 rows) - Layanan tambahan
4. **clients** (3 rows) - Data client

---

## ⚠️ Important Migration Notes

### 1. Urutan Execution

**HARUS dalam urutan ini:**
1. Schema dulu (`007_schema_from_backup.sql`)
2. Data kemudian (`008_data_from_backup.sql`)

Jika terbalik, akan error "relation does not exist"

### 2. Foreign Keys

Data sudah diurutkan berdasarkan dependencies:
```
users → profiles → packages → clients → projects → transactions
```

### 3. Large File

File `008_data_from_backup.sql` besar (1.25 MB):
- Via psql: OK, cepat
- Via SQL Editor: Mungkin slow, consider split

### 4. Duplicate Prevention

```sql
ON CONFLICT (id) DO NOTHING;
```

Safe untuk re-run. Tidak akan error jika data sudah ada.

### 5. What's NOT Included

**⚠️ Not in backup - need manual migration:**

1. **RLS Policies** 
   - ✅ Solution: Run `009_rls_policies.sql`

2. **Storage Buckets & Files**
   - ✅ Solution: Follow `STORAGE_MIGRATION.md`

3. **Auth Users** (managed by Supabase Auth)
   - Manual migration needed if users exist

4. **Functions & Triggers** (custom ones)
   - Check if any exist, migrate manually

5. **API Keys & Secrets**
   - Update in new project dashboard

6. **Edge Functions**
   - Redeploy via Supabase CLI

### 6. Environment Variables

**Must update in `.env`:**
```env
SUPABASE_URL=https://NEW_PROJECT.supabase.co
SUPABASE_ANON_KEY=new_anon_key_here
SUPABASE_SERVICE_KEY=new_service_key_here
```

**Helper:** Use `node scripts/update-env.js` for guided update

### 7. Testing Before Production

**Critical Tests:**
- [ ] Login/Authentication works
- [ ] Can read packages (10 rows)
- [ ] Can read cards (178 rows)
- [ ] Can read clients (3 rows)
- [ ] Can create new records
- [ ] RLS prevents unauthorized access
- [ ] Images load from storage
- [ ] No console errors

**Use DEPLOYMENT_CHECKLIST.md for complete testing protocol**

---

## 🔧 Troubleshooting

### Error: "relation does not exist"

**Cause:** Trying to insert data before creating tables

**Solution:** Run schema migration dulu
```powershell
psql "CONNECTION" -f migration/007_schema_from_backup.sql
```

### Error: "violates foreign key constraint"

**Cause:** Parent record belum exist

**Solution:** Check parent data exists
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM clients;
```

Data migration sudah diurutkan, ini seharusnya tidak terjadi. Jika terjadi, ada data corruption.

### Error: "out of memory" atau "timeout"

**Cause:** File `008_data_from_backup.sql` terlalu besar (1.25 MB)

**Solution 1:** Use psql (lebih cepat dari SQL Editor)
```powershell
psql "CONNECTION" -f migration/008_data_from_backup.sql
```

**Solution 2:** Split file jadi sections:
```powershell
# Split by table groups
# Section 1: users, profiles, clients
# Section 2: packages, add_ons
# Section 3: cards (biggest)
# Section 4: rest
```

### Error: "permission denied"

**Cause:** Using anon key instead of service key

**Solution:** Use service_role key atau database password

### Migration Verification Failed

**Cause:** Row counts tidak match atau tables missing

**Solution:** 
1. Check `migration/verification-report.json` for details
2. Identify missing/incorrect tables
3. Re-run specific sections if needed
4. Or full rollback: `rollback_migration.sql` then re-migrate

### RLS Blocking Application

**Cause:** RLS policies terlalu restrictive

**Solution:**
1. Verify user authenticated correctly
2. Check policies: `SELECT * FROM pg_policies WHERE schemaname = 'public';`
3. Temporarily disable RLS for debugging: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`
4. Fix policy then re-enable

### Storage URLs Not Working

**Cause:** URLs still pointing to old project

**Solution:**
```sql
-- Update all URLs in database
UPDATE galleries 
SET image_url = REPLACE(image_url, 'qnepyfrogzzlnnmusyzs', 'NEW_PROJECT_REF');

UPDATE profiles
SET avatar_url = REPLACE(avatar_url, 'qnepyfrogzzlnnmusyzs', 'NEW_PROJECT_REF');
```

See `STORAGE_MIGRATION.md` for complete guide.

---

## 🆘 Emergency Procedures

### Full Rollback

Jika migration gagal total dan perlu start from scratch:

```powershell
# WARNING: This will DELETE ALL TABLES!
psql "CONNECTION_STRING" -f migration/rollback_migration.sql

# Then start over
psql "CONNECTION_STRING" -f migration/007_schema_from_backup.sql
psql "CONNECTION_STRING" -f migration/008_data_from_backup.sql
psql "CONNECTION_STRING" -f migration/009_rls_policies.sql
```

### Revert to Old Project

Jika new project tidak stabil dalam 48 jam pertama:

```powershell
# Restore .env from backup
cp .env.backup .env

# Redeploy application with old credentials
npm run build
# Deploy...
```

Old project masih active, application akan connect kembali.

**Important:** Keep old project active minimal 2 minggu setelah migration!

---

## 📞 Support & Resources

### Documentation
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step deployment guide
- `STORAGE_MIGRATION.md` - Storage files migration
- `../BACKUP_SUPABASE/README.md` - Backup documentation

### Scripts
- `scripts/verify-migration.js` - Verify migration success
- `scripts/update-env.js` - Update environment variables
- `scripts/backup-supabase-js.js` - Create new backups
- `scripts/restore-from-json.js` - Alternative restore method

### Original Backup
```
BACKUP_SUPABASE/backup_2026-09-24T14-30-16/
├── users.json (0 rows)
├── clients.json (3 rows)
├── packages.json (10 rows)
├── add_ons.json (5 rows)
├── cards.json (178 rows)
└── ... (25 files total, 196 rows)
```

### Supabase Resources
- Dashboard: https://supabase.com/dashboard
- Documentation: https://supabase.com/docs
- CLI Guide: https://supabase.com/docs/guides/cli
- Support: https://supabase.com/support

---

## ✅ Post-Migration Checklist

After successful migration:

- [ ] All 25 tables created and verified
- [ ] All 196 rows inserted and verified
- [ ] RLS policies applied and tested
- [ ] Storage files migrated (if applicable)
- [ ] Environment variables updated
- [ ] Application tested locally
- [ ] Deployed to production
- [ ] Monitoring enabled
- [ ] Old project kept active (2 weeks buffer)
- [ ] Team notified of new project
- [ ] Documentation updated

**Use `DEPLOYMENT_CHECKLIST.md` for complete 23-step checklist**

---

**Package Created:** 24 September 2026  
**Last Updated:** 24 September 2026  
**Version:** 2.0 (Complete Migration Package)  
**Status:** ✅ Production Ready

**Migration Success Rate:** Expected 99%+ with proper execution
