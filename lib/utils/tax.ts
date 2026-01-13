// Indian GST calculation utilities
export const GST_RATE = 0.18 // 18% GST

export function calculateSubtotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function calculateTax(subtotal: number): number {
  return subtotal * GST_RATE
}

export function calculateTotal(subtotal: number, tax: number, shipping: number = 0): number {
  return subtotal + tax + shipping
}

export const COD_SHIPPING_FEE = 80 // Base shipping fee
export const SHIPPING_FEE = 80 // Shipping fee for any payment method
export const FREE_SHIPPING_THRESHOLD = 2000 // Free shipping for orders over this amount

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price)
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

// Calculate bulk discount for a product based on quantity
export function calculateBulkDiscount(
  price: number,
  quantity: number,
  discount21_50: number = 10,
  discount51Plus: number = 20
): number {
  let discountPercent = 0
  if (quantity >= 51) {
    discountPercent = discount51Plus
  } else if (quantity >= 21) {
    discountPercent = discount21_50
  }
  return (price * quantity * discountPercent) / 100
}

// Calculate discounted price for a product
export function calculateDiscountedPrice(
  price: number,
  quantity: number,
  discount21_50: number = 10,
  discount51Plus: number = 20
): number {
  const discount = calculateBulkDiscount(price, quantity, discount21_50, discount51Plus)
  return price * quantity - discount
}
