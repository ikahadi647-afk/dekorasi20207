# Deployment Checklist - Migration ke Project Baru

## Pre-Deployment

### 1. Backup Project Lama
- [x] Database backup completed (196 rows, 25 tables)
- [ ] Storage files downloaded (foto, dokumen, dll)
- [ ] Environment variables documented
- [ ] API keys dan secrets tersimpan aman
- [ ] Screenshot konfigurasi Supabase Dashboard

### 2. Create New Supabase Project
- [ ] Login ke Supabase Dashboard: https://supabase.com/dashboard
- [ ] Create new project
  - [ ] Organization: _______________
  - [ ] Project name: _______________
  - [ ] Database password: _______________ (simpan aman!)
  - [ ] Region: _______________ (pilih closest to users)
- [ ] Tunggu project selesai provisioning (~2 menit)
- [ ] Catat Project Reference ID: _______________

### 3. Get New Project Credentials
- [ ] Buka Settings > API di project baru
- [ ] Copy credentials:
  ```
  Project URL: https://_____________.supabase.co
  anon/public key: _______________________________________________
  service_role key: _______________________________________________ (RAHASIA!)
  ```
- [ ] Copy Database Connection String:
  ```
  postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
  ```

---

## Database Migration

### 4. Run Schema Migration
```bash
# Navigate to project folder
cd D:\apliaksi 2027\weddfinpoto

# Run schema creation
psql "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres" -f migration/007_schema_from_backup.sql
```

**Checklist:**
- [ ] Command executed without errors
- [ ] Check Supabase Dashboard > Table Editor
- [ ] Verify 25 tables created
- [ ] Screenshot atau log success message

### 5. Run Data Migration
```bash
# Import data
psql "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres" -f migration/008_data_from_backup.sql
```

**Checklist:**
- [ ] Command executed without errors
- [ ] Check row counts in Table Editor
- [ ] Verify 196 total rows inserted
- [ ] Spot-check: packages table has 10 rows
- [ ] Spot-check: cards table has 178 rows
- [ ] Spot-check: clients table has 3 rows

### 6. Apply RLS Policies
```bash
# Apply security policies
psql "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres" -f migration/009_rls_policies.sql
```

**Checklist:**
- [ ] Command executed without errors
- [ ] Verify RLS enabled di Table Editor (cek icon lock)
- [ ] Test: Try accessing table sebagai anonymous user (should be restricted)

### 7. Verify Migration
```bash
# Update .env temporarily untuk verification
# Copy .env to .env.backup
cp .env .env.backup

# Edit .env dengan credentials project BARU (temporary)
# SUPABASE_URL=https://NEW_PROJECT.supabase.co
# SUPABASE_ANON_KEY=new_anon_key
# SUPABASE_SERVICE_KEY=new_service_key

# Run verification script
node scripts/verify-migration.js
```

**Checklist:**
- [ ] Script shows "Migration verification PASSED! ✅"
- [ ] All 25 tables found
- [ ] 196 rows total verified
- [ ] No data integrity issues
- [ ] verification-report.json generated

### 8. Rollback Plan (If Needed)
Jika ada masalah kritis:
```bash
# Rollback: Drop all tables and start over
psql "CONNECTION_STRING" -f migration/rollback_migration.sql

# Then re-run steps 4-6
```

---

## Storage Migration

### 9. Identify Storage Buckets
```bash
# Login and check old project storage
supabase login
supabase link --project-ref qnepyfrogzzlnnmusyzs
supabase storage list
```

**Checklist:**
- [ ] List all bucket names: _______________
- [ ] Document bucket policies (public/private)
- [ ] Estimate total storage size: _______________
- [ ] Identify critical buckets (must migrate first)

### 10. Download Storage Files
```bash
# Create backup folder
mkdir STORAGE_BACKUP

# Download each bucket
supabase storage download BUCKET_NAME --output STORAGE_BACKUP/BUCKET_NAME
```

