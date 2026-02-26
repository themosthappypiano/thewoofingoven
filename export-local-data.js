import Database from 'better-sqlite3';
import fs from 'fs';

console.log('📦 Exporting data from SQLite database...');

try {
  // Open SQLite database
  const db = new Database('./dev.db');
  
  // Get all data
  const products = db.prepare('SELECT * FROM products').all();
  const productVariants = db.prepare('SELECT * FROM product_variants').all();
  const reviews = db.prepare('SELECT * FROM reviews').all();
  
  console.log(`Found:
  - ${products.length} products
  - ${productVariants.length} product variants  
  - ${reviews.length} reviews`);
  
  // Export data as JSON
  const exportData = {
    products,
    productVariants,
    reviews,
    exportedAt: new Date().toISOString()
  };
  
  fs.writeFileSync('local-data-export.json', JSON.stringify(exportData, null, 2));
  
  console.log('✅ Data exported to local-data-export.json');
  
  // Generate SQL for Supabase
  let sql = `-- Supabase Migration SQL
-- Generated on ${new Date().toISOString()}

-- Create tables
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

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  dog_name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_variant_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  customization JSONB
);

-- Insert data
`;

  // Generate INSERT statements for products
  if (products.length > 0) {
    sql += `\n-- Insert products\n`;
    for (const product of products) {
      sql += `INSERT INTO products (name, description, base_price, image_url, category, is_featured, created_at, updated_at) VALUES (
  '${product.name.replace(/'/g, "''")}',
  '${product.description.replace(/'/g, "''")}',
  ${product.basePrice || product.price || '0'},
  '${product.imageUrl}',
  '${product.category}',
  ${product.isFeatured ? 'TRUE' : 'FALSE'},
  NOW(),
  NOW()
);\n`;
    }
  }

  // Generate INSERT statements for reviews  
  if (reviews.length > 0) {
    sql += `\n-- Insert reviews\n`;
    for (const review of reviews) {
      sql += `INSERT INTO reviews (dog_name, rating, content, image_url) VALUES (
  '${review.dogName.replace(/'/g, "''")}',
  ${review.rating},
  '${review.content.replace(/'/g, "''")}',
  '${review.imageUrl || ''}'
);\n`;
    }
  }

  fs.writeFileSync('supabase-migration.sql', sql);
  
  console.log('✅ SQL migration file created: supabase-migration.sql');
  console.log('📝 Next steps:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Open the SQL editor');
  console.log('3. Copy and run the content of supabase-migration.sql');
  console.log('4. Set your database password in .env file');
  
  db.close();
  
} catch (error) {
  console.error('❌ Error:', error);
}