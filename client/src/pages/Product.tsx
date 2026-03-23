import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { useProduct } from "@/hooks/use-api";
import { useCart } from "@/store/use-cart";
import { ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";

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
  const [isFlavorInfoOpen, setIsFlavorInfoOpen] = useState(false);
  const [isBenefitsOpen, setIsBenefitsOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const variants: Variant[] = product?.variants || [];
  const isCake = product?.category === 'cake';
  const isPupcakes = product?.name === 'Pupcakes';
  const isTrainingTreats = product?.name === 'Training Treats';
  const isWoofles = product?.name === 'Woofles';
  const isDognuts = product?.name === 'Dognuts';
  const isBarkdayBox = product?.name === 'Barkday Box';
  const useCakeSelectors = isCake && !isPupcakes;
  const shouldAutoRotateImages = !useCakeSelectors || !selectedDesign || selectedDesign === "Deluxe/Bespoke";
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
  const isBoneShaped = selectedDesign === "Bone Shaped Design";
  const selectedVariant =
    (useCakeSelectors
      ? cakeVariants.find(
          (variant: any) =>
            variant.design === selectedDesign &&
            variant.base === selectedCakeFlavor &&
            variant.size === selectedSize
        ) ||
        cakeVariants.find(
          (variant: any) =>
            variant.design === selectedDesign && variant.base === selectedCakeFlavor
        ) ||
        cakeVariants.find((variant: any) => variant.design === selectedDesign)
      : isTrainingTreats
        ? parsedVariants.find(
            (variant) =>
              variant.name.includes(selectedTrainingFlavor) &&
              variant.name.includes(selectedTrainingPack)
          )
        : isPupcakes
          ? parsedVariants.find((variant) => variant.name === selectedPupcakeBox || variant.name === `Apple & Carrot - ${selectedPupcakeBox} - Pack`)
          : parsedVariants.find(
              (variant) => variant.name.includes(selectedPackOption)
            ) ||
            parsedVariants.find((variant) => variant.id === selectedVariantId)) ||
    parsedVariants[0] ||
    null;

  // Product descriptions based on user's detailed content
  const productDescriptions: Record<string, { short: string; full: string }> = {
    "Bow-Wownies": {
      short: "Soft, chewy training treats made with real beef liver, banana and Greek yogurt for a naturally rich flavour dogs love.",
      full: "Bow-Wownies are soft, chewy training treats made with **real beef liver, banana and Greek yogurt** for a naturally rich flavour dogs love. Their small size makes them perfect for training sessions, allowing you to reward your pup frequently without overfeeding. The soft texture also makes them easy to chew for puppies, small breeds and senior dogs.\n\nMade with **100% oat flour**, these treats are gentle on digestion while still being highly motivating during training or playtime."
    },
    "Pee-Nutz": {
      short: "Small, tasty peanut butter treats specially baked for training and enrichment activities.",
      full: "Pee-Nutz are small, tasty peanut butter treats specially baked for training and enrichment activities. Their bite-size shape makes them ideal for teaching new commands, rewarding good behaviour or using inside **snuffle mats and puzzle toys**.\n\nMade with simple ingredients and **dog-friendly peanut butter**, they are easy to digest and loved by dogs of all sizes."
    },
    "Tuna Puffs": {
      short: "Light, savoury training treats made with tuna in spring water and flaxseed, creating a naturally fishy flavour dogs find irresistible.",
      full: "Tuna Puffs are light, savoury training treats made with **tuna in spring water and flaxseed**, creating a naturally fishy flavour dogs find irresistible. These tiny bites are perfect as high-value rewards during recall training or enrichment games.\n\nTheir small size makes them perfect for frequent rewards while keeping dogs focused and engaged."
    },
    "Cheesy Bites": {
      short: "Tiny savoury treats made with grated mozzarella and a touch of turmeric, giving them a flavour dogs absolutely love.",
      full: "Cheesy Bites are tiny savoury treats made with **grated mozzarella and a touch of turmeric**, giving them a flavour dogs absolutely love. Their soft texture allows dogs to quickly enjoy the reward and stay focused on the next command.\n\nThese treats are perfect for training sessions, enrichment toys and everyday rewards."
    },
    "Training Treats": {
      short: "A selection of small, motivating training treats including Pee-Nutz, Tuna Puffs, and Cheesy Bites.",
      full: "Our Training Treats collection includes three different flavors perfect for training sessions:\n\n**Pee-Nutz** - Tiny peanut butter training treats\n**Tuna Puffs** - Soft tuna & flaxseed training bites\n**Cheesy Bites** - Soft mozzarella training treats\n\nAll treats are small-sized, easy to chew, and perfect for frequent rewards during training without overfeeding."
    },
    "Woofles": {
      short: "Our signature grain-free soft carrot waffles, the very first treat created at The Woofing Oven.",
      full: "Woofles are our **signature product and the very first treat created at The Woofing Oven**. These soft, grain-free waffles are made with carrot and chickpea flour, creating a wholesome snack that is gentle on sensitive tummies.\n\nThey can be enjoyed as a simple everyday treat or topped with dog-friendly spreads for an extra special moment."
    },
    "Dognuts": {
      short: "Soft baked donuts made with banana, peanut butter and Greek yogurt, topped with dog-friendly icing and coconut sprinkles.",
      full: "Dognuts are soft baked donuts made with **banana, peanut butter and Greek yogurt**, creating a naturally sweet treat that dogs adore. Each donut is topped with **dog-friendly icing and coconut sprinkles**, making them perfect for birthdays, gotcha days and special celebrations.\n\nThey are soft, fluffy and easy to share with dog friends during a paw-ty."
    },
    "Petzza": {
      short: "Dog-friendly 8\" pizza treat baked with minced chicken, minced beef, vegetables and mozzarella cheese.",
      full: "Petzza is our fun dog-friendly version of pizza, baked with **minced chicken, minced beef, vegetables and mozzarella cheese** on a gentle oat-flour base. Each Petzza measures approximately **8 inches and is cut into about 7 slices**, making it perfect for sharing at doggy parties or daycare celebrations.\n\nFor extra flavour, a **bacon topping can be added on request**."
    },
    "Doggy Birthday Cake": {
      short: "Freshly baked celebration cakes made specially for dogs using simple, natural ingredients.",
      full: "Our Doggie Cakes are freshly baked celebration cakes made specially for dogs using simple, natural ingredients. Each cake is filled with a creamy blend of **Greek yogurt and peanut butter** and finished with a smooth **cream cheese frosting**.\n\nThey are available in **3\", 4\", and 6\" round cakes**, as well as a **bone-shaped cake** perfect for larger dog parties or daycare celebrations.\n\n**Available flavours:**\n- **Banana & Peanut Butter** – a naturally sweet favourite\n- **Apple & Carrots** – a gentle, lightly sweet recipe\n- **Chicken & Spinach** – a savoury cake for meaty flavors\n- **Mince Beef & Beetroot** – our dog-friendly \"red velvet\""
    },
    "Pupcakes": {
      short: "Mini dog cupcakes made with apple and carrot, perfect for small celebrations and party favours.",
      full: "Pupcakes are mini dog cupcakes made with the same wholesome recipe as our Apple & Carrot Doggie Cake. These soft treats are perfect for **small celebrations, party favours, daycare treats or Barkday Boxes**.\n\nThey can be served plain or topped with a light **cream cheese frosting**."
    },
    "Gingerbread Hooman": {
      short: "Playful dog-friendly version of the classic gingerbread man, lightly spiced with ginger and cinnamon.",
      full: "The Gingerbread Hooman is our playful dog-friendly version of the classic gingerbread man. Lightly spiced with **ground ginger and a touch of cinnamon**, and gently sweetened with **honey**, this cookie is a festive treat dogs can enjoy during the holiday season.\n\nIt's perfect for **Christmas treat boxes, seasonal markets and holiday gifting**."
    }
  };

  const trainingFlavorInfo: Record<string, { description: string; ingredients: string[] }> = {
    "Pee-Nutz": {
      description:
        "Tiny peanut butter training treats specially baked for training and enrichment activities.",
      ingredients: ["Dog friendly peanut butter", "Oat flour", "Egg"],
    },
    "Tuna Puffs": {
      description:
        "Soft tuna & flaxseed training bites made with tuna in spring water and flaxseed.",
      ingredients: ["Spring water tuna", "Oat flour", "Egg", "Flaxseed"],
    },
    "Cheesy Bites": {
      description:
        "Soft mozzarella training treats made with grated mozzarella and a touch of turmeric.",
      ingredients: ["Cheese", "Oat flour", "Egg"],
    },
  };
  const selectedTrainingFlavorInfo = trainingFlavorInfo[selectedTrainingFlavor];

  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setSelectedDesign("");
      setSelectedFlavor("Non-Protein");
      setSelectedSize(sizes[0] ?? "");
      setSelectedVariantId(parsedVariants[0]?.id ?? null);
      setSelectedCakeFlavor("Apple & Carrot");
      setSelectedTrainingFlavor("Pee-Nutz");
      setSelectedTrainingPack("1 Pack");
      setSelectedPackOption(product.name === "Woofles" ? "4 Packs" : "1 Pack");
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
      "https://i.postimg.cc/PJVJF3xg/Whats-App-Image-2026-03-14-at-19-13-35.jpg",
      "https://i.ibb.co/x8PrBc28/image.png",
      "https://i.ibb.co/jPy7JDvm/image.png",
      "https://i.postimg.cc/6qbq1jq9/Whats-App-Image-2026-03-14-at-19-13-18.jpg",
    ];
    const cakeDesignImages: Record<string, string[]> = {
      "Drip Design": [
        "https://i.ibb.co/Fkkf5xrD/image.png",
        "https://i.ibb.co/HDJrVNJ3/image.png",
      ],
      "Standard Personalised": [
        "https://i.ibb.co/HDNsKRS2/image.png",
        "https://i.ibb.co/G3pYK2Z8/image.png",
      ],
      "Bone Shaped Design": [
        "https://i.postimg.cc/zBT4c9PF/Chat-GPT-Image-Mar-14-2026-06-46-24-PM.png",
        "https://i.postimg.cc/cJVg614N/Whats-App-Image-2025-10-15-at-21-35-32-(7).jpg",
        "https://i.postimg.cc/KYdk4cv2/Whats-App-Image-2025-10-15-at-21-35-34-(8).jpg",
        "https://i.postimg.cc/9X6BLL35/Whats-App-Image-2026-03-10-at-18-12-46.jpg",
        "https://i.postimg.cc/MZCY9dC4/Whats-App-Image-2026-03-10-at-18-12-46(1).jpg",
      ],
      "Deluxe/Bespoke": [
        "https://i.postimg.cc/YCzNZx43/Whats-App-Image-2025-10-15-at-21-35-34-(4).jpg",
        "https://i.postimg.cc/T1YmYBxC/Whats-App-Image-2025-10-15-at-21-35-34-(9).jpg",
        "https://i.postimg.cc/ZKnV9GxK/Whats-App-Image-2026-03-10-at-18-14-15.jpg",
        "https://i.postimg.cc/5NynHhS9/Whats-App-Image-2026-03-10-at-18-14-15(1).jpg",
        "https://i.postimg.cc/65qY7kfB/Whats-App-Image-2026-03-10-at-18-17-05.jpg",
      ],
    };
    const defaultCakeImages = [
      "https://i.postimg.cc/sXJ7zskn/Whats-App-Image-2025-10-15-at-21-35-26.jpg",
      "https://i.postimg.cc/V6FnwmxG/Whats-App-Image-2025-10-15-at-21-35-32-(3).jpg",
      "https://i.postimg.cc/LXVLS2cQ/Whats-App-Image-2025-10-15-at-21-35-32-(6).jpg",
      "https://i.postimg.cc/JnQZ8Mf2/Whats-App-Image-2025-10-15-at-21-35-34-(3).jpg",
      "https://i.postimg.cc/YCzNZx43/Whats-App-Image-2025-10-15-at-21-35-34-(4).jpg",
      "https://i.postimg.cc/ZnK3KXmj/Whats-App-Image-2025-10-15-at-21-35-34-(5).jpg",
      "https://i.postimg.cc/yxY9Y2KL/Whats-App-Image-2025-10-15-at-21-35-34-(6).jpg",
      "https://i.postimg.cc/T1YmYBxC/Whats-App-Image-2025-10-15-at-21-35-34-(9).jpg",
    ];
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
    if (isPupcakes) {
      return pupcakesImages;
    }
    if (isCake && selectedDesign && cakeDesignImages[selectedDesign]?.length) {
      // For Standard Personalised, show specific image based on size
      if (selectedDesign === "Standard Personalised") {
        const images = cakeDesignImages[selectedDesign];
        if (selectedSize === "6 inch") {
          return [images[0]]; // First image for 6 inch
        } else if (selectedSize === "3 inch") {
          return [images[1]]; // Second image for 3 inch
        }
        return images; // Show both if no specific size selected
      }
      return cakeDesignImages[selectedDesign];
    }
    if (useCakeSelectors && !selectedDesign) {
      return defaultCakeImages;
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
  }, [
    product,
    selectedDesign,
    selectedSize,
    isCake,
    isPupcakes,
    isDognuts,
    isBarkdayBox,
    isWoofles,
    selectedVariant?.imageUrl,
  ]);

  useEffect(() => {
    if (selectedImage > 0 && selectedImage >= images.length) {
      setSelectedImage(0);
    }
  }, [images.length, selectedImage]);

  useEffect(() => {
    if (!shouldAutoRotateImages || images.length <= 1) return;
    const interval = setInterval(() => {
      setSelectedImage((current) => (current + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length, shouldAutoRotateImages]);

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
      <main className="flex-1 pt-24 sm:pt-32 lg:pt-36 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-primary text-primary-foreground shadow-soft hover:shadow-soft-hover transition-all duration-300 hover:-translate-y-0.5 mt-4 sm:mt-8 mb-4 sm:mb-6 text-base sm:text-lg relative z-10"
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
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-display font-bold text-accent">{product.name}</h1>
                  {isPupcakes && (
                    <span className="text-sm font-semibold uppercase tracking-wide text-red-600">
                      Collection only
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold text-primary mt-1">
                  {isDeluxe ? "From 80 euros" : 
                   isBoneShaped ? 
                     (selectedCakeFlavor === "Chicken & Spinach" || selectedCakeFlavor === "Red Velvet (Beef & Beetroot)" ? 
                       "From 70 euros" : "From 65 euros") :
                     `EUR ${(Number(selectedVariant?.price ?? product.price) || 0).toFixed(2)}`}
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
                        setSelectedDesign("Bone Shaped Design");
                        setSelectedImage(0);
                      }}
                      className={`px-3 py-2 rounded-xl border text-left transition-colors ${
                        selectedDesign === "Bone Shaped Design"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold text-sm">Bone Shaped Design</div>
                    </button>
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

                  {!isDeluxe && !isBoneShaped && (
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
                      Bespoke cakes are made to your imagination that's why we require more information to get these done to you. Email us at thewoofingoven@gmail.com for an order.
                    </div>
                  )}

                  {isBoneShaped && (
                    <div className="mt-2 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-accent">
                      Bone shaped design variant - perfect for big pawtys (daycare, anniversaries and big celebrations)! Email us at thewoofingoven@gmail.com for an order.
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
                              setIsFlavorInfoOpen(true);
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
                      {selectedTrainingFlavorInfo && (
                        <div className="mb-4 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
                          <div className="text-sm font-semibold text-accent mb-1">
                            {selectedTrainingFlavor}
                          </div>
                          <p className="text-sm text-accent/80 mb-2">
                            {selectedTrainingFlavorInfo.description}
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => setIsFlavorInfoOpen(true)}
                              className="text-sm font-semibold text-primary hover:underline"
                            >
                              View ingredients
                            </button>
                            <button
                              onClick={() => setIsBenefitsOpen(true)}
                              className="text-sm font-semibold text-primary hover:underline"
                            >
                              Benefits
                            </button>
                          </div>
                        </div>
                      )}

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
                            : isWoofles
                              ? ["4 Packs"]
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
                {(() => {
                  const productDesc = productDescriptions[product.name];
                  if (productDesc) {
                    return (
                      <div>
                        <p className="text-accent/80 mb-2">{productDesc.short}</p>
                        {productDesc.full.length > productDesc.short.length && (
                          <button
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            className="inline-flex items-center gap-1 text-primary font-semibold hover:underline text-sm"
                          >
                            {isDescriptionExpanded ? "Show less" : "Read more"}
                            {isDescriptionExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        )}
                        {isDescriptionExpanded && (
                          <div className="mt-3 p-4 bg-secondary/30 rounded-2xl">
                            <div className="text-accent/80 whitespace-pre-line">
                              {productDesc.full.split('**').map((part, index) => 
                                index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return <p className="text-accent/80">{product.description}</p>;
                })()}
              </div>

              <Button
                className="w-full gap-2"
                onClick={() => {
                  if (isDeluxe || isBoneShaped) return;
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
                disabled={isDeluxe || isBoneShaped}
              >
                <ShoppingBag size={18} />
                {isDeluxe || isBoneShaped ? "Email to Order" : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {isTrainingTreats && isFlavorInfoOpen && selectedTrainingFlavorInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsFlavorInfoOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-2xl font-display font-bold text-accent mb-2">
              {selectedTrainingFlavor}
            </h3>
            <p className="text-accent/80 mb-4">{selectedTrainingFlavorInfo.description}</p>
            <h4 className="text-sm font-bold text-accent mb-2">Ingredients</h4>
            <ul className="space-y-2 mb-5">
              {selectedTrainingFlavorInfo.ingredients.map((ingredient) => (
                <li key={ingredient} className="text-sm text-accent/80">
                  - {ingredient}
                </li>
              ))}
            </ul>
            <Button className="w-full" onClick={() => setIsFlavorInfoOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      )}

      {isTrainingTreats && isBenefitsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsBenefitsOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-2xl font-display font-bold text-accent mb-4">
              Benefits of Training Treats
            </h3>
            <div className="space-y-3 mb-6 text-sm text-accent/80">
              <p><strong>Perfect size for training</strong> – small bites allow frequent rewards without overfeeding.</p>
              <p><strong>Highly motivating flavours</strong> – strong natural aromas (peanut butter, tuna, cheese, liver) help keep your dog focused and engaged during training.</p>
              <p><strong>Soft, easy-to-chew texture</strong> – suitable for puppies, small breeds, and senior dogs.</p>
              <p><strong>Quick to eat</strong> – dogs can swallow them quickly and stay focused on the next command instead of chewing for long.</p>
              <p><strong>Gentle ingredients</strong> – made with oat flour and simple, dog-friendly ingredients that are easy on digestion.</p>
              <p><strong>Ideal for enrichment toys</strong> – their small size makes them perfect for snuffle mats, puzzle toys, and training games.</p>
              <p><strong>Great for positive reinforcement</strong> – helps reinforce good behaviour and build strong training habits.</p>
            </div>
            <Button className="w-full" onClick={() => setIsBenefitsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
