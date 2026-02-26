import { useCart } from "@/store/use-cart";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "wouter";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getCartTotal } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2 text-accent">
            <ShoppingBag size={24} />
            <h2 className="text-2xl font-bold font-display m-0">Your Cart</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-secondary text-accent rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-accent/60">
              <ShoppingBag size={64} className="opacity-20" />
              <p className="text-lg">Your cart is empty.</p>
              <button 
                onClick={onClose}
                className="text-primary font-medium hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.variant.id}-${JSON.stringify(item.customization)}`} className="flex gap-4 p-4 bg-secondary/50 rounded-2xl">
                <img 
                  src={item.variant.imageUrl || item.product.imageUrl || "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=150&h=150&fit=crop"} 
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-xl"
                />
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-accent font-display leading-tight">{item.product.name}</h4>
                    <button 
                      onClick={() => removeItem(item.variant.id)}
                      className="text-accent/40 hover:text-destructive transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-accent/60">{item.variant.name}</p>
                  <p className="text-primary font-bold mt-1">€{(Number(item.variant.price || item.product.price) || 0).toFixed(2)}</p>
                  
                  <div className="mt-auto flex items-center gap-3">
                    <div className="flex items-center bg-white rounded-lg border border-border overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                        className="px-2 py-1 hover:bg-secondary text-accent transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                        className="px-2 py-1 hover:bg-secondary text-accent transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-border space-y-4">
            <div className="flex items-center justify-between text-lg font-bold text-accent">
              <span>Subtotal</span>
              <span>€{getCartTotal().toFixed(2)}</span>
            </div>
            <p className="text-sm text-accent/60">Shipping and taxes calculated at checkout.</p>
            <Link 
              href="/checkout"
              onClick={onClose}
              className="w-full flex items-center justify-center py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-soft hover:shadow-soft-hover hover:-translate-y-0.5 transition-all duration-200"
            >
              Secure Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
