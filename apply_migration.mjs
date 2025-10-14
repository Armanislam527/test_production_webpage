import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://vbpepgysyzrllyegzety.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZicGVwZ3lzeXpybGx5ZWd6ZXR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxODkxMzAsImV4cCI6MjA3NTc2NTEzMH0.XZsbxsJ0n2mB6FxPBkdc624hqtl70lFy-JZB3b6l1dA';

const supabase = createClient(supabaseUrl, supabaseKey);

const migrationSQL = readFileSync('./supabase/migrations/20251013000000_add_analytics_tracking.sql', 'utf8');

console.log('Testing connection to Supabase...');

// Test if we can access the database
const { data: testData, error: testError } = await supabase.from('profiles').select('count').limit(1);

if (testError) {
  console.error('Connection test failed:', testError);
} else {
  console.log('Connection successful!');
}

// Try to execute the migration as a single query using rpc
console.log('\nAttempting to apply migration...\n');

const { data, error } = await supabase.rpc('get_platform_stats');

console.log('Function test result:', { data, error });

