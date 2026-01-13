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

export const MINIMUM_ORDER_VALUE = 200 // Minimum order value required
export const FREE_SHIPPING_THRESHOLD = 2000 // Free shipping for orders over this amount
export const COD_FEE = 80 // Additional fee for Cash on Delivery orders

// Calculate base shipping fee based on order value (after discounts, before tax)
// 200-500: 100rs
// 500-1000: 200rs
// 1000-2000: 250rs
// 2000+: free delivery
export function calculateBaseShippingFee(orderValue: number): number {
  if (orderValue >= FREE_SHIPPING_THRESHOLD) {
    return 0 // Free delivery
  } else if (orderValue >= 1000) {
    return 250
  } else if (orderValue >= 500) {
    return 200
  } else if (orderValue >= MINIMUM_ORDER_VALUE) {
    return 100
  } else {
    return 0 // Below minimum order value
  }
}

// Calculate total shipping fee including COD fee if applicable
// paymentMethod: "cod" or "razorpay" (or any other online payment method)
export function calculateShippingFee(orderValue: number, paymentMethod?: string): number {
  const baseShipping = calculateBaseShippingFee(orderValue)
  const codFee = paymentMethod === "cod" ? COD_FEE : 0
  return baseShipping + codFee
}

// Legacy constants for backward compatibility (deprecated)
export const COD_SHIPPING_FEE = 80 // Deprecated - use calculateShippingFee instead
export const SHIPPING_FEE = 80 // Deprecated - use calculateShippingFee instead

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
