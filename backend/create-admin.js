// Script to create an admin user
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function createAdmin() {
  console.log('=== Create Admin User ===\n');

  try {
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    const name = await question('Enter admin name: ');

    console.log('\nCreating admin user...');

    // Create user with admin metadata
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password: password.trim(),
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        name: name.trim()
      }
    });

    if (error) {
      console.error('❌ Error creating admin:', error.message);
      process.exit(1);
    }

    console.log('\n✅ Admin user created successfully!');
    console.log(`Email: ${data.user.email}`);
    console.log(`User ID: ${data.user.id}`);
    console.log(`Role: admin`);
    console.log('\nYou can now login at /admin/login');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

createAdmin();
