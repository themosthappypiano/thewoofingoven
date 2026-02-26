import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { sqliteTable, text as sqliteText, integer as sqliteInteger } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Auto-detect database type
const isLocal = process.env.DATABASE_URL?.startsWith('file:') ?? false;

export const products = isLocal 
  ? sqliteTable("products", {
      id: sqliteInteger("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
      name: sqliteText("name").notNull(),
      description: sqliteText("description").notNull(),
      basePrice: sqliteText("base_price").notNull(),
      imageUrl: sqliteText("image_url").notNull(),
      imageUrls: sqliteText("image_urls"),
      category: sqliteText("category").notNull(), // 'treat' | 'cake' | 'box'
      isFeatured: sqliteInteger("is_featured", { mode: "boolean" }).default(false),
      tags: sqliteText("tags"), // JSON array of tags
      stripeProductId: sqliteText("stripe_product_id"),
      createdAt: sqliteText("created_at"),
      updatedAt: sqliteText("updated_at"),
    })
  : pgTable("products", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description").notNull(),
      basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
      imageUrl: text("image_url").notNull(),
      imageUrls: jsonb("image_urls"),
      category: text("category").notNull(), // 'treat' | 'cake' | 'box'
      isFeatured: boolean("is_featured").default(false),
      tags: jsonb("tags"), // Array of tags
      stripeProductId: text("stripe_product_id"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
    });

// Product variants table for complex variant management
export const productVariants = isLocal
  ? sqliteTable("product_variants", {
      id: sqliteInteger("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
      productId: sqliteInteger("product_id").notNull(),
      sku: sqliteText("sku").notNull(),
      name: sqliteText("name").notNull(),
      price: sqliteText("price").notNull(),
      priceAdjustment: sqliteText("price_adjustment").default("0"),
      inventory: sqliteInteger("inventory").default(0),
      isActive: sqliteInteger("is_active", { mode: "boolean" }).default(true),
      variantData: sqliteText("variant_data"), // JSON variant options
      imageUrl: sqliteText("image_url"),
      stripePriceId: sqliteText("stripe_price_id"),
      shippingRequired: sqliteInteger("shipping_required", { mode: "boolean" }).default(true),
      weight: sqliteText("weight"), // in grams
      createdAt: sqliteText("created_at"),
    })
  : pgTable("product_variants", {
      id: serial("id").primaryKey(),
      productId: integer("product_id").notNull(),
      sku: text("sku").notNull(),
      name: text("name").notNull(),
      price: numeric("price", { precision: 10, scale: 2 }).notNull(),
      priceAdjustment: numeric("price_adjustment", { precision: 10, scale: 2 }).default("0"),
      inventory: integer("inventory").default(0),
      isActive: boolean("is_active").default(true),
      variantData: jsonb("variant_data"), // Variant options
      imageUrl: text("image_url"),
      stripePriceId: text("stripe_price_id"),
      shippingRequired: boolean("shipping_required").default(true),
      weight: integer("weight"), // in grams
      createdAt: timestamp("created_at").defaultNow(),
    });

export const reviews = isLocal
  ? sqliteTable("reviews", {
      id: sqliteInteger("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
      dogName: sqliteText("dog_name").notNull(),
      rating: sqliteInteger("rating").notNull(),
      content: sqliteText("content").notNull(),
      imageUrl: sqliteText("image_url"),
    })
  : pgTable("reviews", {
      id: serial("id").primaryKey(),
      dogName: text("dog_name").notNull(),
      rating: integer("rating").notNull(),
      content: text("content").notNull(),
      imageUrl: text("image_url"),
    });

export const contactMessages = isLocal
  ? sqliteTable("contact_messages", {
      id: sqliteInteger("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
      name: sqliteText("name").notNull(),
      email: sqliteText("email").notNull(),
      message: sqliteText("message").notNull(),
      createdAt: sqliteText("created_at"),
    })
  : pgTable("contact_messages", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      email: text("email").notNull(),
      message: text("message").notNull(),
      createdAt: timestamp("created_at").defaultNow(),
    });

// Orders with shipping and delivery support
export const orders = isLocal
  ? sqliteTable("orders", {
      id: sqliteInteger("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
      customerName: sqliteText("customer_name").notNull(),
      customerEmail: sqliteText("customer_email").notNull(),
      customerPhone: sqliteText("customer_phone"),
      totalAmount: sqliteText("total_amount").notNull(),
      status: sqliteText("status").notNull().default("pending"),
      deliveryType: sqliteText("delivery_type").notNull(), // 'delivery' | 'collection'
      shippingAddress: sqliteText("shipping_address"), // JSON
      specialInstructions: sqliteText("special_instructions"),
      stripePaymentIntentId: sqliteText("stripe_payment_intent_id"),
      stripeCustomerId: sqliteText("stripe_customer_id"),
      createdAt: sqliteText("created_at"),
      updatedAt: sqliteText("updated_at"),
    })
  : pgTable("orders", {
      id: serial("id").primaryKey(),
      customerName: text("customer_name").notNull(),
      customerEmail: text("customer_email").notNull(),
      customerPhone: text("customer_phone"),
      totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
      status: text("status").notNull().default("pending"),
      deliveryType: text("delivery_type").notNull(), // 'delivery' | 'collection'
      shippingAddress: jsonb("shipping_address"),
      specialInstructions: text("special_instructions"),
      stripePaymentIntentId: text("stripe_payment_intent_id"),
      stripeCustomerId: text("stripe_customer_id"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
    });

export const orderItems = isLocal
  ? sqliteTable("order_items", {
      id: sqliteInteger("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
      orderId: sqliteInteger("order_id").notNull(),
      productVariantId: sqliteInteger("product_variant_id").notNull(),
      quantity: sqliteInteger("quantity").notNull(),
      price: sqliteText("price").notNull(),
      customization: sqliteText("customization"), // JSON for personalization
    })
  : pgTable("order_items", {
      id: serial("id").primaryKey(),
      orderId: integer("order_id").notNull(),
      productVariantId: integer("product_variant_id").notNull(),
      quantity: integer("quantity").notNull(),
      price: numeric("price", { precision: 10, scale: 2 }).notNull(),
      customization: jsonb("customization"), // For personalization
    });

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertProductVariantSchema = createInsertSchema(productVariants).omit({ id: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true });
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// Request Types
export type CheckoutRequest = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryType: 'delivery' | 'collection';
  shippingAddress?: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    distanceKm?: number;
  };
  specialInstructions?: string;
  items: Array<{
    productVariantId: number;
    quantity: number;
    price: string;
    customization?: any;
  }>;
};
