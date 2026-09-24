/**
 * MIGRATION VERIFICATION SCRIPT
 * 
 * Verifies that database migration completed successfully by:
 * 1. Checking all tables exist
 * 2. Verifying row counts match expected values
 * 3. Checking data integrity (no nulls in required fields)
 * 4. Verifying RLS is enabled
 * 
 * Usage:
 *   node scripts/verify-migration.js
 * 
 * Required environment variables:
 *   SUPABASE_URL - New project URL
 *   SUPABASE_SERVICE_KEY - Service role key (bypasses RLS)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Expected row counts from backup
const EXPECTED_COUNTS = {
  users: 0,
  profiles: 0,
  clients: 3,
  projects: 0,
  team_members: 0,
  leads: 0,
  calendar_events: 0,
  packages: 10,
  promo_codes: 0,
  notifications: 0,
  add_ons: 5,
  bookings: 0,
  cards: 178,
  client_feedback: 0,
  contracts: 0,
  galleries: 0,
  pockets: 0,
  project_add_ons: 0,
  project_team_assignments: 0,
  team_payment_records: 0,
  team_project_payments: 0,
  transactions: 0,
  vendor_portfolios: 0,
  vendor_profiles: 0,
  wedding_day_checklists: 0
};

const TOTAL_EXPECTED = 196;

async function verifyMigration() {
  console.log('🔍 Starting migration verification...\n');

  // Check environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables!');
    console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY');
    process.exit(1);
  }

  console.log(`📡 Connecting to: ${supabaseUrl}\n`);

  // Initialize Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  let allPassed = true;
  const results = [];

  // Test 1: Check all tables exist and count rows
  console.log('📊 Test 1: Checking tables and row counts...\n');

  let totalRows = 0;
  for (const [table, expectedCount] of Object.entries(EXPECTED_COUNTS)) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: Error - ${error.message}`);
        allPassed = false;
        results.push({ table, status: 'ERROR', expected: expectedCount, actual: 'N/A', error: error.message });
        continue;
      }

      const actualCount = count || 0;
      totalRows += actualCount;

      const status = actualCount === expectedCount ? '✅' : '⚠️';
      const statusText = actualCount === expectedCount ? 'OK' : 'MISMATCH';

      console.log(`${status} ${table}: ${actualCount} rows (expected ${expectedCount})`);

      results.push({
        table,
        status: statusText,
        expected: expectedCount,
        actual: actualCount
      });

      if (actualCount !== expectedCount) {
        allPassed = false;
      }
    } catch (err) {
      console.log(`❌ ${table}: Exception - ${err.message}`);
      allPassed = false;
      results.push({ table, status: 'EXCEPTION', expected: expectedCount, actual: 'N/A', error: err.message });
    }
  }

  console.log(`\n📈 Total rows: ${totalRows} (expected ${TOTAL_EXPECTED})`);

  if (totalRows !== TOTAL_EXPECTED) {
    console.log('⚠️  Row count mismatch!\n');
    allPassed = false;
  } else {
    console.log('✅ Row count matches!\n');
  }

  // Test 2: Check critical tables have data
  console.log('📋 Test 2: Checking critical tables...\n');

  const criticalTables = ['packages', 'add_ons', 'cards', 'clients'];
  for (const table of criticalTables) {
    const result = results.find(r => r.table === table);
    if (result && result.actual > 0) {
      console.log(`✅ ${table}: Has data (${result.actual} rows)`);
    } else {
      console.log(`❌ ${table}: No data found!`);
      allPassed = false;
    }
  }

  // Test 3: Sample data integrity check on packages
  console.log('\n🔍 Test 3: Data integrity checks...\n');

  try {
    const { data: packages, error } = await supabase
      .from('packages')
      .select('id, name, price')
      .limit(5);

    if (error) {
      console.log(`❌ Packages integrity check failed: ${error.message}`);
      allPassed = false;
    } else if (packages && packages.length > 0) {
      let integrityIssues = 0;
      packages.forEach(pkg => {
        if (!pkg.id || !pkg.name || pkg.price === null || pkg.price === undefined) {
          console.log(`⚠️  Package missing required fields: ${JSON.stringify(pkg)}`);
          integrityIssues++;
        }
      });

      if (integrityIssues === 0) {
        console.log(`✅ Packages: All required fields present`);
      } else {
        console.log(`❌ Packages: ${integrityIssues} integrity issues found`);
        allPassed = false;
      }
    }
  } catch (err) {
    console.log(`❌ Packages integrity check exception: ${err.message}`);
    allPassed = false;
  }

  // Test 4: Sample data integrity check on cards
  try {
    const { data: cards, error } = await supabase
      .from('cards')
      .select('id, couple_name_male, couple_name_female')
      .limit(5);

    if (error) {
      console.log(`❌ Cards integrity check failed: ${error.message}`);
      allPassed = false;
    } else if (cards && cards.length > 0) {
      let integrityIssues = 0;
      cards.forEach(card => {
        if (!card.id || !card.couple_name_male || !card.couple_name_female) {
          console.log(`⚠️  Card missing required fields: ${JSON.stringify(card)}`);
          integrityIssues++;
        }
      });

      if (integrityIssues === 0) {
        console.log(`✅ Cards: All required fields present`);
      } else {
        console.log(`❌ Cards: ${integrityIssues} integrity issues found`);
        allPassed = false;
      }
    }
  } catch (err) {
    console.log(`❌ Cards integrity check exception: ${err.message}`);
    allPassed = false;
  }

  // Test 5: Check if RLS is enabled (requires raw SQL query)
  console.log('\n🔒 Test 5: RLS Status Check...\n');
  console.log('ℹ️  Run this SQL query manually to verify RLS:');
  console.log(`
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
  `);
  console.log('Expected: rowsecurity = true for all tables\n');

  // Generate summary report
  console.log('=' .repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('=' .repeat(60));

  const passed = results.filter(r => r.status === 'OK').length;
  const failed = results.filter(r => r.status !== 'OK').length;

  console.log(`✅ Passed: ${passed}/${results.length} tables`);
  console.log(`❌ Failed: ${failed}/${results.length} tables`);
  console.log(`📈 Total Rows: ${totalRows}/${TOTAL_EXPECTED}`);

  if (allPassed) {
    console.log('\n🎉 Migration verification PASSED! ✅');
    console.log('All tables exist with correct row counts.');
    console.log('\nNext steps:');
    console.log('1. Verify RLS policies are applied (run 009_rls_policies.sql)');
    console.log('2. Test application functionality');
    console.log('3. Migrate Storage files if needed');
  } else {
    console.log('\n⚠️  Migration verification FAILED!');
    console.log('Please review the errors above and re-run migration if needed.');
  }

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    url: supabaseUrl,
    allPassed,
    totalRows,
    expectedRows: TOTAL_EXPECTED,
    tables: results
  };

  const reportPath = path.join(process.cwd(), 'migration', 'verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  process.exit(allPassed ? 0 : 1);
}

// Run verification
verifyMigration().catch(err => {
  console.error('💥 Verification script failed:', err);
  process.exit(1);
});
