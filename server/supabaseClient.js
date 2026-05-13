const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase;

try {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('CRITICAL: Supabase environment variables are missing!');
    // We don't throw here to prevent the Vercel function from crashing on startup
  } else {
    supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
}

module.exports = { supabase };