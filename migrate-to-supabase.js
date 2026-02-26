import Database from 'better-sqlite3';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const { Pool } = pg;

// Supabase configuration
const supabaseUrl = 'https://kksziefdwuczqvzgffxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44';

const supabase = createClient(supabaseUrl, supabaseKey);

// PostgreSQL connection string format for Supabase
const supabaseConnectionString = `postgresql://postgres.kksziefdwuczqvzgffxn:YOUR_PASSWORD@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`;

async function migrateData() {
  console.log('🚀 Starting migration from SQLite to Supabase...');

  try {
    // Step 1: Connect to local SQLite database
    console.log('📦 Opening local SQLite database...');
    const sqlite = new Database('./dev.db');
    
    // Step 2: Extract data from SQLite
    console.log('📋 Extracting data from local database...');
    
    const products = sqlite.prepare('SELECT * FROM products').all();
    const productVariants = sqlite.prepare('SELECT * FROM product_variants').all();
    const reviews = sqlite.prepare('SELECT * FROM reviews').all();
    
    console.log(`Found ${products.length} products, ${productVariants.length} variants, ${reviews.length} reviews`);
    
    // Step 3: Create tables in Supabase using Supabase client
    console.log('🔧 Creating tables in Supabase...');
    
    // Create products table
    const productsTableSQL = `
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
    `;
    
    const productVariantsTableSQL = `
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
    `;
    
    const reviewsTableSQL = `
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        dog_name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT
      );
    `;
    
    // Execute table creation using raw SQL
    await supabase.rpc('exec_sql', { sql: productsTableSQL });
    await supabase.rpc('exec_sql', { sql: productVariantsTableSQL });
    await supabase.rpc('exec_sql', { sql: reviewsTableSQL });
    
    console.log('✅ Tables created successfully');
    
    // Step 4: Insert data into Supabase
    console.log('📤 Inserting products...');
    
    if (products.length > 0) {
      // Transform SQLite data for PostgreSQL
      const transformedProducts = products.map(p => ({
        name: p.name,
        description: p.description,
        base_price: p.basePrice || p.price,
        image_url: p.imageUrl,
        category: p.category,
        is_featured: Boolean(p.isFeatured),
        tags: p.tags ? JSON.parse(p.tags) : null,
        stripe_product_id: p.stripeProductId,
        created_at: p.createdAt || new Date().toISOString(),
        updated_at: p.updatedAt || new Date().toISOString()
      }));
      
      const { error: productsError } = await supabase
        .from('products')
        .insert(transformedProducts);
      
      if (productsError) {
        console.error('❌ Error inserting products:', productsError);
      } else {
        console.log(`✅ Inserted ${products.length} products`);
      }
    }
    
    console.log('📤 Inserting reviews...');
    if (reviews.length > 0) {
      const transformedReviews = reviews.map(r => ({
        dog_name: r.dogName,
        rating: r.rating,
        content: r.content,
        image_url: r.imageUrl
      }));
      
      const { error: reviewsError } = await supabase
        .from('reviews')
        .insert(transformedReviews);
      
      if (reviewsError) {
        console.error('❌ Error inserting reviews:', reviewsError);
      } else {
        console.log(`✅ Inserted ${reviews.length} reviews`);
      }
    }
    
    // Close SQLite connection
    sqlite.close();
    
    console.log('🎉 Migration completed successfully!');
    console.log('📝 Next steps:');
    console.log('1. Update DATABASE_URL in .env to use Supabase connection string');
    console.log('2. Test the application');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
migrateData();