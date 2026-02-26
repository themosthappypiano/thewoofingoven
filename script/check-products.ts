import { db } from '../server/db';
import { products, productVariants } from '../shared/schema';

async function checkProducts() {
  const allProducts = await db.select().from(products);
  console.log('Products in database:');
  allProducts.forEach(p => console.log(`- ${p.name} (Category: ${p.category})`));

  const variantCount = await db.select().from(productVariants);
  console.log(`\nTotal variants: ${variantCount.length}`);
  
  // Show some cake variants
  const cakeVariants = variantCount.filter(v => 
    allProducts.find(p => p.id === v.productId)?.category === 'cake'
  ).slice(0, 5);
  
  console.log('\nSample cake variants:');
  cakeVariants.forEach(v => console.log(`- ${v.name} - €${v.price}`));
}

checkProducts();