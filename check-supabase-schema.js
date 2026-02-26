import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://kksziefdwuczqvzgffxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking existing Supabase schema...');

  try {
    // Try to get a sample from each table to see the column structure
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (!productsError && products) {
      console.log('📋 Products table structure:');
      console.log('Columns found:', Object.keys(products[0] || {}));
    } else {
      console.log('❌ Products table error:', productsError);
    }

    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .limit(1);
    
    if (!variantsError && variants) {
      console.log('📋 Product variants table structure:');
      console.log('Columns found:', Object.keys(variants[0] || {}));
    } else {
      console.log('❌ Product variants table error:', variantsError);
    }

    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .limit(1);
    
    if (!reviewsError && reviews !== null) {
      console.log('📋 Reviews table structure:');
      console.log('Columns found:', Object.keys(reviews[0] || {}));
    } else {
      console.log('❌ Reviews table error:', reviewsError);
    }

    // Test insert with minimal data
    console.log('🧪 Testing minimal insert...');
    const { data: testProduct, error: testError } = await supabase
      .from('products')
      .insert({
        name: 'Test Product',
        description: 'Test Description',
        price: '10.00',
        imageUrl: 'https://example.com/test.jpg',
        category: 'test'
      })
      .select()
      .single();
    
    if (testError) {
      console.log('❌ Test insert failed:', testError);
    } else {
      console.log('✅ Test insert succeeded:', testProduct);
      // Clean up
      await supabase.from('products').delete().eq('id', testProduct.id);
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

// Run the check
checkSchema();