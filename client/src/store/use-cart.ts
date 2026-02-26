import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function playAddToCartSound() {
  if (typeof window === "undefined") return;
  const audioContextConstructor = window.AudioContext || (window as any).webkitAudioContext;
  if (!audioContextConstructor) return;

  try {
    const audioContext = new audioContextConstructor();
    const now = audioContext.currentTime;
    const gainNode = audioContext.createGain();
    const oscillator = audioContext.createOscillator();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(880, now);
    oscillator.frequency.exponentialRampToValueAtTime(1320, now + 0.08);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.17);
  } catch {
    // no-op when browser blocks autoplay audio
  }
}
export interface CartItem {
  product: CartProduct;
  variant: CartVariant;
  quantity: number;
  customization?: any; // For personalization like dog names, special instructions
}

export interface CartProduct {
  id: string | number;
  name: string;
  price: string | number;
  imageUrl?: string;
  category?: string;
}

export interface CartVariant {
  id: string | number;
  productId?: string | number;
  sku?: string;
  name: string;
  price: string | number;
  imageUrl?: string;
  shippingRequired?: boolean;
}

interface CartStore {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (product: CartProduct, variant?: CartVariant, quantity?: number, customization?: any) => void;
  removeItem: (variantId: string | number) => void;
  updateQuantity: (variantId: string | number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getShippingRequired: () => boolean;
  getCollectionOnlyItems: () => CartItem[];
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      addItem: (product, variant, quantity = 1, customization) => {
        set((state) => {
          // Create a default variant if none provided
          const finalVariant: CartVariant = variant || {
            id: product.id,
            productId: product.id,
            sku: `default-${product.id}`,
            name: 'Default',
            price: product.price || '0',
            imageUrl: product.imageUrl,
            shippingRequired: true,
          };

          const existingItemIndex = state.items.findIndex((i) => 
            i.variant.id === finalVariant.id && 
            JSON.stringify(i.customization) === JSON.stringify(customization)
          );
          
          if (existingItemIndex >= 0) {
            return {
              items: state.items.map((item, index) =>
                index === existingItemIndex
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
              isDrawerOpen: true, // Open drawer when item added
            };
          }
          
          return { 
            items: [...state.items, { 
              product, 
              variant: finalVariant, 
              quantity, 
              customization 
            }],
            isDrawerOpen: true, // Open drawer when item added
          };
        });

        playAddToCartSound();
      },
      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variant.id !== variantId),
        }));
      },
      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        
        set((state) => ({
          items: state.items.map((i) =>
            i.variant.id === variantId ? { ...i, quantity } : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          if (!item.variant) return total;
          return total + Number(item.variant.price) * item.quantity;
        }, 0);
      },
      getCartCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
      getShippingRequired: () => {
        const { items } = get();
        return items.some(item => item.variant && item.variant.shippingRequired);
      },
      getCollectionOnlyItems: () => {
        const { items } = get();
        return items.filter(item => item.variant && !item.variant.shippingRequired);
      },
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
    }),
    {
      name: 'woofing-oven-cart-v4', // Changed name to reset old cart data and add drawer state
      partialize: (state) => ({ items: state.items }), // Don't persist drawer state
    }
  )
);
