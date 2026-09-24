# Storage Migration Guide

## Overview

Supabase Storage buckets dan files **tidak ter-backup** dalam database dump. Files seperti foto, dokumen, dan media lainnya perlu di-migrate secara terpisah dari database.

## Storage Buckets di Weddfin

Aplikasi Weddfin kemungkinan menggunakan storage buckets untuk:

1. **Gallery Photos** - Foto hasil pemotretan untuk client
2. **Profile Pictures** - Foto profil users/vendors
3. **Contract Documents** - File kontrak PDF
4. **Portfolio Images** - Portfolio vendor
5. **Card Assets** - Background/template kartu undangan
6. **Client Documents** - Dokumen lain dari client

## Pre-Migration Checklist

Sebelum mulai migration, identifikasi storage buckets yang ada:

```bash
# Login ke project lama
supabase login

# Link ke project lama
supabase link --project-ref qnepyfrogzzlnnmusyzs

# List semua buckets
supabase storage list
```

Atau cek di Supabase Dashboard:
- Buka project lama: https://supabase.com/dashboard/project/qnepyfrogzzlnnmusyzs
- Navigate ke **Storage** menu
- Catat semua bucket names dan policies

## Migration Methods

### Method 1: Manual Download & Upload (Recommended for Small Files)

#### Step 1: Download dari Project Lama

```bash
# Buat folder temporary untuk storage files
mkdir -p D:\apliaksi 2027\weddfinpoto\STORAGE_BACKUP

# Download semua files dari bucket tertentu
# Contoh untuk bucket "galleries"
supabase storage download galleries --project-ref qnepyfrogzzlnnmusyzs --output D:\apliaksi 2027\weddfinpoto\STORAGE_BACKUP\galleries

# Ulangi untuk setiap bucket
supabase storage download profiles --project-ref qnepyfrogzzlnnmusyzs --output D:\apliaksi 2027\weddfinpoto\STORAGE_BACKUP\profiles
supabase storage download contracts --project-ref qnepyfrogzzlnnmusyzs --output D:\apliaksi 2027\weddfinpoto\STORAGE_BACKUP\contracts
```

#### Step 2: Buat Buckets di Project Baru

Di project baru, buat buckets dengan nama yang sama:

```sql
-- Connect ke project baru via psql
-- Run di SQL Editor atau via psql

-- Create buckets (adjust names as needed)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('galleries', 'galleries', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('profiles', 'profiles', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('contracts', 'contracts', false, 10485760, ARRAY['application/pdf']),
  ('portfolios', 'portfolios', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('cards', 'cards', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);
```

#### Step 3: Setup Storage Policies

```sql
-- Policy untuk public read pada galleries
CREATE POLICY "Public can view galleries"
ON storage.objects FOR SELECT
USING (bucket_id = 'galleries');

CREATE POLICY "Authenticated users can upload galleries"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'galleries');

-- Policy untuk profiles
CREATE POLICY "Public can view profiles"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

CREATE POLICY "Users can upload own profile"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy untuk contracts (private)
CREATE POLICY "Authenticated can view contracts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'contracts');

CREATE POLICY "Authenticated can upload contracts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contracts');

-- Repeat for other buckets...
```

#### Step 4: Upload ke Project Baru

```bash
# Link ke project baru
supabase link --project-ref NEW_PROJECT_REF

# Upload files
supabase storage upload galleries D:\apliaksi 2027\weddfinpoto\STORAGE_BACKUP\galleries --project-ref NEW_PROJECT_REF
supabase storage upload profiles D:\apliaksi 2027\weddfinpoto\STORAGE_BACKUP\profiles --project-ref NEW_PROJECT_REF
supabase storage upload contracts D:\apliaksi 2027\weddfinpoto\STORAGE_BACKUP\contracts --project-ref NEW_PROJECT_REF
```

### Method 2: Using JavaScript/TypeScript Script (Recommended for Large Files)

Buat script untuk automated migration:

```javascript
// scripts/migrate-storage.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const OLD_PROJECT = {
  url: 'https://qnepyfrogzzlnnmusyzs.supabase.co',
  key: 'YOUR_OLD_SERVICE_KEY'
};

const NEW_PROJECT = {
  url: 'YOUR_NEW_PROJECT_URL',
  key: 'YOUR_NEW_SERVICE_KEY'
};

const oldSupabase = createClient(OLD_PROJECT.url, OLD_PROJECT.key);
const newSupabase = createClient(NEW_PROJECT.url, NEW_PROJECT.key);

async function migrateBucket(bucketName) {
  console.log(`Migrating bucket: ${bucketName}`);
  
  // List all files in old bucket
  const { data: files, error } = await oldSupabase
    .storage
    .from(bucketName)
    .list();
    
  if (error) {
    console.error(`Error listing files: ${error.message}`);
    return;
  }
  
  for (const file of files) {
    try {
      // Download from old bucket
      const { data: fileData, error: downloadError } = await oldSupabase
        .storage
        .from(bucketName)
        .download(file.name);
        
      if (downloadError) {
        console.error(`Error downloading ${file.name}: ${downloadError.message}`);
        continue;
      }
      
      // Upload to new bucket
      const { error: uploadError } = await newSupabase
        .storage
        .from(bucketName)
        .upload(file.name, fileData, {
          contentType: file.metadata?.mimetype,
          upsert: true
        });
        
      if (uploadError) {
        console.error(`Error uploading ${file.name}: ${uploadError.message}`);
      } else {
        console.log(`✅ Migrated: ${file.name}`);
      }
    } catch (err) {
      console.error(`Exception migrating ${file.name}:`, err);
    }
  }
  
  console.log(`Completed bucket: ${bucketName}\n`);
}

async function migrateAllBuckets() {
  const buckets = ['galleries', 'profiles', 'contracts', 'portfolios', 'cards'];
  
  for (const bucket of buckets) {
    await migrateBucket(bucket);
  }
  
  console.log('Storage migration completed!');
}

migrateAllBuckets();
```

