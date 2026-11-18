import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kksziefdwuczqvzgffxn.supabase.co',
  process.env.SUPABASE_ANON_KEY
);

const BASE = '/images/products/christmas-dog-cards';

const designs = [
  { key: 'we-woof-you-dogs',    name: 'We Woof You A Merry Christmas (Dogs)', sku: 'CARD-XMAS-DOGS',        inventory: 3 },
  { key: 'we-woof-you-tree',    name: 'We Woof You A Merry Christmas (Tree)', sku: 'CARD-XMAS-TREE',        inventory: 1 },
  { key: 'happy-howlidays',     name: 'Happy Howlidays',                      sku: 'CARD-XMAS-HOWLIDAYS',   inventory: 1 },
  { key: 'gluten-free-joke',    name: 'This Christmas Card Is Gluten Free',   sku: 'CARD-XMAS-GLUTENFREE',  inventory: 1 },
  { key: 'working-with-me-gift',name: 'Working With Me Every Day Is Your Gift', sku: 'CARD-XMAS-WORKGIFT', inventory: 1 },
  { key: 'pawsome-dad',         name: 'Merry Christmas Pawsome Dad',          sku: 'CARD-XMAS-PAWSOMEDAD', inventory: 1 },
];

const product = {
  name: 'Christmas Dog Cards',
  description: 'Hand-picked Christmas greeting cards for dog lovers. Pick your favourite design at checkout.',
  base_price: 3.80,
  image_url: `${BASE}/${designs[0].key}.jpg`,
  image_urls: designs.map(d => `${BASE}/${d.key}.jpg`),
  category: 'treat', // DB check constraint only allows box/cake/treat
  is_featured: true,
  tags: ['christmas', 'card', 'dog', 'seasonal', 'gift'],
};

const { data: inserted, error: prodErr } = await supabase
  .from('products')
  .insert(product)
  .select('id')
  .single();

if (prodErr) {
  console.error('PRODUCT INSERT FAILED:', JSON.stringify(prodErr));
  process.exit(1);
}

console.log('Inserted product id:', inserted.id);

for (const d of designs) {
  const variant = {
    product_id: inserted.id,
    sku: d.sku,
    name: d.name,
    price: 3.80,
    price_adjustment: 0,
    inventory: d.inventory,
    is_active: true,
    variant_data: {
      option1Name: 'Design',
      option2Name: null,
      option3Name: null,
      option1Value: d.name,
      option2Value: null,
      option3Value: null,
    },
    image_url: `${BASE}/${d.key}.jpg`,
    shipping_required: true,
  };
  const { error } = await supabase.from('product_variants').insert(variant);
  if (error) {
    console.error(`VARIANT FAILED (${d.sku}):`, JSON.stringify(error));
  } else {
    console.log(`Inserted variant: ${d.name} (stock ${d.inventory})`);
  }
}
