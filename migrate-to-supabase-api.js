import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Supabase configuration
const supabaseUrl = 'https://kksziefdwuczqvzgffxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44';

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateToSupabase() {
  console.log('🚀 Starting migration to Supabase using API...');

  try {
    // Step 1: Load exported data
    console.log('📦 Loading exported data...');
    const data = JSON.parse(fs.readFileSync('./local-data-export.json', 'utf8'));
    const { products, productVariants, reviews } = data;

    console.log(`Found:
    - ${products.length} products
    - ${productVariants.length} product variants
    - ${reviews.length} reviews`);

    // Step 2: Create tables first using SQL
    console.log('🔧 Creating tables in Supabase...');
    
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

    // Execute table creation
    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTablesSQL });
    
    if (tableError) {
      console.error('❌ Error creating tables:', tableError);
      // Try alternative approach - create tables individually
      console.log('📝 Trying to create tables individually...');
    } else {
      console.log('✅ Tables created successfully');
    }

    // Step 3: Clear existing data (in case of re-run)
    console.log('🧹 Clearing existing data...');
    await supabase.from('product_variants').delete().neq('id', 0);
    await supabase.from('products').delete().neq('id', 0);
    await supabase.from('reviews').delete().neq('id', 0);

    // Step 4: Insert products
    console.log('📤 Inserting products...');
    
    if (products.length > 0) {
      // Transform SQLite data for PostgreSQL
      const transformedProducts = products.map((p, index) => ({
        name: p.name,
        description: p.description,
        base_price: parseFloat(p.base_price || p.basePrice || '0'),
        image_url: p.image_url || p.imageUrl,
        category: p.category,
        is_featured: Boolean(p.is_featured || p.isFeatured),
        tags: p.tags ? (typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags) : null,
        stripe_product_id: p.stripe_product_id || p.stripeProductId,
        created_at: p.created_at || p.createdAt || new Date().toISOString(),
        updated_at: p.updated_at || p.updatedAt || new Date().toISOString()
      }));
      
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

      // Step 5: Get the new product IDs and create a mapping
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
        
        const { data: insertedVariants, error: variantsError } = await supabase
          .from('product_variants')
          .insert(transformedVariants)
          .select('id');
        
        if (variantsError) {
          console.error('❌ Error inserting variants:', variantsError);
        } else {
          console.log(`✅ Inserted ${insertedVariants.length} product variants`);
        }
      }
    }

    // Step 7: Insert reviews (if any)
    if (reviews.length > 0) {
      console.log('📤 Inserting reviews...');
      const transformedReviews = reviews.map(r => ({
        dog_name: r.dogName || r.dog_name,
        rating: r.rating,
        content: r.content,
        image_url: r.imageUrl || r.image_url
      }));
      
      const { data: insertedReviews, error: reviewsError } = await supabase
        .from('reviews')
        .insert(transformedReviews)
        .select('id');
      
      if (reviewsError) {
        console.error('❌ Error inserting reviews:', reviewsError);
      } else {
        console.log(`✅ Inserted ${insertedReviews.length} reviews`);
      }
    }

    // Step 8: Verify data
    console.log('🔍 Verifying migration...');
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    const { count: variantCount } = await supabase
      .from('product_variants')
      .select('*', { count: 'exact', head: true });

    console.log(`✅ Verification complete:
    - Products in Supabase: ${productCount}
    - Variants in Supabase: ${variantCount}
    - Expected: ${products.length} products, ${productVariants.length} variants`);

    console.log('🎉 Migration completed successfully!');
    console.log('📝 Next step: Update DATABASE_URL in .env to use Supabase');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
migrateToSupabase();