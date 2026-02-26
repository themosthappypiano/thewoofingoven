import Stripe from 'stripe';

// Initialize Stripe with secret key or use dummy for development
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_development';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

// Shipping rates for Dublin area
export const CAKE_DELIVERY_RATE_CENTS_PER_KM = 85;

export const SHIPPING_RATES = {
  collection: {
    id: 'collection',
    name: 'Collection (Dublin 24)',
    price: 0,
    delivery_time: 'Next day',
  },
  cake_delivery: {
    id: 'cake_delivery',
    name: 'Cake Delivery (Dublin)',
    price: CAKE_DELIVERY_RATE_CENTS_PER_KM,
    delivery_time: '1-2 business days',
  },
};

// Helper to calculate shipping based on location and products
export function calculateShipping(
  deliveryType: 'delivery' | 'collection',
  location?: { postalCode?: string; city?: string; distanceKm?: number },
  cartItems?: any[]
) {
  if (deliveryType === 'collection') {
    return SHIPPING_RATES.collection;
  }

  // Check if any items require collection only
  const hasCollectionOnlyItems = cartItems?.some(item => {
    if (typeof item?.shippingRequired === 'boolean') return !item.shippingRequired;
    if (typeof item?.variant?.shippingRequired === 'boolean') return !item.variant.shippingRequired;
    if (typeof item?.variantData?.shippingRequired === 'boolean') return !item.variantData.shippingRequired;
    return false;
  });

  if (hasCollectionOnlyItems) {
    throw new Error('Some items in your cart are collection only.');
  }

  const isBarkdayBoxDelivery = (item: any) => {
    const productName = item?.product?.name || item?.productName || '';
    const variantName = item?.variant?.name || item?.variantData?.name || '';
    return productName === 'Barkday Box' && variantName.toLowerCase().includes('delivery');
  };

  const isCakeItem = (item: any) => {
    const category = item?.product?.category || item?.productCategory || '';
    const productName = item?.product?.name || item?.productName || '';
    return category === 'cake' || productName.toLowerCase().includes('cake');
  };

  const items = cartItems || [];
  const onlyDeliveryIncluded =
    items.length > 0 && items.every((item) => isBarkdayBoxDelivery(item));

  if (onlyDeliveryIncluded) {
    return {
      id: 'delivery_included',
      name: 'Delivery Included (Barkday Box)',
      price: 0,
      delivery_time: '1-2 business days',
    };
  }

  const hasNonCakeDeliveryItems = items.some(
    (item) => !isCakeItem(item) && !isBarkdayBoxDelivery(item)
  );
  if (hasNonCakeDeliveryItems) {
    throw new Error('Only cakes (and Barkday Box delivery) are eligible for delivery.');
  }

  const isDublin =
    location?.postalCode?.startsWith('D') ||
    location?.city?.toLowerCase().includes('dublin');

  if (!isDublin) {
    throw new Error('Cake delivery is available for Dublin addresses only.');
  }

  const distanceKm = Number(location?.distanceKm);
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    throw new Error('Please provide the delivery distance in kilometers for cake delivery.');
  }

  const deliveryPrice = Math.round(distanceKm * CAKE_DELIVERY_RATE_CENTS_PER_KM);
  return {
    id: SHIPPING_RATES.cake_delivery.id,
    name: `Cake Delivery (${distanceKm} km)`,
    price: deliveryPrice,
    delivery_time: SHIPPING_RATES.cake_delivery.delivery_time,
  };
}

// Create Stripe products and prices for all variants
export async function syncProductsToStripe() {
  console.log('Syncing products to Stripe...');
  // This will be implemented when you have real Stripe credentials
  // For now, we'll create mock Stripe price IDs
  return { success: true, message: 'Products will sync when Stripe credentials are added' };
}
