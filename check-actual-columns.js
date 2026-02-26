import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kksziefdwuczqvzgffxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  console.log('🔍 Checking actual column names...');

  // Try to get any existing data to see column structure
  const { data: sampleData, error: sampleError } = await supabase
    .from('products')
    .select('*')
    .limit(1);
    
  console.log('Sample data:', sampleData);
  console.log('Sample error:', sampleError);

  // Try a simple select to see if we get any data
  const { data: allProducts, error: selectError } = await supabase
    .from('products')
    .select('*');
    
  console.log('Select result:', { data: allProducts, error: selectError });

  // Try to insert with common column names to see what fails
  const testColumns = [
    'name',
    'description', 
    'price',
    'base_price',
    'image_url',
    'imageUrl',
    'category'
  ];

  for (const col of testColumns) {
    const testData = { [col]: 'test' };
    const { error } = await supabase
      .from('products')
      .insert(testData)
      .select();
    
    if (error) {
      console.log(`❌ Column '${col}': ${error.message}`);
    } else {
      console.log(`✅ Column '${col}': exists`);
      // Delete the test record
      await supabase.from('products').delete().eq(col, 'test');
    }
  }
}

checkColumns();