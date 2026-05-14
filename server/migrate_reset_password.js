const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  console.log('Adding reset password columns to users table...');
  
  // Note: Supabase JS client doesn't support ALTER TABLE directly.
  // We have to use the SQL API or instruct the user.
  // However, we can try to use a RPC if they have one, but they don't.
  
  console.log('--------------------------------------------------');
  console.log('PLEASE RUN THIS SQL IN YOUR SUPABASE SQL EDITOR:');
  console.log('--------------------------------------------------');
  console.log(`
    ALTER TABLE public.users 
    ADD COLUMN IF NOT EXISTS reset_token text,
    ADD COLUMN IF NOT EXISTS reset_token_expires timestamp with time zone;
  `);
  console.log('--------------------------------------------------');
}

migrate();
