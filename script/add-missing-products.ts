import { db } from '../server/db';
import { products, productVariants } from '../shared/schema';
import { and, eq } from 'drizzle-orm';

type ProductSeed = {
  name: string;
  description: string;
  basePrice: string;
  imageUrl: string;
  imageUrls?: string[];
  category: 'treat' | 'cake' | 'box';
  isFeatured: boolean;
  tags: string[];
  variants: Array<{
    sku: string;
    name: string;
    price: string;
    priceAdjustment?: string;
    inventory?: number;
    isActive?: boolean;
    variantData?: Record<string, string | number | boolean>;
    imageUrl?: string;
    shippingRequired?: boolean;
    weight?: string;
  }>;
};

const isLocal = (process.env.DATABASE_URL || '').startsWith('file:');
const nowIso = new Date().toISOString();
const nowDate = new Date();

async function upsertProduct(product: ProductSeed) {
  const existing = await db
    .select()
    .from(products)
    .where(eq(products.name, product.name))
    .limit(1);

  const baseData = {
    name: product.name,
    description: product.description,
    basePrice: product.basePrice,
    imageUrl: product.imageUrl,
    imageUrls: product.imageUrls
      ? (isLocal ? JSON.stringify(product.imageUrls) : product.imageUrls)
      : null,
    category: product.category,
    isFeatured: product.isFeatured,
    tags: isLocal ? JSON.stringify(product.tags) : product.tags,
    stripeProductId: null,
    createdAt: isLocal ? nowIso : nowDate,
    updatedAt: isLocal ? nowIso : nowDate,
  };

  if (existing.length) {
    const [updated] = await db
      .update(products)
      .set(baseData)
      .where(eq(products.id, existing[0].id))
      .returning();
    return updated;
  }

  const [inserted] = await db.insert(products).values(baseData).returning();
  return inserted;
}

async function upsertVariant(productId: number, variant: ProductSeed['variants'][number]) {
  const existing = await db
    .select()
    .from(productVariants)
    .where(and(eq(productVariants.productId, productId), eq(productVariants.sku, variant.sku)))
    .limit(1);

  const basePrice = variant.price;
  const priceAdjustment = variant.priceAdjustment ?? '0';
  const variantPayload = {
    productId,
    sku: variant.sku,
    name: variant.name,
    price: basePrice,
    priceAdjustment,
    inventory: variant.inventory ?? 100,
    isActive: variant.isActive ?? true,
    variantData: variant.variantData
      ? (isLocal ? JSON.stringify(variant.variantData) : variant.variantData)
      : null,
    imageUrl: variant.imageUrl ?? null,
    stripePriceId: null,
    shippingRequired: variant.shippingRequired ?? false,
    weight: isLocal ? (variant.weight ?? null) : (variant.weight ? Number(variant.weight) : null),
    createdAt: isLocal ? nowIso : nowDate,
  };

  if (existing.length) {
    await db
      .update(productVariants)
      .set(variantPayload)
      .where(eq(productVariants.id, existing[0].id));
    return;
  }

  await db.insert(productVariants).values(variantPayload);
}

