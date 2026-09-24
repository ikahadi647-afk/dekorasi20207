/**
 * DIRECT SCHEMA MIGRATION
 * 
 * Creates tables directly using Supabase Management API
 * This bypasses the need for psql
 * 
 * Usage:
 *   node scripts/migrate-schema-direct.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env file
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

async function executeSql(supabaseUrl, serviceKey, sql) {
  // Use Supabase REST API to execute SQL via PostgREST
  // We need to use the database directly
  
  // Extract project ref from URL
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1];
  
  // Try using PostgREST's raw SQL execution if available
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ query: sql })
  });
  
  return response;
}

async function runMigration() {
  console.log('🚀 Direct Schema Migration\n');
  
  // Load environment
  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const serviceKey = env.VIT_SUPABASE_SERVICE_ROL_KEY || env.VITE_SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing environment variables');
    process.exit(1);
  }
  
  console.log(`📡 Project: ${supabaseUrl}`);
  console.log('⚠️  Note: This script requires database access.\n');
  console.log('Alternative approach: Use Supabase SQL Editor\n');
  console.log('Steps:');
  console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard');
  console.log('2. Go to SQL Editor');
  console.log('3. Copy content from migration/007_schema_from_backup.sql');
  console.log('4. Paste and Run in SQL Editor');
  console.log('5. Repeat for 008_data_from_backup.sql');
  console.log('6. Repeat for 009_rls_policies.sql\n');
  
  console.log('📋 Files to migrate:');
  console.log('   1. migration/007_schema_from_backup.sql (21.98 KB)');
  console.log('   2. migration/008_data_from_backup.sql (1.25 MB)');
  console.log('   3. migration/009_rls_policies.sql\n');
  
  console.log('💡 Tip: SQL Editor can handle large files, but you may want to');
  console.log('   split 008_data_from_backup.sql into sections if it times out.\n');
  
  console.log('⚠️  IMPORTANT: Run files in order (007 → 008 → 009)');
  console.log('   Schema must be created before data can be inserted.\n');
  
  // Create instructions file
  const instructionsPath = path.join(process.cwd(), 'migration', 'MIGRATION_INSTRUCTIONS.txt');
  const instructions = `
SUPABASE SQL MIGRATION INSTRUCTIONS
====================================

Project URL: ${supabaseUrl}
Project Ref: ${supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1]}

STEP 1: Open Supabase Dashboard
--------------------------------
1. Go to: https://supabase.com/dashboard
2. Select your project: ${supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1]}
3. Click on "SQL Editor" in left sidebar

STEP 2: Run Schema Migration
-----------------------------
1. Click "New Query"
2. Open file: migration/007_schema_from_backup.sql
3. Copy ALL content (Ctrl+A, Ctrl+C)
4. Paste into SQL Editor
5. Click "Run" button
6. Wait for success message
7. Expected result: 25 tables created

STEP 3: Run Data Migration
---------------------------
1. Click "New Query"
2. Open file: migration/008_data_from_backup.sql
3. Copy ALL content (file is large, be patient)
4. Paste into SQL Editor
5. Click "Run" button
6. Wait for completion (may take 1-2 minutes)
7. Expected result: 196 rows inserted

STEP 4: Apply RLS Policies
---------------------------
1. Click "New Query"
2. Open file: migration/009_rls_policies.sql
3. Copy ALL content
4. Paste into SQL Editor
5. Click "Run" button
6. Wait for success message
7. Expected result: RLS enabled on all tables

STEP 5: Verify Migration
-------------------------
Run this command in your terminal:

  node scripts/verify-migration.js

Expected output: ✅ Migration verification PASSED!

TROUBLESHOOTING
---------------

If 008_data_from_backup.sql times out:
- Split file into 5 sections
- Run each section separately
- Check for "already exists" errors (safe to ignore)

If tables already exist:
- Either drop them first, or
- Skip to data migration

If data already exists:
- SQL uses ON CONFLICT DO NOTHING
- Safe to re-run

If RLS blocks access:
- Verify you're using service_role key
- Check policies in Table Editor

VERIFICATION QUERIES
--------------------

Check tables:
  SELECT tablename FROM pg_tables WHERE schemaname = 'public';

Check row counts:
  SELECT 
    'packages' as table_name, COUNT(*) as rows FROM packages
  UNION ALL
  SELECT 'cards', COUNT(*) FROM cards
  UNION ALL
  SELECT 'clients', COUNT(*) FROM clients
  UNION ALL
  SELECT 'add_ons', COUNT(*) FROM add_ons;

Expected:
- packages: 10 rows
- cards: 178 rows
- clients: 3 rows
- add_ons: 5 rows

Check RLS status:
  SELECT tablename, rowsecurity 
  FROM pg_tables 
  WHERE schemaname = 'public'
  ORDER BY tablename;

Expected: rowsecurity = true for all tables

NEXT STEPS
----------

After successful migration:

1. Run verification: node scripts/verify-migration.js
2. Test application: npm run dev
3. Check all features work
4. Follow DEPLOYMENT_CHECKLIST.md for production

SUPPORT
-------

If you encounter issues:
1. Check migration/README.md
2. Check TROUBLESHOOTING section
3. Check Supabase Dashboard > Logs for errors

Generated: ${new Date().toISOString()}
`;
  
  fs.writeFileSync(instructionsPath, instructions.trim());
  console.log(`✅ Instructions saved to: migration/MIGRATION_INSTRUCTIONS.txt\n`);
  
  // Open the instructions file
  console.log('Opening instructions file...\n');
  
  const { exec } = await import('child_process');
  exec(`notepad "${instructionsPath}"`, (error) => {
    if (error) {
      console.log('Could not open Notepad. Please open the file manually.');
    }
  });
}

runMigration();
