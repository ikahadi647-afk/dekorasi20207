// Script untuk restore data dari backup JSON ke database baru

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

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

log('========================================', colors.cyan);
log('   RESTORE DATABASE DARI BACKUP JSON', colors.cyan);
log('========================================', colors.cyan);
log('');

// Cari folder backup
const backupDir = 'BACKUP_SUPABASE';
const backups = fs.readdirSync(backupDir)
  .filter(f => f.startsWith('backup_'))
  .sort()
  .reverse();

if (backups.length === 0) {
  log('ERROR: Tidak ada backup ditemukan!', colors.red);
  process.exit(1);
}

log('Available Backups:', colors.yellow);
backups.forEach((backup, i) => {
  log(`  [${i + 1}] ${backup}`, colors.white);
});
log('');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Pilih nomor backup (atau Enter untuk terbaru): ', (answer) => {
  const selection = answer.trim() || '1';
  const index = parseInt(selection) - 1;
  
  if (index < 0 || index >= backups.length) {
    log('ERROR: Pilihan tidak valid!', colors.red);
    process.exit(1);
  }
  
  const selectedBackup = backups[index];
  const backupPath = path.join(backupDir, selectedBackup);
  
  log('');
  log(`Selected: ${selectedBackup}`, colors.green);
  log('');
  
  // Input credentials database baru
  rl.question('Supabase URL baru: ', (url) => {
    rl.question('Service Role Key baru: ', async (key) => {
      rl.close();
      
      log('');
      log('========================================', colors.cyan);
      log('MEMULAI RESTORE PROCESS', colors.cyan);
      log('========================================', colors.cyan);
      log('');
      
      await restoreFromBackup(url, key, backupPath);
    });
  });
});

async function restoreFromBackup(url, key, backupPath) {
  const supabase = createClient(url, key);
  
  // Baca summary untuk list tabel
  const summaryPath = path.join(backupPath, '_summary.json');
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
  
  const tables = Object.keys(summary.tables);
  
  log(`Total tables to restore: ${tables.length}`, colors.white);
  log('');
  
  const results = {
    success: [],
    failed: [],
    skipped: []
  };
  
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    const jsonFile = path.join(backupPath, `${table}.json`);
    
    if (!fs.existsSync(jsonFile)) {
      log(`[${i + 1}/${tables.length}] ⚠️  ${table} - FILE NOT FOUND`, colors.yellow);
      results.skipped.push(table);
      continue;
    }
    
    log(`[${i + 1}/${tables.length}] Restoring ${table}...`, colors.cyan);
    
    try {
      const data = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
      
      if (!data || data.length === 0) {
        log(`      ⚠️  ${table} - EMPTY (0 rows)`, colors.yellow);
        results.skipped.push(table);
        continue;
      }
      
      // Insert data
      const { error } = await supabase
        .from(table)
        .insert(data);
      
      if (error) {
        log(`      ❌ ${table} - ERROR: ${error.message}`, colors.red);
        results.failed.push({ table, error: error.message });
      } else {
        log(`      ✅ ${table} - ${data.length} rows restored`, colors.green);
        results.success.push(table);
      }
      
      // Delay to avoid rate limit
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (err) {
      log(`      ❌ ${table} - ERROR: ${err.message}`, colors.red);
      results.failed.push({ table, error: err.message });
    }
  }
  
  // Summary
  log('');
  log('========================================', colors.green);
  log('   RESTORE COMPLETED!', colors.green);
  log('========================================', colors.green);
  log('');
  
  log('Summary:', colors.white);
  log(`  ✅ Success: ${results.success.length}`, colors.green);
  log(`  ❌ Failed: ${results.failed.length}`, results.failed.length > 0 ? colors.red : colors.green);
  log(`  ⚠️  Skipped: ${results.skipped.length}`, results.skipped.length > 0 ? colors.yellow : colors.green);
  log('');
  
  if (results.failed.length > 0) {
    log('Failed Tables:', colors.red);
    results.failed.forEach(({ table, error }) => {
      log(`  - ${table}: ${error}`, colors.gray);
    });
    log('');
    log('NOTE:', colors.yellow);
    log('  Errors biasanya karena:', colors.white);
    log('  1. Tabel belum dibuat (run migration schema dulu)', colors.gray);
    log('  2. Constraint violation (foreign key issue)', colors.gray);
    log('  3. Duplicate data (data sudah ada)', colors.gray);
    log('');
  }
  
  if (results.success.length === tables.length) {
    log('🎉 ALL DATA RESTORED SUCCESSFULLY!', colors.green);
  }
  
  log('');
  log('Next Steps:', colors.yellow);
  log('  1. ✅ Verify data di Supabase Dashboard', colors.white);
  log('  2. ✅ Update .env dengan credentials baru', colors.white);
  log('  3. ✅ Test aplikasi dengan database baru', colors.white);
  log('  4. ✅ Restore Storage files jika ada', colors.white);
  log('');
}
