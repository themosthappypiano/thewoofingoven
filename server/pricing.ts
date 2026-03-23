// Dynamic Pricing System for The Woofing Oven
// This system calculates prices dynamically based on product configuration

export interface PricingConfig {
  // Base cake pricing structure
  cakes: {
    sizes: {
      [key: string]: { basePrice: number; weight: number };
    };
    proteinSurcharge: number; // Extra cost for protein-based cakes
    personalizationSurcharge: number; // Extra cost for personalized cakes
    dripSurcharge: number; // Extra cost for drip design
    specialShapes: {
      bone: number; // Fixed price for bone-shaped cakes
    };
  };
  
  // Pupcakes pricing
  pupcakes: {
    basePricePerUnit: number;
    bulkDiscounts: {
      [quantity: number]: number; // quantity -> total price
    };
  };

  // Training treats pricing
  trainingTreats: {
    singlePackPrice: number;
    multiPackDiscount: {
      4: number; // 4-pack bundle price
    };
  };

  // Other products
  woofles: {
    singlePackPrice: number;
    multiPackDiscount: {
      4: number; // 4-pack bundle price
    };
  };

  dognuts: {
    pricePerUnit: number;
    minimumOrder: number;
  };

  barkdayBox: {
    collectionPrice: number;
    deliverySurcharge: number;
  };

  seasonal: {
    basePrice: number;
    personalizationSurcharge: number;
  };

  // Delivery pricing
  delivery: {
    dublinRate: number; // per kilometer
    freeDeliveryThreshold?: number;
  };
}

// Current pricing configuration
export const PRICING_CONFIG: PricingConfig = {
  cakes: {
    sizes: {
      "3 inch": { basePrice: 35, weight: 300 },
      "4 inch": { basePrice: 40, weight: 450 },
      "6 inch": { basePrice: 50, weight: 700 }
    },
    proteinSurcharge: 5, // €5 extra for protein cakes
    personalizationSurcharge: 5, // €5 extra for personalized (except 6" which stays same)
    dripSurcharge: 15, // €15 extra for drip design (4" becomes 55€, 6" becomes 60€)
    specialShapes: {
      bone: 65 // Fixed €65 for bone-shaped cakes
    }
  },

  pupcakes: {
    basePricePerUnit: 3.60, // €7.20 / 2 = €3.60 per pupcake
    bulkDiscounts: {
      2: 7.20,
      4: 14.00,
      6: 20.00,
      12: 40.00,
      24: 80.00
    }
  },

  trainingTreats: {
    singlePackPrice: 7.00,
    multiPackDiscount: {
      4: 25.00 // €3 savings on 4-pack
    }
  },

  woofles: {
    singlePackPrice: 7.00,
    multiPackDiscount: {
      4: 40.00 // Bulk pricing for 4 packs
    }
  },

  dognuts: {
    pricePerUnit: 3.30,
    minimumOrder: 6
  },

  barkdayBox: {
    collectionPrice: 30.00,
    deliverySurcharge: 10.00
  },

  seasonal: {
    basePrice: 12.00,
    personalizationSurcharge: 6.00
  },

  delivery: {
    dublinRate: 0.85 // €0.85 per kilometer
  }
};

export interface CakeOptions {
  size: "3 inch" | "4 inch" | "6 inch";
  flavor: "Banana & Peanut Butter" | "Apple & Carrot" | "Chicken & Spinach" | "Red Velvet (Beef & Beetroot)";
  design: "Non-Personalised" | "Personalised Name" | "Drip Design" | "Bone-shaped";
  isProtein?: boolean; // Auto-determined from flavor if not provided
}

export interface PupcakeOptions {
  quantity: 2 | 4 | 6 | 12 | 24;
}

export interface DeliveryOptions {
  type: "collection" | "delivery";
  distance?: number; // kilometers for delivery
}

