// Script Backup Supabase Database via JavaScript Client
// Alternative untuk backup tanpa Docker

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
  gray: '\x1b[90m'
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

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  log('ERROR: Tidak dapat membaca Supabase credentials dari .env', colors.red);
  process.exit(1);
}

log('========================================', colors.cyan);
log('   SUPABASE BACKUP (JavaScript Method)', colors.cyan);
log('========================================', colors.cyan);
log('');

log(`URL: ${SUPABASE_URL}`, colors.gray);
log('');

// WARNING tentang Service Key
log('PERHATIAN:', colors.yellow);
log('Untuk backup lengkap (termasuk data yang dilindungi RLS),', colors.yellow);
log('gunakan SERVICE_ROLE_KEY instead of ANON_KEY.', colors.yellow);
log('', '');
log('Dapatkan Service Role Key dari:', colors.white);
log('Dashboard -> Settings -> API -> service_role key', colors.gray);
log('');

import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Gunakan Service Role Key? (y/n): ', async (answer) => {
  rl.close();
  
  let apiKey = SUPABASE_ANON_KEY;
  
  if (answer.toLowerCase() === 'y') {
    const rlKey = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rlKey.question('Paste Service Role Key: ', async (serviceKey) => {
      rlKey.close();
      apiKey = serviceKey.trim();
      await runBackup(SUPABASE_URL, apiKey);
    });
  } else {
    await runBackup(SUPABASE_URL, apiKey);
  }
});

async function runBackup(url, key) {
  const supabase = createClient(url, key);
  
  // Buat folder backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupFolder = path.join('BACKUP_SUPABASE', `backup_${timestamp}`);
  
  if (!fs.existsSync('BACKUP_SUPABASE')) {
    fs.mkdirSync('BACKUP_SUPABASE');
  }
  fs.mkdirSync(backupFolder);
  
  log('');
  log('========================================', colors.cyan);
  log('MEMULAI BACKUP PROCESS', colors.cyan);
  log('========================================', colors.cyan);
  log('');
  log(`Backup Location: ${backupFolder}`, colors.white);
  log('');
  
  // Daftar tabel yang akan di-backup (SEMUA 25 tabel di database)
  const tables = [
    // Core tables (sudah di-backup sebelumnya)
    'profiles',
    'clients',
    'projects',
    'team_members',
    'leads',
    'calendar_events',
    'packages',
    'promo_codes',
    'notifications',
    
    // Tabel yang belum di-backup (16 tabel)
    'add_ons',
    'bookings',
    'cards',
    'client_feedback',
    'contracts',
    'galleries',
    'pockets',
    'project_add_ons',
    'project_team_assignments',
    'team_payment_records',
    'team_project_payments',
    'transactions',
    'users',
    'vendor_portfolios',
    'vendor_profiles',
    'wedding_day_checklists'
  ];
  
  const summary = {
    timestamp: new Date().toISOString(),
    tables: {},
    total_rows: 0,
    errors: []
  };
  
  // Backup setiap tabel
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    log(`[${i + 1}/${tables.length}] Backing up table: ${table}...`, colors.cyan);
    
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*');
      
      if (error) {
        log(`      WARNING: ${error.message}`, colors.yellow);
        summary.errors.push({ table, error: error.message });
        continue;
      }
      
      const filename = path.join(backupFolder, `${table}.json`);
      fs.writeFileSync(filename, JSON.stringify(data, null, 2));
      
      const rowCount = data ? data.length : 0;
      summary.tables[table] = rowCount;
      summary.total_rows += rowCount;
      
      log(`      OK: ${rowCount} rows backed up`, colors.green);
      
      // Delay untuk menghindari rate limit
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (err) {
      log(`      ERROR: ${err.message}`, colors.red);
      summary.errors.push({ table, error: err.message });
    }
  }
  
  log('');
  
  // Simpan summary
  const summaryFile = path.join(backupFolder, '_summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  
  // Buat README
  const readmeContent = `# Supabase Database Backup (JavaScript Method)

Generated: ${new Date().toLocaleString('id-ID')}

## Backup Summary

- Total Tables: ${Object.keys(summary.tables).length}
- Total Rows: ${summary.total_rows}
- Errors: ${summary.errors.length}

## Tables Backed Up

${Object.entries(summary.tables).map(([table, count]) => `- **${table}**: ${count} rows`).join('\n')}

${summary.errors.length > 0 ? `\n## Errors\n\n${summary.errors.map(e => `- **${e.table}**: ${e.error}`).join('\n')}` : ''}

## How to Restore

Use the restore script or manually insert data via Supabase Dashboard.

\`\`\`javascript
// Example restore code
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(URL, SERVICE_KEY);

const data = JSON.parse(fs.readFileSync('profiles.json'));
await supabase.from('profiles').insert(data);
\`\`\`

## Important Notes

⚠️ **This backup method:**
- Only backs up table data (not schema/structure)
- Requires RLS to be bypassed (use Service Role Key)
- Does not include Storage files
- May miss data if RLS policies block access

For full backup including schema, use:
- Supabase CLI with Docker, OR
- pg_dump directly with database password

## Storage Files

Remember to backup Storage separately:
- Gallery photos
- Documents
- Invoices
- Other uploaded files

---
Project: weddfinpoto  
Method: JavaScript Client Backup  
Generated by: backup-supabase-js.js
`;
  
  fs.writeFileSync(path.join(backupFolder, 'README.md'), readmeContent);
  
  // Final summary
  log('========================================', colors.green);
  log('   BACKUP COMPLETED!', colors.green);
  log('========================================', colors.green);
  log('');
  log('Backup Location:', colors.white);
  log(`  ${backupFolder}`, colors.cyan);
  log('');
  log('Files Created:', colors.white);
  
  const files = fs.readdirSync(backupFolder);
  files.forEach(file => {
    const stats = fs.statSync(path.join(backupFolder, file));
    const size = stats.size > 1024 ? `${(stats.size / 1024).toFixed(2)} KB` : `${stats.size} B`;
    log(`  - ${file} - ${size}`, colors.gray);
  });
  
  log('');
  log('Summary:', colors.white);
  log(`  Tables backed up: ${Object.keys(summary.tables).length}`, colors.gray);
  log(`  Total rows: ${summary.total_rows}`, colors.gray);
  log(`  Errors: ${summary.errors.length}`, colors.gray);
  log('');
  
  if (summary.errors.length > 0) {
    log('WARNINGS:', colors.yellow);
    summary.errors.forEach(e => {
      log(`  - ${e.table}: ${e.error}`, colors.gray);
    });
    log('');
  }
  
  log('REMINDERS:', colors.yellow);
  log('  * This only backs up TABLE DATA', colors.white);
  log('  * Schema/structure NOT included', colors.white);
  log('  * Storage files NOT included', colors.white);
  log('  * For full backup, use Supabase CLI with Docker', colors.white);
  log('');
}
