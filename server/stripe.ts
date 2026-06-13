import Stripe from 'stripe';
import { isCollectionOnlyCartItem } from '../shared/delivery-rules';

const dummyStripeSecretKey = 'sk_test_dummy_key_for_development';
const configuredStripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim() || '';

export const isStripeMockMode =
  process.env.NODE_ENV !== 'production' &&
  (!configuredStripeSecretKey || configuredStripeSecretKey === dummyStripeSecretKey);

export const stripeConfigurationError =
  !configuredStripeSecretKey
    ? 'STRIPE_SECRET_KEY is missing'
    : configuredStripeSecretKey.includes('*') ||
        !/^sk_(test|live)_[A-Za-z0-9]+$/.test(configuredStripeSecretKey)
      ? 'STRIPE_SECRET_KEY is not a valid Stripe secret key'
      : null;

const stripeSecretKey = isStripeMockMode
  ? dummyStripeSecretKey
  : configuredStripeSecretKey || dummyStripeSecretKey;

export const stripe = new Stripe(stripeSecretKey);

export const SHIPPING_RATES = {
  collection: {
    id: 'collection',
    name: 'Collection',
    price: 0,
    delivery_time: 'Arrange collection time',
  },
  an_post: {
    id: 'an_post',
    name: 'An Post Shipping',
    price: 699,
    delivery_time: '3-5 business days',
  },
};

// Helper to calculate shipping based on location and products
export function calculateShipping(
  deliveryType: 'delivery' | 'collection',
  _location?: { postalCode?: string; city?: string; distanceKm?: number },
  cartItems?: any[]
) {
  if (deliveryType === 'collection') {
    return SHIPPING_RATES.collection;
  }

  const hasItems = Array.isArray(cartItems) && cartItems.length > 0;
  const hasShippableItems = hasItems
    ? cartItems.some((item) => !isCollectionOnlyCartItem(item))
    : true;

  // Delivery is only invalid when the full cart is collection-only.
  if (!hasShippableItems) {
    throw new Error('All items in your cart are collection only, so delivery is unavailable.');
  }
  return {
    id: SHIPPING_RATES.an_post.id,
    name: SHIPPING_RATES.an_post.name,
    price: SHIPPING_RATES.an_post.price,
    delivery_time: SHIPPING_RATES.an_post.delivery_time,
  };
}

// Create Stripe products and prices for all variants
export async function syncProductsToStripe() {
  console.log('Syncing products to Stripe...');
  // This will be implemented when you have real Stripe credentials
  // For now, we'll create mock Stripe price IDs
  return { success: true, message: 'Products will sync when Stripe credentials are added' };
}
