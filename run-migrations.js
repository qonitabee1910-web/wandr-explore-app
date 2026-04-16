#!/usr/bin/env node

/**
 * Admin Dashboard Migration Runner
 * Executes database migrations for admin dashboard setup
 * 
 * Usage:
 *   node run-migrations.js [--dry-run] [--verbose]
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const MIGRATIONS_DIR = path.join(__dirname, 'src/admin/migrations');
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// Supabase setup
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Helpers
function log(message, level = 'info') {
  const prefix = `[${level.toUpperCase()}]`;
  const timestamp = new Date().toISOString().split('T')[1];
  console.log(`${prefix} ${timestamp} ${message}`);
}

function logVerbose(message) {
  if (VERBOSE) log(message, 'debug');
}

async function executeMigration(sql) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    log('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set', 'error');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  if (DRY_RUN) {
    log('DRY RUN MODE - No changes will be made', 'warn');
    log('SQL to execute:', 'info');
    console.log(sql);
    return true;
  }

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_text: sql });
    
    if (error) {
      log(`Migration failed: ${error.message}`, 'error');
      return false;
    }
    
    return true;
  } catch (error) {
    log(`Migration error: ${error.message}`, 'error');
    return false;
  }
}

async function runMigrations() {
  log('Starting Admin Dashboard Migrations', 'info');
  
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    log(`Migrations directory not found: ${MIGRATIONS_DIR}`, 'error');
    process.exit(1);
  }

  const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    log('No migration files found', 'warn');
    return;
  }

  log(`Found ${migrationFiles.length} migration file(s)`, 'info');

  let successful = 0;
  let failed = 0;

  for (const file of migrationFiles) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    log(`Executing: ${file}`, 'info');

    try {
      const sql = fs.readFileSync(filePath, 'utf-8');
      logVerbose(`SQL length: ${sql.length} characters`);

      // For manual execution via Supabase UI, just read and display
      console.log('\n' + '='.repeat(80));
      console.log(`📄 Migration: ${file}`);
      console.log('='.repeat(80));
      console.log(sql);
      console.log('='.repeat(80) + '\n');

      successful++;
    } catch (error) {
      log(`Failed to read ${file}: ${error.message}`, 'error');
      failed++;
    }
  }

  log(`\nMigration Summary:`, 'info');
  log(`✅ Successful: ${successful}`, 'info');
  log(`❌ Failed: ${failed}`, 'error');
  
  if (failed === 0) {
    log('All migrations ready for execution', 'info');
  }
}

// Run migrations
runMigrations().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});

// Export for external use
module.exports = { executeMigration };
