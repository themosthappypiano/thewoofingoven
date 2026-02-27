import { db as dbPromise } from "./db";
import {
  products, reviews, contactMessages, orders, orderItems,
  type Product, type InsertProduct, type Review, type InsertReview,
  type ContactMessage, type InsertContactMessage,
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  
  getReviews(): Promise<Review[]>;
  
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    const db = await dbPromise;
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const db = await dbPromise;
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getReviews(): Promise<Review[]> {
    const db = await dbPromise;
    return await db.select().from(reviews);
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const db = await dbPromise;
    const [msg] = await db.insert(contactMessages).values(message).returning();
    return msg;
  }

  async createOrder(orderInfo: InsertOrder, items: Omit<InsertOrderItem, 'orderId'>[]): Promise<Order> {
    const db = await dbPromise;
    return await db.transaction(async (tx) => {
      const [order] = await tx.insert(orders).values(orderInfo).returning();
      
      const itemsToInsert = items.map(item => ({
        ...item,
        orderId: order.id
      }));
      
      await tx.insert(orderItems).values(itemsToInsert);
      return order;
    });
  }
}

export const storage = new DatabaseStorage();