### Method 3: Direct Database Copy (Advanced)

Jika ada akses ke underlying Postgres database:

```sql
-- Copy storage.objects table
-- WARNING: This requires direct database access and may not work across projects

-- Export from old project
COPY (SELECT * FROM storage.objects) TO '/tmp/storage_objects.csv' WITH CSV HEADER;
COPY (SELECT * FROM storage.buckets) TO '/tmp/storage_buckets.csv' WITH CSV HEADER;

-- Import to new project
COPY storage.buckets FROM '/tmp/storage_buckets.csv' WITH CSV HEADER;
COPY storage.objects FROM '/tmp/storage_objects.csv' WITH CSV HEADER;

-- Note: Files themselves still need to be copied separately
```

## Verification

After migration, verify files:

```javascript
// scripts/verify-storage.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(NEW_PROJECT_URL, NEW_PROJECT_KEY);

async function verifyBucket(bucketName, expectedCount) {
  const { data: files, error } = await supabase
    .storage
    .from(bucketName)
    .list();
    
  if (error) {
    console.log(`❌ ${bucketName}: Error - ${error.message}`);
    return;
  }
  
  const actualCount = files?.length || 0;
  const status = actualCount === expectedCount ? '✅' : '⚠️';
  
  console.log(`${status} ${bucketName}: ${actualCount} files (expected ${expectedCount})`);
}

async function verifyAllBuckets() {
  // Update expected counts based on your data
  await verifyBucket('galleries', 50);
  await verifyBucket('profiles', 10);
  await verifyBucket('contracts', 5);
  await verifyBucket('portfolios', 30);
  await verifyBucket('cards', 178);
}

verifyAllBuckets();
```

## Important Notes

### Storage URLs Will Change

URLs akan berubah dari:
```
https://qnepyfrogzzlnnmusyzs.supabase.co/storage/v1/object/public/galleries/photo.jpg
```

Ke:
```
https://NEW_PROJECT_REF.supabase.co/storage/v1/object/public/galleries/photo.jpg
```

**Action Required:**
- Update `SUPABASE_URL` di `.env`
- Jika ada hardcoded URLs di database (misal di table `galleries.image_url`), perlu update:

```sql
-- Update URLs in database after storage migration
UPDATE galleries 
SET image_url = REPLACE(
  image_url, 
  'qnepyfrogzzlnnmusyzs.supabase.co', 
  'NEW_PROJECT_REF.supabase.co'
);

UPDATE profiles
SET avatar_url = REPLACE(
  avatar_url,
  'qnepyfrogzzlnnmusyzs.supabase.co',
  'NEW_PROJECT_REF.supabase.co'
);

-- Repeat for other tables with file URLs
```

### Storage Policies

- Public buckets: Semua orang bisa read, hanya authenticated bisa write
- Private buckets: Hanya authenticated users bisa access
- RLS policies di storage berbeda dari table RLS
- Test policies setelah migration dengan non-authenticated request

### File Size Limits

Default Supabase limits:
- Free tier: 1GB total storage
- Pro tier: 100GB total storage
- Max file size: 50MB per file (configurable)

Jika mendekati limit, consider:
- Compress images before upload
- Use CDN untuk reduce bandwidth
- Upgrade plan jika perlu

## Troubleshooting

### Error: Bucket Already Exists

```sql
-- Check existing buckets
SELECT * FROM storage.buckets;

-- Drop and recreate if needed
DELETE FROM storage.buckets WHERE id = 'bucket_name';
```

### Error: File Already Exists

Use `upsert: true` option saat upload:

```javascript
await supabase.storage
  .from('bucket')
  .upload('file.jpg', fileData, { upsert: true });
```

### Permission Denied

Pastikan menggunakan **service_role key** (bukan anon key) untuk migration script.

### Missing Files After Migration

```javascript
// Compare file counts
const { data: oldFiles } = await oldSupabase.storage.from('bucket').list();
const { data: newFiles } = await newSupabase.storage.from('bucket').list();

console.log(`Old: ${oldFiles.length}, New: ${newFiles.length}`);

// List missing files
const newFileNames = new Set(newFiles.map(f => f.name));
const missing = oldFiles.filter(f => !newFileNames.has(f.name));
console.log('Missing files:', missing);
```

## Post-Migration Checklist

- [ ] All buckets created in new project
- [ ] All files uploaded and verified
- [ ] Storage policies applied and tested
- [ ] URLs updated in database tables
- [ ] `.env` updated with new `SUPABASE_URL`
- [ ] Application tested with new storage
- [ ] Old storage backup kept temporarily (1-2 weeks)
- [ ] Monitor storage usage in new project

## Cleanup

Setelah yakin migration berhasil (tunggu 1-2 minggu):

```bash
# Hapus local backup
rm -rf D:\apliaksi 2027\weddfinpoto\STORAGE_BACKUP

# Optional: Delete old project storage (PERMANENT!)
# Only do this after confirming everything works
```

## Need Help?

Jika ada masalah:
1. Check Supabase Storage logs di Dashboard
2. Verify bucket policies dengan test uploads
3. Check network/firewall issues
4. Contact Supabase support untuk project-level issues

---

**Created:** 2026-09-24  
**Last Updated:** 2026-09-24  
**Related:** 007_schema_from_backup.sql, 008_data_from_backup.sql, 009_rls_policies.sql
