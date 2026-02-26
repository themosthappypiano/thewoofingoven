import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Use service key for admin access
const supabaseUrl = 'https://kksziefdwuczqvzgffxn.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk1NjEwOCwiZXhwIjoyMDg3NTMyMTA4fQ.a2uYbkrSwUDItagh6jfbAtc_AB38P3bytsrxR_96GBk';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function insertAllData() {
  console.log('🚀 Inserting all data directly to Supabase...');

  try {
    // Load exported data
    const data = JSON.parse(fs.readFileSync('./local-data-export.json', 'utf8'));
    const { products, productVariants } = data;

    console.log(`Found: ${products.length} products, ${productVariants.length} variants`);

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await supabase.from('product_variants').delete().gte('id', 0);
    await supabase.from('products').delete().gte('id', 0);

    // Insert products
    console.log('📤 Inserting products...');
    const productInserts = products.map(p => ({
      name: p.name,
      description: p.description,
      base_price: parseFloat(p.base_price || '0'),
      image_url: p.image_url || p.imageUrl,
      category: p.category,
      is_featured: Boolean(p.is_featured || p.isFeatured),
      tags: p.tags ? JSON.parse(p.tags) : null,
      created_at: new Date().toISOString()
    }));

    const { data: insertedProducts, error: prodError } = await supabase
      .from('products')
      .insert(productInserts)
      .select('id, name');

    if (prodError) {
      console.error('❌ Products error:', prodError);
      return;
    }

    console.log(`✅ Inserted ${insertedProducts.length} products`);

    // Create ID mapping
    const idMapping = {};
    products.forEach((orig, i) => {
      idMapping[orig.id] = insertedProducts[i].id;
    });

    // Insert variants  
    console.log('📤 Inserting variants...');
    const variantInserts = productVariants.map(v => ({
      product_id: idMapping[v.product_id],
      sku: v.sku,
      name: v.name,
      price: parseFloat(v.price || '0'),
      price_adjustment: parseFloat(v.price_adjustment || '0'),
      inventory: parseInt(v.inventory || '0'),
      is_active: Boolean(v.is_active),
      variant_data: v.variant_data ? JSON.parse(v.variant_data) : null,
      image_url: v.image_url,
      shipping_required: Boolean(v.shipping_required),
      weight: parseInt(v.weight || '0'),
      created_at: new Date().toISOString()
    }));

    // Insert in batches
    const batchSize = 10;
    let totalInserted = 0;
    
    for (let i = 0; i < variantInserts.length; i += batchSize) {
      const batch = variantInserts.slice(i, i + batchSize);
      const { data: batchResult, error: batchError } = await supabase
        .from('product_variants')
        .insert(batch)
        .select('id');

      if (batchError) {
        console.error(`❌ Batch ${i/batchSize + 1} error:`, batchError);
        break;
      }
      
      totalInserted += batchResult.length;
      console.log(`✅ Batch ${i/batchSize + 1}: ${batchResult.length} variants`);
    }

    console.log(`🎉 Migration complete! Inserted ${totalInserted} variants`);

    // Add sample reviews
    console.log('📤 Adding sample reviews...');
    const reviews = [
      { dog_name: 'Bella', rating: 5, content: 'Amazing woofles! My dog loves them!', image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=80' },
      { dog_name: 'Max', rating: 5, content: 'Perfect birthday cake. Custom made and delicious!', image_url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&q=80' },
      { dog_name: 'Luna', rating: 5, content: 'Training treats work perfectly!', image_url: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=400&q=80' }
    ];

    await supabase.from('reviews').insert(reviews);
    console.log('✅ Added sample reviews');

    console.log('🎯 All done! Your app can now use Supabase!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

insertAllData();