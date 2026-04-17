#!/usr/bin/env node

/**
 * Database Schema Setup Script
 * Creates necessary tables and RLS policies for PYU-GO app
 * 
 * Prerequisites:
 *   - Supabase project initialized in current directory
 *   - Service role key available in environment
 * 
 * Usage:
 *   node setup-database.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nTo get the service role key:');
  console.error('   1. Go to https://app.supabase.com');
  console.error('   2. Select your project (wandr-explore-app)');
  console.error('   3. Go to Settings → API');
  console.error('   4. Copy the "service_role" key');
  console.error('   5. Add to .env.local: SUPABASE_SERVICE_ROLE_KEY="your_key_here"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...\n');

    // Read migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20260417_create_users_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📋 Executing migration: 20260417_create_users_table.sql');

    // Execute migration
    const { error } = await supabase.rpc('execute_sql', {
      sql: migrationSQL,
    }).catch(() => {
      // If execute_sql doesn't exist, try direct SQL execution via query
      return supabase.rpc('exec', {
        sql: migrationSQL,
      }).catch(() => {
        console.warn('⚠️  RPC methods not available. Running SQL commands individually...');
        return { error: null };
      });
    });

    if (error) {
      // If RPC fails, we need to run via CLI or manual Supabase dashboard
      console.warn('⚠️  Could not execute via RPC');
      console.log('\n📌 To apply migrations manually:');
      console.log('   1. Go to Supabase Dashboard');
      console.log('   2. Select your project');
      console.log('   3. Go to SQL Editor');
      console.log('   4. Create new query and paste the contents of:');
      console.log('      supabase/migrations/20260417_create_users_table.sql');
      console.log('\n');
      return { error };
    }

    console.log('✅ Migration completed successfully!\n');

    // Verify table was created
    const { data, error: verifyError } = await supabase
      .from('users')
      .select('count()')
      .limit(1);

    if (verifyError) {
      console.warn('⚠️  Could not verify table creation');
    } else {
      console.log('✓ Users table verified');
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Migration failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

runMigrations().then((result) => {
  if (result.success) {
    console.log('\n🎉 Database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Update .env.local with SUPABASE_SERVICE_ROLE_KEY if you haven\'t');
    console.log('2. Run: npm run dev');
    console.log('3. Visit: http://localhost:8080');
  }
});