// Calculate birthday cake price
export function calculateCakePrice(options: CakeOptions): { price: number; breakdown: string[] } {
  const breakdown: string[] = [];
  
  // Handle special shapes
  if (options.design === "Bone-shaped") {
    breakdown.push(`Bone-shaped cake: €${PRICING_CONFIG.cakes.specialShapes.bone}`);
    return { price: PRICING_CONFIG.cakes.specialShapes.bone, breakdown };
  }

  // Get base price for size
  const sizeConfig = PRICING_CONFIG.cakes.sizes[options.size];
  if (!sizeConfig) {
    throw new Error(`Invalid cake size: ${options.size}`);
  }
  
  let price = sizeConfig.basePrice;
  breakdown.push(`${options.size} base: €${price}`);

  // Determine if protein (auto-detect if not explicitly provided)
  const isProtein = options.isProtein ?? 
    (options.flavor === "Chicken & Spinach" || options.flavor === "Red Velvet (Beef & Beetroot)");

  // Add protein surcharge
  if (isProtein) {
    // For 3" cakes, protein makes it €40 instead of €35
    // For 4" cakes, protein makes it €45 instead of €40  
    // For 6" cakes, protein makes it €55 instead of €50
    price += PRICING_CONFIG.cakes.proteinSurcharge;
    breakdown.push(`Protein flavor: +€${PRICING_CONFIG.cakes.proteinSurcharge}`);
  }

  // Add personalization surcharge (but not for 6" cakes, they stay the same)
  if (options.design === "Personalised Name") {
    if (options.size !== "6 inch") {
      // 3" and 4" get +€5 for personalization
      price += PRICING_CONFIG.cakes.personalizationSurcharge;
      breakdown.push(`Personalization: +€${PRICING_CONFIG.cakes.personalizationSurcharge}`);
    } else {
      breakdown.push(`Personalization: €0 (included for 6" cakes)`);
    }
  }

  // Add drip design surcharge (not available for 3")
  if (options.design === "Drip Design") {
    if (options.size === "3 inch") {
      throw new Error("Drip design is not available for 3 inch cakes");
    }
    
    // Drip design pricing:
    // 4" non-protein: €55 (€40 base + €15 drip)
    // 4" protein: €60 (€45 base + €15 drip) 
    // 6" non-protein: €60 (€50 base + €10 drip)
    // 6" protein: €65 (€55 base + €10 drip)
    
    const dripSurcharge = options.size === "4 inch" ? 15 : 10;
    price += dripSurcharge;
    breakdown.push(`Drip design: +€${dripSurcharge}`);
  }

  return { price, breakdown };
}

// Calculate pupcake price
export function calculatePupcakePrice(options: PupcakeOptions): { price: number; breakdown: string[] } {
  const breakdown: string[] = [];
  const price = PRICING_CONFIG.pupcakes.bulkDiscounts[options.quantity];
  
  if (!price) {
    throw new Error(`Invalid pupcake quantity: ${options.quantity}`);
  }

  const unitPrice = (price / options.quantity).toFixed(2);
  breakdown.push(`${options.quantity} pupcakes at €${unitPrice} each: €${price}`);
  
  return { price, breakdown };
}

// Calculate training treats price
export function calculateTrainingTreatsPrice(packs: number, flavor?: string): { price: number; breakdown: string[] } {
  const breakdown: string[] = [];
  
  if (packs === 4) {
    const price = PRICING_CONFIG.trainingTreats.multiPackDiscount[4];
    const savings = (PRICING_CONFIG.trainingTreats.singlePackPrice * 4) - price;
    breakdown.push(`4-pack bundle: €${price} (Save €${savings.toFixed(2)})`);
    return { price, breakdown };
  } else {
    const price = PRICING_CONFIG.trainingTreats.singlePackPrice * packs;
    breakdown.push(`${packs} pack(s) at €${PRICING_CONFIG.trainingTreats.singlePackPrice} each: €${price}`);
    return { price, breakdown };
  }
}

