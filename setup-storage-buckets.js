#!/usr/bin/env node

/**
 * Storage Bucket & RLS Policy Setup Script
 * 
 * Sets up Supabase storage buckets and RLS policies for seat layouts
 * 
 * Prerequisites:
 *   - Supabase project initialized
 *   - Service role key available in environment
 * 
 * Usage:
 *   node setup-storage-buckets.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nTo get the service role key:');
  console.error('   1. Go to https://app.supabase.com');
  console.error('   2. Select your project');
  console.error('   3. Go to Settings → API');
  console.error('   4. Copy the "service_role" key');
  console.error('   5. Add to .env.local: SUPABASE_SERVICE_ROLE_KEY="your_key_here"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function setupStorageBuckets() {
  try {
    console.log('🔄 Setting up storage buckets and RLS policies...\n');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20260427_9_setup_storage_buckets.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Error: Migration file not found at', migrationPath);
      console.error('   Please ensure the migration file exists');
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📋 Executing migration: 20260427_9_setup_storage_buckets.sql\n');

    // Execute the SQL migration
    const { error } = await supabase.rpc('exec', {
      sql: migrationSQL,
    }).catch(() => {
      // Alternative: if exec doesn't work, log helpful message
      console.warn('⚠️  RPC method not available');
      return { error: { message: 'RPC method not available. Please run migration via Supabase dashboard.' } };
    });

    if (error) {
      console.warn('⚠️  Could not execute via RPC');
      console.log('\n📌 MANUAL SETUP INSTRUCTIONS:');
      console.log('   1. Go to https://app.supabase.com/project/_/sql');
      console.log('   2. Click "New Query"');
      console.log('   3. Copy the SQL from: supabase/migrations/20260427_9_setup_storage_buckets.sql');
      console.log('   4. Paste and click "Run"');
      console.log('   5. Verify success in the Storage tab\n');
      return;
    }

    console.log('✅ Migration executed successfully!\n');

    // Verify buckets were created
    console.log('🔍 Verifying storage setup...\n');
    
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) throw bucketsError;
      
      const seatLayoutsBucket = buckets?.find(b => b.id === 'seat-layouts');
      
      if (seatLayoutsBucket) {
        console.log('✅ Seat-layouts bucket created:');
        console.log(`   - ID: ${seatLayoutsBucket.id}`);
        console.log(`   - Public: ${seatLayoutsBucket.public}`);
        console.log(`   - Created: ${seatLayoutsBucket.created_at}\n`);
      } else {
        console.log('⚠️  Seat-layouts bucket not found. It may need to be created via dashboard.\n');
      }
    } catch (err) {
      console.warn('⚠️  Could not verify buckets:', err.message, '\n');
    }

    console.log('🎉 Storage setup complete!\n');
    console.log('📌 Next steps:');
    console.log('   1. Go to https://app.supabase.com/project/_/storage');
    console.log('   2. Verify "seat-layouts" bucket exists and is PUBLIC');
    console.log('   3. Test uploading an image via the app\n');

  } catch (err) {
    console.error('❌ Error during setup:', err.message);
    console.error('\n📌 Troubleshooting:');
    console.error('   1. Check your Supabase credentials in .env.local');
    console.error('   2. Verify the service role key has full permissions');
    console.error('   3. Try running the SQL manually via the dashboard\n');
    process.exit(1);
  }
}

setupStorageBuckets();
