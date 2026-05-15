const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyStats() {
  console.log('🚀 Starting Supabase Stats Trigger Verification...');

  try {
    // 1. Get a test store
    const { data: stores, error: storeError } = await supabase
      .from('stores')
      .select('id, name, stats')
      .limit(1);

    if (storeError || !stores || stores.length === 0) {
      console.error('❌ No stores found to test with.');
      return;
    }

    const store = stores[0];
    console.log(`📍 Testing with store: ${store.name} (${store.id})`);
    console.log('Current Stats:', store.stats);

    const initialProductCount = store.stats.totalProducts || 0;
    const initialOrderCount = store.stats.totalOrders || 0;
    const initialRevenue = parseFloat(store.stats.totalRevenue || 0);

    // 2. Insert a dummy product
    console.log('\n📦 Inserting test product...');
    const { data: product, error: pError } = await supabase
      .from('products')
      .insert([{
        name: 'TEST PRODUCT (Stats Verification)',
        price: 99.99,
        store_id: store.id,
        is_active: true
      }])
      .select()
      .single();

    if (pError) throw pError;

    // Wait a bit for the trigger to fire
    await new Promise(r => setTimeout(r, 1000));

    // Check stats
    const { data: storeAfterProduct } = await supabase.from('stores').select('stats').eq('id', store.id).single();
    console.log('Stats after product insert:', storeAfterProduct.stats);
    
    if (storeAfterProduct.stats.totalProducts === initialProductCount + 1) {
      console.log('✅ totalProducts incremented correctly!');
    } else {
      console.warn('⚠️ totalProducts did NOT increment as expected.');
    }

    // 3. Insert a dummy order
    console.log('\n🛍️ Inserting test order...');
    const { data: order, error: oError } = await supabase
      .from('orders')
      .insert([{
        user_id: (await supabase.from('users').select('id').limit(1).single()).data.id,
        store_id: store.id,
        total_amount: 150.50,
        order_status: 'pending',
        shipping_address: { city: 'Test City' },
        payment_info: { method: 'test' }
      }])
      .select()
      .single();

    if (oError) throw oError;

    await new Promise(r => setTimeout(r, 1000));

    const { data: storeAfterOrder } = await supabase.from('stores').select('stats').eq('id', store.id).single();
    console.log('Stats after order insert:', storeAfterOrder.stats);

    if (storeAfterOrder.stats.totalOrders === initialOrderCount + 1 && 
        parseFloat(storeAfterOrder.stats.totalRevenue) === initialRevenue + 150.50) {
      console.log('✅ totalOrders and totalRevenue updated correctly!');
    } else {
      console.warn('⚠️ Stats did NOT update correctly after order.');
    }

    // 4. Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await supabase.from('products').delete().eq('id', product.id);
    await supabase.from('orders').delete().eq('id', order.id);

    await new Promise(r => setTimeout(r, 1000));

    const { data: finalStore } = await supabase.from('stores').select('stats').eq('id', store.id).single();
    console.log('Final Stats (should be back to initial):', finalStore.stats);

    if (finalStore.stats.totalProducts === initialProductCount) {
      console.log('✅ Cleanup successful, stats reverted.');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyStats();