**Checklist:**
- [ ] Bucket 1: _______________ downloaded (_____ files)
- [ ] Bucket 2: _______________ downloaded (_____ files)
- [ ] Bucket 3: _______________ downloaded (_____ files)
- [ ] Total files downloaded: _____
- [ ] Total size: _____ MB

### 11. Create Buckets in New Project
Via Supabase Dashboard atau SQL:
```sql
-- Create buckets (customize as needed)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('bucket_name', 'bucket_name', true, 10485760, ARRAY['image/jpeg', 'image/png']);
```

**Checklist:**
- [ ] All buckets created in new project
- [ ] Public/private settings match old project
- [ ] File size limits configured
- [ ] Allowed MIME types configured

### 12. Apply Storage Policies
```sql
-- Example for public read bucket
CREATE POLICY "Public read" ON storage.objects 
FOR SELECT USING (bucket_id = 'bucket_name');

CREATE POLICY "Authenticated write" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'bucket_name');
```

**Checklist:**
- [ ] Read policies applied
- [ ] Write policies applied
- [ ] Delete policies applied (if needed)
- [ ] Test: Access file sebagai anonymous (should work for public)
- [ ] Test: Upload sebagai authenticated (should work)

### 13. Upload Files to New Project
```bash
# Link to new project
supabase link --project-ref NEW_PROJECT_REF

# Upload files
supabase storage upload BUCKET_NAME STORAGE_BACKUP/BUCKET_NAME/
```

**Checklist:**
- [ ] Bucket 1: _______________ uploaded (_____ files)
- [ ] Bucket 2: _______________ uploaded (_____ files)
- [ ] Bucket 3: _______________ uploaded (_____ files)
- [ ] Verify file counts match downloads
- [ ] Spot-check: View sample images via URL

### 14. Update Database URLs
Jika ada hardcoded storage URLs di database:
```sql
UPDATE galleries 
SET image_url = REPLACE(image_url, 'qnepyfrogzzlnnmusyzs', 'NEW_PROJECT_REF');

UPDATE profiles
SET avatar_url = REPLACE(avatar_url, 'qnepyfrogzzlnnmusyzs', 'NEW_PROJECT_REF');
```

**Checklist:**
- [ ] Identified tables with storage URLs
- [ ] URLs updated to new project
- [ ] Verify URLs accessible via browser

---

## Application Configuration

### 15. Update Environment Variables

**File: `.env`**

```bash
# OLD VALUES (backup ke .env.backup)
# SUPABASE_URL=https://qnepyfrogzzlnnmusyzs.supabase.co
# SUPABASE_ANON_KEY=old_key
# SUPABASE_SERVICE_KEY=old_service_key

# NEW VALUES
SUPABASE_URL=https://NEW_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=new_anon_key_here
SUPABASE_SERVICE_KEY=new_service_key_here
```

**Checklist:**
- [ ] `.env` file backed up to `.env.backup`
- [ ] `SUPABASE_URL` updated
- [ ] `SUPABASE_ANON_KEY` updated
- [ ] `SUPABASE_SERVICE_KEY` updated
- [ ] Other environment variables unchanged
- [ ] `.env` NOT committed to git (check .gitignore)

### 16. Update Capacitor Config (if Mobile App)

**File: `capacitor.config.ts`**

Jika ada hardcoded Supabase URL:
```typescript
const config: CapacitorConfig = {
  // ...
  plugins: {
    // Update if Supabase URL is here
  }
};
```

**Checklist:**
- [ ] Checked `capacitor.config.ts` for hardcoded URLs
- [ ] Updated if necessary
- [ ] Mobile app config verified

### 17. Update Build/Deploy Scripts

Check files yang mungkin punya hardcoded URLs:
- `bitrise.yml`
- `codemagic.yaml`
- `package.json` scripts
- CI/CD workflows

**Checklist:**
- [ ] `bitrise.yml` checked
- [ ] `codemagic.yaml` checked
- [ ] No hardcoded old URLs found
- [ ] CI/CD secrets updated (if applicable)

---

## Testing

### 18. Local Development Testing
```bash
# Install dependencies (jika belum)
npm install

# Run development server
npm run dev
```