async function addMissingProducts() {
  console.log('Updating products and variants with latest pricing...');

  const defaultImage = 'https://placehold.co/800x800?text=The+Woofing+Oven';
  const cakeImage = 'https://cdn.shopify.com/s/files/1/0970/6799/1383/files/WhatsAppImage2025-10-15at21.35.32_4.jpg?v=1765216387';
  const wooflesImage = 'https://cdn.shopify.com/s/files/1/0970/6799/1383/files/hmmmm.jpg?v=1765216392';
  const wooflesImages = [
    'https://i.ibb.co/sTX4gCq/image.png',
    'https://i.ibb.co/S4sd2DGB/image.png',
    'https://i.ibb.co/VYfcVtXy/image.png',
    'https://i.ibb.co/bj4YCFwx/image.png',
  ];
  const barkdayBoxImage = 'https://i.ibb.co/0gpzNsx/image.png';
  const trainingTreatsImage = 'https://cdn.shopify.com/s/files/1/0970/6799/1383/files/WhatsAppImage2025-10-15at22.00.56_3_eed392a1-7628-4abb-be3b-7ecc65ce2f51.jpg?v=1765216389';

  const productSeeds: ProductSeed[] = [
    {
      name: 'Doggy Birthday Cake',
      description: 'Birthday cakes in 3, 4, and 6 inch sizes with protein or non-protein bases. Standard, personalised, and drip designs available. Delivery is Dublin-only for cakes, or collection.',
      basePrice: '35.00',
      imageUrl: cakeImage,
      category: 'cake',
      isFeatured: true,
      tags: ['birthday cake', 'celebration', 'dog cake', 'custom', 'pawty'],
      variants: [
        { sku: 'CAKE-STD-NP-3', name: 'Standard Non-Personalised - Non-Protein - 3 inch', price: '35.00', variantData: { Design: 'Standard Non-Personalised', Base: 'Non-Protein', Size: '3 inch' }, shippingRequired: true, weight: '300' },
        { sku: 'CAKE-STD-P-3', name: 'Standard Non-Personalised - Protein - 3 inch', price: '40.00', variantData: { Design: 'Standard Non-Personalised', Base: 'Protein', Size: '3 inch' }, shippingRequired: true, weight: '300' },
        { sku: 'CAKE-STD-NP-4', name: 'Standard Non-Personalised - Non-Protein - 4 inch', price: '40.00', variantData: { Design: 'Standard Non-Personalised', Base: 'Non-Protein', Size: '4 inch' }, shippingRequired: true, weight: '450' },
        { sku: 'CAKE-STD-P-4', name: 'Standard Non-Personalised - Protein - 4 inch', price: '45.00', variantData: { Design: 'Standard Non-Personalised', Base: 'Protein', Size: '4 inch' }, shippingRequired: true, weight: '450' },
        { sku: 'CAKE-STD-NP-6', name: 'Standard Non-Personalised - Non-Protein - 6 inch', price: '50.00', variantData: { Design: 'Standard Non-Personalised', Base: 'Non-Protein', Size: '6 inch' }, shippingRequired: true, weight: '700' },
        { sku: 'CAKE-STD-P-6', name: 'Standard Non-Personalised - Protein - 6 inch', price: '55.00', variantData: { Design: 'Standard Non-Personalised', Base: 'Protein', Size: '6 inch' }, shippingRequired: true, weight: '700' },
        { sku: 'CAKE-PERS-NP-3', name: 'Standard Personalised - Non-Protein - 3 inch', price: '40.00', variantData: { Design: 'Standard Personalised', Base: 'Non-Protein', Size: '3 inch' }, shippingRequired: true, weight: '300' },
        { sku: 'CAKE-PERS-P-3', name: 'Standard Personalised - Protein - 3 inch', price: '42.00', variantData: { Design: 'Standard Personalised', Base: 'Protein', Size: '3 inch' }, shippingRequired: true, weight: '300' },
        { sku: 'CAKE-PERS-NP-4', name: 'Standard Personalised - Non-Protein - 4 inch', price: '45.00', variantData: { Design: 'Standard Personalised', Base: 'Non-Protein', Size: '4 inch' }, shippingRequired: true, weight: '450' },
        { sku: 'CAKE-PERS-P-4', name: 'Standard Personalised - Protein - 4 inch', price: '50.00', variantData: { Design: 'Standard Personalised', Base: 'Protein', Size: '4 inch' }, shippingRequired: true, weight: '450' },
        { sku: 'CAKE-PERS-NP-6', name: 'Standard Personalised - Non-Protein - 6 inch', price: '50.00', variantData: { Design: 'Standard Personalised', Base: 'Non-Protein', Size: '6 inch' }, shippingRequired: true, weight: '700' },
        { sku: 'CAKE-PERS-P-6', name: 'Standard Personalised - Protein - 6 inch', price: '55.00', variantData: { Design: 'Standard Personalised', Base: 'Protein', Size: '6 inch' }, shippingRequired: true, weight: '700' },
        { sku: 'CAKE-DRIP-NP-4', name: 'Drip Cake - Non-Protein - 4 inch', price: '55.00', variantData: { Design: 'Drip Cake', Base: 'Non-Protein', Size: '4 inch' }, shippingRequired: true, weight: '450' },
        { sku: 'CAKE-DRIP-P-4', name: 'Drip Cake - Protein - 4 inch', price: '60.00', variantData: { Design: 'Drip Cake', Base: 'Protein', Size: '4 inch' }, shippingRequired: true, weight: '450' },
        { sku: 'CAKE-DRIP-NP-6', name: 'Drip Cake - Non-Protein - 6 inch', price: '60.00', variantData: { Design: 'Drip Cake', Base: 'Non-Protein', Size: '6 inch' }, shippingRequired: true, weight: '700' },
        { sku: 'CAKE-DRIP-P-6', name: 'Drip Cake - Protein - 6 inch', price: '65.00', variantData: { Design: 'Drip Cake', Base: 'Protein', Size: '6 inch' }, shippingRequired: true, weight: '700' },
      ],
    },
    {
      name: 'Training Treats',
      description: 'Pee-Nutz, Tuna Puffs, and Cheesy Bites training treats. 120g packs with multi-pack savings.',
      basePrice: '7.00',
      imageUrl: trainingTreatsImage,
      category: 'treat',
      isFeatured: false,
      tags: ['training', 'treats', 'packs'],
      variants: [
        { sku: 'TRAIN-PEE-1PACK', name: 'Pee-Nutz - 1 Pack - 120g', price: '7.00', variantData: { Type: 'Pee-Nutz', Pack: '1 Pack', Weight: '120g' } },
        { sku: 'TRAIN-PEE-4PACK', name: 'Pee-Nutz - 4 Packs - 120g', price: '25.00', variantData: { Type: 'Pee-Nutz', Pack: '4 Packs', Weight: '120g' } },
        { sku: 'TRAIN-TUNA-1PACK', name: 'Tuna Puffs - 1 Pack - 120g', price: '7.00', variantData: { Type: 'Tuna Puffs', Pack: '1 Pack', Weight: '120g' } },
        { sku: 'TRAIN-TUNA-4PACK', name: 'Tuna Puffs - 4 Packs - 120g', price: '25.00', variantData: { Type: 'Tuna Puffs', Pack: '4 Packs', Weight: '120g' } },
        { sku: 'TRAIN-CHEESE-1PACK', name: 'Cheesy Bites - 1 Pack - 120g', price: '7.00', variantData: { Type: 'Cheesy Bites', Pack: '1 Pack', Weight: '120g' } },
        { sku: 'TRAIN-CHEESE-4PACK', name: 'Cheesy Bites - 4 Packs - 120g', price: '25.00', variantData: { Type: 'Cheesy Bites', Pack: '4 Packs', Weight: '120g' } },
      ],
    },
    {
      name: 'Pupcakes',
      description: 'Apple & Carrot pupcakes in celebration box sizes. Collection only.',
      basePrice: '7.20',
      imageUrl: defaultImage,
      category: 'cake',
      isFeatured: false,
      tags: ['pupcakes', 'apple', 'carrot'],
      variants: [
        { sku: 'PUP-2', name: 'Apple & Carrot - Box of 2 - Pack', price: '7.20', variantData: { Flavor: 'Apple & Carrot', Box: '2' }, shippingRequired: false },
        { sku: 'PUP-4', name: 'Apple & Carrot - Box of 4 - Pack', price: '14.00', variantData: { Flavor: 'Apple & Carrot', Box: '4' }, shippingRequired: false },
        { sku: 'PUP-6', name: 'Apple & Carrot - Box of 6 - Pack', price: '20.00', variantData: { Flavor: 'Apple & Carrot', Box: '6' }, shippingRequired: false },
        { sku: 'PUP-12', name: 'Apple & Carrot - Box of 12 - Pack', price: '40.00', variantData: { Flavor: 'Apple & Carrot', Box: '12' }, shippingRequired: false },
        { sku: 'PUP-24', name: 'Apple & Carrot - Box of 24 - Pack', price: '80.00', variantData: { Flavor: 'Apple & Carrot', Box: '24' }, shippingRequired: false },
      ],
    },
    {
      name: 'Barkday Box',
      description: 'Apple & Peanut Butter biscuit barkday box. Collection or delivery option available.',
      basePrice: '30.00',
      imageUrl: barkdayBoxImage,
      imageUrls: [
        'https://i.ibb.co/0gpzNsx/image.png',
        'https://i.ibb.co/x8PrBc28/image.png',
        'https://i.ibb.co/jPy7JDvm/image.png',
      ],
      category: 'box',
      isFeatured: true,
      tags: ['barkday', 'box', 'gift'],
      variants: [
        { sku: 'BOX-COLLECT', name: 'Collection - Barkday Box - Standard', price: '30.00', variantData: { Delivery: 'Collection' }, shippingRequired: false, imageUrl: 'https://i.ibb.co/x8PrBc28/image.png' },
        { sku: 'BOX-DELIVER', name: 'Delivery - Barkday Box', price: '40.00', variantData: { Delivery: 'Delivery', DeliveryIncluded: true }, shippingRequired: true, imageUrl: 'https://i.ibb.co/jPy7JDvm/image.png' },
      ],
    },
    {
      name: 'Woofles',
      description: 'Grain-free carrot waffles. Choose single pack or multi-pack.',
      basePrice: '7.00',
      imageUrl: wooflesImage,
      imageUrls: wooflesImages,
      category: 'treat',
      isFeatured: true,
      tags: ['woofles', 'waffles', 'carrot'],
      variants: [
        { sku: 'WOOF-1PACK', name: 'Woofles - 1 Pack - Standard', price: '7.00', variantData: { Pack: '1 Pack' } },
        { sku: 'WOOF-4PACK', name: 'Woofles - 4 Packs - Standard', price: '40.00', variantData: { Pack: '4 Packs' } },
      ],
    },
    {
      name: 'Dognuts',
      description: 'Banana & peanut butter dognuts. Price is per dognut. Minimum order 6.',
      basePrice: '3.30',
      imageUrl: defaultImage,
      category: 'treat',
      isFeatured: false,
      tags: ['dognuts', 'donuts', 'banana', 'peanut butter'],
      variants: [
        { sku: 'DOGNUT-6', name: 'Dognuts - Box of 6', price: '19.80', variantData: { Box: '6' }, shippingRequired: false },
        { sku: 'DOGNUT-12', name: 'Dognuts - Box of 12', price: '39.60', variantData: { Box: '12' }, shippingRequired: false },
      ],
    },
  ];

  for (const seed of productSeeds) {
    const product = await upsertProduct(seed);
    for (const variant of seed.variants) {
      await upsertVariant(product.id, {
        ...variant,
        imageUrl: variant.imageUrl ?? seed.imageUrl,
        priceAdjustment: (Number(variant.price) - Number(seed.basePrice)).toFixed(2),
        shippingRequired: variant.shippingRequired ?? (seed.category === 'cake'),
      });
    }
    console.log(`Updated ${seed.name} with ${seed.variants.length} variants`);
  }

  console.log('Product pricing update complete.');
}

addMissingProducts().catch(console.error);
