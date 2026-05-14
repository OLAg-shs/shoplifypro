const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  const { data, error } = await supabase.from('stores').select('slug').limit(1);
  if (error) {
    console.error('Error fetching slug:', error);
  } else {
    console.log('Slug column exists!', data);
  }
}

checkSchema();
