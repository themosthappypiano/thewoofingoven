import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  'https://kksziefdwuczqvzgffxn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44'
);

// Better CSV parser that handles multiline quoted fields
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = parseCSVLine(lines[0]);
  
  const data = [];
  let i = 1;
  
  while (i < lines.length) {
    if (!lines[i].trim()) {
      i++;
      continue;
    }
    
    let currentLine = lines[i];
    let inQuotes = false;
    let quoteCount = 0;
    
    // Count quotes to see if we need to read more lines
    for (let char of currentLine) {
      if (char === '"') quoteCount++;
    }
    
    // If odd number of quotes, we have a multiline field
    while (quoteCount % 2 !== 0 && i + 1 < lines.length) {
      i++;
      currentLine += '\n' + lines[i];
      for (let char of lines[i]) {
        if (char === '"') quoteCount++;
      }
    }
    
    const values = parseCSVLine(currentLine);
    
    if (values.length >= headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      if (row.Handle && row.Handle.trim()) {
        data.push(row);
      }
    }
    
    i++;
  }
  
  return data;
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  values.push(current.trim());
  return values;
}

async function importProducts() {
  try {
    console.log('🚀 Starting improved CSV import...');
    
    const csvPath = '/home/errr/Downloads/products_export_1.csv';
    const csvText = fs.readFileSync(csvPath, 'utf-8');
    const rows = parseCSV(csvText);
    
    console.log(`📦 Parsed ${rows.length} valid rows`);
    
    // Clear existing data
    await supabase.from('shopify_products').delete().neq('id', 0);
    
    const normalizeBool = (value) => String(value || '').trim().toLowerCase();
    const isTrue = (value) => ['true', '1', 'yes'].includes(normalizeBool(value));

    const productsToInsert = rows.map(row => ({
      handle: row.Handle || null,
      title: row.Title || null,
      body_html: row['Body (HTML)'] || null,
      vendor: row.Vendor || null,
      product_category: row['Product Category'] || null,
      type: row.Type || null,
      tags: row.Tags || null,
      published: isTrue(row.Published),
      option1_name: row['Option1 Name'] || null,
      option1_value: row['Option1 Value'] || null,
      option2_name: row['Option2 Name'] || null,
      option2_value: row['Option2 Value'] || null,
      option3_name: row['Option3 Name'] || null,
      option3_value: row['Option3 Value'] || null,
      variant_sku: row['Variant SKU'] || null,
      variant_grams: row['Variant Grams'] ? parseFloat(row['Variant Grams']) : null,
      variant_price: row['Variant Price'] ? parseFloat(row['Variant Price']) : null,
      variant_compare_at_price: row['Variant Compare At Price'] ? parseFloat(row['Variant Compare At Price']) : null,
      variant_inventory_tracker: row['Variant Inventory Tracker'] || null,
      variant_inventory_policy: row['Variant Inventory Policy'] || null,
      variant_fulfillment_service: row['Variant Fulfillment Service'] || null,
      variant_requires_shipping: isTrue(row['Variant Requires Shipping']),
      variant_taxable: isTrue(row['Variant Taxable']),
      unit_price_total_measure: row['Unit Price Total Measure'] || null,
      unit_price_total_measure_unit: row['Unit Price Total Measure Unit'] || null,
      unit_price_base_measure: row['Unit Price Base Measure'] || null,
      unit_price_base_measure_unit: row['Unit Price Base Measure Unit'] || null,
      variant_barcode: row['Variant Barcode'] || null,
      image_src: row['Image Src'] || null,
      image_position: row['Image Position'] ? parseInt(row['Image Position']) : null,
      image_alt_text: row['Image Alt Text'] || null,
      gift_card: isTrue(row['Gift Card']),
      seo_title: row['SEO Title'] || null,
      seo_description: row['SEO Description'] || null,
      dog_age_group: row['Dog age group (product.metafields.shopify.dog-age-group)'] || null,
      pet_dietary_requirements: row['Pet dietary requirements (product.metafields.shopify.pet-dietary-requirements)'] || null,
      pet_food_flavor: row['Pet food flavor (product.metafields.shopify.pet-food-flavor)'] || null,
      pet_treat_texture: row['Pet treat texture (product.metafields.shopify.pet-treat-texture)'] || null,
      variant_image: row['Variant Image'] || null,
      variant_weight_unit: row['Variant Weight Unit'] || null,
      variant_tax_code: row['Variant Tax Code'] || null,
      cost_per_item: row['Cost per item'] ? parseFloat(row['Cost per item']) : null,
      status: row.Status || 'active',
      quantity: row.Quantity ? parseInt(row.Quantity) : null
    }));
    
    console.log(`📤 Importing ${productsToInsert.length} records...`);
    
    // Insert in chunks
    const chunkSize = 10;
    let totalImported = 0;
    
    for (let i = 0; i < productsToInsert.length; i += chunkSize) {
      const chunk = productsToInsert.slice(i, i + chunkSize);
      
      const { data, error } = await supabase
        .from('shopify_products')
        .insert(chunk)
        .select('id, handle, title');
      
      if (error) {
        console.error(`❌ Error in chunk ${Math.floor(i/chunkSize) + 1}:`, error);
      } else {
        totalImported += data.length;
        console.log(`✅ Imported chunk ${Math.floor(i/chunkSize) + 1}: ${data.length} records`);
      }
    }
    
    // Show summary
    const { data: summary } = await supabase
      .from('shopify_products')
      .select('handle, title')
      .not('title', 'is', null)
      .order('handle');
      
    const uniqueProducts = {};
    summary.forEach(p => {
      if (p.title && !uniqueProducts[p.handle]) {
        uniqueProducts[p.handle] = p.title;
      }
    });
    
    console.log(`\n🎉 Import completed! ${totalImported} total records`);
    console.log(`📦 Unique products imported:`);
    Object.entries(uniqueProducts).forEach(([handle, title]) => {
      console.log(`   ✓ ${title}`);
    });
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

importProducts();
