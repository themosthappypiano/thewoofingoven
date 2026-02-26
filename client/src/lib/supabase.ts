import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on our schema
export type Product = {
  id: number
  name: string
  description: string
  price: string
  imageUrl: string
  category: 'treat' | 'cake'
  isFeatured: boolean
  variants?: any
  created_at?: string
  updated_at?: string
}

export type ProductVariant = {
  id: number
  product_id: number
  sku: string
  name: string
  price: string
  price_adjustment: string
  inventory: number
  is_active: boolean
  variant_data: any
  image_url?: string
  stripe_price_id?: string
  shipping_required: boolean
  created_at: string
}

export type Order = {
  id: number
  customer_name: string
  customer_email: string
  total_amount: string
  status: string
  shipping_address?: any
  delivery_type?: 'delivery' | 'collection'
  special_instructions?: string
  stripe_payment_intent_id?: string
  created_at: string
}

export type OrderItem = {
  id: number
  order_id: number
  product_variant_id: number
  quantity: number
  price: string
  customization?: any
}