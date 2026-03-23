import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kksziefdwuczqvzgffxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVariantData() {
  console.log('🔍 Checking variant_data structure...\n');

  const { data } = await supabase
    .from('product_variants')
    .select('name, variant_data')
    .like('name', '%Red Velvet%3 inch%')
    .limit(2);

  data?.forEach(v => {
    console.log('Name:', v.name);
    console.log('Variant Data:', v.variant_data);
    console.log('---');
  });

  // Also check how the name parsing works
  console.log('\n📝 Testing name parsing...');
  if (data && data.length > 0) {
    const variant = data[0];
    const parts = variant.name.split(' - ').map(part => part.trim());
    console.log('Original name:', variant.name);
    console.log('Parsed parts:', parts);
    console.log('Design (parts[0]):', parts[0]);
    console.log('Flavor (parts[1]):', parts[1]);
    console.log('Size (parts[2]):', parts[2]);
  }
}

checkVariantData();