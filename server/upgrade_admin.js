const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function makeAdmin() {
  const emailToUpgrade = 'maccarthyquest01@gmail.com'; // User's main email

  console.log(`Looking for user with email: ${emailToUpgrade}`);
  
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('id, name, role')
    .eq('email', emailToUpgrade)
    .single();

  if (fetchError) {
    console.error('Failed to find user:', fetchError.message);
    return;
  }

  console.log(`Found user ${user.name}. Upgrading role to 'admin'...`);

  const { error: updateError } = await supabase
    .from('users')
    .update({ role: 'admin' })
    .eq('id', user.id);

  if (updateError) {
    console.error('Failed to upgrade user:', updateError.message);
  } else {
    console.log('✅ Successfully upgraded user to ADMIN!');
    console.log('Please log out and log back in to see the changes.');
  }
}

makeAdmin();
