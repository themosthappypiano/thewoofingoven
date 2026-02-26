import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export interface ShopifyProduct {
  id: number;
  handle: string;
  title: string;
  body_html: string;
  vendor: string;
  product_category: string;
  type: string;
  tags: string;
  published: boolean;
  option1_name: string;
  option1_value: string;
  option2_name?: string;
  option2_value?: string;
  option3_name?: string;
  option3_value?: string;
  variant_sku: string;
  variant_grams: number;
  variant_price: number;
  variant_compare_at_price?: number;
  variant_requires_shipping: boolean;
  variant_taxable: boolean;
  variant_barcode?: string;
  image_src: string;
  image_position: number;
  image_alt_text?: string;
  seo_title?: string;
  seo_description?: string;
  dog_age_group?: string;
  pet_dietary_requirements?: string;
  pet_food_flavor?: string;
  pet_treat_texture?: string;
  variant_image?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TransformedProduct {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  imageUrls: string[];
  category: string;
  isFeatured: boolean;
  tags: string[];
  handle: string;
  variants: TransformedVariant[];
  seo: {
    title?: string;
    description?: string;
  };
  metadata: {
    dogAgeGroup?: string;
    dietaryRequirements?: string;
    flavor?: string;
    texture?: string;
  };
}

export interface TransformedVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  option1?: { name: string; value: string };
  option2?: { name: string; value: string };
  option3?: { name: string; value: string };
  weight?: number;
  imageUrl?: string;
  shippingRequired: boolean;
  taxable: boolean;
  barcode?: string;
}

export async function getShopifyProducts(): Promise<TransformedProduct[]> {
  const { data: rawProducts, error } = await supabase
    .from('shopify_products')
    .select('*')
    .eq('published', true)
    .eq('status', 'active')
    .order('handle');

  if (error) {
    console.error('Error fetching Shopify products:', error);
    throw new Error('Failed to fetch products');
  }

  if (!rawProducts || rawProducts.length === 0) {
    return [];
  }

  // Group products by handle (Shopify groups variants under the same product)
  const productGroups = new Map<string, ShopifyProduct[]>();
  
  rawProducts.forEach((product: ShopifyProduct) => {
    if (!product.handle) return;
    
    if (!productGroups.has(product.handle)) {
      productGroups.set(product.handle, []);
    }
    productGroups.get(product.handle)!.push(product);
  });

  // Transform grouped products
  const transformedProducts: TransformedProduct[] = [];

  productGroups.forEach((variants, handle) => {
    // Use the first variant as the main product data
    const mainProduct = variants[0];
    
    // Get all unique images, prioritizing by position
    const allImages = variants
      .map(v => ({ src: v.image_src, position: v.image_position || 999 }))
      .filter(img => img.src)
      .sort((a, b) => a.position - b.position);
    
    const mainImageUrl = allImages.length > 0 ? allImages[0].src : 
      'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&q=80&w=800';
    const imageUrls = allImages.map((img) => img.src);

    // Transform variants
    const transformedVariants: TransformedVariant[] = variants.map(variant => ({
      id: `${variant.handle}-${variant.variant_sku || variant.id}`,
      sku: variant.variant_sku || `${variant.handle}-${variant.id}`,
      name: variant.option1_value ? 
        `${mainProduct.title} - ${variant.option1_value}${variant.option2_value ? ` - ${variant.option2_value}` : ''}` : 
        mainProduct.title,
      price: variant.variant_price || 0,
      compareAtPrice: variant.variant_compare_at_price,
      option1: variant.option1_name && variant.option1_value ? {
        name: variant.option1_name,
        value: variant.option1_value
      } : undefined,
      option2: variant.option2_name && variant.option2_value ? {
        name: variant.option2_name,
        value: variant.option2_value
      } : undefined,
      option3: variant.option3_name && variant.option3_value ? {
        name: variant.option3_name,
        value: variant.option3_value
      } : undefined,
      weight: variant.variant_grams,
      imageUrl: variant.variant_image || variant.image_src,
      shippingRequired: variant.variant_requires_shipping ?? true,
      taxable: variant.variant_taxable ?? true,
      barcode: variant.variant_barcode,
    }));

    // Determine if product is featured (you can adjust this logic)
    const isFeatured = mainProduct.tags?.toLowerCase().includes('featured') || 
                      mainProduct.type?.toLowerCase().includes('barkday') ||
                      transformedVariants.some(v => v.price >= 20);

    // Parse tags
    const tags = mainProduct.tags ? 
      mainProduct.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : 
      [];

    // Determine category based on type or tags
    let category = 'treat'; // default
    if (mainProduct.type?.toLowerCase().includes('cake') || 
        mainProduct.title?.toLowerCase().includes('cake')) {
      category = 'cake';
    } else if (mainProduct.type?.toLowerCase().includes('box') || 
               mainProduct.title?.toLowerCase().includes('box')) {
      category = 'box';
    } else if (mainProduct.type?.toLowerCase().includes('woofle')) {
      category = 'woofles';
    }

    transformedProducts.push({
      id: mainProduct.handle,
      name: mainProduct.title || handle,
      description: mainProduct.body_html ? 
        mainProduct.body_html.replace(/<[^>]*>/g, '') : // Strip HTML tags
        `Delicious ${mainProduct.type || 'treat'} for your furry friend.`,
      basePrice: Math.min(...transformedVariants.map(v => v.price)),
      imageUrl: mainImageUrl,
      imageUrls,
      category,
      isFeatured,
      tags,
      handle,
      variants: transformedVariants,
      seo: {
        title: mainProduct.seo_title,
        description: mainProduct.seo_description,
      },
      metadata: {
        dogAgeGroup: mainProduct.dog_age_group,
        dietaryRequirements: mainProduct.pet_dietary_requirements,
        flavor: mainProduct.pet_food_flavor,
        texture: mainProduct.pet_treat_texture,
      }
    });
  });

  return transformedProducts;
}

export async function getShopifyProduct(handle: string): Promise<TransformedProduct | null> {
  const { data: rawProducts, error } = await supabase
    .from('shopify_products')
    .select('*')
    .eq('handle', handle)
    .eq('published', true)
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching Shopify product:', error);
    throw new Error('Failed to fetch product');
  }

  if (!rawProducts || rawProducts.length === 0) {
    return null;
  }

  // Transform the single product (similar logic to above)
  const products = await getShopifyProducts();
  return products.find(p => p.handle === handle) || null;
}
