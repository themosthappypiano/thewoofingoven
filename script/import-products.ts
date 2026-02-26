import fs from 'fs';
import path from 'path';
import { db } from '../server/db';
import { products, productVariants } from '../shared/schema';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Improved CSV parsing utility
function parseCSV(csvText: string) {
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
          // Double quote escape
          current += '"';
          j++; // Skip next quote
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
    
    // Only process rows that have the right number of columns
    if (values.length >= 5) {
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      // Only include rows with valid Handle
      if (row.Handle && row.Handle.length > 1) {
        data.push(row);
      }
    }
  }
  return data;
}

async function importProducts() {
  try {
    console.log('Reading CSV file...');
    const csvPath = '/home/errr/Downloads/products_clean.csv';
    const csvText = fs.readFileSync(csvPath, 'utf-8');
    
    console.log('Parsing CSV...');
    const rows = parseCSV(csvText);
    
    // Group variants by product handle - import all products from CSV
    const productGroups: { [handle: string]: any[] } = {};
    
    rows.forEach(row => {
      if (row.Handle && row.Handle.trim()) {
        if (!productGroups[row.Handle]) {
          productGroups[row.Handle] = [];
        }
        productGroups[row.Handle].push(row);
      }
    });

    console.log(`Found ${Object.keys(productGroups).length} products`);

    for (const [handle, productRows] of Object.entries(productGroups)) {
      const mainRow = productRows.find(r => r.Title); // First row with title
      if (!mainRow) continue;

      console.log(`Processing ${mainRow.Title}...`);

      // Determine category
      let category = 'treat';
      if (handle.includes('cake')) category = 'cake';
      if (handle.includes('box')) category = 'box';

      // Determine if featured
      const isFeatured = mainRow.Tags?.toLowerCase().includes('featured') || false;

      // Create base product
      const basePrice = productRows.reduce((min, row) => {
        const price = parseFloat(row['Variant Price'] || '0');
        return price > 0 && price < min ? price : min;
      }, 999999);

      const productData = {
        name: mainRow.Title,
        description: mainRow['Body (HTML)']?.replace(/<[^>]*>/g, '') || mainRow.Title,
        basePrice: basePrice.toString(),
        imageUrl: mainRow['Image Src'] || 'https://placehold.co/400x400',
        category,
        isFeatured,
        tags: JSON.stringify(mainRow.Tags?.split(', ') || []),
        stripeProductId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Insert product
      const [insertedProduct] = await db.insert(products).values(productData).returning();
      console.log(`Created product: ${insertedProduct.name}`);

      // Create variants
      for (const row of productRows) {
        const variantPrice = parseFloat(row['Variant Price'] || '0');
        if (variantPrice <= 0) continue;

        const variantData: any = {};
        
        // Build variant data based on options
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

        // Determine shipping requirement
        const shippingRequired = !['pupcakes', 'dognuts'].includes(handle);

        const variant = {
          productId: insertedProduct.id,
          sku: row['Variant SKU'] || `${handle}-${Date.now()}`,
          name: variantName,
          price: variantPrice.toString(),
          priceAdjustment: (variantPrice - basePrice).toString(),
          inventory: 100, // Default inventory
          isActive: row.Status === 'active',
          variantData: JSON.stringify(variantData),
          imageUrl: row['Variant Image'] || row['Image Src'] || productData.imageUrl,
          stripePriceId: null,
          shippingRequired,
          weight: row['Variant Grams'] || '200',
          createdAt: new Date().toISOString(),
        };

        await db.insert(productVariants).values(variant);
        console.log(`  Created variant: ${variantName} - €${variantPrice}`);
      }
    }

    console.log('Product import completed!');

  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

// Run the import
importProducts();