**Test Cases:**
- [ ] Application starts without errors
- [ ] Login/Authentication works
- [ ] Can view packages (read dari database)
- [ ] Can view cards (178 cards visible)
- [ ] Can view clients (3 clients visible)
- [ ] Can create new record (write ke database)
- [ ] Images load correctly (storage)
- [ ] No console errors related to Supabase
- [ ] RLS working (can't access unauthorized data)

### 19. Mobile Testing (if applicable)
```bash
# Sync Capacitor
npx cap sync android
npx cap sync ios

# Build and run
npm run build
npx cap open android
```

**Test Cases:**
- [ ] Android build successful
- [ ] iOS build successful
- [ ] App connects to new Supabase project
- [ ] All features work same as web
- [ ] Storage images load on mobile
- [ ] Authentication works on mobile

### 20. Production Deployment
```bash
# Build for production
npm run build

# Deploy to hosting (Netlify, Vercel, dll)
# Or deploy APK/IPA for mobile
```

**Checklist:**
- [ ] Production build successful
- [ ] No build warnings/errors
- [ ] Deployed to production hosting
- [ ] Production URL accessible: _______________
- [ ] Production environment variables set correctly
- [ ] SSL/HTTPS working
- [ ] Test production deployment thoroughly

---

## Post-Deployment

### 21. Monitoring & Validation
**First 24 Hours:**
- [ ] Monitor Supabase Dashboard > Logs for errors
- [ ] Check Database > Activity for unusual queries
- [ ] Monitor Storage usage
- [ ] Check Authentication logs
- [ ] Verify no 5xx errors

**First Week:**
- [ ] Daily check Supabase logs
- [ ] Monitor performance metrics
- [ ] User feedback collected
- [ ] Bug reports tracked
- [ ] Database size monitored

### 22. Cleanup Old Project (AFTER 2+ WEEKS)
**⚠️ ONLY do this after confirming new project is stable!**

- [ ] 2 weeks passed since migration
- [ ] No critical issues reported
- [ ] Users confirmed everything works
- [ ] All data verified in new project
- [ ] Backup files stored safely offsite

Then:
- [ ] Pause old Supabase project (stops billing)
- [ ] Delete old project (PERMANENT - wait 1 more week)
- [ ] Delete local backup files (STORAGE_BACKUP folder)
- [ ] Update documentation with new project info

### 23. Update Documentation
- [ ] Update README.md with new setup instructions
- [ ] Update API documentation (if any)
- [ ] Update team wiki/knowledge base
- [ ] Document lessons learned
- [ ] Update runbooks/playbooks

---

## Emergency Rollback Procedure

If critical issues arise within first 48 hours:

### Option A: Keep Old Project Active
1. [ ] Revert `.env` to `.env.backup`
2. [ ] Redeploy application with old credentials
3. [ ] Investigate issues with new project
4. [ ] Fix and retry migration

### Option B: Quick Fix Forward
1. [ ] Identify specific issue (data, config, permissions)
2. [ ] Apply hotfix to new project
3. [ ] Re-test affected features
4. [ ] Continue monitoring

---

## Notes & Issues Log

**Issues Encountered:**
```
Date: _______
Issue: _______
Resolution: _______
Time to resolve: _______
```

**Migration Metrics:**
```
Total migration time: _______
Downtime (if any): _______
Data verification time: _______
Testing time: _______
Issues encountered: _______
Total cost: _______
```

---

## Sign-Off

**Migration Completed By:** _______________  
**Date:** _______________  
**Verified By:** _______________  
**Production Ready:** [ ] Yes [ ] No

**Notes:**
```
Any additional notes, concerns, or follow-up items...
```

---

**Created:** 2026-09-24  
**Version:** 1.0  
**Related Files:** 
- `migration/007_schema_from_backup.sql`
- `migration/008_data_from_backup.sql`
- `migration/009_rls_policies.sql`
- `migration/STORAGE_MIGRATION.md`
- `scripts/verify-migration.js`
