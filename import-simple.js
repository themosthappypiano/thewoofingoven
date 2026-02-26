import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  'https://kksziefdwuczqvzgffxn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44'
);

// Clear existing products first
console.log('Clearing existing products...');
await supabase.from('products').delete().neq('id', 0);

// Read CSV and convert to products
const csvData = fs.readFileSync('/home/errr/Downloads/products_export_1.csv', 'utf8');
const lines = csvData.split('\n');
const headers = lines[0].split(',');

const products = [];
const seen = new Set();

for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(',');
  if (values.length < 2) continue;
  
  const handle = values[0];
  if (!handle || seen.has(handle)) continue;
  
  seen.add(handle);
  
  const product = {
    name: values[1] || handle,
    description: (values[2] || '').replace(/<[^>]*>/g, '').substring(0, 500) || 'Delicious dog treats',
    base_price: (parseFloat(values[23]) || 10.0).toString(),
    image_url: values[32] || 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&q=80&w=800',
    category: values[5]?.toLowerCase().includes('cake') ? 'cake' : 'treat',
    is_featured: values[6]?.toLowerCase().includes('barkday') || false,
    tags: JSON.stringify(values[6]?.split(',').map(t => t.trim()).filter(t => t) || [])
  };
  
  products.push(product);
}

console.log(`Importing ${products.length} products...`);

for (const product of products) {
  try {
    const { error } = await supabase.from('products').insert(product);
    if (error) throw error;
    console.log(`✅ Added: ${product.name}`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

console.log('Done!');