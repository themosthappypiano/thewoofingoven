import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { useProduct } from "@/hooks/use-api";
import { useCart } from "@/store/use-cart";
import { ShoppingBag } from "lucide-react";

type Variant = {
  id: string | number;
  sku?: string;
  name: string;
  price: number;
  imageUrl?: string;
  shippingRequired?: boolean;
  variantData?: any;
};

type ParsedVariant = Variant & {
  design: string;
  flavor: string;
  size: string;
};

export default function ProductPage() {
  const [, params] = useRoute("/shop/:id");
  const productId = params?.id ? decodeURIComponent(params.id) : "";
  const { data: product, isLoading } = useProduct(productId);
  const addItem = useCart((state) => state.addItem);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageOpacity, setImageOpacity] = useState(1);
  const [selectedDesign, setSelectedDesign] = useState<string>("");
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedVariantId, setSelectedVariantId] = useState<string | number | null>(null);
  const [selectedCakeFlavor, setSelectedCakeFlavor] = useState<string>("");
  const [selectedTrainingFlavor, setSelectedTrainingFlavor] = useState<string>("Pee-Nutz");
  const [selectedTrainingPack, setSelectedTrainingPack] = useState<string>("1 Pack");
  const [selectedPackOption, setSelectedPackOption] = useState<string>("1 Pack");
  const [selectedPupcakeBox, setSelectedPupcakeBox] = useState<string>("Box of 2");

  const variants: Variant[] = product?.variants || [];
  const isCake = product?.category === 'cake';
  const isPupcakes = product?.name === 'Pupcakes';
  const isTrainingTreats = product?.name === 'Training Treats';
  const isWoofles = product?.name === 'Woofles';
  const isDognuts = product?.name === 'Dognuts';
  const isBarkdayBox = product?.name === 'Barkday Box';
  const useCakeSelectors = isCake && !isPupcakes;
  const parsedVariants: ParsedVariant[] = useMemo(
    () =>
      variants.map((variant) => {
        const parts = variant.name.split(" - ").map((part) => part.trim());
        return {
          ...variant,
          design: parts[0] || "Standard",
          flavor: parts[1] || "Default",
          size: parts.slice(2).join(" - ") || "Standard",
        };
      }),
    [variants]
  );

  const normalizeCakeDesign = (design: string) => {
    const trimmed = design.trim();
    if (trimmed === "Drip Cake") return "Drip Design";
    if (trimmed === "Non-Personalised") return "Standard Non-Personalised";
    if (trimmed === "Personalised Name") return "Standard Personalised";
    return trimmed;
  };

  const cakeVariants = useMemo(() => {
    if (!isCake) return [];
    return parsedVariants.map((variant) => {
      let data = variant.variantData;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          data = null;
        }
      }
      const design = normalizeCakeDesign(data?.Design ?? variant.design);
      const base = data?.Base ?? variant.flavor;
      const size = data?.Size ?? variant.size;
      return { ...variant, design, base, size };
    });
  }, [parsedVariants, isCake]);

  const designs = useMemo(() => {
    const raw = useCakeSelectors
      ? cakeVariants.map((variant) => variant.design)
      : parsedVariants.map((variant) => variant.design);
    const unique = Array.from(new Set(raw));
    return unique.filter((design) => design !== "Drip Cake");
  }, [cakeVariants, parsedVariants, useCakeSelectors]);
  const bases = useMemo(
    () =>
      Array.from(
        new Set(
          (useCakeSelectors ? cakeVariants : parsedVariants)
            .filter((variant: any) => !selectedDesign || variant.design === selectedDesign)
            .map((variant: any) => (useCakeSelectors ? variant.base : variant.flavor))
        )
      ),
    [cakeVariants, parsedVariants, selectedDesign, useCakeSelectors]
  );
  const sizes = useMemo(() => {
    const values = Array.from(
      new Set(
        (useCakeSelectors ? cakeVariants : parsedVariants)
          .filter(
            (variant: any) =>
              (!selectedDesign || variant.design === selectedDesign) &&
              (!selectedFlavor || (useCakeSelectors ? variant.base : variant.flavor) === selectedFlavor)
          )
          .map((variant: any) => (useCakeSelectors ? variant.size : variant.size))
      )
    );
    return values.sort((a, b) => {
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);
      if (Number.isFinite(aNum) && Number.isFinite(bNum)) return aNum - bNum;
      return a.localeCompare(b);
    });
  }, [parsedVariants, selectedDesign, selectedFlavor, useCakeSelectors, cakeVariants]);
  const isDeluxe = selectedDesign === "Deluxe/Bespoke";
  const selectedVariant =
    (useCakeSelectors
      ? cakeVariants.find(
          (variant: any) =>
            variant.design === selectedDesign &&
            variant.base === selectedFlavor &&
            variant.size === selectedSize
        ) ||
        cakeVariants.find(
          (variant: any) =>
            variant.design === selectedDesign && variant.base === selectedFlavor
        ) ||
        cakeVariants.find((variant: any) => variant.design === selectedDesign)
      : isTrainingTreats
        ? parsedVariants.find(
            (variant) =>
              variant.name.includes(selectedTrainingFlavor) &&
              variant.name.includes(selectedTrainingPack)
          )
        : isPupcakes
          ? parsedVariants.find((variant) => variant.name.includes(selectedPupcakeBox))
          : parsedVariants.find(
              (variant) => variant.name.includes(selectedPackOption)
            ) ||
            parsedVariants.find((variant) => variant.id === selectedVariantId)) ||
    parsedVariants[0] ||
    null;

  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setSelectedDesign(designs[0] ?? "");
      setSelectedFlavor("Non-Protein");
      setSelectedSize(sizes[0] ?? "");
      setSelectedVariantId(parsedVariants[0]?.id ?? null);
      setSelectedCakeFlavor("Apple & Carrot");
      setSelectedTrainingFlavor("Pee-Nutz");
      setSelectedTrainingPack("1 Pack");
      setSelectedPackOption("1 Pack");
      setSelectedPupcakeBox("Box of 2");
    }
  }, [product?.id, parsedVariants]);

  useEffect(() => {
    if (!useCakeSelectors) return;
    if (bases.length > 0 && !bases.includes(selectedFlavor)) {
      setSelectedFlavor("Non-Protein");
    }
  }, [bases, selectedFlavor, useCakeSelectors]);

  useEffect(() => {
    if (!useCakeSelectors) return;
    if (sizes.length > 0 && !sizes.includes(selectedSize)) {
      setSelectedSize(sizes[0]);
    }
  }, [sizes, selectedSize, useCakeSelectors]);

  const images = useMemo(() => {
    if (!product) return [];
    let imageUrls: string[] = [];
    if (Array.isArray(product.imageUrls)) {
      imageUrls = product.imageUrls;
    } else if (typeof product.imageUrls === "string") {
      try {
        const parsed = JSON.parse(product.imageUrls);
        if (Array.isArray(parsed)) imageUrls = parsed;
      } catch {
        imageUrls = [];
      }
    }

    const barkdayBoxImages = [
      "https://i.ibb.co/0gpzNsx/image.png",
      "https://i.ibb.co/x8PrBc28/image.png",
      "https://i.ibb.co/jPy7JDvm/image.png",
    ];
    const cakeDesignImages: Record<string, string[]> = {
      "Drip Design": [
        "https://i.ibb.co/Fkkf5xrD/image.png",
        "https://i.ibb.co/HDJrVNJ3/image.png",
      ],
      "Standard Non-Personalised": [
        "https://i.ibb.co/HDNsKRS2/image.png",
        "https://i.ibb.co/G3pYK2Z8/image.png",
      ],
    };
    const pupcakesImages = ["https://i.ibb.co/4RHFLxnN/image.png"];
    const dognutsImages = [
      "https://i.ibb.co/8L24cVhq/image.png",
      "https://i.ibb.co/23WhMt5L/image.png",
    ];
    const wooflesImages = [
      "https://i.ibb.co/sTX4gCq/image.png",
      "https://i.ibb.co/S4sd2DGB/image.png",
      "https://i.ibb.co/VYfcVtXy/image.png",
      "https://i.ibb.co/bj4YCFwx/image.png",
    ];
    if (isCake && selectedDesign && cakeDesignImages[selectedDesign]?.length) {
      return cakeDesignImages[selectedDesign];
    }
    if (isPupcakes) {
      return pupcakesImages;
    }
    if (isDognuts) {
      return dognutsImages;
    }
    const base =
      isBarkdayBox
        ? barkdayBoxImages
        : isWoofles
          ? wooflesImages
        : imageUrls.length > 0
          ? imageUrls.filter(Boolean)
          : [product.imageUrl].filter(Boolean);
    if (selectedVariant?.imageUrl && !base.includes(selectedVariant.imageUrl)) {
      return [selectedVariant.imageUrl, ...base];
    }
    return base;
  }, [product, selectedVariant?.imageUrl]);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setSelectedImage((current) => (current + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    setImageOpacity(0);
    const timeout = setTimeout(() => setImageOpacity(1), 50);
    return () => clearTimeout(timeout);
  }, [selectedImage]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-32 pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse bg-secondary rounded-3xl h-[560px]" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-32 pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-display font-bold text-accent mb-4">Product not found</h1>
            <Link href="/shop" className="text-primary font-semibold hover:underline">Back to Shop</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-36 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground shadow-soft hover:shadow-soft-hover transition-all duration-300 hover:-translate-y-0.5 mt-8 mb-6 text-lg"
          >
            Back to shop
          </Link>

          <div className="mt-8 grid md:grid-cols-2 gap-8 bg-white border border-border rounded-3xl p-6">
            <div>
              <div className="aspect-square rounded-2xl overflow-hidden bg-secondary mb-4">
                <img
                  src={images[selectedImage] || product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-opacity duration-500"
                  style={{ opacity: imageOpacity }}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {images.map((image: string, index: number) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setSelectedImage(index)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 ${
                      selectedImage === index ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <h1 className="text-4xl font-display font-bold text-accent">{product.name}</h1>
                <p className="text-3xl font-bold text-primary mt-1">
                  EUR {(Number(selectedVariant?.price ?? product.price) || 0).toFixed(2)}
                </p>
              </div>

              {variants.length > 0 && useCakeSelectors && (
                <div>
                  <h2 className="font-display font-bold text-accent mb-2">Design</h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {designs.map((design) => (
                      <button
                        key={design}
                        onClick={() => {
                          setSelectedDesign(design);
                          setSelectedImage(0);
                        }}
                        className={`px-3 py-2 rounded-xl border text-left transition-colors ${
                          selectedDesign === design
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="font-semibold text-sm">{design}</div>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setSelectedDesign("Deluxe/Bespoke");
                        setSelectedImage(0);
                      }}
                      className={`px-3 py-2 rounded-xl border text-left transition-colors ${
                        selectedDesign === "Deluxe/Bespoke"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold text-sm">Deluxe/Bespoke</div>
                    </button>
                  </div>

                  {!isDeluxe && (
                    <>
                      <h2 className="font-display font-bold text-accent mb-2">Flavor</h2>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {[
                          "Apple & Carrot",
                          "Banana & Peanut Butter",
                          "Chicken & Spinach",
                          "Red Velvet (Beef & Beetroot)",
                        ].map((flavor) => (
                          <button
                            key={flavor}
                            onClick={() => {
                              setSelectedCakeFlavor(flavor);
                              setSelectedImage(0);
                            }}
                            className={`px-3 py-2 rounded-xl border text-left transition-colors ${
                              selectedCakeFlavor === flavor
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="font-semibold text-sm">{flavor}</div>
                          </button>
                        ))}
                      </div>

                      <h2 className="font-display font-bold text-accent mb-2">Size</h2>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => {
                              setSelectedSize(size);
                              setSelectedImage(0);
                            }}
                            className={`px-3 py-2 rounded-xl border text-left transition-colors ${
                              selectedSize === size
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="font-semibold text-sm">{size}</div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {isDeluxe && (
                    <div className="mt-2 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-accent">
                      Email us at thewoofingoven@gmail.com for an order.
                    </div>
                  )}
                </div>
              )}

              {variants.length > 1 && !useCakeSelectors && (
                <div>
                  <h2 className="font-display font-bold text-accent mb-2">Options</h2>

                  {isTrainingTreats && (
                    <>
                      <div className="text-sm font-semibold text-accent/80 mb-2">Flavor</div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {["Pee-Nutz", "Tuna Puffs", "Cheesy Bites"].map((flavor) => (
                          <button
                            key={flavor}
                            onClick={() => {
                              setSelectedTrainingFlavor(flavor);
                              setSelectedImage(0);
                            }}
                            className={`px-3 py-2 rounded-xl border text-left transition-colors ${
                              selectedTrainingFlavor === flavor
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="font-semibold text-sm">{flavor}</div>
                          </button>
                        ))}
                      </div>

                      <div className="text-sm font-semibold text-accent/80 mb-2">Pack</div>
                      <div className="flex flex-wrap gap-2">
                        {["1 Pack", "4 Packs"].map((pack) => (
                          <button
                            key={pack}
                            onClick={() => {
                              setSelectedTrainingPack(pack);
                              setSelectedImage(0);
                            }}
                            className={`px-3 py-2 rounded-xl border text-left transition-colors ${
                              selectedTrainingPack === pack
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="font-semibold text-sm">{pack}</div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {(isWoofles || isDognuts || isBarkdayBox || isPupcakes) && (
                    <div className="flex flex-wrap gap-2">
                      {(isPupcakes
                        ? ["Box of 2", "Box of 4", "Box of 6", "Box of 12", "Box of 24"]
                        : isDognuts
                          ? ["Box of 6", "Box of 12"]
                          : isBarkdayBox
                            ? ["Collection", "Delivery"]
                            : ["1 Pack", "4 Packs"]
                      ).map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            if (isPupcakes) setSelectedPupcakeBox(option);
                            else setSelectedPackOption(option);
                            setSelectedImage(0);
                          }}
                          className={`px-3 py-2 rounded-xl border text-left transition-colors ${
                            (isPupcakes
                              ? selectedPupcakeBox
                              : selectedPackOption) === option
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="font-semibold text-sm">{option}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <h2 className="font-display font-bold text-accent mb-1">Description</h2>
                <p className="text-accent/80">{product.description}</p>
              </div>

              <Button
                className="w-full gap-2"
                onClick={() => {
                  if (isDeluxe) return;
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
                  const customization =
                    isCake && selectedCakeFlavor
                      ? { flavor: selectedCakeFlavor }
                      : undefined;
                  addItem(product, cartVariant, 1, customization);
                }}
                disabled={isDeluxe}
              >
                <ShoppingBag size={18} />
                {isDeluxe ? "Email to Order" : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
