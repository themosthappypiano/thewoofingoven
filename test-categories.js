import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kksziefdwuczqvzgffxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCategories() {
  console.log('🧪 Testing category values...');

  const categories = ['treat', 'cake', 'box', 'treats', 'cakes', 'doggy_cakes', 'woofles', 'training_treats', 'pupcakes'];
  
  for (const category of categories) {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: `Test Product ${category}`,
        description: 'Test Description',
        price: '10.00',
        category: category
      })
      .select();
    
    if (error) {
      console.log(`❌ Category '${category}': ${error.message}`);
    } else {
      console.log(`✅ Category '${category}': works`);
      // Clean up
      await supabase.from('products').delete().eq('name', `Test Product ${category}`);
    }
  }
}

testCategories();