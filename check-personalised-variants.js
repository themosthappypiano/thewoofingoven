// Check if Personalised protein variants exist
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kksziefdwuczqvzgffxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPersonalisedVariants() {
  console.log('🔍 Checking for Personalised protein variants...\n');

  // Check for Personalised Name variants with protein flavors
  const { data: personalised } = await supabase
    .from('product_variants')
    .select('name, price')
    .like('name', '%Personalised Name%')
    .or('name.like.%Red Velvet%,name.like.%Chicken%')
    .order('name');

  console.log('Personalised protein variants found:');
  if (personalised && personalised.length > 0) {
    personalised.forEach(v => console.log(`✓ ${v.name}: €${v.price}`));
  } else {
    console.log('❌ No Personalised protein variants found!');
  }

  // Check what Personalised variants exist at all
  console.log('\n🔍 All Personalised Name variants:');
  const { data: allPersonalised } = await supabase
    .from('product_variants')
    .select('name, price')
    .like('name', '%Personalised Name%')
    .order('price');

  allPersonalised?.forEach(v => {
    const isProtein = v.name.includes('Red Velvet') || v.name.includes('Chicken');
    const label = isProtein ? '(PROTEIN)' : '(non-protein)';
    console.log(`  ${v.name}: €${v.price} ${label}`);
  });

  console.log('\n📊 Missing Personalised protein variants that should exist:');
  const shouldExist = [
    '3 inch protein Personalised: €42',
    '4 inch protein Personalised: €50', 
    '6 inch protein Personalised: €55'
  ];
  shouldExist.forEach(missing => console.log(`❌ ${missing}`));
}

checkPersonalisedVariants();