import { useEffect } from "react";
import { useLocation } from "wouter";

const SITE_URL = "https://www.thewoofingoven.ie";
const DEFAULT_DESCRIPTION =
  "The Woofing Oven is a Dublin dog bakery making natural dog treats, Woofles, pupcakes, Barkday boxes, and custom dog birthday cakes.";

const routeMetadata: Record<string, { title: string; description: string }> = {
  "/": {
    title: "The Woofing Oven | Dog Treats & Dog Cakes in Dublin",
    description: DEFAULT_DESCRIPTION,
  },
  "/shop": {
    title: "Shop Natural Dog Treats & Cakes | The Woofing Oven",
    description:
      "Shop natural dog treats, Woofles, pupcakes, Barkday boxes, and custom dog birthday cakes handmade in Dublin.",
  },
  "/ingredients": {
    title: "Dog Treat Ingredients | The Woofing Oven",
    description:
      "See the dog-friendly ingredients used in The Woofing Oven's handmade treats, cakes, Woofles, pupcakes, and Dognuts.",
  },
  "/faq": {
    title: "Dog Treat & Cake FAQs | The Woofing Oven",
    description:
      "Find answers about ingredients, allergies, storage, delivery, collection, wholesale orders, and custom dog cakes.",
  },
  "/for-business": {
    title: "Wholesale Dog Treats & Catering | The Woofing Oven",
    description:
      "Explore wholesale dog treats, branded biscuits, corporate orders, and dog event catering from our Dublin bakery.",
  },
  "/catering": {
    title: "Dog Event Catering in Dublin | The Woofing Oven",
    description:
      "Dog-friendly event catering, handcrafted bakes, styled displays, delivery, setup, and takedown across Dublin.",
  },
};

function setMeta(selector: string, attribute: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    const [key, name] = attribute === "property"
      ? ["property", selector.match(/property="([^"]+)"/)?.[1]]
      : ["name", selector.match(/name="([^"]+)"/)?.[1]];
    if (name) element.setAttribute(key, name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", value);
}

export function Seo() {
  const [location] = useLocation();

  useEffect(() => {
    const path = location.split("?")[0] || "/";
    const isProductPage = /^\/shop\/[^/]+$/.test(path);
    const isCheckoutPage = path.startsWith("/checkout");
    const metadata = isProductPage
      ? {
          title: "Dog Treats & Cakes | The Woofing Oven",
          description:
            "View handmade dog treats and celebration cakes from The Woofing Oven in Dublin.",
        }
      : routeMetadata[path] || {
          title: "Page Not Found | The Woofing Oven",
          description: DEFAULT_DESCRIPTION,
        };
    const canonicalPath = path === "/" ? "/" : path.replace(/\/+$/, "");
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;

    document.title = metadata.title;
    setMeta('meta[name="description"]', "name", metadata.description);
    setMeta(
      'meta[name="robots"]',
      "name",
      isCheckoutPage || (!routeMetadata[path] && !isProductPage)
        ? "noindex, nofollow"
        : "index, follow",
    );
    setMeta('meta[property="og:title"]', "property", metadata.title);
    setMeta('meta[property="og:description"]', "property", metadata.description);
    setMeta('meta[property="og:url"]', "property", canonicalUrl);
    setMeta('meta[name="twitter:title"]', "name", metadata.title);
    setMeta('meta[name="twitter:description"]', "name", metadata.description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [location]);

  return null;
}
