// Fix protein flavor pricing - the website needs to know which flavors are protein
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kksziefdwuczqvzgffxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixProteinPricing() {
  console.log('🥩 Fixing protein flavor pricing...\n');

  // Get all cake variants to see what we have
  const { data: allVariants } = await supabase
    .from('product_variants')
    .select('*')
    .like('name', '%Red Velvet%')
    .or('name.like.%Chicken%');

  console.log('Found protein flavor variants:');
  allVariants?.forEach(v => {
    console.log(`- "${v.name}": €${v.price}`);
  });

  // Protein flavor pricing fixes based on your structure:
  // 3" protein: €40 (non-personalised), €42 (personalised) 
  // 4" protein: €45 (non-personalised), €50 (personalised), €60 (drip)
  // 6" protein: €55 (non-personalised), €55 (personalised), €65 (drip)

  const proteinPriceFixes = [
    // 3" protein flavors
    { pattern: '%Red Velvet%3 inch%', excludePattern: 'Drip%', expectedPrice: 40 },
    { pattern: '%Chicken & Spinach%3 inch%', excludePattern: 'Drip%', expectedPrice: 40 },
    
    // 4" protein flavors  
    { pattern: '%Red Velvet%4 inch%', excludePattern: 'Drip%', excludePattern2: 'Personalised%', expectedPrice: 45 },
    { pattern: '%Chicken & Spinach%4 inch%', excludePattern: 'Drip%', excludePattern2: 'Personalised%', expectedPrice: 45 },
    { pattern: '%Red Velvet%4 inch%Personalised%', excludePattern: 'Drip%', expectedPrice: 50 },
    { pattern: '%Chicken & Spinach%4 inch%Personalised%', excludePattern: 'Drip%', expectedPrice: 50 },
    
    // 6" protein flavors
    { pattern: '%Red Velvet%6 inch%', excludePattern: 'Drip%', expectedPrice: 55 },
    { pattern: '%Chicken & Spinach%6 inch%', excludePattern: 'Drip%', expectedPrice: 55 },
  ];

  for (const fix of proteinPriceFixes) {
    let query = supabase
      .from('product_variants')
      .select('id, name, price')
      .like('name', fix.pattern);
      
    if (fix.excludePattern) {
      query = query.not('name', 'like', fix.excludePattern);
    }
    if (fix.excludePattern2) {
      query = query.not('name', 'like', fix.excludePattern2);
    }

    const { data: variants } = await query;
    
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        if (variant.price !== fix.expectedPrice) {
          console.log(`🔧 Updating "${variant.name}" from €${variant.price} → €${fix.expectedPrice}`);
          
          const { error } = await supabase
            .from('product_variants')
            .update({ price: fix.expectedPrice })
            .eq('id', variant.id);
            
          if (error) {
            console.error(`❌ Error updating ${variant.name}:`, error.message);
          } else {
            console.log(`✅ Updated successfully`);
          }
        } else {
          console.log(`✓ "${variant.name}" already correctly priced at €${variant.price}`);
        }
      }
    }
  }

  // Now check specific problematic variants
  console.log('\n🔍 Checking specific Red Velvet 3" variants...\n');
  
  const { data: redVelvet3inch } = await supabase
    .from('product_variants')
    .select('id, name, price')
    .like('name', '%Red Velvet%3 inch%')
    .not('name', 'like', '%Drip%');

  redVelvet3inch?.forEach(variant => {
    console.log(`🎂 "${variant.name}": €${variant.price}`);
  });

  console.log('\n✅ Protein pricing fix complete!');
}

fixProteinPricing();