type ProductLike = {
  name?: string | null;
  category?: string | null;
};

type CartItemLike = {
  shippingRequired?: boolean;
  variant?: { shippingRequired?: boolean };
  variantData?: { shippingRequired?: boolean };
  product?: ProductLike;
  productName?: string;
  productCategory?: string;
  name?: string;
  category?: string;
};

function normalizeProduct(product?: ProductLike | null) {
  return {
    name: String(product?.name ?? "").trim().toLowerCase(),
    category: String(product?.category ?? "").trim().toLowerCase(),
  };
}

export function isAlwaysDeliverableProduct(product?: ProductLike | null): boolean {
  const { name } = normalizeProduct(product);

  if (name === "woofles") return true;
  if (name === "training treats") return true;

  return false;
}

export function isCollectionOnlyProduct(product?: ProductLike | null): boolean {
  const { name, category } = normalizeProduct(product);

  if (isAlwaysDeliverableProduct(product)) return false;

  if (category === "cake") return true;
  if (name.includes("pupcake")) return true;
  if (name.includes("birthday cake")) return true;
  if (name.includes("doggy birthday cake")) return true;
  if (name.includes("doggie cake")) return true;

  return false;
}

export function isCollectionOnlyCartItem(item?: CartItemLike | null): boolean {
  if (!item) return false;
  const product =
    item.product ?? {
      name: item.productName ?? item.name,
      category: item.productCategory ?? item.category,
    };

  if (isAlwaysDeliverableProduct(product)) return false;
  if (item.shippingRequired === false) return true;
  if (item.variant?.shippingRequired === false) return true;
  if (item.variantData?.shippingRequired === false) return true;

  return isCollectionOnlyProduct(product);
}
