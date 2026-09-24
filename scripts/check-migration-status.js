/**
 * CHECK MIGRATION STATUS
 * 
 * Quick check to see what tables were created successfully
 * and basic data verification
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env
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

async function checkStatus() {
  console.log('🔍 Checking Migration Status\n');
  
  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const serviceKey = env.VIT_SUPABASE_SERVICE_ROL_KEY || env.VITE_SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing environment variables');
    process.exit(1);
  }
  
  console.log(`📡 Project: ${supabaseUrl}\n`);
  
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  const expectedTables = [
    'users', 'profiles', 'clients', 'projects', 'team_members',
    'leads', 'calendar_events', 'packages', 'promo_codes',
    'notifications', 'add_ons', 'bookings', 'cards',
    'client_feedback', 'contracts', 'galleries', 'pockets',
    'project_add_ons', 'project_team_assignments',
    'team_payment_records', 'team_project_payments',
    'transactions', 'vendor_portfolios', 'vendor_profiles',
    'wedding_day_checklists'
  ];
  
  console.log('📊 Checking Tables:\n');
  
  let successCount = 0;
  let totalRows = 0;
  
  for (const table of expectedTables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        const rows = count || 0;
        totalRows += rows;
        console.log(`✅ ${table}: ${rows} rows`);
        successCount++;
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Tables Created: ${successCount}/${expectedTables.length}`);
  console.log(`📊 Total Rows: ${totalRows}`);
  console.log('='.repeat(50));
  
  if (successCount === expectedTables.length) {
    console.log('\n🎉 Schema migration SUCCESS!');
    console.log('Next: Insert data via SQL Editor');
  } else {
    console.log('\n⚠️  Some tables missing. Check errors above.');
  }
}

checkStatus();
