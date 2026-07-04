import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://kksziefdwuczqvzgffxn.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44';

const supabase = createClient(supabaseUrl, supabaseKey);

const pupcakeStandardImageUrl = '/images/products/pupcakes/pupcakes-standard-decoration.jpeg';
const pupcakeStandardLargeBoxImageUrl = '/images/products/pupcakes/pupcakes-standard-large-box.jpeg';
const pupcakeBarkdayImageUrl = '/images/products/pupcakes/pupcakes-barkday-non-personalised.png';
const pupcakePersonalisedImageUrls = [
  '/images/products/pupcakes/pupcakes-personalised-marnie-4.png',
  '/images/products/pupcakes/pupcakes-personalised-zeus-5.png',
  '/images/products/pupcakes/pupcakes-personalised-darcy-marnie-4.png',
  '/images/products/pupcakes/pupcakes-personalised-zeus-5-close.png',
];
const pupcakeImageUrls = [
  pupcakeStandardImageUrl,
  pupcakeStandardLargeBoxImageUrl,
  pupcakeBarkdayImageUrl,
  ...pupcakePersonalisedImageUrls,
];

function getPupcakeImageUrl(style, box) {
  if (style === 'Personalised Barkday Pupcakes') {
    return box === 'Box of 4'
      ? pupcakePersonalisedImageUrls[1]
      : pupcakePersonalisedImageUrls[0];
  }

  if (style === 'Barkday Pupcakes') {
    return pupcakeBarkdayImageUrl;
  }

  if (box === 'Box of 12' || box === 'Box of 24') {
    return pupcakeStandardLargeBoxImageUrl;
  }

  return pupcakeStandardImageUrl;
}

const variantGroups = [
  {
    style: 'Standard Decoration',
    skuPrefix: 'PUP-STANDARD',
    variants: [
      ['Box of 2', '7.50'],
      ['Box of 4', '15.00'],
      ['Box of 6', '21.00'],
      ['Box of 12', '42.00'],
      ['Box of 24', '80.00'],
    ],
  },
  {
    style: 'Barkday Pupcakes',
    skuPrefix: 'PUP-BARKDAY',
    variants: [
      ['Box of 2', '10.00'],
      ['Box of 4', '20.00'],
    ],
  },
  {
    style: 'Personalised Barkday Pupcakes',
    skuPrefix: 'PUP-PERSONALISED-BARKDAY',
    variants: [
      ['Box of 2', '12.00'],
      ['Box of 4', '22.00'],
    ],
  },
];

function boxCount(box) {
  return box.replace('Box of ', '');
}

function buildVariant(productId, group, box, price) {
  const imageUrl = getPupcakeImageUrl(group.style, box);

  return {
    product_id: productId,
    sku: `${group.skuPrefix}-${boxCount(box)}`,
    name: `${group.style} - ${box}`,
    price,
    price_adjustment: '0.00',
    inventory: 100,
    is_active: true,
    variant_data: {
      Style: group.style,
      Box: box,
    },
    image_url: imageUrl,
    shipping_required: false,
    weight: null,
  };
}

async function upsertVariant(variant) {
  const { data: existingBySku, error: skuError } = await supabase
    .from('product_variants')
    .select('id, name')
    .eq('sku', variant.sku)
    .maybeSingle();

  if (skuError) throw skuError;

  if (existingBySku) {
    const { error } = await supabase
      .from('product_variants')
      .update(variant)
      .eq('id', existingBySku.id);
    if (error) throw error;
    console.log(`Updated ${variant.name}`);
    return;
  }

  const { data: existingByName, error: nameError } = await supabase
    .from('product_variants')
    .select('id, sku')
    .eq('product_id', variant.product_id)
    .eq('name', variant.name)
    .maybeSingle();

  if (nameError) throw nameError;

  if (existingByName) {
    const { error } = await supabase
      .from('product_variants')
      .update(variant)
      .eq('id', existingByName.id);
    if (error) throw error;
    console.log(`Updated ${variant.name}`);
    return;
  }

  const { error } = await supabase.from('product_variants').insert(variant);
  if (error) throw error;
  console.log(`Inserted ${variant.name}`);
}

async function updateLegacyStandardVariant(productId, box, price) {
  const legacyNames = [box, `Apple & Carrot - ${box} - Pack`];
  const { data: legacyVariants, error } = await supabase
    .from('product_variants')
    .select('id, name')
    .eq('product_id', productId)
    .in('name', legacyNames);

  if (error) throw error;

  for (const variant of legacyVariants || []) {
    const { error: updateError } = await supabase
      .from('product_variants')
      .update({
        price,
        variant_data: {
          Style: 'Standard Decoration',
          Box: box,
        },
        image_url: getPupcakeImageUrl('Standard Decoration', box),
        shipping_required: false,
      })
      .eq('id', variant.id);

    if (updateError) throw updateError;
    console.log(`Updated legacy ${variant.name}`);
  }
}

async function main() {
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, name')
    .eq('name', 'Pupcakes')
    .maybeSingle();

  if (productError) throw productError;
  if (!product) throw new Error('Pupcakes product was not found in Supabase.');

  const { error: productUpdateError } = await supabase
    .from('products')
    .update({
      base_price: '7.50',
      image_url: pupcakeStandardImageUrl,
      image_urls: pupcakeImageUrls,
    })
    .eq('id', product.id);

  if (productUpdateError) throw productUpdateError;

  for (const group of variantGroups) {
    for (const [box, price] of group.variants) {
      if (group.style === 'Standard Decoration') {
        await updateLegacyStandardVariant(product.id, box, price);
      }

      await upsertVariant(buildVariant(product.id, group, box, price));
    }
  }

  const { data: updatedVariants, error: verifyError } = await supabase
    .from('product_variants')
    .select('name, price, variant_data')
    .eq('product_id', product.id)
    .order('price');

  if (verifyError) throw verifyError;

  console.log('\nCurrent Pupcakes variants:');
  for (const variant of updatedVariants || []) {
    console.log(`${variant.name}: EUR ${Number(variant.price).toFixed(2)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
