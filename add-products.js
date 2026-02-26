import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kksziefdwuczqvzgffxn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44'
);

const products = [
  {
    name: 'Barkday Box',
    description: 'Apple & Peanut Butter biscuit barkday box. Collection or delivery option available.',
    basePrice: '30.00',
    imageUrl: 'https://i.ibb.co/0gpzNsx/image.png',
    imageUrls: [
      'https://i.ibb.co/0gpzNsx/image.png',
      'https://i.ibb.co/x8PrBc28/image.png',
      'https://i.ibb.co/jPy7JDvm/image.png'
    ],
    category: 'box',
    isFeatured: true,
    tags: ["barkday", "birthday", "celebration", "gift box"]
  },
  {
    name: 'Woofles',
    description: 'Grain-free carrot waffles. Choose single pack or multi-pack.',
    basePrice: '7.00',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0970/6799/1383/files/hmmmm.jpg?v=1765216392',
    imageUrls: [
      'https://i.ibb.co/sTX4gCq/image.png',
      'https://i.ibb.co/S4sd2DGB/image.png',
      'https://i.ibb.co/VYfcVtXy/image.png',
      'https://i.ibb.co/bj4YCFwx/image.png'
    ],
    category: 'treat',
    isFeatured: true,
    tags: ["woofles", "grain-free", "carrot", "chickpea"]
  },
  {
    name: 'Training Treats',
    description: 'Pee-Nutz, Tuna Puffs, and Cheesy Bites training treats. 120g packs with multi-pack savings.',
    basePrice: '7.00',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0970/6799/1383/files/WhatsAppImage2025-10-15at22.00.56_3_eed392a1-7628-4abb-be3b-7ecc65ce2f51.jpg?v=1765216389',
    category: 'treat',
    isFeatured: false,
    tags: ["training", "treats", "packs"]
  },
  {
    name: 'Doggy Birthday Cake',
    description: 'Birthday cakes in 3, 4, and 6 inch sizes with protein or non-protein bases. Standard, personalised, and drip designs available.',
    basePrice: '35.00',
    imageUrl: 'https://cdn.shopify.com/s/files/1/0970/6799/1383/files/WhatsAppImage2025-10-15at21.35.32_4.jpg?v=1765216387',
    category: 'cake',
    isFeatured: true,
    tags: ["birthday cake", "celebration", "dog cake", "custom", "pawty"]
  },
  {
    name: 'Pupcakes',
    description: 'Apple & Carrot pupcakes in celebration box sizes. Collection only.',
    basePrice: '7.20',
    imageUrl: 'https://placehold.co/800x800?text=Pupcakes',
    category: 'cake',
    isFeatured: false,
    tags: ["pupcakes", "apple", "carrot"]
  },
  {
    name: 'Dognuts',
    description: 'Banana & peanut butter dognuts. Price is per dognut. Minimum order 6.',
    basePrice: '3.30',
    imageUrl: 'https://placehold.co/800x800?text=Dognuts',
    category: 'treat',
    isFeatured: false,
    tags: ["dognuts", "donuts", "banana", "peanut butter"]
  },
  // Special Cakes and Seasonal Treats removed per latest catalog
];

for (const product of products) {
  try {
    const { error } = await supabase.from('products').insert(product);
    if (error) throw error;
    console.log(`✅ Added: ${product.name}`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}
