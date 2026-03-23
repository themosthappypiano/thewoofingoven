// Fix ALL protein flavor pricing for ALL design types
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kksziefdwuczqvzgffxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAllProteinDesigns() {
  console.log('🥩 Fixing protein flavor pricing for ALL design types...\n');

  // Get ALL variants with protein flavors
  const { data: proteinVariants } = await supabase
    .from('product_variants')
    .select('*')
    .or('name.like.%Red Velvet%,name.like.%Chicken & Spinach%')
    .order('name');

  console.log(`Found ${proteinVariants?.length} protein variants to check:\n`);

  // Define the correct pricing structure for protein flavors
  const proteinPricingRules = [
    // 3 inch protein cakes
    { size: '3 inch', design: 'Non-Personalised', correctPrice: 40 },
    { size: '3 inch', design: 'Personalised', correctPrice: 42 },
    // Note: No drip design for 3 inch
    
    // 4 inch protein cakes  
    { size: '4 inch', design: 'Non-Personalised', correctPrice: 45 },
    { size: '4 inch', design: 'Personalised', correctPrice: 50 },
    { size: '4 inch', design: 'Drip', correctPrice: 60 },
    
    // 6 inch protein cakes
    { size: '6 inch', design: 'Non-Personalised', correctPrice: 55 },
    { size: '6 inch', design: 'Personalised', correctPrice: 55 }, // Same price for 6"
    { size: '6 inch', design: 'Drip', correctPrice: 65 },
  ];

  let updatesCount = 0;

  for (const variant of proteinVariants || []) {
    // Determine which rule applies to this variant
    let applicableRule = null;
    
    for (const rule of proteinPricingRules) {
      if (variant.name.includes(rule.size)) {
        if ((rule.design === 'Non-Personalised' && variant.name.includes('Non-Personalised')) ||
            (rule.design === 'Personalised' && variant.name.includes('Personalised Name')) ||
            (rule.design === 'Drip' && variant.name.includes('Drip Design'))) {
          applicableRule = rule;
          break;
        }
      }
    }

    if (applicableRule) {
      if (variant.price !== applicableRule.correctPrice) {
        console.log(`🔧 "${variant.name}"`);
        console.log(`   Current: €${variant.price} → Correct: €${applicableRule.correctPrice}`);
        
        const { error } = await supabase
          .from('product_variants')
          .update({ price: applicableRule.correctPrice })
          .eq('id', variant.id);
          
        if (error) {
          console.error(`   ❌ Error: ${error.message}`);
        } else {
          console.log(`   ✅ Updated successfully`);
          updatesCount++;
        }
      } else {
        console.log(`✓ "${variant.name}" - €${variant.price} (correct)`);
      }
    } else {
      console.log(`⚠️  No rule found for: "${variant.name}"`);
    }
  }

  console.log(`\n📊 Summary: Updated ${updatesCount} protein variants`);
  
  // Show final pricing for verification
  console.log('\n🎂 Final protein cake pricing:');
  
  const { data: finalCheck } = await supabase
    .from('product_variants')
    .select('name, price')
    .or('name.like.%Red Velvet%,name.like.%Chicken & Spinach%')
    .order('price');

  finalCheck?.forEach(variant => {
    const flavor = variant.name.includes('Red Velvet') ? 'Red Velvet' : 'Chicken & Spinach';
    console.log(`   ${flavor} - ${variant.name}: €${variant.price}`);
  });

  console.log('\n✅ All protein designs pricing fixed!');
}

fixAllProteinDesigns();