// Script untuk cek semua tabel yang ada di database Supabase

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Warna console
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  white: '\x1b[37m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Baca .env
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');

let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';

envLines.forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) {
    SUPABASE_URL = line.split('=')[1].trim();
  }
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
    SUPABASE_ANON_KEY = line.split('=')[1].trim();
  }
});

log('========================================', colors.cyan);
log('   CEK TABEL DI DATABASE SUPABASE', colors.cyan);
log('========================================', colors.cyan);
log('');
log(`URL: ${SUPABASE_URL}`, colors.gray);
log('');

// Daftar tabel yang SEHARUSNYA ada berdasarkan migration files
const expectedTables = [
  // Core tables (001_schema.sql)
  'users',
  'profiles',
  'clients',
  'leads',
  'packages',
  'add_ons',
  'promo_codes',
  'team_members',
  'projects',
  'cards',
  'financial_pockets',
  'transactions',
  'calendar_events',
  'expenses',
  'notifications',
  'assets',
  'sop_items',
  'heartbeat',
  
  // Missing tables (006_missing_tables.sql)
  'invoices',
  'payments',
  'tasks',
  'client_documents'
];

async function checkTables() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  log('Checking tables...', colors.yellow);
  log('');
  
  const results = {
    existing: [],
    missing: [],
    errors: []
  };
  
  // Cek setiap tabel
  for (const table of expectedTables) {
    try {
      // Try to query the table (just count)
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.message.includes('does not exist') || error.message.includes('Could not find')) {
          results.missing.push(table);
          log(`  ❌ ${table.padEnd(25)} - NOT FOUND`, colors.red);
        } else {
          results.errors.push({ table, error: error.message });
          log(`  ⚠️  ${table.padEnd(25)} - ERROR: ${error.message}`, colors.yellow);
        }
      } else {
        results.existing.push(table);
        log(`  ✅ ${table.padEnd(25)} - EXISTS`, colors.green);
      }
      
      // Delay untuk avoid rate limit
      await new Promise(resolve => setTimeout(resolve, 50));
      
    } catch (err) {
      results.errors.push({ table, error: err.message });
      log(`  ⚠️  ${table.padEnd(25)} - ERROR: ${err.message}`, colors.yellow);
    }
  }
  
  // Summary
  log('');
  log('========================================', colors.cyan);
  log('   SUMMARY', colors.cyan);
  log('========================================', colors.cyan);
  log('');
  
  log(`Total Expected Tables: ${expectedTables.length}`, colors.white);
  log(`✅ Existing: ${results.existing.length}`, colors.green);
  log(`❌ Missing: ${results.missing.length}`, results.missing.length > 0 ? colors.red : colors.green);
  log(`⚠️  Errors: ${results.errors.length}`, results.errors.length > 0 ? colors.yellow : colors.green);
  log('');
  
  if (results.missing.length > 0) {
    log('Missing Tables:', colors.red);
    results.missing.forEach(table => {
      log(`  - ${table}`, colors.gray);
    });
    log('');
    log('Action Required:', colors.yellow);
    log('  1. Check if migration 006_missing_tables.sql has been run', colors.white);
    log('  2. Run the migration via SQL Editor:', colors.white);
    log('     https://supabase.com/dashboard/project/qnepyfrogzzlnnmusyzs/sql/new', colors.gray);
    log('');
  }
  
  if (results.errors.length > 0) {
    log('Errors:', colors.yellow);
    results.errors.forEach(({ table, error }) => {
      log(`  - ${table}: ${error}`, colors.gray);
    });
    log('');
  }
  
  if (results.missing.length === 0 && results.errors.length === 0) {
    log('🎉 ALL TABLES EXIST!', colors.green);
    log('');
    log('Your database schema is complete.', colors.white);
    log('');
  }
  
  // Save to file
  const report = {
    timestamp: new Date().toISOString(),
    total: expectedTables.length,
    existing: results.existing.length,
    missing: results.missing.length,
    errors: results.errors.length,
    existing_tables: results.existing,
    missing_tables: results.missing,
    error_details: results.errors
  };
  
  const reportFile = 'BACKUP_SUPABASE/table-check-report.json';
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  log(`Report saved to: ${reportFile}`, colors.gray);
  log('');
}

checkTables().catch(err => {
  log('');
  log('FATAL ERROR:', colors.red);
  log(err.message, colors.red);
  log('');
  process.exit(1);
});
