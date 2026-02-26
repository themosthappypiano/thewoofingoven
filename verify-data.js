import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kksziefdwuczqvzgffxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  const { data: products } = await supabase.from('products').select('id, name').limit(3);
  const { data: variants } = await supabase.from('product_variants').select('id, sku, name, price').limit(3);
  console.log('✅ Products sample:', products);
  console.log('✅ Variants sample:', variants);
  
  // Test a join query like the app would use
  const { data: joinData, error: joinError } = await supabase
    .from('products')
    .select(`
      *,
      product_variants (*)
    `)
    .limit(1);
    
  console.log('✅ Join query result:', joinData);
  if (joinError) console.log('❌ Join error:', joinError);
}

verify();