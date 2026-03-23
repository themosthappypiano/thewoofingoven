// Script to update Supabase with correct pricing
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://kksziefdwuczqvzgffxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePricing() {
  try {
    console.log('🚀 Starting pricing update...');

    // Read the SQL file
    const sqlFile = readFileSync('./update-pricing-2024.sql', 'utf8');
    
    // Split into individual statements (rough split, but should work for our SQL)
    const statements = sqlFile
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && s !== 'SELECT');

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      if (statement.includes('CREATE TABLE') || statement.includes('DROP TABLE') || statement.includes('SELECT')) {
        console.log(`⏭️  Skipping statement ${i + 1} (table management/select)`);
        continue;
      }

      console.log(`📤 Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
          // Try alternative approach for updates/inserts
          if (statement.includes('UPDATE products')) {
            console.log('🔄 Trying alternative product update...');
            await updateProductsDirectly();
          } else if (statement.includes('INSERT INTO product_variants')) {
            console.log('🔄 Trying alternative variant insert...');
            await insertVariantsDirectly();
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (execError) {
        console.error(`💥 Execution error for statement ${i + 1}:`, execError.message);
      }
    }

    // Verify the update
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, base_price');

    const { data: variants, error: varError } = await supabase
      .from('product_variants')
      .select('id, product_id, name, price')
      .order('product_id, price');

    if (!prodError && !varError) {
      console.log('\n📊 Current pricing summary:');
      products.forEach(product => {
        console.log(`\n🏷️  ${product.name} (Base: €${product.base_price})`);
        const productVariants = variants.filter(v => v.product_id === product.id);
        productVariants.forEach(variant => {
          console.log(`   - ${variant.name}: €${variant.price}`);
        });
      });
      
      console.log(`\n✅ Update complete! Total: ${products.length} products, ${variants.length} variants`);
    }

  } catch (error) {
    console.error('❌ Update failed:', error);
  }
}

// Alternative direct updates if SQL execution fails
async function updateProductsDirectly() {
  const updates = [
    { name: 'Doggy Birthday Cake', base_price: 35.00 },
    { name: 'Pupcakes', base_price: 7.20 },
    { name: 'Training Treats', base_price: 7.00 },
    { name: 'Woofles', base_price: 7.00 },
    { name: 'Dognuts', base_price: 3.30 },
  ];

  for (const update of updates) {
    const { error } = await supabase
      .from('products')
      .update({ base_price: update.base_price, updated_at: new Date() })
      .eq('name', update.name);
      
    if (error) {
      console.error(`Failed to update ${update.name}:`, error);
    } else {
      console.log(`✅ Updated ${update.name} to €${update.base_price}`);
    }
  }
}

async function insertVariantsDirectly() {
  // Clear existing variants first
  const { error: deleteError } = await supabase
    .from('product_variants')
    .delete()
    .gte('id', 0);

  if (deleteError) {
    console.error('Failed to clear variants:', deleteError);
    return;
  }

  // Get product IDs
  const { data: products } = await supabase
    .from('products')
    .select('id, name');

  if (!products) return;

  const productMap = products.reduce((map, p) => {
    map[p.name] = p.id;
    return map;
  }, {});

  // Insert new variants with correct pricing
  const variants = [
    // Birthday Cakes - 3 inch
    { product_name: 'Doggy Birthday Cake', sku: 'CAKE-BP-3-BASIC', name: 'Non-Personalised - Banana & Peanut Butter - 3 inch', price: 35.00, data: { size: '3 inch', flavor: 'Banana & Peanut Butter', design: 'Non-Personalised' }},
    { product_name: 'Doggy Birthday Cake', sku: 'CAKE-AC-3-BASIC', name: 'Non-Personalised - Apple & Carrot - 3 inch', price: 35.00, data: { size: '3 inch', flavor: 'Apple & Carrot', design: 'Non-Personalised' }},
    { product_name: 'Doggy Birthday Cake', sku: 'CAKE-CS-3-BASIC', name: 'Non-Personalised - Chicken & Spinach - 3 inch', price: 40.00, data: { size: '3 inch', flavor: 'Chicken & Spinach', design: 'Non-Personalised' }},
    
    // Birthday Cakes - 4 inch  
    { product_name: 'Doggy Birthday Cake', sku: 'CAKE-BP-4-BASIC', name: 'Non-Personalised - Banana & Peanut Butter - 4 inch', price: 40.00, data: { size: '4 inch', flavor: 'Banana & Peanut Butter', design: 'Non-Personalised' }},
    { product_name: 'Doggy Birthday Cake', sku: 'CAKE-BP-4-NAME', name: 'Personalised Name - Banana & Peanut Butter - 4 inch', price: 45.00, data: { size: '4 inch', flavor: 'Banana & Peanut Butter', design: 'Personalised Name' }},
    { product_name: 'Doggy Birthday Cake', sku: 'CAKE-BP-4-DRIP', name: 'Drip Design - Banana & Peanut Butter - 4 inch', price: 55.00, data: { size: '4 inch', flavor: 'Banana & Peanut Butter', design: 'Drip Design' }},
    
    // Pupcakes
    { product_name: 'Pupcakes', sku: 'PUPCAKE-2', name: 'Box of 2', price: 7.20, data: { quantity: 2 }},
    { product_name: 'Pupcakes', sku: 'PUPCAKE-4', name: 'Box of 4', price: 14.00, data: { quantity: 4 }},
    { product_name: 'Pupcakes', sku: 'PUPCAKE-6', name: 'Box of 6', price: 20.00, data: { quantity: 6 }},
    
    // Training Treats
    { product_name: 'Training Treats', sku: 'TT-1PACK', name: '1 Pack (120g)', price: 7.00, data: { packs: 1 }},
    { product_name: 'Training Treats', sku: 'TT-4PACK', name: '4 Pack Bundle', price: 25.00, data: { packs: 4 }},
  ];

  for (const variant of variants.slice(0, 10)) { // Insert first 10 as example
    const productId = productMap[variant.product_name];
    if (!productId) continue;

    const { error } = await supabase
      .from('product_variants')
      .insert({
        product_id: productId,
        sku: variant.sku,
        name: variant.name,
        price: variant.price,
        variant_data: variant.data,
        is_active: true,
        inventory: 100,
        shipping_required: false,
        weight: 300,
        created_at: new Date()
      });

    if (error) {
      console.error(`Failed to insert ${variant.name}:`, error);
    } else {
      console.log(`✅ Added ${variant.name} - €${variant.price}`);
    }
  }
}

// Run the update
updatePricing();