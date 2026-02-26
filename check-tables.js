import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kksziefdwuczqvzgffxn.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44'
);

async function checkTables() {
  console.log('Checking table structures...');
  
  // Check products table
  console.log('\n1. Products table:');
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .limit(1);
  
  if (productsError) {
    console.log('Products error:', productsError);
  } else {
    console.log('Products sample:', products);
  }

  // Check shopify_products table  
  console.log('\n2. Shopify_products table:');
  const { data: shopify, error: shopifyError } = await supabase
    .from('shopify_products')
    .select('*')
    .limit(1);
    
  if (shopifyError) {
    console.log('Shopify_products error:', shopifyError);
  } else {
    console.log('Shopify_products sample:', shopify);
  }
}

checkTables();