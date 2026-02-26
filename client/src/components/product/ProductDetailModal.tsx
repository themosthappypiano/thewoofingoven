import { useEffect, useState } from "react";
import { X, ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/store/use-cart";

interface Product {
  id: number | string;
  name: string;
  price: string | number;
  category: string;
  imageUrl: string;
  imageUrls?: string[];
  variants?: ProductVariant[];
  description?: string;
  ingredients?: string[];
  nutritionalInfo?: string;
  weight?: string;
}

interface ProductVariant {
  id: string | number;
  sku?: string;
  name: string;
  price: number;
  imageUrl?: string;
  shippingRequired?: boolean;
  option1?: { name: string; value: string };
  option2?: { name: string; value: string };
  option3?: { name: string; value: string };
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | number | null>(null);
  const addItem = useCart((state) => state.addItem);
  const variants = product?.variants || [];
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) || variants[0] || null;

  useEffect(() => {
    if (variants.length > 0 && selectedVariantId === null) {
      setSelectedVariantId(variants[0].id);
    }
  }, [variants, selectedVariantId]);

  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setSelectedVariantId(null);
    }
  }, [product?.id]);

  if (!product || !isOpen) return null;

  // Enhanced product details with unique images per product
  const getProductImages = (productId: number, mainImage: string, providedImages?: string[], variantImage?: string) => {
    const normalizedProvided = providedImages?.filter(Boolean) || [];
    const baseImages = normalizedProvided.length > 0 ? normalizedProvided : [mainImage];
    if (variantImage && !baseImages.includes(variantImage)) {
      return [variantImage, ...baseImages];
    }
    if (normalizedProvided.length > 0) {
      return normalizedProvided;
    }
    const imageCollections = {
      1: [ // Peanut Butter Bones
        mainImage,
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80",
        "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&q=80"
      ],
      2: [ // Sweet Potato Paws
        mainImage,
        "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=800&q=80",
        "https://images.unsplash.com/photo-1616089333912-32a243b17726?w=800&q=80"
      ],
      3: [ // Cheese & Apple Stars
        mainImage,
        "https://images.unsplash.com/photo-1595180630737-147b0a701967?w=800&q=80",
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80"
      ],
      4: [ // Beef & Carrot Hearts
        mainImage,
        "https://images.unsplash.com/photo-1581888227599-779811939961?w=800&q=80",
        "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=800&q=80"
      ]
    };
    
    return imageCollections[productId as keyof typeof imageCollections] || [mainImage];
  };

  const enhancedProduct = {
    ...product,
    description: product.description || "Handcrafted with natural ingredients. Perfect for treating your pup!",
    ingredients: product.ingredients || ["Organic oat flour", "Free-range eggs", "Natural peanut butter", "Honey", "Coconut oil"],
    nutritionalInfo: product.nutritionalInfo || "Protein: 12%, Fat: 8%, Fiber: 3%, Moisture: 10%",
    weight: product.weight || "150g",
    images: getProductImages(Number(product.id), product.imageUrl, product.imageUrls, selectedVariant?.imageUrl)
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="grid md:grid-cols-2 gap-0 h-full">
          {/* Image Section */}
          <div className="relative bg-secondary p-6">
            <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-white">
              <img
                src={enhancedProduct.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Image Thumbnails */}
            <div className="flex gap-2 justify-center">
              {enhancedProduct.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 overflow-y-auto">
            <div className="space-y-4">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h1 className="text-2xl font-display font-bold text-accent mb-1">{product.name}</h1>
                    <p className="text-3xl font-bold text-primary">
                      €{(Number(selectedVariant?.price ?? product.price) || 0).toFixed(2)}
                    </p>
                  </div>
                  <button className="p-2 text-accent/60 hover:text-primary transition-colors">
                    <Heart size={24} />
                  </button>
                </div>
                <span className="inline-block px-3 py-1 bg-secondary text-accent text-sm rounded-full capitalize">
                  {product.category}
                </span>
              </div>

              {variants.length > 0 && (
                <div>
                  <h3 className="font-display font-bold text-accent mb-2">Choose a Variant</h3>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => {
                          setSelectedVariantId(variant.id);
                          setSelectedImage(0);
                        }}
                        className={`px-3 py-2 rounded-xl border text-left transition-colors ${
                          selectedVariant?.id === variant.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-sm font-semibold">{variant.name}</div>
                        <div className="text-xs text-accent/70">€{(Number(variant.price) || 0).toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="font-display font-bold text-accent mb-1">Description</h3>
                <p className="text-accent/80 text-sm">{enhancedProduct.description}</p>
              </div>

              {/* Ingredients */}
              <div>
                <h3 className="font-display font-bold text-accent mb-1">Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {enhancedProduct.ingredients.map((ingredient, index) => (
                    <span key={index} className="text-xs bg-secondary px-2 py-1 rounded-full text-accent/70">
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <h4 className="font-bold text-accent mb-1">Weight</h4>
                  <p className="text-accent/80">{enhancedProduct.weight}</p>
                </div>
                <div>
                  <h4 className="font-bold text-accent mb-1">Nutrition</h4>
                  <p className="text-accent/80 text-xs">{enhancedProduct.nutritionalInfo}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => {
                    const cartVariant = selectedVariant
                      ? {
                          id: selectedVariant.id,
                          productId: product.id,
                          sku: selectedVariant.sku,
                          name: selectedVariant.name,
                          price: selectedVariant.price,
                          imageUrl: selectedVariant.imageUrl || product.imageUrl,
                          shippingRequired: selectedVariant.shippingRequired ?? true,
                        }
                      : undefined;
                    addItem(product, cartVariant);
                    onClose();
                  }}
                >
                  <ShoppingBag size={18} />
                  Add to Cart
                </Button>
                <Button variant="outline" className="px-6">
                  <Heart size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
