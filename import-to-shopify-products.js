import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Supabase configuration
const supabaseUrl = 'https://kksziefdwuczqvzgffxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44';

const supabase = createClient(supabaseUrl, supabaseKey);

// CSV parsing utility
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/"/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/"/g, ''));
    
    if (values.length >= 5) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      if (row.Handle && row.Handle.length > 1) {
        data.push(row);
      }
    }
  }
  return data;
}

async function importProducts() {
  try {
    console.log('🚀 Starting CSV import to Supabase shopify_products table...');
    
    // Read and parse CSV
    const csvPath = '/home/errr/Downloads/products_clean.csv';
    const csvText = fs.readFileSync(csvPath, 'utf-8');
    const rows = parseCSV(csvText);
    
    console.log(`📦 Found ${rows.length} CSV rows`);
    
    // Clear existing data
    console.log('🧹 Clearing existing products...');
    await supabase.from('shopify_products').delete().neq('id', 0);
    
    // Transform and insert all rows
    const productsToInsert = rows.map(row => ({
      handle: row.Handle || null,
      title: row.Title || null,
      body_html: row['Body (HTML)'] || null,
      vendor: row.Vendor || null,
      type: row.Type || null,
      tags: row.Tags || null,
      published: row.Published === 'true',
      option1_name: row['Option1 Name'] || null,
      option1_value: row['Option1 Value'] || null,
      option2_name: row['Option2 Name'] || null,
      option2_value: row['Option2 Value'] || null,
      option3_name: row['Option3 Name'] || null,
      option3_value: row['Option3 Value'] || null,
      variant_sku: row['Variant SKU'] || null,
      variant_price: row['Variant Price'] ? parseFloat(row['Variant Price']) : null,
      variant_compare_at_price: row['Variant Compare At Price'] ? parseFloat(row['Variant Compare At Price']) : null,
      variant_inventory_policy: row['Variant Inventory Policy'] || null,
      variant_requires_shipping: row['Variant Requires Shipping'] === 'true',
      image_src: row['Image Src'] || null,
      image_position: row['Image Position'] ? parseInt(row['Image Position']) : null,
      image_alt_text: row['Image Alt Text'] || null,
      seo_title: row['SEO Title'] || null,
      seo_description: row['SEO Description'] || null,
      status: row.Status || 'active',
      quantity: row.Quantity ? parseInt(row.Quantity) : null
    }));
    
    console.log(`📤 Importing ${productsToInsert.length} product records...`);
    
    // Insert in chunks to avoid timeout
    const chunkSize = 20;
    let imported = 0;
    
    for (let i = 0; i < productsToInsert.length; i += chunkSize) {
      const chunk = productsToInsert.slice(i, i + chunkSize);
      
      const { data, error } = await supabase
        .from('shopify_products')
        .insert(chunk)
        .select('id');
      
      if (error) {
        console.error(`❌ Error importing chunk ${Math.floor(i/chunkSize) + 1}:`, error);
      } else {
        imported += data.length;
        console.log(`✅ Imported chunk ${Math.floor(i/chunkSize) + 1}: ${data.length} records`);
      }
    }
    
    // Verify import
    const { count: totalCount } = await supabase
      .from('shopify_products')
      .select('*', { count: 'exact', head: true });
    
    const { data: products } = await supabase
      .from('shopify_products')
      .select('handle, title')
      .not('title', 'is', null)
      .order('handle');
      
    console.log(`🎉 Import completed successfully!`);
    console.log(`📊 Total records: ${totalCount}`);
    console.log(`📦 Products imported:`);
    
    const uniqueProducts = {};
    products.forEach(p => {
      if (!uniqueProducts[p.handle]) {
        uniqueProducts[p.handle] = p.title;
      }
    });
    
    Object.entries(uniqueProducts).forEach(([handle, title]) => {
      console.log(`   - ${title} (${handle})`);
    });
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the import
importProducts();