import { readFile, writeFile, access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';
import * as schema from "@shared/schema";

interface JsonStorage {
  products: any[];
  categories: any[];
  orders: any[];
  [key: string]: any[];
}

export class JSONStorageAdapter {
  private filePath: string;
  private data: JsonStorage;

  constructor(filePath = './storage.json') {
    this.filePath = path.resolve(filePath);
    this.data = {
      products: [],
      categories: [],
      orders: []
    };
  }

  async initialize(): Promise<void> {
    try {
      await access(this.filePath, constants.F_OK);
      const fileContent = await readFile(this.filePath, 'utf-8');
      this.data = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist, create it with empty data
      await this.save();
    }
  }

  private async save(): Promise<void> {
    await writeFile(this.filePath, JSON.stringify(this.data, null, 2));
  }

  // Mock database interface methods
  async select(tableName: string): Promise<any[]> {
    await this.initialize();
    return this.data[tableName] || [];
  }

  async insert(tableName: string, data: any): Promise<any> {
    await this.initialize();
    if (!this.data[tableName]) {
      this.data[tableName] = [];
    }
    
    const newRecord = {
      id: Date.now(), // Simple ID generation
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.data[tableName].push(newRecord);
    await this.save();
    return newRecord;
  }

  async update(tableName: string, id: number, data: any): Promise<any> {
    await this.initialize();
    if (!this.data[tableName]) {
      this.data[tableName] = [];
    }

    const index = this.data[tableName].findIndex(record => record.id === id);
    if (index !== -1) {
      this.data[tableName][index] = {
        ...this.data[tableName][index],
        ...data,
        updated_at: new Date().toISOString()
      };
      await this.save();
      return this.data[tableName][index];
    }
    throw new Error(`Record with id ${id} not found in ${tableName}`);
  }

  async delete(tableName: string, id: number): Promise<void> {
    await this.initialize();
    if (!this.data[tableName]) {
      return;
    }

    const index = this.data[tableName].findIndex(record => record.id === id);
    if (index !== -1) {
      this.data[tableName].splice(index, 1);
      await this.save();
    }
  }

  // Drizzle-like query interface
  query = {
    products: {
      findMany: async () => this.select('products'),
      findFirst: async (where?: any) => {
        const records = await this.select('products');
        return records[0] || null;
      },
      create: async (data: any) => this.insert('products', data.data || data),
      update: async (where: any, data: any) => {
        const records = await this.select('products');
        const record = records.find(r => r.id === where.where?.id);
        if (record) {
          return this.update('products', record.id, data.data || data);
        }
        throw new Error('Record not found');
      },
      delete: async (where: any) => {
        const records = await this.select('products');
        const record = records.find(r => r.id === where.where?.id);
        if (record) {
          await this.delete('products', record.id);
        }
      }
    },
    categories: {
      findMany: async () => this.select('categories'),
      findFirst: async (where?: any) => {
        const records = await this.select('categories');
        return records[0] || null;
      },
      create: async (data: any) => this.insert('categories', data.data || data),
    },
    orders: {
      findMany: async () => this.select('orders'),
      findFirst: async (where?: any) => {
        const records = await this.select('orders');
        return records[0] || null;
      },
      create: async (data: any) => this.insert('orders', data.data || data),
    }
  };
}