import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/store/use-cart";
import { Button } from "@/components/ui/Button";
import { useCheckout } from "@/hooks/use-api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import { useState } from "react";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Valid email required"),
  customerPhone: z.string().optional(),
  deliveryType: z.enum(["collection", "delivery"]),
  shippingAddress: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().default("Ireland"),
  }).optional(),
  specialInstructions: z.string().optional(),
}).refine((data) => {
  if (data.deliveryType === "delivery") {
    return data.shippingAddress && 
           data.shippingAddress.address && 
           data.shippingAddress.address.length > 0 && 
           data.shippingAddress.city && 
           data.shippingAddress.city.length > 0 && 
           data.shippingAddress.postalCode && 
           data.shippingAddress.postalCode.length > 0;
  }
  return true;
}, {
  message: "Complete address is required for delivery",
  path: ["shippingAddress"]
});

export default function Checkout() {
  const { items, getCartTotal, clearCart } = useCart();
  const checkoutMutation = useCheckout();
  const [isSuccess, setIsSuccess] = useState(false);
  const [, setLocation] = useLocation();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryType: "collection" as const,
      shippingAddress: {
        country: "Ireland"
      }
    }
  });

  const deliveryType = watch("deliveryType");
  const needsShipping = deliveryType === "delivery";

  const onSubmit = (data: any) => {
    console.log('=== FORM SUBMISSION START ===');
    console.log('Form submitted with data:', data);
    console.log('Cart items:', items);
    console.log('Form validation errors:', errors);
    
    try {
      const payload = {
        ...data,
        items: items.map(i => ({
          productVariantId: Number(i.variant.id),
          quantity: i.quantity,
          price: i.variant.price.toString(),
          customization: i.customization,
          variantData: {
            sku: i.variant.sku || '',
            name: i.variant.name,
            price: i.variant.price,
            imageUrl: i.variant.imageUrl || '',
            shippingRequired: i.variant.shippingRequired ?? true
          },
          productName: i.product.name,
          productId: i.product.id
        }))
      };

      console.log('Sending checkout payload:', payload);
      console.log('Checkout mutation pending:', checkoutMutation.isPending);
      
      checkoutMutation.mutate(payload, {
        onSuccess: (data) => {
          console.log('Checkout success:', data);
          if (data.checkoutUrl) {
            window.location.href = data.checkoutUrl;
          } else {
            clearCart();
            setIsSuccess(true);
          }
        },
        onError: (error) => {
          console.error('Checkout error:', error);
        }
      });
      
      console.log('=== MUTATION CALLED ===');
    } catch (error) {
      console.error('Error in onSubmit:', error);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-32 pb-24 px-4">
          <div className="bg-white p-12 rounded-[3rem] shadow-soft max-w-lg w-full text-center border border-border">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
              <CheckCircle2 size={40} />
            </div>
            <h1 className="text-4xl font-display font-bold text-accent mb-4">Order Confirmed!</h1>
            <p className="text-accent/70 mb-8">
              Thank you for your order. We've sent a confirmation email with all the details. Time to get baking!
            </p>
            <Button onClick={() => setLocation("/")} size="lg">Return Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/shop" className="inline-flex items-center text-accent/60 hover:text-primary mb-8 font-medium transition-colors">
            <ChevronLeft size={20} />
            Back to Shop
          </Link>

          <h1 className="text-4xl font-display font-bold text-accent mb-12">Checkout</h1>

          {items.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-border">
              <p className="text-lg text-accent/60 mb-6">Your cart is empty.</p>
              <Link href="/shop">
                <Button>Go Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-12 items-start">
              
              {/* Form */}
              <div className="lg:col-span-7 bg-white p-8 rounded-3xl shadow-sm border border-border">
                <h2 className="text-2xl font-display font-bold text-accent mb-6">Contact Information</h2>
                <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-accent mb-2">Full Name</label>
                    <input 
                      {...register("customerName")}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="John Doe"
                    />
                    {errors.customerName && <p className="text-destructive text-sm mt-1">{errors.customerName.message as string}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-accent mb-2">Email Address</label>
                    <input 
                      {...register("customerEmail")}
                      type="email"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="john@example.com"
                    />
                    {errors.customerEmail && <p className="text-destructive text-sm mt-1">{errors.customerEmail.message as string}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-accent mb-2">Phone Number (Optional)</label>
                    <input 
                      {...register("customerPhone")}
                      type="tel"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="+353 1 234 5678"
                    />
                    {errors.customerPhone && <p className="text-destructive text-sm mt-1">{errors.customerPhone.message as string}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-accent mb-4">Delivery Option</label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 cursor-pointer transition-colors">
                        <input 
                          {...register("deliveryType")}
                          type="radio" 
                          value="collection"
                          className="text-primary focus:ring-primary/20"
                        />
                        <div>
                          <div className="font-semibold text-accent">Collection</div>
                          <div className="text-sm text-accent/60">Collect from our kitchen - Free</div>
                          <div className="text-xs text-accent/50 mt-1">
                            📍 The Woofing Oven, Dublin 2, Ireland<br/>
                            🕒 Mon-Fri 9AM-6PM, Sat 10AM-4PM
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 cursor-pointer transition-colors">
                        <input 
                          {...register("deliveryType")}
                          type="radio" 
                          value="delivery"
                          className="text-primary focus:ring-primary/20"
                        />
                        <div>
                          <div className="font-semibold text-accent">Delivery</div>
                          <div className="text-sm text-accent/60">Dublin area delivery - €5-15 (based on distance)</div>
                        </div>
                      </label>
                    </div>
                    {errors.deliveryType && <p className="text-destructive text-sm mt-1">{errors.deliveryType.message as string}</p>}
                  </div>

                  {needsShipping && (
                    <div className="space-y-4 p-4 bg-background/50 rounded-xl border border-border/50">
                      <h3 className="font-semibold text-accent">Delivery Address</h3>
                      <div>
                        <label className="block text-sm font-bold text-accent mb-2">Street Address</label>
                        <input 
                          {...register("shippingAddress.address")}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          placeholder="123 Main Street"
                        />
                        {errors.shippingAddress?.address && <p className="text-destructive text-sm mt-1">{errors.shippingAddress.address.message as string}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-accent mb-2">City</label>
                          <input 
                            {...register("shippingAddress.city")}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="Dublin"
                          />
                          {errors.shippingAddress?.city && <p className="text-destructive text-sm mt-1">{errors.shippingAddress.city.message as string}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-accent mb-2">Postal Code</label>
                          <input 
                            {...register("shippingAddress.postalCode")}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="D01 A1B2"
                          />
                          {errors.shippingAddress?.postalCode && <p className="text-destructive text-sm mt-1">{errors.shippingAddress.postalCode.message as string}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-accent mb-2">Special Instructions (Optional)</label>
                    <textarea 
                      {...register("specialInstructions")}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                      placeholder="Any special instructions for your order..."
                    />
                    {errors.specialInstructions && <p className="text-destructive text-sm mt-1">{errors.specialInstructions.message as string}</p>}
                  </div>
                </form>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-5 bg-secondary p-8 rounded-3xl border border-border sticky top-32">
                <h2 className="text-2xl font-display font-bold text-accent mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                  {items.map(item => (
                    <div key={item.product.id} className="flex gap-4">
                      <img 
                        src={item.product.imageUrl || "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=100&q=80"} 
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-accent text-sm leading-tight">{item.product.name}</h4>
                        <p className="text-accent/60 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-primary">€{(Number(item.product.price) * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/50 pt-4 space-y-3 mb-8">
                  <div className="flex justify-between text-accent/80">
                    <span>Subtotal</span>
                    <span>€{getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-accent/80">
                    <span>
                      {deliveryType === "delivery" ? "Delivery" : "Collection"}
                    </span>
                    <span>
                      {deliveryType === "delivery" ? "€8.00" : "Free"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-accent pt-2 border-t border-border/50">
                    <span>Total</span>
                    <span className="text-primary">
                      €{(getCartTotal() + (deliveryType === "delivery" ? 8 : 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  form="checkout-form" 
                  size="lg" 
                  className="w-full"
                  disabled={checkoutMutation.isPending}
                >
                  {checkoutMutation.isPending ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
