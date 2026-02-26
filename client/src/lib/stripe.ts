import { loadStripe } from '@stripe/stripe-js';

// Load Stripe with publishable key or use null for development
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || null;

export const stripePromise = loadStripe(stripePublishableKey);

// Stripe checkout utilities
export async function createCheckoutSession(checkoutData: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryType: 'delivery' | 'collection';
  shippingAddress?: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    distanceKm?: number;
  };
  specialInstructions?: string;
  items: Array<{
    productVariantId: string | number;
    quantity: number;
    customization?: any;
    productId?: string | number;
    productName?: string;
    productCategory?: string;
    price?: number | string;
    imageUrl?: string;
    shippingRequired?: boolean;
    variantData?: {
      id?: string | number;
      sku?: string;
      name?: string;
      price?: number | string;
      imageUrl?: string;
      shippingRequired?: boolean;
    };
  }>;
}) {
  try {
    const response = await fetch('/api/checkout/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    const session = await response.json();
    return session;
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
}

// Calculate shipping rates
export async function getShippingRates(
  deliveryType: 'delivery' | 'collection',
  location?: { postalCode?: string; city?: string; distanceKm?: number },
  items?: any[]
) {
  try {
    const response = await fetch('/api/checkout/shipping-rates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deliveryType, location, items }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to calculate shipping');
    }

    return await response.json();
  } catch (error) {
    console.error('Shipping calculation error:', error);
    throw error;
  }
}

// Redirect to Stripe Checkout
export async function redirectToCheckout(sessionId: string) {
  const stripe = await stripePromise;
  
  if (!stripe) {
    // For development without Stripe credentials
    console.log('Development mode: Would redirect to Stripe Checkout with session:', sessionId);
    return;
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });
  
  if (error) {
    console.error('Stripe redirect error:', error);
    throw error;
  }
}
