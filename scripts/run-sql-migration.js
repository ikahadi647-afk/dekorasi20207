/**
 * RUN SQL MIGRATION SCRIPT
 * 
 * Executes SQL migration files against Supabase database
 * Uses service role key to bypass RLS during migration
 * 
 * Usage:
 *   node scripts/run-sql-migration.js <sql-file-path>
 * 
 * Example:
 *   node scripts/run-sql-migration.js migration/007_schema_from_backup.sql
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

async function runSqlFile(filePath) {
  console.log('🚀 SQL Migration Runner\n');
  
  // Load environment variables
  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const serviceKey = env.VIT_SUPABASE_SERVICE_ROL_KEY || env.VITE_SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing VITE_SUPABASE_URL or service key in .env');
    process.exit(1);
  }
  
  console.log(`📡 Connecting to: ${supabaseUrl}`);
  console.log(`📄 SQL File: ${filePath}\n`);
  
  // Read SQL file
  const sqlPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(sqlPath)) {
    console.error(`❌ File not found: ${sqlPath}`);
    process.exit(1);
  }
  
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
  console.log(`📊 File size: ${(sqlContent.length / 1024).toFixed(2)} KB`);
  console.log(`📊 Total lines: ${sqlContent.split('\n').length}\n`);
  
  // Split SQL into individual statements
  // Remove comments and split by semicolon
  const statements = sqlContent
    .split('\n')
    .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
    .join('\n')
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);
  
  console.log(`📊 Total statements: ${statements.length}\n`);
  console.log('⏳ Executing SQL statements...\n');
  
  // Initialize Supabase client with service role key
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Skip empty statements and comments
    if (!statement || statement.startsWith('--')) continue;
    
    // Show progress
    if (i % 10 === 0) {
      console.log(`Progress: ${i}/${statements.length} statements...`);
    }
    
    try {
      // Use rpc to execute raw SQL
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        // If exec_sql doesn't exist, try direct execution
        // This will work for some statements but not all
        const { error: directError } = await supabase
          .from('_migration_temp')
          .select('*')
          .limit(0);
        
        if (directError && directError.message.includes('does not exist')) {
          // Table doesn't exist yet, this is expected for schema creation
          // We'll use postgres REST API directly
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': serviceKey,
              'Authorization': `Bearer ${serviceKey}`
            },
            body: JSON.stringify({ sql: statement })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
          }
        } else {
          throw error;
        }
      }
      
      successCount++;
    } catch (err) {
      errorCount++;
      errors.push({
        statement: i + 1,
        preview: statement.substring(0, 100) + '...',
        error: err.message
      });
      
      // Log error but continue
      console.error(`❌ Error in statement ${i + 1}: ${err.message}`);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${successCount}/${statements.length}`);
  console.log(`❌ Errors: ${errorCount}/${statements.length}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  ERRORS ENCOUNTERED:');
    errors.slice(0, 5).forEach((err, idx) => {
      console.log(`\n${idx + 1}. Statement #${err.statement}`);
      console.log(`   Preview: ${err.preview}`);
      console.log(`   Error: ${err.error}`);
    });
    
    if (errors.length > 5) {
      console.log(`\n... and ${errors.length - 5} more errors`);
    }
  }
  
  if (errorCount > 0) {
    console.log('\n⚠️  Migration completed with errors');
    console.log('Note: Some errors may be expected (e.g., IF NOT EXISTS checks)');
    console.log('Please verify the results manually.');
  } else {
    console.log('\n✅ Migration completed successfully!');
  }
  
  process.exit(errorCount > statements.length / 2 ? 1 : 0);
}

// Get file path from command line argument
const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node scripts/run-sql-migration.js <sql-file-path>');
  console.error('Example: node scripts/run-sql-migration.js migration/007_schema_from_backup.sql');
  process.exit(1);
}

// Run migration
runSqlFile(filePath).catch(err => {
  console.error('💥 Migration failed:', err);
  process.exit(1);
});
