import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useProducts } from "@/hooks/use-api";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/store/use-cart";
import { ShoppingBag } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

export default function Shop() {
  const { data: products, isLoading } = useProducts();
  const addItem = useCart((state) => state.addItem);
  const [location] = useLocation();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash || location !== "/shop") return;

    const element = document.getElementById(hash);
    if (!element) return;

    const navbarHeight = 120;
    const extraOffset = 10;
    const elementPosition = element.offsetTop - navbarHeight - extraOffset;

    window.scrollTo({
      top: elementPosition,
      behavior: "smooth",
    });
  }, [location]);

  // Mock data fallback
  const displayProducts = products?.length ? products : [
    { id: 1, name: "Barkday Box", price: "30.00", category: "box", imageUrl: "https://i.ibb.co/0gpzNsx/image.png", variants: [{ id: "fallback-box-collect", name: "Collection", price: "30.00", shippingRequired: false }] },
    { id: 2, name: "Woofles", price: "40.00", category: "treat", imageUrl: "https://cdn.shopify.com/s/files/1/0970/6799/1383/files/hmmmm.jpg?v=1765216392", variants: [{ id: "fallback-woofles-4", name: "4 Packs", price: "40.00", shippingRequired: false }] },
    { id: 3, name: "Training Treats", price: "7.00", category: "treat", imageUrl: "https://cdn.shopify.com/s/files/1/0970/6799/1383/files/WhatsAppImage2025-10-15at22.00.56_3_eed392a1-7628-4abb-be3b-7ecc65ce2f51.jpg?v=1765216389", variants: [{ id: "fallback-train-1", name: "1 Pack", price: "7.00", shippingRequired: false }] },
    { id: 4, name: "Pupcakes", price: "7.20", category: "cake", imageUrl: "https://placehold.co/500x500?text=Pupcakes", variants: [{ id: "fallback-pup-2", name: "Box of 2", price: "7.20", shippingRequired: false }] },
    { id: 5, name: "Dognuts", price: "19.80", category: "treat", imageUrl: "https://placehold.co/500x500?text=Dognuts", variants: [{ id: "fallback-dognut-6", name: "Box of 6", price: "19.80", shippingRequired: false }] },
    { id: 6, name: "Doggy Birthday Cake", price: "35.00", category: "cake", imageUrl: "https://i.postimg.cc/sXJ7zskn/Whats-App-Image-2025-10-15-at-21-35-26.jpg", variants: [{ id: "fallback-cake-3", name: "3 inch", price: "35.00", shippingRequired: true }] },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-display font-bold text-accent mb-4">Shop All Treats</h1>
            <p className="text-lg text-accent/70 max-w-2xl mx-auto">Browse our full range of natural, hand-baked goodness.</p>
          </div>

          {isLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="animate-pulse bg-secondary rounded-3xl h-80" />
             ))}
           </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {displayProducts.map((product: any) => {
                const isPlaceholderImageUrl = (url?: string) => {
                  if (!url) return true;
                  const normalized = String(url).toLowerCase();
                  return (
                    normalized.includes("placehold.co") ||
                    normalized.includes("placeholder") ||
                    normalized.includes("text=the%20woofing%20oven") ||
                    normalized.includes("text=the+woofing+oven")
                  );
                };
                const parsedImageUrls = Array.isArray(product.imageUrls)
                  ? product.imageUrls
                  : typeof product.imageUrls === "string"
                    ? (() => {
                        try {
                          const parsed = JSON.parse(product.imageUrls);
                          return Array.isArray(parsed) ? parsed : [];
                        } catch {
                          return [];
                        }
                      })()
                    : [];
                const variantImage = product.variants?.find((variant: any) => !isPlaceholderImageUrl(variant?.imageUrl))?.imageUrl;
                const curatedImageFallbacks: Record<string, string> = {
                  Pupcakes: "https://i.postimg.cc/pr3hR08T/Whats-App-Image-2025-10-15-at-22-00-56-(4).jpg",
                  Dognuts: "https://i.postimg.cc/Pxz2Lwy3/Whats-App-Image-2025-10-15-at-21-54-09-(4).jpg",
                  Woofles: "https://cdn.shopify.com/s/files/1/0970/6799/1383/files/hmmmm.jpg?v=1765216392",
                  "Barkday Box": "https://i.postimg.cc/PJVJF3xg/Whats-App-Image-2026-03-14-at-19-13-35.jpg",
                  "Doggy Birthday Cake": "https://i.postimg.cc/ZqX1PprN/Whats-App-Image-2025-10-15-at-21-35-26.jpg",
                };
                const firstValidImageUrl = parsedImageUrls.find((url: string) => !isPlaceholderImageUrl(url));
                const productCardOverrideImage = curatedImageFallbacks[product.name];
                const resolvedImage =
                  productCardOverrideImage ||
                  variantImage ||
                  firstValidImageUrl ||
                  (!isPlaceholderImageUrl(product.imageUrl) ? product.imageUrl : "") ||
                  curatedImageFallbacks[product.name] ||
                  `https://placehold.co/500x500?text=${encodeURIComponent(product.name)}`;
                const finalFallbackImage =
                  curatedImageFallbacks[product.name] ||
                  `https://placehold.co/500x500?text=${encodeURIComponent(product.name)}`;
                const pupcakesDefaultVariant = product.name === "Pupcakes"
                  ? product.variants?.find((variant: any) => variant.name === "Box of 2" || variant.name === "Apple & Carrot - Box of 2 - Pack")
                  : undefined;
                const wooflesDefaultVariant = product.name === "Woofles"
                  ? product.variants?.find((variant: any) => variant.name.includes("4 Pack"))
                  : undefined;
                const displayPrice = Number(
                  pupcakesDefaultVariant?.price ??
                  wooflesDefaultVariant?.price ??
                  product.variants?.find((v: any) => v.name === "Box of 2")?.price ??
                  product.price
                ) || 0;
                const defaultCartVariant =
                  product.name === "Woofles"
                    ? wooflesDefaultVariant || product.variants?.[0]
                    : product.variants?.[0];
                return (
                <div
                  key={product.id}
                  id={product.name === "Doggy Birthday Cake" ? "cake-product" : undefined}
                  className="group relative bg-white border border-border rounded-3xl p-4 shadow-sm hover:shadow-soft-hover transition-all duration-300"
                >
                  <Link href={`/shop/${encodeURIComponent(product.handle || product.id)}`} className="block aspect-square rounded-2xl overflow-hidden mb-4 bg-secondary cursor-pointer">
                    <img
                      src={resolvedImage}
                      alt={product.name}
                      onError={(event) => {
                        const img = event.currentTarget;
                        if (img.src !== finalFallbackImage) {
                          img.src = finalFallbackImage;
                          return;
                        }
                        img.onerror = null;
                        img.src = `https://placehold.co/500x500?text=${encodeURIComponent(product.name)}`;
                      }}
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
                    <p className="text-primary font-bold text-lg">€{displayPrice.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 gap-2" 
                      onClick={() => addItem(product, defaultCartVariant)}
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
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
