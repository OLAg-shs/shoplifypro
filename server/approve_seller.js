const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const email = 'OLAGUSER144@GMAIL.COM';
  
  console.log('Fetching user...');
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (fetchError) {
    console.error('Fetch error:', fetchError);
    return;
  }

  console.log(`Approving seller ${user.name}...`);
  const { error: updateError } = await supabase
    .from('users')
    .update({ status: 'active' })
    .eq('id', user.id);

  if (updateError) {
    console.error('Update error:', updateError);
    return;
  }

  console.log('Checking if store exists...');
  const { data: existingStore } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!existingStore) {
    console.log('Creating default store...');
    const slug = user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-store';
    
    const { error: storeError } = await supabase
      .from('stores')
      .insert([{
        name: `${user.name}'s Store`,
        description: 'Welcome to my store! Edit this in your Store Builder.',
        slug,
        owner_id: user.id,
        branding: {
          primaryColor: '#2563eb',
          secondaryColor: '#f1f5f9',
          backgroundColor: '#ffffff',
          textColor: '#0f172a',
          fontFamily: 'Inter, sans-serif',
          layoutStyle: 'modern',
        },
        settings: {},
        is_published: false,
        is_verified: false,
      }]);

    if (storeError) {
      console.error('Store creation error:', storeError);
    } else {
      console.log('Store created successfully!');
    }
  } else {
    console.log('Store already exists.');
  }

  console.log('Done! Account is now active and ready to use.');
}

main();
