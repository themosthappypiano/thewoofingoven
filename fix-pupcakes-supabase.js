// Fix specific Pupcakes pricing in Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kksziefdwuczqvzgffxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPupcakesPricing() {
  console.log('🚀 Fixing Pupcakes pricing...');
  
  try {
    // Fix variant id 30: "Box of 2" from €6.8 to €7.20
    console.log('📝 Updating variant 30 (Box of 2) from €6.8 to €7.20');
    const { error: error1 } = await supabase
      .from('product_variants')
      .update({ price: 7.20 })
      .eq('id', 30);
    
    if (error1) {
      console.error('❌ Error updating variant 30:', error1);
    } else {
      console.log('✅ Successfully updated variant 30');
    }

    // Fix variant id 31: "Box of 4" from €13 to €14.00  
    console.log('📝 Updating variant 31 (Box of 4) from €13 to €14.00');
    const { error: error2 } = await supabase
      .from('product_variants')
      .update({ price: 14.00 })
      .eq('id', 31);
    
    if (error2) {
      console.error('❌ Error updating variant 31:', error2);
    } else {
      console.log('✅ Successfully updated variant 31');
    }

    // Verify the changes
    console.log('🔍 Verifying changes...');
    const { data: variants, error: fetchError } = await supabase
      .from('product_variants')
      .select('id, name, price')
      .eq('product_id', 23)
      .in('id', [30, 31]);
    
    if (fetchError) {
      console.error('❌ Error fetching variants:', fetchError);
    } else {
      console.log('📊 Updated variants:');
      variants.forEach(variant => {
        console.log(`   - ${variant.name}: €${variant.price}`);
      });
    }
    
    console.log('✅ Pupcakes pricing fix complete!');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

fixPupcakesPricing();