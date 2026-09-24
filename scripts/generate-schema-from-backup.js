// Script untuk generate schema SQL dari backup JSON

import fs from 'fs';
import path from 'path';

const BACKUP_DIR = 'BACKUP_SUPABASE/backup_2026-09-24T14-30-16';
const OUTPUT_FILE = 'migration/007_schema_from_backup.sql';

// Mapping tipe data JavaScript ke PostgreSQL
function inferPostgresType(value, key) {
  if (value === null || value === undefined) {
    // Cek dari nama kolom untuk hint
    if (key.includes('_at') || key === 'date' || key === 'since' || key === 'last_contact') {
      return 'TIMESTAMP WITH TIME ZONE';
    }
    if (key === 'id' || key.endsWith('_id')) {
      return 'UUID';
    }
    if (key.includes('email')) return 'TEXT';
    if (key.includes('phone')) return 'TEXT';
    return 'TEXT'; // Default
  }
  
  const type = typeof value;
  
  if (type === 'string') {
    // Check if it's a UUID
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
      return 'UUID';
    }
    // Check if it's a timestamp
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return 'TIMESTAMP WITH TIME ZONE';
    }
    // Check if it's a date
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return 'DATE';
    }
    // Long text
    if (value.length > 500) {
      return 'TEXT';
    }
    return 'TEXT';
  }
  
  if (type === 'number') {
    if (Number.isInteger(value)) {
      return value > 2147483647 ? 'BIGINT' : 'INTEGER';
    }
    return 'NUMERIC';
  }
  
  if (type === 'boolean') {
    return 'BOOLEAN';
  }
  
  if (type === 'object') {
    if (Array.isArray(value)) {
      return 'JSONB'; // Array stored as JSONB
    }
    return 'JSONB'; // Object stored as JSONB
  }
  
  return 'TEXT';
}

function analyzeTable(tableName, jsonPath) {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }
  
  // Collect all unique keys and their types
  const columns = {};
  
  data.forEach(row => {
    Object.entries(row).forEach(([key, value]) => {
      if (!columns[key]) {
        columns[key] = {
          type: inferPostgresType(value, key),
          nullable: value === null || value === undefined,
          hasNonNull: value !== null && value !== undefined
        };
      } else {
        // Check consistency
        const inferredType = inferPostgresType(value, key);
        if (value !== null && value !== undefined) {
          columns[key].hasNonNull = true;
          // Use more specific type if available
          if (columns[key].type === 'TEXT' && inferredType !== 'TEXT') {
            columns[key].type = inferredType;
          }
        } else {
          columns[key].nullable = true;
        }
      }
    });
  });
  
  return {
    tableName,
    rowCount: data.length,
    columns
  };
}

function generateCreateTable(analysis) {
  const { tableName, columns } = analysis;
  
  let sql = `-- Table: ${tableName}\n`;
  sql += `CREATE TABLE IF NOT EXISTS public.${tableName} (\n`;
  
  const columnDefs = [];
  
  // ID column first
  if (columns.id) {
    columnDefs.push(`    id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`);
  }
  
  // Other columns
  Object.entries(columns).forEach(([colName, colInfo]) => {
    if (colName === 'id') return; // Already added
    
    let def = `    ${colName} ${colInfo.type}`;
    
    // Add constraints
    if (!colInfo.nullable && colInfo.hasNonNull) {
      def += ' NOT NULL';
    }
    
    // Default values
    if (colInfo.type === 'JSONB') {
      def += ` DEFAULT '[]'`;
    } else if (colInfo.type === 'BOOLEAN') {
      def += ' DEFAULT false';
    } else if (colInfo.type === 'INTEGER' || colInfo.type === 'NUMERIC') {
      if (colName.includes('total') || colName.includes('amount') || colName.includes('price') || colName.includes('cost') || colName.includes('fee')) {
        def += ' DEFAULT 0';
      }
    }
    
    columnDefs.push(def);
  });
  
  // Add timestamps if not exists
  if (!columns.created_at) {
    columnDefs.push(`    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL`);
  }
  if (!columns.updated_at) {
    columnDefs.push(`    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL`);
  }
  
  sql += columnDefs.join(',\n');
  sql += '\n);\n\n';
  
  // Add indexes for common columns
  const indexColumns = ['email', 'phone', 'status', 'client_id', 'project_id', 'user_id', 'team_member_id'];
  indexColumns.forEach(col => {
    if (columns[col]) {
      sql += `CREATE INDEX IF NOT EXISTS idx_${tableName}_${col} ON public.${tableName}(${col});\n`;
    }
  });
  
  sql += '\n';
  
  return sql;
}

