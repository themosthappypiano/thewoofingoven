// Add missing Personalised Name protein variants
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kksziefdwuczqvzgffxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addMissingPersonalisedProtein() {
  console.log('➕ Adding missing Personalised Name protein variants...\n');

  // Get the Doggy Birthday Cake product ID
  const { data: products } = await supabase
    .from('products')
    .select('id')
    .eq('name', 'Doggy Birthday Cake')
    .single();

  if (!products) {
    console.error('❌ Could not find Doggy Birthday Cake product');
    return;
  }

  const productId = products.id;
  console.log(`🎂 Found Doggy Birthday Cake product ID: ${productId}\n`);

  // Define the missing Personalised protein variants
  const missingVariants = [
    // 3 inch Personalised protein - €42
    {
      sku: 'CAKE-CS-3-NAME',
      name: 'Personalised Name - Chicken & Spinach - 3 inch',
      price: 42.00,
      data: { Design: 'Personalised Name', Flavour: 'Chicken & Spinach', Size: '3 inch', Type: 'protein' },
      weight: 300
    },
    {
      sku: 'CAKE-RV-3-NAME', 
      name: 'Personalised Name - Red Velvet (Beef & Beetroot) - 3 inch',
      price: 42.00,
      data: { Design: 'Personalised Name', Flavour: 'Red Velvet (Beef & Beetroot)', Size: '3 inch', Type: 'protein' },
      weight: 300
    },

    // 4 inch Personalised protein - €50
    {
      sku: 'CAKE-CS-4-NAME',
      name: 'Personalised Name - Chicken & Spinach - 4 inch', 
      price: 50.00,
      data: { Design: 'Personalised Name', Flavour: 'Chicken & Spinach', Size: '4 inch', Type: 'protein' },
      weight: 450
    },
    {
      sku: 'CAKE-RV-4-NAME',
      name: 'Personalised Name - Red Velvet (Beef & Beetroot) - 4 inch',
      price: 50.00,
      data: { Design: 'Personalised Name', Flavour: 'Red Velvet (Beef & Beetroot)', Size: '4 inch', Type: 'protein' },
      weight: 450
    },

    // 6 inch Personalised protein - €55 (same as non-personalised for 6")
    {
      sku: 'CAKE-CS-6-NAME',
      name: 'Personalised Name - Chicken & Spinach - 6 inch',
      price: 55.00,
      data: { Design: 'Personalised Name', Flavour: 'Chicken & Spinach', Size: '6 inch', Type: 'protein' },
      weight: 700
    },
    {
      sku: 'CAKE-RV-6-NAME',
      name: 'Personalised Name - Red Velvet (Beef & Beetroot) - 6 inch',
      price: 55.00,
      data: { Design: 'Personalised Name', Flavour: 'Red Velvet (Beef & Beetroot)', Size: '6 inch', Type: 'protein' },
      weight: 700
    }
  ];

  console.log(`📝 Adding ${missingVariants.length} missing personalised protein variants...\n`);

  for (const variant of missingVariants) {
    // Check if it already exists
    const { data: existing } = await supabase
      .from('product_variants')
      .select('id')
      .eq('sku', variant.sku)
      .single();

    if (existing) {
      console.log(`⏭️  ${variant.name} already exists`);
      continue;
    }

    // Insert the new variant
    const { error } = await supabase
      .from('product_variants')
      .insert({
        product_id: productId,
        sku: variant.sku,
        name: variant.name,
        price: variant.price,
        price_adjustment: variant.price - 35, // Adjustment from base price
        inventory: 20,
        is_active: true,
        variant_data: variant.data,
        image_url: 'https://cdn.shopify.com/s/files/1/0970/6799/1383/files/WhatsAppImage2025-10-15at21.35.32_4.jpg?v=1765216387',
        shipping_required: false,
        weight: variant.weight,
        created_at: new Date()
      });

    if (error) {
      console.error(`❌ Failed to add ${variant.name}:`, error.message);
    } else {
      console.log(`✅ Added ${variant.name}: €${variant.price}`);
    }
  }

  // Verify the additions
  console.log('\n🔍 Verifying all Personalised protein variants now exist...\n');
  
  const { data: allPersonalisedProtein } = await supabase
    .from('product_variants')
    .select('name, price')
    .like('name', '%Personalised Name%')
    .or('name.like.%Red Velvet%,name.like.%Chicken%')
    .order('price');

  console.log('Personalised protein variants:');
  allPersonalisedProtein?.forEach(v => {
    console.log(`✓ ${v.name}: €${v.price}`);
  });

  console.log('\n🎉 All Personalised protein variants are now complete!');
}

addMissingPersonalisedProtein();