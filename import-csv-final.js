import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import csvParser from 'csv-parser';

// Supabase configuration
const supabaseUrl = 'https://kksziefdwuczqvzgffxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44';

const supabase = createClient(supabaseUrl, supabaseKey);

// Path to your CSV file
const csvPath = '/home/errr/Downloads/products_clean.csv';

async function importCSVToSupabase() {
  console.log('🚀 Starting CSV import to Supabase...');
  
  const products = {};
  const variants = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csvParser())
      .on('data', (row) => {
        try {
          const handle = row.Handle?.trim();
          if (!handle) return;
          
          // Create base product if it doesn't exist
          if (!products[handle]) {
            products[handle] = {
              name: row.Title?.trim() || handle,
              description: row['Body (HTML)']?.trim() || '',
              basePrice: row['Variant Price'] || '0',
              imageUrl: row['Image Src']?.trim() || '',
              category: row.Type?.toLowerCase()?.trim() || 'treat',
              isFeatured: false,
              tags: row.Tags ? row.Tags.split(',').map(t => t.trim()) : [],
              stripeProductId: null
            };
          }
          
          // Create variant if price exists
          if (row['Variant Price'] && row['Variant SKU']) {
            const variant = {
              handle: handle, // We'll use this to link to product later
              sku: row['Variant SKU'].trim(),
              name: `${row['Option1 Value'] || 'Default'}${row['Option2 Value'] ? ` - ${row['Option2 Value']}` : ''}${row['Option3 Value'] ? ` - ${row['Option3 Value']}` : ''}`.trim(),
              price: row['Variant Price'],
              priceAdjustment: '0',
              inventory: parseInt(row.Quantity || '0'),
              isActive: true,
              variantData: {
                option1Name: row['Option1 Name'] || null,
                option1Value: row['Option1 Value'] || null,
                option2Name: row['Option2 Name'] || null,
                option2Value: row['Option2 Value'] || null,
                option3Name: row['Option3 Name'] || null,
                option3Value: row['Option3 Value'] || null
              },
              imageUrl: row['Image Src']?.trim() || null,
              stripePriceId: null,
              shippingRequired: row['Variant Requires Shipping']?.toLowerCase() === 'true'
            };
            
            variants.push(variant);
          }
        } catch (error) {
          console.error('Error processing row:', error, row);
        }
      })
      .on('end', async () => {
        try {
          console.log(`📊 Parsed ${Object.keys(products).length} products and ${variants.length} variants`);
          
          // Insert products first
          console.log('📝 Inserting products...');
          const productEntries = Object.entries(products);
          
          for (const [handle, productData] of productEntries) {
            try {
              const { data: existingProduct } = await supabase
                .from('products')
                .select('id, name')
                .eq('name', productData.name)
                .single();
              
              if (existingProduct) {
                console.log(`⏭️ Product "${productData.name}" already exists`);
                products[handle].id = existingProduct.id;
                continue;
              }
              
              const { data: insertedProduct, error: productError } = await supabase
                .from('products')
                .insert({
                  name: productData.name,
                  description: productData.description,
                  basePrice: productData.basePrice,
                  imageUrl: productData.imageUrl,
                  category: productData.category,
                  isFeatured: productData.isFeatured,
                  tags: productData.tags
                })
                .select('id')
                .single();
              
              if (productError) {
                console.error(`❌ Failed to insert product ${productData.name}:`, productError);
                continue;
              }
              
              products[handle].id = insertedProduct.id;
              console.log(`✅ Inserted product: ${productData.name} (ID: ${insertedProduct.id})`);
              
            } catch (error) {
              console.error(`❌ Error with product ${productData.name}:`, error);
            }
          }
          
          // Insert variants
          console.log('🎯 Inserting variants...');
          for (const variant of variants) {
            try {
              const product = products[variant.handle];
              if (!product || !product.id) {
                console.log(`⚠️ Skipping variant ${variant.sku} - no product ID`);
                continue;
              }
              
              const { data: existingVariant } = await supabase
                .from('product_variants')
                .select('id')
                .eq('sku', variant.sku)
                .single();
              
              if (existingVariant) {
                console.log(`⏭️ Variant ${variant.sku} already exists`);
                continue;
              }
              
              const { data: insertedVariant, error: variantError } = await supabase
                .from('product_variants')
                .insert({
                  productId: product.id,
                  sku: variant.sku,
                  name: variant.name,
                  price: variant.price,
                  priceAdjustment: variant.priceAdjustment,
                  inventory: variant.inventory,
                  isActive: variant.isActive,
                  variantData: variant.variantData,
                  imageUrl: variant.imageUrl,
                  stripePriceId: variant.stripePriceId,
                  shippingRequired: variant.shippingRequired
                })
                .select('id')
                .single();
              
              if (variantError) {
                console.error(`❌ Failed to insert variant ${variant.sku}:`, variantError);
                continue;
              }
              
              console.log(`✅ Inserted variant: ${variant.name} (SKU: ${variant.sku})`);
              
            } catch (error) {
              console.error(`❌ Error with variant ${variant.sku}:`, error);
            }
          }
          
          console.log('🎉 Import completed successfully!');
          console.log('📊 Summary:');
          console.log(`   Products: ${Object.keys(products).length}`);
          console.log(`   Variants: ${variants.length}`);
          
          resolve();
        } catch (error) {
          console.error('❌ Import failed:', error);
          reject(error);
        }
      })
      .on('error', reject);
  });
}

// Run the import
importCSVToSupabase()
  .then(() => {
    console.log('✅ Import process finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Import process failed:', error);
    process.exit(1);
  });