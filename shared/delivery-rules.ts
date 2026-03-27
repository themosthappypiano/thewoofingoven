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

export function isCollectionOnlyProduct(product?: ProductLike | null): boolean {
  const name = String(product?.name ?? "").trim().toLowerCase();
  const category = String(product?.category ?? "").trim().toLowerCase();

  if (category === "cake") return true;
  if (name.includes("pupcake")) return true;
  if (name.includes("birthday cake")) return true;
  if (name.includes("doggy birthday cake")) return true;
  if (name.includes("doggie cake")) return true;

  return false;
}

export function isCollectionOnlyCartItem(item?: CartItemLike | null): boolean {
  if (!item) return false;
  if (item.shippingRequired === false) return true;
  if (item.variant?.shippingRequired === false) return true;
  if (item.variantData?.shippingRequired === false) return true;

  return isCollectionOnlyProduct(
    item.product ?? {
      name: item.productName ?? item.name,
      category: item.productCategory ?? item.category,
    }
  );
}