// Calculate woofles price
export function calculateWooflesPrice(packs: number): { price: number; breakdown: string[] } {
  const breakdown: string[] = [];
  
  if (packs === 4) {
    const price = PRICING_CONFIG.woofles.multiPackDiscount[4];
    const savings = (PRICING_CONFIG.woofles.singlePackPrice * 4) - price;
    breakdown.push(`4-pack bundle: €${price} (Save €${savings.toFixed(2)} vs single packs)`);
    return { price, breakdown };
  } else {
    const price = PRICING_CONFIG.woofles.singlePackPrice * packs;
    breakdown.push(`${packs} pack(s) at €${PRICING_CONFIG.woofles.singlePackPrice} each: €${price}`);
    return { price, breakdown };
  }
}

// Calculate dognuts price
export function calculateDognutsPrice(quantity: number): { price: number; breakdown: string[] } {
  const breakdown: string[] = [];
  
  if (quantity < PRICING_CONFIG.dognuts.minimumOrder) {
    throw new Error(`Minimum order is ${PRICING_CONFIG.dognuts.minimumOrder} dognuts`);
  }
  
  const price = PRICING_CONFIG.dognuts.pricePerUnit * quantity;
  breakdown.push(`${quantity} dognuts at €${PRICING_CONFIG.dognuts.pricePerUnit} each: €${price.toFixed(2)}`);
  
  return { price: parseFloat(price.toFixed(2)), breakdown };
}

// Calculate barkday box price
export function calculateBarkdayBoxPrice(delivery: DeliveryOptions): { price: number; breakdown: string[] } {
  const breakdown: string[] = [];
  let price = PRICING_CONFIG.barkdayBox.collectionPrice;
  
  breakdown.push(`Barkday Box: €${price}`);
  
  if (delivery.type === "delivery") {
    price += PRICING_CONFIG.barkdayBox.deliverySurcharge;
    breakdown.push(`Delivery surcharge: +€${PRICING_CONFIG.barkdayBox.deliverySurcharge}`);
  }
  
  return { price, breakdown };
}

// Calculate seasonal treats price
export function calculateSeasonalTreatsPrice(personalized: boolean = false): { price: number; breakdown: string[] } {
  const breakdown: string[] = [];
  let price = PRICING_CONFIG.seasonal.basePrice;
  
  breakdown.push(`Seasonal treats: €${price}`);
  
  if (personalized) {
    price += PRICING_CONFIG.seasonal.personalizationSurcharge;
    breakdown.push(`Personalization: +€${PRICING_CONFIG.seasonal.personalizationSurcharge}`);
  }
  
  return { price, breakdown };
}

// Calculate delivery cost
export function calculateDeliveryPrice(distance: number): { price: number; breakdown: string[] } {
  const breakdown: string[] = [];
  const price = parseFloat((distance * PRICING_CONFIG.delivery.dublinRate).toFixed(2));
  
  breakdown.push(`${distance}km at €${PRICING_CONFIG.delivery.dublinRate}/km: €${price}`);
  
  return { price, breakdown };
}

// Utility function to update pricing configuration
export function updatePricingConfig(updates: Partial<PricingConfig>): PricingConfig {
  return {
    ...PRICING_CONFIG,
    ...updates,
    // Deep merge for nested objects
    cakes: { ...PRICING_CONFIG.cakes, ...updates.cakes },
    pupcakes: { ...PRICING_CONFIG.pupcakes, ...updates.pupcakes },
    trainingTreats: { ...PRICING_CONFIG.trainingTreats, ...updates.trainingTreats },
    woofles: { ...PRICING_CONFIG.woofles, ...updates.woofles },
    dognuts: { ...PRICING_CONFIG.dognuts, ...updates.dognuts },
    barkdayBox: { ...PRICING_CONFIG.barkdayBox, ...updates.barkdayBox },
    seasonal: { ...PRICING_CONFIG.seasonal, ...updates.seasonal },
    delivery: { ...PRICING_CONFIG.delivery, ...updates.delivery }
  };
}

// Export all pricing functions
export const pricing = {
  calculateCakePrice,
  calculatePupcakePrice,
  calculateTrainingTreatsPrice,
  calculateWooflesPrice,
  calculateDognutsPrice,
  calculateBarkdayBoxPrice,
  calculateSeasonalTreatsPrice,
  calculateDeliveryPrice
};