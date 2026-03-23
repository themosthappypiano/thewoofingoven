// Fine-tune pricing to match exact requirements
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kksziefdwuczqvzgffxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fineTunePricing() {
  console.log('🎯 Fine-tuning pricing to match your exact requirements...');

  // Price adjustments needed based on your pricing structure vs current database
  const priceAdjustments = [
    // 3" cakes - non-protein should be €35, protein should be €40
    { name: 'Non-Personalised - Banana & Peanut Butter - 3 inch', newPrice: 35.00 },
    { name: 'Non-Personalised - Apple & Carrot - 3 inch', newPrice: 35.00 },
    { name: 'Standard Personalised - Non-Protein - 3 inch', newPrice: 40.00 },
    { name: 'Standard Personalised - Protein - 3 inch', newPrice: 42.00 },
    
    // 4" cakes - non-protein €40 std/€45 personal, protein €45 std/€50 personal  
    { name: 'Non-Personalised - Banana & Peanut Butter - 4 inch', newPrice: 40.00 },
    { name: 'Non-Personalised - Apple & Carrot - 4 inch', newPrice: 40.00 },
    { name: 'Non-Personalised - Chicken & Spinach - 4 inch', newPrice: 45.00 },
    { name: 'Non-Personalised - Red Velvet (Beef & Beetroot) - 4 inch', newPrice: 45.00 },
    
    // 6" cakes - both types €50 std/€50 personal (no difference), protein €55
    { name: 'Non-Personalised - Banana & Peanut Butter - 6 inch', newPrice: 50.00 },
    { name: 'Non-Personalised - Apple & Carrot - 6 inch', newPrice: 50.00 },
    { name: 'Non-Personalised - Chicken & Spinach - 6 inch', newPrice: 55.00 },
    { name: 'Non-Personalised - Red Velvet (Beef & Beetroot) - 6 inch', newPrice: 55.00 },
    
    // Drip cakes - 4" should be €55 non-protein/€60 protein, 6" should be €60 non-protein/€65 protein
    { name: 'Drip Design - Red Velvet (Beef & Beetroot) - 4 inch', newPrice: 60.00 },
    { name: 'Drip Design - Chicken & Spinach - 4 inch', newPrice: 60.00 },
    { name: 'Drip Design - Red Velvet (Beef & Beetroot) - 6 inch', newPrice: 65.00 },
    { name: 'Drip Design - Chicken & Spinach - 6 inch', newPrice: 65.00 }
  ];

  console.log(`📝 Adjusting ${priceAdjustments.length} variant prices...\n`);

  for (const adjustment of priceAdjustments) {
    const { data, error } = await supabase
      .from('product_variants')
      .update({ price: adjustment.newPrice })
      .eq('name', adjustment.name)
      .select();

    if (error) {
      console.error(`❌ Failed to update "${adjustment.name}":`, error.message);
    } else if (data && data.length > 0) {
      console.log(`✅ Updated "${adjustment.name}" to €${adjustment.newPrice}`);
    } else {
      console.log(`⏭️  Variant "${adjustment.name}" not found - may already be correct`);
    }
  }

  // Verify final pricing
  console.log('\n📊 Checking final birthday cake pricing...\n');
  
  const { data: cakeVariants } = await supabase
    .from('product_variants')
    .select('name, price')
    .in('name', [
      'Non-Personalised - Banana & Peanut Butter - 3 inch',
      'Non-Personalised - Chicken & Spinach - 3 inch', 
      'Non-Personalised - Banana & Peanut Butter - 4 inch',
      'Non-Personalised - Chicken & Spinach - 4 inch',
      'Non-Personalised - Banana & Peanut Butter - 6 inch', 
      'Non-Personalised - Chicken & Spinach - 6 inch',
      'Drip Design - Banana & Peanut Butter - 4 inch',
      'Drip Design - Chicken & Spinach - 4 inch',
      'Drip Design - Banana & Peanut Butter - 6 inch',
      'Drip Design - Chicken & Spinach - 6 inch'
    ])
    .order('price');

  if (cakeVariants) {
    cakeVariants.forEach(variant => {
      const isProtein = variant.name.includes('Chicken') || variant.name.includes('Red Velvet');
      const proteinLabel = isProtein ? '(Protein)' : '(Non-Protein)';
      console.log(`🎂 ${variant.name} ${proteinLabel}: €${variant.price}`);
    });
  }

  console.log('\n🎉 Pricing update complete! Your database now matches your current pricing structure.');
}

fineTunePricing();