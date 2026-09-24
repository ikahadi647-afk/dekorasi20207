/**
 * UPDATE ENVIRONMENT VARIABLES HELPER
 * 
 * Interactive script to help update .env file with new Supabase credentials
 * after migration to new project.
 * 
 * Usage:
 *   node scripts/update-env.js
 * 
 * This script will:
 * 1. Backup current .env to .env.backup
 * 2. Prompt for new Supabase credentials
 * 3. Update .env with new values
 * 4. Validate new credentials by testing connection
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function readEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env file not found. Will create new one.');
    return {};
  }
  
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  content.split('\n').forEach(line => {
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

function writeEnvFile(env) {
  const envPath = path.join(process.cwd(), '.env');
  const lines = [];
  
  lines.push('# Weddfin Dashboard Environment Variables');
  lines.push('# Updated: ' + new Date().toISOString());
  lines.push('');
  
  // Supabase section
  lines.push('# Supabase Configuration');
  lines.push(`SUPABASE_URL=${env.SUPABASE_URL || ''}`);
  lines.push(`SUPABASE_ANON_KEY=${env.SUPABASE_ANON_KEY || ''}`);
  lines.push(`SUPABASE_SERVICE_KEY=${env.SUPABASE_SERVICE_KEY || ''}`);
  lines.push('');
  
  // Other variables
  const supabaseKeys = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_KEY'];
  const otherKeys = Object.keys(env).filter(k => !supabaseKeys.includes(k));
  
  if (otherKeys.length > 0) {
    lines.push('# Other Configuration');
    otherKeys.forEach(key => {
      lines.push(`${key}=${env[key]}`);
    });
  }
  
  fs.writeFileSync(envPath, lines.join('\n'));
}

function backupEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const backupPath = path.join(process.cwd(), '.env.backup');
  
  if (fs.existsSync(envPath)) {
    // Add timestamp to backup
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const timestampedBackup = path.join(process.cwd(), `.env.backup.${timestamp}`);
    
    fs.copyFileSync(envPath, backupPath);
    fs.copyFileSync(envPath, timestampedBackup);
    
    console.log(`✅ Backup created: .env.backup`);
    console.log(`✅ Timestamped backup: .env.backup.${timestamp}\n`);
    return true;
  }
  
  return false;
}

async function testConnection(url, key) {
  try {
    console.log('\n🔍 Testing connection to new project...');
    
    const supabase = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Test by querying packages table
    const { data, error } = await supabase
      .from('packages')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ Connection test failed: ${error.message}`);
      return false;
    }
    
    console.log(`✅ Connection successful!`);
    console.log(`   Packages table accessible\n`);
    return true;
  } catch (err) {
    console.log(`❌ Connection test error: ${err.message}`);
    return false;
  }
}

function extractProjectRef(url) {
  // Extract project ref from URL like: https://abcdefgh.supabase.co
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : null;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   Supabase Environment Variables Update Helper    ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log();
  
  // Read current .env
  const currentEnv = readEnvFile();
  
  if (currentEnv.SUPABASE_URL) {
    console.log('📄 Current Configuration:');
    console.log(`   URL: ${currentEnv.SUPABASE_URL}`);
    console.log(`   Project: ${extractProjectRef(currentEnv.SUPABASE_URL) || 'Unknown'}`);
    console.log();
  }
  
  // Confirm backup
  const confirmBackup = await question('Create backup of current .env? (Y/n): ');
  if (!confirmBackup || confirmBackup.toLowerCase() !== 'n') {
    backupEnvFile();
  }
  
  console.log('Please enter new Supabase project credentials:');
  console.log('(You can find these in: Supabase Dashboard > Settings > API)\n');
  
  // Get new credentials
  const newUrl = await question('New Project URL (https://xxxxx.supabase.co): ');
  const projectRef = extractProjectRef(newUrl);
  
  if (!projectRef) {
    console.log('❌ Invalid URL format. Expected: https://PROJECT_REF.supabase.co');
    rl.close();
    process.exit(1);
  }
  
  console.log(`✅ Project Reference: ${projectRef}\n`);
  
  const newAnonKey = await question('New Anon/Public Key: ');
  const newServiceKey = await question('New Service Role Key (for admin tasks): ');
  
  // Validate inputs
  if (!newUrl || !newAnonKey || !newServiceKey) {
    console.log('\n❌ All fields are required!');
    rl.close();
    process.exit(1);
  }
  
  // Update env object
  const updatedEnv = {
    ...currentEnv,
    SUPABASE_URL: newUrl,
    SUPABASE_ANON_KEY: newAnonKey,
    SUPABASE_SERVICE_KEY: newServiceKey
  };
  
  // Test connection before saving
  const testSuccess = await testConnection(newUrl, newAnonKey);
  
  if (!testSuccess) {
    const continueAnyway = await question('\n⚠️  Connection test failed. Continue anyway? (y/N): ');
    if (!continueAnyway || continueAnyway.toLowerCase() !== 'y') {
      console.log('Aborted. .env file not modified.');
      rl.close();
      process.exit(1);
    }
  }
  
  // Confirm before writing
  console.log('\n📝 Ready to update .env file with:');
  console.log(`   SUPABASE_URL=${newUrl}`);
  console.log(`   SUPABASE_ANON_KEY=${newAnonKey.substring(0, 20)}...`);
  console.log(`   SUPABASE_SERVICE_KEY=${newServiceKey.substring(0, 20)}...`);
  console.log();
  
  const confirmWrite = await question('Proceed with update? (Y/n): ');
  if (confirmWrite && confirmWrite.toLowerCase() === 'n') {
    console.log('Aborted. .env file not modified.');
    rl.close();
    process.exit(0);
  }
  
  // Write new .env
  writeEnvFile(updatedEnv);
  console.log('\n✅ .env file updated successfully!\n');
  
  // Next steps
  console.log('📋 Next Steps:');
  console.log('   1. Verify migration completed: node scripts/verify-migration.js');
  console.log('   2. Test application locally: npm run dev');
  console.log('   3. Check all features work correctly');
  console.log('   4. Deploy to production when ready');
  console.log();
  console.log('💡 Tip: Keep .env.backup safe in case you need to rollback');
  console.log();
  
  // Offer to run verification
  const runVerify = await question('Run migration verification now? (Y/n): ');
  if (!runVerify || runVerify.toLowerCase() !== 'n') {
    console.log('\n🔍 Running verification...\n');
    rl.close();
    
    // Import and run verification
    const { exec } = await import('child_process');
    exec('node scripts/verify-migration.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      console.log(stdout);
    });
  } else {
    rl.close();
    console.log('Done! 🎉');
  }
}

// Run main function
main().catch(err => {
  console.error('💥 Error:', err);
  rl.close();
  process.exit(1);
});
