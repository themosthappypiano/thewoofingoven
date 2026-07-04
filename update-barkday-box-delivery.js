import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://kksziefdwuczqvzgffxn.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44';

const supabase = createClient(supabaseUrl, supabaseKey);

const barkdayBoxImageUrl = '/images/products/barkday-box/barkday-box-haze.jpeg';
const barkdayBoxImageUrls = [
  barkdayBoxImageUrl,
  '/images/products/barkday-box/barkday-box-winnie.jpeg',
  '/images/products/barkday-box/barkday-box-charlie.jpeg',
  '/images/products/barkday-box/barkday-box-archie-close.jpeg',
  '/images/products/barkday-box/barkday-box-ruru.jpeg',
  '/images/products/barkday-box/barkday-box-ellie.jpeg',
  '/images/products/barkday-box/barkday-box-frankie.jpeg',
];

const variants = [
  {
    sku: 'BOX-DELIVER',
    name: 'Delivery - Barkday Box',
    price: '40.00',
    shipping_required: true,
    variant_data: { Delivery: 'Delivery', DeliveryIncluded: true },
  },
  {
    sku: 'BOX-COLLECT',
    name: 'Collection - Barkday Box - Standard',
    price: '30.00',
    shipping_required: false,
    variant_data: { Delivery: 'Collection' },
  },
];

const duplicateSkusCreatedByEarlierRun = [
  'BARKDAY-BOX-DELIVERY',
  'BARKDAY-BOX-COLLECTION',
];

async function upsertVariant(productId, variant) {
  const payload = {
    product_id: productId,
    ...variant,
    price_adjustment: '0.00',
    inventory: 100,
    is_active: true,
    image_url: barkdayBoxImageUrl,
    weight: null,
  };

  const { data: existingBySku, error: skuError } = await supabase
    .from('product_variants')
    .select('id')
    .eq('sku', variant.sku)
    .maybeSingle();

  if (skuError) throw skuError;

  if (existingBySku) {
    const { error } = await supabase
      .from('product_variants')
      .update(payload)
      .eq('id', existingBySku.id);
    if (error) throw error;
    console.log(`Updated ${variant.name}`);
    return;
  }

  const { data: existingByName, error: nameError } = await supabase
    .from('product_variants')
    .select('id')
    .eq('product_id', productId)
    .eq('name', variant.name)
    .maybeSingle();

  if (nameError) throw nameError;

  if (existingByName) {
    const { error } = await supabase
      .from('product_variants')
      .update(payload)
      .eq('id', existingByName.id);
    if (error) throw error;
    console.log(`Updated ${variant.name}`);
    return;
  }

  const { error } = await supabase.from('product_variants').insert(payload);
  if (error) throw error;
  console.log(`Inserted ${variant.name}`);
}

async function main() {
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id')
    .eq('name', 'Barkday Box')
    .maybeSingle();

  if (productError) throw productError;
  if (!product) throw new Error('Barkday Box product was not found in Supabase.');

  const { error: productUpdateError } = await supabase
    .from('products')
    .update({
      base_price: '40.00',
      image_url: barkdayBoxImageUrl,
      image_urls: barkdayBoxImageUrls,
    })
    .eq('id', product.id);

  if (productUpdateError) throw productUpdateError;

  for (const variant of variants) {
    await upsertVariant(product.id, variant);
  }

  const { error: cleanupError } = await supabase
    .from('product_variants')
    .delete()
    .eq('product_id', product.id)
    .in('sku', duplicateSkusCreatedByEarlierRun);

  if (cleanupError) throw cleanupError;

  const { data: updatedVariants, error: verifyError } = await supabase
    .from('product_variants')
    .select('name, price, shipping_required')
    .eq('product_id', product.id)
    .in('sku', ['BOX-COLLECT', 'BOX-DELIVER'])
    .order('price');

  if (verifyError) throw verifyError;

  console.log('\nCurrent Barkday Box variants:');
  for (const variant of updatedVariants || []) {
    console.log(`${variant.name}: EUR ${Number(variant.price).toFixed(2)} / shippingRequired=${variant.shipping_required}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
