/**
 * MIGRATE VIA SUPABASE CLI
 * 
 * Uses Supabase CLI db execute command to run migrations
 * 
 * Usage:
 *   node scripts/migrate-via-cli.js
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

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

async function runMigration() {
  console.log('🚀 Supabase CLI Migration\n');
  
  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1];
  
  console.log(`📡 Project: ${projectRef}`);
  console.log(`🔗 URL: ${supabaseUrl}\n`);
  
  const migrations = [
    { file: 'migration/007_schema_from_backup.sql', name: 'Schema (25 tables)' },
    { file: 'migration/008_data_from_backup.sql', name: 'Data (196 rows)' },
    { file: 'migration/009_rls_policies.sql', name: 'RLS Policies' }
  ];
  
  for (const migration of migrations) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 Running: ${migration.name}`);
    console.log(`📁 File: ${migration.file}`);
    console.log('='.repeat(60) + '\n');
    
    const sqlPath = path.join(process.cwd(), migration.file);
    
    if (!fs.existsSync(sqlPath)) {
      console.error(`❌ File not found: ${sqlPath}`);
      continue;
    }
    
    try {
      // Use supabase db execute command
      console.log('⏳ Executing SQL...\n');
      
      const command = `supabase db execute --project-ref ${projectRef} --file "${sqlPath}"`;
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: process.cwd(),
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large files
      });
      
      if (stdout) {
        console.log(stdout);
      }
      
      if (stderr && !stderr.includes('NOTICE')) {
        console.error('⚠️  Stderr:', stderr);
      }
      
      console.log(`✅ ${migration.name} completed!\n`);
      
    } catch (error) {
      console.error(`❌ Error running ${migration.name}:`);
      console.error(error.message);
      
      if (error.stdout) {
        console.log('\nStdout:', error.stdout);
      }
      if (error.stderr) {
        console.error('\nStderr:', error.stderr);
      }
      
      console.log('\n⚠️  Continuing to next migration...\n');
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION COMPLETE');
  console.log('='.repeat(60) + '\n');
  
  console.log('Next steps:');
  console.log('1. Verify migration: node scripts/verify-migration.js');
  console.log('2. Test application: npm run dev\n');
}

runMigration().catch(err => {
  console.error('💥 Migration failed:', err);
  process.exit(1);
});
