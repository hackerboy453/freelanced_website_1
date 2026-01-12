export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  created_at: string
  subcategories?: Category[]
}

export interface Product {
  id: string
  title: string
  description: string | null
  price: number
  category_id: string | null
  images: string[]
  stock: number
  is_active: boolean
  discount_21_50?: number | null
  discount_51_plus?: number | null
  // Optional product specifications shown as a custom table
  specs?: { label: string; value: string }[] | null
  created_at: string
  updated_at: string
  category?: Category
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  product?: Product
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  status: "pending" | "confirmed" | "shipped" | "out_of_delivery" | "delivered" | "cancelled" | "failed"
  subtotal: number
  tax: number
  total: number
  shipping_address: string | null
  shipping_city: string | null
  shipping_state: string | null
  shipping_pincode: string | null
  shipping_full_name?: string | null
  shipping_phone?: string | null
  payment_method: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_title: string
  product_price: number
  quantity: number
  created_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  pincode: string | null
  created_at: string
  updated_at: string
}

export interface Blog {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  image_url: string | null
  author_name: string
  is_published: boolean
  medium_link: string | null
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}
