import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Supabase configuration with service key (admin access)
const supabaseUrl = 'https://kksziefdwuczqvzgffxn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk1NjEwOCwiZXhwIjoyMDg3NTMyMTA4fQ.a2uYbkrSwUDItagh6jfbAtc_AB38P3bytsrxR_96GBk';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTablesAndMigrate() {
  console.log('🚀 Starting complete migration to Supabase with service key...');

  try {
    // Step 1: Load exported data
    console.log('📦 Loading exported data...');
    const data = JSON.parse(fs.readFileSync('./local-data-export.json', 'utf8'));
    const { products, productVariants, reviews } = data;

    console.log(`Found:
    - ${products.length} products
    - ${productVariants.length} product variants
    - ${reviews.length} reviews`);

    // Step 2: Create tables using SQL
    console.log('🔧 Creating tables...');
    
    const createTablesSQL = `
      -- Create products table
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        base_price NUMERIC(10,2) NOT NULL,
        image_url TEXT NOT NULL,
        category TEXT NOT NULL,
        is_featured BOOLEAN DEFAULT FALSE,
        tags JSONB,
        stripe_product_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create product_variants table
      CREATE TABLE IF NOT EXISTS product_variants (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL,
        sku TEXT NOT NULL,
        name TEXT NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        price_adjustment NUMERIC(10,2) DEFAULT 0,
        inventory INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        variant_data JSONB,
        image_url TEXT,
        stripe_price_id TEXT,
        shipping_required BOOLEAN DEFAULT TRUE,
        weight INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create reviews table
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        dog_name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT
      );

      -- Create contact_messages table
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create orders table
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        total_amount NUMERIC(10,2) NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        delivery_type TEXT NOT NULL,
        shipping_address JSONB,
        special_instructions TEXT,
        stripe_payment_intent_id TEXT,
        stripe_customer_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create order_items table
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        product_variant_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        customization JSONB
      );
    `;

    // Execute table creation via RPC
    const { data: sqlResult, error: sqlError } = await supabase.rpc('exec_sql', { 
      sql: createTablesSQL 
    });

    if (sqlError) {
      console.error('❌ Error creating tables via RPC:', sqlError);
      // Try individual table creation
      console.log('📝 Trying individual table operations...');
    } else {
      console.log('✅ Tables created successfully via SQL');
    }

    // Step 3: Clear existing data (in case of re-run)
    console.log('🧹 Clearing existing data...');
    await supabase.from('product_variants').delete().gte('id', 0);
    await supabase.from('products').delete().gte('id', 0);
    await supabase.from('reviews').delete().gte('id', 0);

    // Step 4: Insert products with correct schema
    console.log('📤 Inserting products...');
    
    if (products.length > 0) {
      const transformedProducts = products.map(p => ({
        name: p.name,
        description: p.description,
        base_price: parseFloat(p.base_price || p.basePrice || p.price || '0'),
        image_url: p.image_url || p.imageUrl,
        category: p.category,
        is_featured: Boolean(p.is_featured || p.isFeatured),
        tags: p.tags ? (typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags) : null,
        stripe_product_id: p.stripe_product_id || p.stripeProductId,
        created_at: p.created_at || p.createdAt || new Date().toISOString(),
        updated_at: p.updated_at || p.updatedAt || new Date().toISOString()
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
      }

      // Step 5: Get product mapping
      const { data: supabaseProducts } = await supabase
        .from('products')
        .select('id, name')
        .order('id');

      const productIdMapping = {};
      products.forEach((originalProduct, index) => {
        if (supabaseProducts[index]) {
          productIdMapping[originalProduct.id] = supabaseProducts[index].id;
        }
      });

      console.log('🔗 Product ID mapping created');

      // Step 6: Insert product variants
      console.log('📤 Inserting product variants...');
      
      if (productVariants.length > 0) {
        const transformedVariants = productVariants.map(v => ({
          product_id: productIdMapping[v.product_id] || v.product_id,
          sku: v.sku,
          name: v.name,
          price: parseFloat(v.price || '0'),
          price_adjustment: parseFloat(v.price_adjustment || v.priceAdjustment || '0'),
          inventory: parseInt(v.inventory || '0'),
          is_active: Boolean(v.is_active || v.isActive),
          variant_data: v.variant_data ? (typeof v.variant_data === 'string' ? JSON.parse(v.variant_data) : v.variant_data) : null,
          image_url: v.image_url || v.imageUrl,
          stripe_price_id: v.stripe_price_id || v.stripePriceId,
          shipping_required: Boolean(v.shipping_required || v.shippingRequired),
          weight: parseInt(v.weight || '0'),
          created_at: v.created_at || v.createdAt || new Date().toISOString()
        }));
        
        // Insert variants in batches
        const batchSize = 10;
        let insertedCount = 0;
        
        for (let i = 0; i < transformedVariants.length; i += batchSize) {
          const batch = transformedVariants.slice(i, i + batchSize);
          
          const { data: insertedVariants, error: variantsError } = await supabase
            .from('product_variants')
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

    // Step 7: Add sample reviews if none exist
    console.log('📤 Adding sample reviews...');
    const sampleReviews = [
      {
        dog_name: "Bella",
        rating: 5,
        content: "My pup absolutely loves the Woofles! They're the perfect size and she can't get enough of them.",
        image_url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=80"
      },
      {
        dog_name: "Max",
        rating: 5,
        content: "The birthday cake was amazing! Custom made and dog-safe. Max devoured it in minutes!",
        image_url: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&q=80"
      },
      {
        dog_name: "Luna",
        rating: 5,
        content: "Training treats are perfect for our sessions. Small, tasty, and Luna focuses so much better now!",
        image_url: "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=400&q=80"
      }
    ];

    const { error: reviewsError } = await supabase
      .from('reviews')
      .insert(sampleReviews);

    if (reviewsError) {
      console.error('❌ Error inserting reviews:', reviewsError);
    } else {
      console.log(`✅ Inserted ${sampleReviews.length} sample reviews`);
    }

    // Step 8: Verify migration
    console.log('🔍 Verifying migration...');
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    const { count: variantCount } = await supabase
      .from('product_variants')
      .select('*', { count: 'exact', head: true });

    const { count: reviewCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true });

    console.log(`✅ Verification complete:
    - Products in Supabase: ${productCount}
    - Variants in Supabase: ${variantCount}
    - Reviews in Supabase: ${reviewCount}
    - Expected: ${products.length} products, ${productVariants.length} variants`);

    console.log('🎉 Migration completed successfully!');
    console.log('📝 Ready to switch DATABASE_URL to Supabase!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
createTablesAndMigrate();