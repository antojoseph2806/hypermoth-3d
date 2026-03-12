// Simple test script to verify the server setup
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

console.log('Testing Event Booking Backend Setup...\n');

// Check environment variables
console.log('1. Checking environment variables...');
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_KEY', 'SUPABASE_JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing environment variables:', missingVars.join(', '));
  console.log('\nPlease create a .env file with:');
  console.log('SUPABASE_URL=your_supabase_url');
  console.log('SUPABASE_KEY=your_supabase_service_role_key');
  console.log('SUPABASE_JWT_SECRET=your_jwt_secret');
  process.exit(1);
}

console.log('✅ All environment variables present\n');

// Test Supabase connection
console.log('2. Testing Supabase connection...');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

try {
  const { data, error } = await supabase.from('events').select('count');
  
  if (error) {
    console.error('❌ Supabase connection failed:', error.message);
    console.log('\nPlease check:');
    console.log('- Your Supabase credentials are correct');
    console.log('- The events table exists in your database');
    console.log('- Run the schema from backend/supabase_schema.sql');
    process.exit(1);
  }
  
  console.log('✅ Supabase connection successful\n');
  
  // Test events table
  console.log('3. Testing events table...');
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .limit(1);
  
  if (eventsError) {
    console.error('❌ Events table query failed:', eventsError.message);
    process.exit(1);
  }
  
  console.log(`✅ Events table accessible (${events?.length || 0} events found)\n`);
  
  // Test bookings table
  console.log('4. Testing bookings table...');
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*')
    .limit(1);
  
  if (bookingsError) {
    console.error('❌ Bookings table query failed:', bookingsError.message);
    process.exit(1);
  }
  
  console.log(`✅ Bookings table accessible (${bookings?.length || 0} bookings found)\n`);
  
  console.log('🎉 All tests passed! Your backend is ready to run.');
  console.log('\nStart the server with:');
  console.log('  npm start        (production)');
  console.log('  npm run dev      (development with auto-reload)');
  console.log('  start-server.bat (Windows batch file)');
  
} catch (error) {
  console.error('❌ Unexpected error:', error.message);
  process.exit(1);
}
