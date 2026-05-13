const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create a supabase client with the service role for backend operations (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Export the supabase client
module.exports = { supabase };