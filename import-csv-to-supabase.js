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
    console.log('🚀 Starting CSV import to Supabase...');
    
    // Read and parse CSV
    const csvPath = '/home/errr/Downloads/products_clean.csv';
    const csvText = fs.readFileSync(csvPath, 'utf-8');
    const rows = parseCSV(csvText);
    
    console.log(`📦 Found ${rows.length} CSV rows`);
    
    // Group variants by product handle
    const productGroups = {};
    rows.forEach(row => {
      if (row.Handle && row.Handle.trim()) {
        if (!productGroups[row.Handle]) {
          productGroups[row.Handle] = [];
        }
        productGroups[row.Handle].push(row);
      }
    });
    
    console.log(`🏷️  Found ${Object.keys(productGroups).length} unique products`);
    
    // Clear existing products
    console.log('🧹 Clearing existing products...');
    await supabase.from('product_variants').delete().neq('id', 0);
    await supabase.from('products').delete().neq('id', 0);
    
    // Import each product group
    for (const [handle, productRows] of Object.entries(productGroups)) {
      const mainRow = productRows.find(r => r.Title) || productRows[0];
      if (!mainRow || !mainRow.Title) continue;
      
      console.log(`📦 Processing: ${mainRow.Title}`);
      
      // Determine category
      let category = 'treat';
      if (handle.includes('cake')) category = 'cake';
      if (handle.includes('box')) category = 'box';
      if (handle.includes('pupcake')) category = 'cake';
      if (handle.includes('dognut')) category = 'treat';
      
      // Get base price (lowest variant price)
      const basePrice = productRows.reduce((min, row) => {
        const price = parseFloat(row['Variant Price'] || '0');
        return price > 0 && price < min ? price : min;
      }, 999999);
      
      // Create product
      const productData = {
        name: mainRow.Title,
        description: mainRow['Body (HTML)']?.replace(/<[^>]*>/g, '') || mainRow.Title,
        base_price: basePrice === 999999 ? 0 : basePrice,
        image_url: mainRow['Image Src'] || 'https://placehold.co/400x400',
        category,
        is_featured: mainRow.Tags?.toLowerCase().includes('featured') || false,
        tags: mainRow.Tags ? mainRow.Tags.split(', ') : null,
        stripe_product_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: insertedProducts, error: productError } = await supabase
        .from('products')
        .insert([productData])
        .select('id')
        .single();
      
      if (productError) {
        console.error(`❌ Error creating product ${mainRow.Title}:`, productError);
        continue;
      }
      
      const productId = insertedProducts.id;
      console.log(`✅ Created product: ${mainRow.Title} (ID: ${productId})`);
      
      // Create variants
      const variants = [];
      for (const row of productRows) {
        const variantPrice = parseFloat(row['Variant Price'] || '0');
        if (variantPrice <= 0) continue;
        
        // Build variant data
        const variantData = {};
        if (row['Option1 Name'] && row['Option1 Value']) {
          variantData[row['Option1 Name']] = row['Option1 Value'];
        }
        if (row['Option2 Name'] && row['Option2 Value']) {
          variantData[row['Option2 Name']] = row['Option2 Value'];
        }
        if (row['Option3 Name'] && row['Option3 Value']) {
          variantData[row['Option3 Name']] = row['Option3 Value'];
        }
        
        // Build variant name
        const variantName = [
          row['Option1 Value'],
          row['Option2 Value'],
          row['Option3 Value']
        ].filter(Boolean).join(' - ') || mainRow.Title;
        
        const variant = {
          product_id: productId,
          sku: row['Variant SKU'] || `${handle}-${Date.now()}`,
          name: variantName,
          price: variantPrice,
          price_adjustment: variantPrice - basePrice,
          inventory: 100,
          is_active: row.Status !== 'draft',
          variant_data: Object.keys(variantData).length > 0 ? variantData : null,
          image_url: row['Image Src'] || productData.image_url,
          stripe_price_id: null,
          shipping_required: !['pupcakes', 'dognuts'].includes(handle),
          weight: 200,
          created_at: new Date().toISOString()
        };
        
        variants.push(variant);
      }
      
      if (variants.length > 0) {
        const { data: insertedVariants, error: variantError } = await supabase
          .from('product_variants')
          .insert(variants)
          .select('id');
        
        if (variantError) {
          console.error(`❌ Error creating variants for ${mainRow.Title}:`, variantError);
        } else {
          console.log(`   ✅ Created ${insertedVariants.length} variants`);
        }
      }
    }
    
    // Verify import
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    const { count: variantCount } = await supabase
      .from('product_variants')  
      .select('*', { count: 'exact', head: true });
    
    console.log(`🎉 Import completed successfully!`);
    console.log(`📊 Final counts:`);
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Variants: ${variantCount}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the import
importProducts();