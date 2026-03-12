// Script to setup Supabase Storage bucket for event images
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function setupStorage() {
  console.log('=== Supabase Storage Setup ===\n');

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      process.exit(1);
    }

    const bucketExists = buckets.some(b => b.name === 'event-images');

    if (bucketExists) {
      console.log('✅ Bucket "event-images" already exists\n');
    } else {
      console.log('Creating bucket "event-images"...');
      
      const { data, error } = await supabase.storage.createBucket('event-images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
      });

      if (error) {
        console.error('❌ Error creating bucket:', error.message);
        console.log('\nYou may need to create the bucket manually in Supabase Dashboard:');
        console.log('1. Go to Storage > Buckets');
        console.log('2. Click "New Bucket"');
        console.log('3. Name: event-images');
        console.log('4. Public: Yes');
        console.log('5. File size limit: 5MB');
        process.exit(1);
      }

      console.log('✅ Bucket created successfully!\n');
    }

    console.log('Storage setup complete!');
    console.log('\nNext steps:');
    console.log('1. Ensure storage policies are set (see supabase_storage_policies.sql)');
    console.log('2. Test image upload from the admin dashboard');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

setupStorage();
