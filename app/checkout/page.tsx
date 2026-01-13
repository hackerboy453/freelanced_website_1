"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CheckoutForm } from "@/components/checkout-form"
import { formatPrice, calculateSubtotal, calculateTax, calculateTotal, GST_RATE, calculateBulkDiscount, calculateShippingFee, calculateBaseShippingFee, COD_FEE, MINIMUM_ORDER_VALUE, FREE_SHIPPING_THRESHOLD } from "@/lib/utils/tax"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import type { CartItem, Product, Profile } from "@/lib/types"

interface CartItemWithProduct extends CartItem {
  product: Product
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState("cod")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUserId(user.id)

      // Get selected items from sessionStorage
      const selectedItemsJson = sessionStorage.getItem("checkout-items")
      const selectedItemIds = selectedItemsJson ? JSON.parse(selectedItemsJson) : []

      // Load all cart items
      const { data: allItems, error: itemsError } = await supabase
        .from("cart_items")
        .select("*, product:products(*)")
        .eq("user_id", user.id)

      if (itemsError) {
        console.error("Error loading cart:", itemsError)
        return
      }

      // Filter to only selected items, or all if none selected
      const items = (allItems as CartItemWithProduct[]) || []
      const filteredItems =
        selectedItemIds.length > 0 ? items.filter((item) => selectedItemIds.includes(item.id)) : items

      if (filteredItems.length === 0) {
        router.push("/cart")
        return
      }

      setCartItems(filteredItems)

      // Load profile
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(profileData)
    } catch (err) {
      console.error("Unexpected error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  // Calculate prices with bulk discounts - using same pattern as cart page
  const items = cartItems.map((item) => ({
    price: item.product.price,
    quantity: item.quantity,
  }))

  const originalSubtotal = calculateSubtotal(items)
  const totalDiscount = cartItems.reduce((sum, item) => {
    const discount21_50 = item.product.discount_21_50 ?? 10
    const discount51Plus = item.product.discount_51_plus ?? 20
    return sum + calculateBulkDiscount(item.product.price, item.quantity, discount21_50, discount51Plus)
  }, 0)
  const subtotal = originalSubtotal - totalDiscount
  const tax = calculateTax(subtotal)
  const totalBeforeShipping = calculateTotal(subtotal, tax)
  const shipping = calculateShippingFee(subtotal, paymentMethod)
  const baseShipping = calculateBaseShippingFee(subtotal)
  const codFee = paymentMethod === "cod" ? COD_FEE : 0
  const total = totalBeforeShipping + shipping

  if (!userId) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div>
          <CheckoutForm
            userId={userId}
            profile={profile}
            cartItems={cartItems}
            subtotal={subtotal}
            tax={tax}
            total={total}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
          />
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const discount21_50 = item.product.discount_21_50 ?? 10
                  const discount51Plus = item.product.discount_51_plus ?? 20
                  const itemDiscount = calculateBulkDiscount(
                    item.product.price,
                    item.quantity,
                    discount21_50,
                    discount51Plus
                  )
                  const originalPrice = item.product.price * item.quantity
                  const discountedPrice = originalPrice - itemDiscount
                  const hasDiscount = itemDiscount > 0
                  
                  return (
                    <div key={item.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex-1 truncate pr-2">
                          {item.product.title} x {item.quantity}
                        </span>
                        <div className="shrink-0 text-right">
                          {hasDiscount ? (
                            <>
                              <span className="line-through text-muted-foreground mr-2">
                                {formatPrice(originalPrice)}
                              </span>
                              <span>{formatPrice(discountedPrice)}</span>
                            </>
                          ) : (
                            <span>{formatPrice(originalPrice)}</span>
                          )}
                        </div>
                      </div>
                      {hasDiscount && (
                        <div className="text-xs text-green-600 ml-2">
                          Bulk discount: {formatPrice(itemDiscount)} off
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({cartItems.length} items)</span>
                  {totalDiscount > 0 ? (
                    <div className="text-right">
                      <span className="line-through text-muted-foreground mr-2">
                        {formatPrice(originalSubtotal)}
                      </span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                  ) : (
                    <span>{formatPrice(subtotal)}</span>
                  )}
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Bulk Discount</span>
                    <span>-{formatPrice(totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST ({(GST_RATE * 100).toFixed(0)}%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <div className="text-right">
                    {baseShipping === 0 ? (
                      subtotal >= FREE_SHIPPING_THRESHOLD ? (
                        <span className="text-green-600">Free (orders over ₹{FREE_SHIPPING_THRESHOLD})</span>
                      ) : (
                        <span className="text-destructive">Minimum order ₹{MINIMUM_ORDER_VALUE}</span>
                      )
                    ) : (
                      <span>{formatPrice(baseShipping)}</span>
                    )}
                    <p className="text-xs text-muted-foreground">Standard shipping</p>
                  </div>
                </div>
                {codFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cash on Delivery Fee</span>
                    <div className="text-right">
                      <span>{formatPrice(codFee)}</span>
                      <p className="text-xs text-muted-foreground">Additional COD charge</p>
                    </div>
                  </div>
                )}
                {/* Delivery Charges Information */}
                <div className="mt-2 p-3 bg-muted/50 rounded-md">
                  <p className="text-xs font-semibold mb-1">Delivery Charges:</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    <li>• Order value ₹200-500: ₹100</li>
                    <li>• Order value ₹500-1000: ₹200</li>
                    <li>• Order value ₹1000-2000: ₹250</li>
                    <li>• Order value ₹2000+: Free delivery</li>
                    <li>• Cash on Delivery: +₹{COD_FEE} additional</li>
                    <li>• Minimum order value: ₹{MINIMUM_ORDER_VALUE}</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Final Payable ({paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"})</span>
                <span>{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