function generateSchema() {
  console.log('🔍 Analyzing backup files...\n');
  
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.json') && f !== '_summary.json' && f !== 'README.md');
  
  let fullSQL = `-- ============================================
-- SCHEMA GENERATED FROM BACKUP
-- Generated: ${new Date().toISOString()}
-- Source: ${BACKUP_DIR}
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

`;
  
  const analyses = [];
  
  files.forEach(file => {
    const tableName = path.basename(file, '.json');
    const jsonPath = path.join(BACKUP_DIR, file);
    
    console.log(`  📋 Analyzing ${tableName}...`);
    
    const analysis = analyzeTable(tableName, jsonPath);
    if (analysis) {
      analyses.push(analysis);
    }
  });
  
  console.log(`\n✅ Analyzed ${analyses.length} tables\n`);
  console.log('📝 Generating SQL...\n');
  
  // Sort tables by dependencies (tables without foreign keys first)
  const independentTables = ['users', 'profiles', 'packages', 'add_ons', 'promo_codes', 'cards', 'team_members'];
  const sortedAnalyses = [
    ...analyses.filter(a => independentTables.includes(a.tableName)),
    ...analyses.filter(a => !independentTables.includes(a.tableName))
  ];
  
  // Generate CREATE TABLE statements
  sortedAnalyses.forEach(analysis => {
    fullSQL += generateCreateTable(analysis);
    console.log(`  ✅ ${analysis.tableName} (${analysis.rowCount} rows, ${Object.keys(analysis.columns).length} columns)`);
  });
  
  // Add trigger function for updated_at
  fullSQL += `
-- ============================================
-- TRIGGER FOR AUTO-UPDATE updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

`;
  
  // Add triggers for all tables
  sortedAnalyses.forEach(analysis => {
    if (analysis.columns.updated_at) {
      fullSQL += `CREATE TRIGGER update_${analysis.tableName}_updated_at 
    BEFORE UPDATE ON public.${analysis.tableName} 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();\n\n`;
    }
  });
  
  // Add comments
  fullSQL += `
-- ============================================
-- TABLE COMMENTS
-- ============================================

`;
  
  sortedAnalyses.forEach(analysis => {
    fullSQL += `COMMENT ON TABLE public.${analysis.tableName} IS 'Generated from backup: ${analysis.rowCount} rows';\n`;
  });
  
  // Write to file
  fs.writeFileSync(OUTPUT_FILE, fullSQL);
  
  console.log(`\n✅ Schema SQL generated successfully!\n`);
  console.log(`📁 Output: ${OUTPUT_FILE}`);
  console.log(`📊 Total tables: ${analyses.length}`);
  console.log(`📝 Total lines: ${fullSQL.split('\n').length}`);
  console.log(`💾 File size: ${(fullSQL.length / 1024).toFixed(2)} KB\n`);
  
  // Generate summary
  const summary = {
    generated_at: new Date().toISOString(),
    source: BACKUP_DIR,
    output: OUTPUT_FILE,
    total_tables: analyses.length,
    tables: analyses.map(a => ({
      name: a.tableName,
      rows: a.rowCount,
      columns: Object.keys(a.columns).length
    }))
  };
  
  fs.writeFileSync(
    'migration/007_schema_summary.json',
    JSON.stringify(summary, null, 2)
  );
  
  console.log('📋 Summary saved to: migration/007_schema_summary.json\n');
}

// Run
try {
  generateSchema();
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
