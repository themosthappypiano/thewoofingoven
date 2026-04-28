import type { Express } from "express";
import type { Server } from "http";
import type Stripe from "stripe";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { stripe, calculateShipping, SHIPPING_RATES } from "./stripe";
import { db as dbPromise } from "./db";
import { products, productVariants } from "@shared/schema";
import { isCollectionOnlyCartItem } from "@shared/delivery-rules";
import { eq } from "drizzle-orm";

async function seedDatabase() {
  const db = await dbPromise;
  const existingProducts = await storage.getProducts();
  if (existingProducts.length === 0) {
    const sampleProducts = [
      {
        name: "Barkday Box",
        description: "Apple & Peanut Butter biscuit barkday box. Collection or delivery option available.",
        basePrice: "30.00",
        imageUrl: "https://i.ibb.co/0gpzNsx/image.png",
        imageUrls: [
          "https://i.ibb.co/0gpzNsx/image.png",
          "https://i.ibb.co/x8PrBc28/image.png",
          "https://i.ibb.co/jPy7JDvm/image.png",
        ],
        category: "box",
        isFeatured: true,
      },
      {
        name: "Woofles",
        description: "Grain-free carrot waffles. Choose single pack or multi-pack.",
        basePrice: "7.00",
        imageUrl: "https://cdn.shopify.com/s/files/1/0970/6799/1383/files/hmmmm.jpg?v=1765216392",
        category: "treat",
        isFeatured: true,
      },
      {
        name: "Training Treats",
        description: "Pee-Nutz, Tuna Puffs, and Cheesy Bites training treats. 120g packs with multi-pack savings.",
        basePrice: "7.00",
        imageUrl: "https://cdn.shopify.com/s/files/1/0970/6799/1383/files/WhatsAppImage2025-10-15at22.00.56_3_eed392a1-7628-4abb-be3b-7ecc65ce2f51.jpg?v=1765216389",
        category: "treat",
        isFeatured: false,
      },
      {
        name: "Doggy Birthday Cake",
        description: "Birthday cakes in 3, 4, and 6 inch sizes with protein or non-protein bases. Standard, personalised, and drip designs available.",
        basePrice: "35.00",
        imageUrl: "https://i.postimg.cc/sXJ7zskn/Whats-App-Image-2025-10-15-at-21-35-26.jpg",
        category: "cake",
        isFeatured: true,
      }
    ];

    const { db: dbPromise } = await import("./db");
    const { products, reviews } = await import("@shared/schema");
    const db = await dbPromise;

    await db.insert(products).values(sampleProducts);

    const existingReviews = await storage.getReviews();
    if (existingReviews.length === 0) {
      const sampleReviews = [
        {
          dogName: "Rocky",
          rating: 5,
          content: "Absolutely loved the Barkday Box! Best treats in Dublin.",
          imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800"
        },
        {
          dogName: "Bella",
          rating: 5,
          content: "The custom cake was beautiful and devoured in seconds!",
          imageUrl: "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&q=80&w=800"
        },
        {
          dogName: "Max",
          rating: 5,
          content: "Every Sunday we visit the market just for these waffles.",
          imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=800"
        }
      ];
      await db.insert(reviews).values(sampleReviews);
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || "";

  const newsletterInputSchema = z.object({
    email: z.string().email(),
  });

  const airtablePat = process.env.AIRTABLE_PAT || "";
  const airtableBaseId = process.env.AIRTABLE_BASE_ID || "appZ9heO1salfHYMa";
  const airtableTableId = process.env.AIRTABLE_TABLE_ID || "tbl2xJrAnilq5dAII";
  const airtableFieldName = process.env.AIRTABLE_EMAIL_FIELD || "Email";

  const canonicalDescriptions: Record<string, string> = {
    "Doggy Birthday Cake":
      "Celebrate your pup in style with our freshly baked birthday cakes, available in 3, 4, and 6 inch sizes with your choice of protein or non-protein bases. Pick from standard, personalised, or drip designs to make their big day extra special. Handmade with dog-friendly ingredients and baked with love. Dublin delivery available for cakes, or collection.",
    "Pupcakes":
      "Soft, fluffy apple & carrot pupcakes topped with dog-friendly frosting - perfect for sharing (or not!). Available in party boxes of different sizes for every kind of celebration.",
    "Barkday Box":
      "A ready-to-go birthday surprise filled with themed, hand-decorated biscuits. The perfect gift for dogs who love a little extra fuss on their special day.",
    "Training Treats":
      "Tasty little reward bites in our popular flavours - perfect for training, tricks, or just because they're a very good dog.",
    "Woofles":
      "Grain-free carrot waffles that are crunchy, wholesome, and easy to break into snack-sized pieces. Great for sensitive tummies.",
    "Dognuts":
      "Banana & peanut butter baked dognuts finished with dog-friendly icing. Fun, festive, and guaranteed tail wags.",
    "Seasonal Treats":
      "Limited-edition themed goodies throughout the year, with personalised options available to match the season.",
  };

  const mapVariant = (variant: any) => ({
    id: variant.id,
    productId: variant.product_id ?? variant.productId,
    sku: variant.sku,
    name: variant.name,
    price: variant.price,
    imageUrl: variant.image_url ?? variant.imageUrl ?? "",
    shippingRequired: variant.shipping_required ?? variant.shippingRequired ?? true,
    variantData: variant.variant_data ?? variant.variantData ?? null,
    option1: undefined,
    option2: undefined,
    option3: undefined,
  });

  const parseImageUrls = (value: any) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : undefined;
      } catch {
        return undefined;
      }
    }
    return undefined;
  };

  const mapProduct = (product: any, variants: any[]) => ({
    id: product.id,
    name: product.name,
    description: canonicalDescriptions[product.name] ?? product.description,
    price: product.base_price ?? product.basePrice ?? product.price ?? "0",
    imageUrl: product.image_url ?? product.imageurl ?? product.imageUrl ?? "",
    imageUrls: parseImageUrls(product.image_urls ?? product.imageUrls),
    category: product.category,
    isFeatured: product.is_featured ?? product.isFeatured ?? false,
    tags: product.tags ?? null,
    variants: variants
      .filter((variant) => (variant.product_id ?? variant.productId) === product.id)
      .map(mapVariant),
  });

  // Get products with variants from Supabase first, fallback to local DB
  app.get(api.products.list.path, async (_req, res) => {
    try {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
          process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
        );

        const { data: supabaseProducts, error: productsError } = await supabase
          .from('products')
          .select('*');
        const { data: supabaseVariants, error: variantsError } = await supabase
          .from('product_variants')
          .select('*');

        if (!productsError && !variantsError && supabaseProducts) {
          return res.json(
            supabaseProducts.map((product) => mapProduct(product, supabaseVariants || []))
          );
        }
      } catch (supabaseError) {
        console.error('Supabase products read failed, using local DB:', supabaseError);
      }

      const db = await dbPromise;
      const allProducts = await db.select().from(products);
      const allVariants = await db.select().from(productVariants);

      const mappedProducts = allProducts.map((product) =>
        mapProduct(
          {
            id: product.id,
            name: product.name,
            description: product.description,
            basePrice: product.basePrice,
            imageUrl: product.imageUrl,
            category: product.category,
            isFeatured: product.isFeatured,
            tags: product.tags,
          },
          allVariants.map((variant) => ({
            id: variant.id,
            productId: variant.productId,
            sku: variant.sku,
            name: variant.name,
            price: variant.price,
            imageUrl: variant.imageUrl,
            shippingRequired: variant.shippingRequired,
          }))
        )
      );

      return res.json(mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  app.get(api.products.get.path, async (req, res) => {
    try {
      const productParam = String(req.params.id || "").trim();
      const productId = Number(productParam);
      const isNumericId = !Number.isNaN(productId);

      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
          process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
        );

        const productQuery = supabase
          .from('products')
          .select('*')
          .limit(1);

        const { data: supabaseProduct, error: productError } = await (isNumericId
          ? productQuery.eq('id', productId).maybeSingle()
          : productQuery.eq('name', productParam).maybeSingle());

        if (!productError && supabaseProduct) {
          const { data: supabaseVariants } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', supabaseProduct.id);

          return res.json(mapProduct(supabaseProduct, supabaseVariants || []));
        }
      } catch (supabaseError) {
        console.error('Supabase product read failed, using local DB:', supabaseError);
      }

      const db = await dbPromise;
      const product = await (isNumericId
        ? db.select().from(products).where(eq(products.id, productId)).limit(1)
        : db.select().from(products).then((rows: any[]) =>
            rows.filter((row) => row.name === productParam).slice(0, 1)
          ));
      if (product.length > 0) {
        const variants = await db
          .select()
          .from(productVariants)
          .where(eq(productVariants.productId, product[0].id));
        return res.json(
          mapProduct(
            {
              id: product[0].id,
              name: product[0].name,
              description: product[0].description,
              basePrice: product[0].basePrice,
              imageUrl: product[0].imageUrl,
              category: product[0].category,
              isFeatured: product[0].isFeatured,
              tags: product[0].tags,
            },
            variants.map((variant) => ({
              id: variant.id,
              productId: variant.productId,
              sku: variant.sku,
              name: variant.name,
              price: variant.price,
              imageUrl: variant.imageUrl,
              shippingRequired: variant.shippingRequired,
            }))
          )
        );
      }

      return res.status(404).json({ message: "Product not found" });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: "Error fetching product" });
    }
  });

  // Get product variants
  app.get("/api/variants/:id", async (req, res) => {
    try {
      const variantId = Number(req.params.id);
      const variant = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.id, variantId))
        .limit(1);
      
      if (!variant.length) {
        return res.status(404).json({ message: "Variant not found" });
      }
      
      res.json(variant[0]);
    } catch (error) {
      console.error('Error fetching variant:', error);
      res.status(500).json({ message: "Error fetching variant" });
    }
  });

  app.get(api.reviews.list.path, async (_req, res) => {
    const reviews = await storage.getReviews();
    res.json(reviews);
  });

  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email } = newsletterInputSchema.parse(req.body);
      console.log("[newsletter] incoming subscribe request", {
        email,
        hasPat: Boolean(airtablePat),
        baseId: airtableBaseId,
        tableId: airtableTableId,
        fieldName: airtableFieldName,
      });

      if (!airtablePat) {
        console.error("[newsletter] missing AIRTABLE_PAT");
        return res.status(500).json({
          message: "Newsletter is not configured. Missing AIRTABLE_PAT.",
        });
      }

      const endpoint = `https://api.airtable.com/v0/${encodeURIComponent(airtableBaseId)}/${encodeURIComponent(airtableTableId)}`;
      const payload = {
        records: [
          {
            fields: {
              [airtableFieldName]: email,
            },
          },
        ],
      };

      const airtableResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${airtablePat}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const airtableBody = await airtableResponse.json();
      console.log("[newsletter] airtable response", {
        status: airtableResponse.status,
        ok: airtableResponse.ok,
        body: airtableBody,
      });
      if (!airtableResponse.ok) {
        const message =
          airtableBody?.error?.message ||
          airtableBody?.message ||
          "Failed to save newsletter subscription.";
        console.error("[newsletter] airtable rejected request", { message });
        return res.status(400).json({ message });
      }

      console.log("[newsletter] saved subscriber", { email });
      return res.json({ success: true });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error("[newsletter] invalid email payload", { issues: error.issues });
        return res.status(400).json({ message: "Please enter a valid email address." });
      }

      console.error("[newsletter] unexpected error", { message: error?.message, error });
      return res.status(500).json({
        message: error?.message || "Failed to subscribe to newsletter.",
      });
    }
  });

  app.post("/api/stripe/webhook", async (req, res) => {
    if (!stripeWebhookSecret) {
      console.error("[stripe webhook] missing STRIPE_WEBHOOK_SECRET");
      return res.status(500).send("Webhook secret is not configured.");
    }

    if (!n8nWebhookUrl) {
      console.error("[stripe webhook] missing N8N_WEBHOOK_URL");
      return res.status(500).send("n8n webhook URL is not configured.");
    }

    const signature = req.headers["stripe-signature"];
    const rawBody = Buffer.isBuffer(req.rawBody) ? req.rawBody : null;

    if (!signature || Array.isArray(signature)) {
      return res.status(400).send("Missing Stripe signature.");
    }

    if (!rawBody) {
      return res.status(400).send("Missing raw request body.");
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error("[stripe webhook] signature verification failed", error?.message || error);
      return res.status(400).send(`Webhook Error: ${error?.message || "Invalid signature"}`);
    }

    if (event.type !== "payment_intent.succeeded") {
      return res.json({ received: true, ignored: event.type });
    }

    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const latestCharge =
      paymentIntent.latest_charge && typeof paymentIntent.latest_charge !== "string"
        ? paymentIntent.latest_charge
        : null;

    const customerEmail =
      paymentIntent.receipt_email ||
      paymentIntent.metadata.customer_email ||
      latestCharge?.billing_details?.email ||
      null;

    let shippingAddress: Record<string, unknown> | null = null;
    let orderItems: Array<Record<string, unknown>> = [];

    try {
      shippingAddress = paymentIntent.metadata.shipping_address
        ? JSON.parse(paymentIntent.metadata.shipping_address)
        : null;
    } catch (error) {
      console.error("[stripe webhook] failed to parse shipping address metadata", error);
    }

    try {
      orderItems = paymentIntent.metadata.order_items
        ? JSON.parse(paymentIntent.metadata.order_items)
        : [];
    } catch (error) {
      console.error("[stripe webhook] failed to parse order items metadata", error);
    }

    const payload = {
      customerName: paymentIntent.metadata.customer_name || null,
      customerEmail,
      customerPhone: paymentIntent.metadata.customer_phone || null,
      amountPaid: paymentIntent.amount_received,
      currency: paymentIntent.currency,
      paymentIntentId: paymentIntent.id,
      paymentStatus: paymentIntent.status,
      deliveryType: paymentIntent.metadata.delivery_type || null,
      specialInstructions: paymentIntent.metadata.special_instructions || null,
      shippingAmount: Number(paymentIntent.metadata.shipping_amount || 0),
      shippingAddress,
      orderItems,
    };

    try {
      const forwardResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!forwardResponse.ok) {
        const responseText = await forwardResponse.text();
        console.error("[stripe webhook] n8n forward failed", {
          status: forwardResponse.status,
          body: responseText,
        });
        return res.status(502).send("Failed to forward webhook to n8n.");
      }
    } catch (error) {
      console.error("[stripe webhook] n8n request failed", error);
      return res.status(502).send("Failed to reach n8n webhook.");
    }

    return res.json({ received: true });
  });

  // Create Stripe checkout session
  app.post("/api/checkout/create-session", async (req, res) => {
    try {
      const {
        customerName,
        customerEmail,
        customerPhone,
        deliveryType,
        shippingAddress,
        specialInstructions,
        items
      } = req.body;

      const orderItemsForWebhook: Array<{
        productId: string;
        productName: string;
        productCategory: string | null;
        productVariantId: string;
        variantName: string;
        sku: string;
        quantity: number;
        unitPrice: number;
        imageUrl: string;
        shippingRequired: boolean;
        selectedOptions: Array<{ name: string; value: string }>;
        customization: unknown;
        variantData: Record<string, unknown> | null;
      }> = [];

      // Validate items and calculate total
      let subtotal = 0;
      const lineItems = [];
      
      for (const item of items) {
        const variantId = item.productVariantId;
        const variantIdNumber = typeof variantId === 'number' ? variantId : Number(variantId);
        const canQueryDb = Number.isFinite(variantIdNumber) && String(variantId).match(/^\d+$/);

        let variantData: any = null;
        if (canQueryDb) {
          const db = await dbPromise;
          const variant = await db.select().from(productVariants)
            .where(eq(productVariants.id, variantIdNumber))
            .limit(1);
          if (variant.length) {
            variantData = variant[0];
          }
        }

        const collectionOnlyItem = isCollectionOnlyCartItem(item);

        if (!variantData) {
          if (!item.variantData) {
            return res.status(400).json({ message: `Variant ${variantId} not found` });
          }
          variantData = {
            id: variantId,
            productId: item.productId || '',
            sku: item.variantData.sku || '',
            name: item.variantData.name || item.productName || 'Product',
            price: item.variantData.price || item.price || 0,
            imageUrl: item.variantData.imageUrl || item.imageUrl || '',
            shippingRequired: collectionOnlyItem ? false : (item.variantData.shippingRequired ?? true),
          };
        }

        const itemTotal = Number(variantData.price) * item.quantity;
        subtotal += itemTotal;

        const selectedOptions = [
          item.variantData?.option1,
          item.variantData?.option2,
          item.variantData?.option3,
        ].filter((option): option is { name: string; value: string } =>
          Boolean(option?.name && option?.value)
        );

        orderItemsForWebhook.push({
          productId: String(item.productId || variantData.productId || ""),
          productName: item.productName || variantData.name || "Product",
          productCategory: item.productCategory || null,
          productVariantId: String(variantData.id),
          variantName: variantData.name,
          sku: item.variantData?.sku || variantData.sku || "",
          quantity: item.quantity,
          unitPrice: Math.round(Number(variantData.price) * 100),
          imageUrl: item.variantData?.imageUrl || variantData.imageUrl || item.imageUrl || "",
          shippingRequired: collectionOnlyItem ? false : (variantData.shippingRequired ?? true),
          selectedOptions,
          customization: item.customization ?? null,
          variantData: item.variantData || null,
        });

        // Create line item for Stripe
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: variantData.name,
              description: `SKU: ${variantData.sku}`,
              images: variantData.imageUrl ? [variantData.imageUrl] : [],
              metadata: {
                variant_id: String(variantData.id),
                product_id: String(variantData.productId || ''),
                shipping_required: String(collectionOnlyItem ? false : (variantData.shippingRequired ?? true)),
              }
            },
            unit_amount: Math.round(Number(variantData.price) * 100), // Convert to cents
          },
          quantity: item.quantity,
        });
      }

      // Calculate shipping
      let shipping;
      try {
        shipping = calculateShipping(deliveryType, shippingAddress, items);
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }

      // Add shipping as line item if needed
      if (shipping.price > 0) {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: shipping.name,
              description: `Delivery time: ${shipping.delivery_time}`,
            },
            unit_amount: shipping.price, // Already in cents
          },
          quantity: 1,
        });
      }

      // For development without real Stripe credentials
      if (process.env.STRIPE_SECRET_KEY === 'sk_test_dummy_key_for_development') {
        // Return mock checkout session
        const mockOrder = {
          id: Math.floor(Math.random() * 10000),
          customerName,
          customerEmail,
          totalAmount: (subtotal + (shipping.price / 100)).toFixed(2),
          status: 'pending',
          deliveryType,
          checkoutUrl: 'https://checkout.stripe.com/pay/mock_session_id#fidkdWxOYHwnPyd1blpxYHZxWjA0VDVhSUo0VTdEU'
        };
        
        return res.json({
          sessionId: 'mock_session_id',
          checkoutUrl: mockOrder.checkoutUrl,
          order: mockOrder
        });
      }

      // Real Stripe checkout session
      const collectionMessage =
        "Collection: Monday to Saturday at our kitchen in Rathcoole, Dublin 24. Sundays at People's Park, Dun Laoghaire.";
      const deliveryMessage = "Shipping via An Post. Delivery in 3-5 business days for EUR 6.99.";
      const fulfillmentLabel = deliveryType === 'delivery' ? 'Delivery' : 'Collection';
      const shippingAmount = shipping.price;
      const shippingAddressMetadata = shippingAddress ? JSON.stringify(shippingAddress) : "";
      const orderItemsMetadata = JSON.stringify(orderItemsForWebhook);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        currency: 'eur',
        locale: 'en',
        success_url: `${req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/checkout/cancel`,
        customer_email: customerEmail,
        line_items: lineItems,
        billing_address_collection: 'required',
        shipping_address_collection: deliveryType === 'delivery' ? {
          allowed_countries: ['IE'],
        } : undefined,
        custom_text: deliveryType === 'delivery'
          ? {
              shipping_address: {
                message: deliveryMessage,
              },
              submit: {
                message: deliveryMessage,
              },
            }
          : {
              submit: {
                message: collectionMessage,
              },
              after_submit: {
                message: collectionMessage,
              },
            },
        metadata: {
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone || '',
          delivery_type: deliveryType,
          special_instructions: specialInstructions || '',
          shipping_amount: String(shippingAmount),
          shipping_address: shippingAddressMetadata,
          order_items: orderItemsMetadata,
        },
        payment_intent_data: {
          description: `Fulfillment: ${fulfillmentLabel}`,
          metadata: {
            customer_email: customerEmail,
            delivery_type: deliveryType,
            fulfillment_method: fulfillmentLabel.toLowerCase(),
            customer_name: customerName,
            customer_phone: customerPhone || '',
            special_instructions: specialInstructions || '',
            shipping_amount: String(shippingAmount),
            shipping_address: shippingAddressMetadata,
            order_items: orderItemsMetadata,
          },
        },
      });

      res.json({
        sessionId: session.id,
        checkoutUrl: session.url
      });

    } catch (error) {
      console.error('Checkout error:', error);
      res.status(500).json({ message: 'Checkout failed', error: error.message });
    }
  });

  // Get shipping rates
  app.post("/api/checkout/shipping-rates", async (req, res) => {
    try {
      const { deliveryType, location, items } = req.body;
      
      const shipping = calculateShipping(deliveryType, location, items);
      res.json(shipping);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Legacy checkout endpoint (keep for backwards compatibility)
  app.post(api.checkout.create.path, async (req, res) => {
    try {
      const input = api.checkout.create.input.parse(req.body);
      
      let totalAmount = 0;
      const orderItems = input.items.map(item => {
        const itemTotal = Number(item.price) * item.quantity;
        totalAmount += itemTotal;
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          options: item.options || null,
        };
      });

      const order = await storage.createOrder(
        {
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          totalAmount: totalAmount.toFixed(2),
          status: "pending"
        },
        orderItems
      );

      res.status(201).json({ orderId: order.id, message: "Order placed successfully" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post(api.contact.create.path, async (req, res) => {
    try {
      const input = api.contact.create.input.parse(req.body);
      await storage.createContactMessage(input);
      res.status(201).json({ message: "Message sent successfully" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Seed the database
  seedDatabase().catch(console.error);

  return httpServer;
}
