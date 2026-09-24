// Script untuk generate INSERT SQL statements dari backup JSON

import fs from 'fs';
import path from 'path';

const BACKUP_DIR = 'BACKUP_SUPABASE/backup_2026-09-24T14-30-16';
const OUTPUT_FILE = 'migration/008_data_from_backup.sql';

// Escape string untuk SQL
function escapeSQLString(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  
  if (typeof value === 'string') {
    // Escape single quotes
    return `'${value.replace(/'/g, "''")}'`;
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  
  if (typeof value === 'object') {
    // JSON objects/arrays
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  }
  
  return 'NULL';
}

function generateInsertStatements(tableName, data) {
  if (!Array.isArray(data) || data.length === 0) {
    return `-- Table ${tableName}: No data to insert\n\n`;
  }
  
  let sql = `-- ============================================\n`;
  sql += `-- Insert data for table: ${tableName}\n`;
  sql += `-- Rows: ${data.length}\n`;
  sql += `-- ============================================\n\n`;
  
  // Get all unique columns
  const columns = new Set();
  data.forEach(row => {
    Object.keys(row).forEach(col => columns.add(col));
  });
  
  const columnList = Array.from(columns);
  
  // Generate INSERT statements in batches
  const BATCH_SIZE = 50;
  
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    
    sql += `INSERT INTO public.${tableName} (${columnList.join(', ')})\nVALUES\n`;
    
    const values = batch.map(row => {
      const rowValues = columnList.map(col => {
        const value = row[col];
        return escapeSQLString(value);
      });
      return `  (${rowValues.join(', ')})`;
    });
    
    sql += values.join(',\n');
    sql += '\nON CONFLICT (id) DO NOTHING;\n\n';
  }
  
  return sql;
}

function generateDataSQL() {
  console.log('🔍 Reading backup files...\n');
  
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.json') && f !== '_summary.json' && f !== 'README.md')
    .sort(); // Sort alphabetically
  
  let fullSQL = `-- ============================================
-- DATA SQL GENERATED FROM BACKUP
-- Generated: ${new Date().toISOString()}
-- Source: ${BACKUP_DIR}
-- ============================================
-- 
-- IMPORTANT NOTES:
-- 1. Run schema migration (007_schema_from_backup.sql) FIRST
-- 2. This file contains INSERT statements for all tables
-- 3. Foreign key constraints may cause errors if parent data missing
-- 4. ON CONFLICT (id) DO NOTHING prevents duplicate inserts
-- 
-- USAGE:
-- psql "CONNECTION_STRING" -f migration/008_data_from_backup.sql
-- 
-- Or via Supabase SQL Editor:
-- Copy-paste sections to SQL Editor and run
-- ============================================

-- Disable triggers temporarily (optional, for faster inserts)
SET session_replication_role = replica;

`;
  
  // Recommended order for inserts (parent tables first)
  const orderedTables = [
    'users',
    'profiles', 
    'packages',
    'add_ons',
    'promo_codes',
    'cards',
    'pockets',
    'team_members',
    'clients',
    'leads',
    'bookings',
    'contracts',
    'projects',
    'project_add_ons',
    'project_team_assignments',
    'team_project_payments',
    'team_payment_records',
    'transactions',
    'calendar_events',
    'notifications',
    'client_feedback',
    'galleries',
    'vendor_profiles',
    'vendor_portfolios',
    'wedding_day_checklists'
  ];
  
  const stats = {
    total_tables: 0,
    total_rows: 0,
    tables: []
  };
  
  // Process in order
  orderedTables.forEach(tableName => {
    const filename = `${tableName}.json`;
    const filepath = path.join(BACKUP_DIR, filename);
    
    if (!fs.existsSync(filepath)) {
      console.log(`  ⚠️  ${tableName} - FILE NOT FOUND (skipped)`);
      return;
    }
    
    console.log(`  📝 Processing ${tableName}...`);
    
    try {
      const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
      
      if (!Array.isArray(data) || data.length === 0) {
        console.log(`      ⚠️  Empty (0 rows)`);
        fullSQL += `-- Table ${tableName}: No data\n\n`;
        return;
      }
      
      fullSQL += generateInsertStatements(tableName, data);
      
      stats.total_tables++;
      stats.total_rows += data.length;
      stats.tables.push({
        name: tableName,
        rows: data.length
      });
      
      console.log(`      ✅ ${data.length} rows generated`);
      
    } catch (err) {
      console.log(`      ❌ ERROR: ${err.message}`);
      fullSQL += `-- ERROR processing ${tableName}: ${err.message}\n\n`;
    }
  });
  
  // Process any remaining files not in ordered list
  files.forEach(file => {
    const tableName = path.basename(file, '.json');
    if (!orderedTables.includes(tableName)) {
      console.log(`  📝 Processing ${tableName} (unordered)...`);
      
      const filepath = path.join(BACKUP_DIR, file);
      const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
      
      if (Array.isArray(data) && data.length > 0) {
        fullSQL += generateInsertStatements(tableName, data);
        stats.total_tables++;
        stats.total_rows += data.length;
        stats.tables.push({
          name: tableName,
          rows: data.length
        });
        console.log(`      ✅ ${data.length} rows generated`);
      }
    }
  });
  
  // Re-enable triggers
  fullSQL += `\n-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Refresh sequences (optional)
SELECT setval(pg_get_serial_sequence('public.users', 'id'), (SELECT MAX(id) FROM public.users));

-- Verify row counts
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        ORDER BY tablename
    LOOP
        EXECUTE format('SELECT COUNT(*) as count FROM %I.%I', r.schemaname, r.tablename);
        RAISE NOTICE '% rows in %.%', count, r.schemaname, r.tablename;
    END LOOP;
END $$;

-- End of data migration
`;
  
  // Write to file
  fs.writeFileSync(OUTPUT_FILE, fullSQL);
  
  console.log(`\n✅ Data SQL generated successfully!\n`);
  console.log(`📁 Output: ${OUTPUT_FILE}`);
  console.log(`📊 Total tables: ${stats.total_tables}`);
  console.log(`📊 Total rows: ${stats.total_rows}`);
  console.log(`📝 Total lines: ${fullSQL.split('\n').length}`);
  console.log(`💾 File size: ${(fullSQL.length / 1024).toFixed(2)} KB\n`);
  
  // Save stats
  const statsFile = 'migration/008_data_summary.json';
  fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
  console.log(`📋 Summary saved to: ${statsFile}\n`);
  
  // Show breakdown
  console.log('Breakdown by table:');
  stats.tables.forEach(t => {
    console.log(`  ${t.name.padEnd(30)} ${t.rows.toString().padStart(4)} rows`);
  });
  console.log('');
}

// Run
try {
  generateDataSQL();
} catch (err) {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  process.exit(1);
}
