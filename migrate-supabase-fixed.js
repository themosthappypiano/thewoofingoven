import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Supabase configuration
const supabaseUrl = 'https://kksziefdwuczqvzgffxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44';

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateToSupabase() {
  console.log('🚀 Starting fixed migration to Supabase...');

  try {
    // Step 1: Load exported data
    console.log('📦 Loading exported data...');
    const data = JSON.parse(fs.readFileSync('./local-data-export.json', 'utf8'));
    const { products, productVariants, reviews } = data;

    console.log(`Found:
    - ${products.length} products
    - ${productVariants.length} product variants
    - ${reviews.length} reviews`);

    // Step 2: Clear existing data (in case of re-run)
    console.log('🧹 Clearing existing data...');
    await supabase.from('productVariants').delete().neq('id', 0);
    await supabase.from('products').delete().neq('id', 0);

    // Step 3: Insert products with correct column names
    console.log('📤 Inserting products...');
    
    if (products.length > 0) {
      // Use the column names that match the client-side schema
      const transformedProducts = products.map(p => ({
        name: p.name,
        description: p.description,
        price: (p.base_price || p.basePrice || p.price || '0').toString(),
        imageUrl: p.image_url || p.imageUrl,
        category: p.category,
        isFeatured: Boolean(p.is_featured || p.isFeatured)
      }));
      
      console.log('📝 Sample product data:', transformedProducts[0]);
      
      const { data: insertedProducts, error: productsError } = await supabase
        .from('products')
        .insert(transformedProducts)
        .select('id, name');
      
      if (productsError) {
        console.error('❌ Error inserting products:', productsError);
        return;
      } else {
        console.log(`✅ Inserted ${insertedProducts.length} products`);
        console.log('📝 Sample inserted:', insertedProducts[0]);
      }

      // Step 4: Get the new product IDs and create a mapping
      const { data: supabaseProducts } = await supabase
        .from('products')
        .select('id, name')
        .order('id');

      // Create mapping from old product IDs to new ones
      const productIdMapping = {};
      products.forEach((originalProduct, index) => {
        if (supabaseProducts[index]) {
          productIdMapping[originalProduct.id] = supabaseProducts[index].id;
        }
      });

      console.log('🔗 Product ID mapping:', productIdMapping);

      // Step 5: Insert product variants
      console.log('📤 Inserting product variants...');
      
      if (productVariants.length > 0) {
        const transformedVariants = productVariants.map(v => ({
          productId: productIdMapping[v.product_id] || v.product_id,
          sku: v.sku,
          name: v.name,
          price: (v.price || '0').toString(),
          priceAdjustment: (v.price_adjustment || v.priceAdjustment || '0').toString(),
          inventory: parseInt(v.inventory || '0'),
          isActive: Boolean(v.is_active || v.isActive),
          variantData: v.variant_data ? (typeof v.variant_data === 'string' ? JSON.parse(v.variant_data) : v.variant_data) : null,
          imageUrl: v.image_url || v.imageUrl,
          stripePriceId: v.stripe_price_id || v.stripePriceId,
          shippingRequired: Boolean(v.shipping_required || v.shippingRequired),
          weight: (v.weight || '0').toString(),
        }));
        
        console.log('📝 Sample variant data:', transformedVariants[0]);
        
        // Insert variants in batches to avoid timeout
        const batchSize = 10;
        let insertedCount = 0;
        
        for (let i = 0; i < transformedVariants.length; i += batchSize) {
          const batch = transformedVariants.slice(i, i + batchSize);
          
          const { data: insertedVariants, error: variantsError } = await supabase
            .from('productVariants')
            .insert(batch)
            .select('id');
          
          if (variantsError) {
            console.error(`❌ Error inserting variants batch ${Math.floor(i/batchSize) + 1}:`, variantsError);
            break;
          } else {
            insertedCount += insertedVariants.length;
            console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}: ${insertedVariants.length} variants`);
          }
        }
        
        console.log(`✅ Total variants inserted: ${insertedCount}`);
      }
    }

    // Step 6: Verify data
    console.log('🔍 Verifying migration...');
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    const { count: variantCount } = await supabase
      .from('productVariants')
      .select('*', { count: 'exact', head: true });

    console.log(`✅ Verification complete:
    - Products in Supabase: ${productCount}
    - Variants in Supabase: ${variantCount}
    - Expected: ${products.length} products, ${productVariants.length} variants`);

    console.log('🎉 Migration completed successfully!');
    console.log('📝 Next step: Switch DATABASE_URL to use Supabase');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
migrateToSupabase();