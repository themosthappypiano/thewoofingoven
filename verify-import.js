import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kksziefdwuczqvzgffxn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44'
);

async function verifyImport() {
  console.log('🔍 Verifying product import...\n');
  
  // Get unique products
  const { data: products, error } = await supabase
    .from('shopify_products')
    .select('handle, title, variant_price, variant_sku, option1_name, option1_value, option2_name, option2_value')
    .not('title', 'is', null)
    .order('handle, variant_price');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Group by handle
  const productGroups = {};
  products.forEach(p => {
    if (!productGroups[p.handle]) {
      productGroups[p.handle] = [];
    }
    productGroups[p.handle].push(p);
  });
  
  console.log(`✅ Successfully imported ${Object.keys(productGroups).length} products:\n`);
  
  Object.entries(productGroups).forEach(([handle, variants]) => {
    const mainProduct = variants[0];
    console.log(`🎯 ${mainProduct.title}`);
    console.log(`   Handle: ${handle}`);
    console.log(`   Variants: ${variants.length}`);
    
    variants.forEach(v => {
      const variantName = [v.option1_value, v.option2_value].filter(Boolean).join(' - ') || 'Default';
      console.log(`      - ${variantName}: €${v.variant_price} (${v.variant_sku})`);
    });
    console.log('');
  });
}

verifyImport();