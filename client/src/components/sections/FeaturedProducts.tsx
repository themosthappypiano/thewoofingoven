import { useProducts } from "@/hooks/use-api";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/store/use-cart";
import { ShoppingBag } from "lucide-react";
import { Link } from "wouter";

export function FeaturedProducts() {
  const { data: products, isLoading } = useProducts();
  const addItem = useCart((state) => state.addItem);

  // Mock data fallback if backend fails/empty during development
  const displayProducts = products?.length ? products.slice(0, 4) : [
    { id: 1, name: "Barkday Box", price: "30.00", category: "box", imageUrl: "https://i.ibb.co/0gpzNsx/image.png", variants: [{ id: "fallback-box-collect", name: "Collection", price: "30.00", shippingRequired: false }] },
    { id: 2, name: "Woofles", price: "7.00", category: "treat", imageUrl: "https://cdn.shopify.com/s/files/1/0970/6799/1383/files/hmmmm.jpg?v=1765216392", variants: [{ id: "fallback-woofles-1", name: "1 Pack", price: "7.00", shippingRequired: false }] },
    { id: 3, name: "Training Treats", price: "7.00", category: "treat", imageUrl: "https://cdn.shopify.com/s/files/1/0970/6799/1383/files/WhatsAppImage2025-10-15at22.00.56_3_eed392a1-7628-4abb-be3b-7ecc65ce2f51.jpg?v=1765216389", variants: [{ id: "fallback-train-1", name: "1 Pack", price: "7.00", shippingRequired: false }] },
    { id: 4, name: "Doggy Birthday Cake", price: "35.00", category: "cake", imageUrl: "https://cdn.shopify.com/s/files/1/0970/6799/1383/files/WhatsAppImage2025-10-15at21.35.32_4.jpg?v=1765216387", variants: [{ id: "fallback-cake-3", name: "3 inch", price: "35.00", shippingRequired: true }] },
  ] as any[];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-accent mb-4">Fresh from the Oven</h2>
            <p className="text-lg text-accent/70 max-w-2xl">Handcrafted treats made with love. No preservatives, no nasties, just pure goodness.</p>
          </div>
          <Link href="/shop" className="hidden md:block">
            <Button variant="outline">View All Treats</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="animate-pulse bg-secondary rounded-3xl h-80" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayProducts.map((product: any) => (
              <div key={product.id} className="group relative bg-white border border-border rounded-3xl p-4 shadow-sm hover:shadow-soft-hover transition-all duration-300 hover:-translate-y-1">
                <Link
                  href={`/shop/${encodeURIComponent(product.handle || product.id)}`}
                  className="block aspect-square rounded-2xl overflow-hidden mb-4 bg-secondary cursor-pointer"
                >
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div className="space-y-2 mb-4">
                  <Link
                    href={`/shop/${encodeURIComponent(product.handle || product.id)}`}
                    className="font-display font-bold text-xl text-accent leading-tight cursor-pointer hover:text-primary transition-colors block"
                  >
                    {product.name}
                  </Link>
                  <p className="text-primary font-bold text-lg">€{(Number(product.price) || 0).toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 gap-2" 
                    onClick={() => addItem(product, product.variants?.[0])}
                  >
                    <ShoppingBag size={18} />
                    Add to Cart
                  </Button>
                  <Link href={`/shop/${encodeURIComponent(product.handle || product.id)}`}>
                    <Button variant="outline" className="px-3">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center md:hidden">
          <Link href="/shop">
            <Button variant="outline" className="w-full">View All Treats</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
