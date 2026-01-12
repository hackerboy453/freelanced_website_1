"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { CartItem, Product, Profile } from "@/lib/types"
import { mutate } from "swr"
import { COD_SHIPPING_FEE, ONLINE_SHIPPING_FEE, calculateTotal as calcTotal, calculateBulkDiscount, calculateDiscountedPrice } from "@/lib/utils/tax"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface CheckoutFormProps {
  userId: string
  profile: Profile | null
  cartItems: (CartItem & { product: Product })[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  onPaymentMethodChange: (method: string) => void
}

// Calculate shipping fee based on payment method
const getShippingFee = (paymentMethod: string): number => {
  return paymentMethod === "cod" ? COD_SHIPPING_FEE : ONLINE_SHIPPING_FEE
}

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
]

export function CheckoutForm({ userId, profile, cartItems, subtotal, tax, total, paymentMethod, onPaymentMethodChange }: CheckoutFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [phone, setPhone] = useState(profile?.phone || "")
  const [address, setAddress] = useState(profile?.address || "")
  const [city, setCity] = useState(profile?.city || "")
  const [state, setState] = useState(profile?.state || "")
  const [pincode, setPincode] = useState(profile?.pincode || "")

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => setIsRazorpayLoaded(true)
    script.onerror = () => {
      console.error("Failed to load Razorpay script")
      toast.error("Failed to load payment gateway")
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const createOrderInDatabase = async () => {
    try {
      // Calculate discounted prices for each item
      const cartItemsWithDiscounts = cartItems.map((item) => {
        const discount21_50 = item.product.discount_21_50 ?? 10
        const discount51Plus = item.product.discount_51_plus ?? 20
        const itemDiscount = calculateBulkDiscount(
          item.product.price,
          item.quantity,
          discount21_50,
          discount51Plus
        )
        const discountedPrice = (item.product.price * item.quantity) - itemDiscount
        
        return {
          product_id: item.product.id,
          product_title: item.product.title,
          product_price: discountedPrice / item.quantity, // Store per-unit discounted price
          quantity: item.quantity,
        }
      })

      // Calculate shipping and final total based on selected payment method
      const shippingFee = getShippingFee(paymentMethod)
      const finalTotal = calcTotal(subtotal, tax, shippingFee)

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems: cartItemsWithDiscounts,
          subtotal,
          tax,
          shipping: shippingFee,
          total: finalTotal,
          shippingAddress: address,
          shippingCity: city,
          shippingState: state,
          shippingPincode: pincode,
          shippingFullName: fullName,
          shippingPhone: phone,
          paymentMethod: paymentMethod,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create order")
      }

      const data = await response.json()
      return data.order
    } catch (error) {
      console.error("Error creating order:", error)
      throw error
    }
  }

  const handleRazorpayPayment = async (order: any) => {
    if (!isRazorpayLoaded || !window.Razorpay) {
      toast.error("Payment gateway not loaded. Please refresh the page.")
      setIsLoading(false)
      // Cancel order if payment gateway fails
      await cancelOrder(order.id)
      return
    }

    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    if (!razorpayKeyId || razorpayKeyId === "your_razorpay_key_id" || razorpayKeyId.trim() === "") {
      toast.error("Razorpay is not configured. Please contact support.")
      console.error("Razorpay key ID is missing or invalid")
      setIsLoading(false)
      // Cancel order if Razorpay is not configured
      await cancelOrder(order.id)
      return
    }

    try {
      const shippingFee = getShippingFee("razorpay")
      const finalTotal = calcTotal(subtotal, tax, shippingFee)
      
      // Create Razorpay order
      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: finalTotal,
          currency: "INR",
          orderId: order.id,
          receipt: order.order_number,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error occurred" }))
        // Mark order as failed if Razorpay order creation fails
        await failOrder(order.id)
        const errorMessage = errorData.error || `Failed to create payment order (${response.status})`
        console.error("Razorpay order creation failed:", errorData)
        throw new Error(errorMessage)
      }

      const razorpayOrder = await response.json()

      // Initialize Razorpay checkout
      const options = {
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "E-Commerce Store",
        description: `Order ${order.order_number}`,
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: order.id,
              }),
            })

            if (!verifyResponse.ok) {
              const error = await verifyResponse.json()
              // Mark order as failed if payment verification fails
              await failOrder(order.id)
              throw new Error(error.error || "Payment verification failed")
            }

            // Clear cart items
            const itemIds = cartItems.map((item) => item.id)
            if (itemIds.length > 0) {
              const supabase = createClient()
              const { error: cartError } = await supabase.from("cart_items").delete().in("id", itemIds)
              if (cartError) {
                console.error("Error clearing cart:", cartError)
                // Don't throw here, payment is verified and order is created
              }
            }

            toast.success("Payment successful! Order placed.")
            mutate(["cart-count", userId])
            router.push(`/orders/${order.id}/success`)
          } catch (error) {
            console.error("Payment verification error:", error)
            toast.error(error instanceof Error ? error.message : "Payment verification failed")
            setIsLoading(false)
          }
        },
        prefill: {
          name: fullName,
          email: profile?.full_name || "",
          contact: phone,
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false)
            toast.info("Payment cancelled")
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on("payment.failed", async function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`)
        // Mark order as failed if payment fails
        await failOrder(order.id)
        setIsLoading(false)
      })
      razorpay.open()
    } catch (error) {
      console.error("Razorpay payment error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to process payment")
      // Mark order as failed on error
      if (order?.id) {
        await failOrder(order.id)
      }
      setIsLoading(false)
    }
  }

  const cancelOrder = async (orderId: string) => {
    try {
      const supabase = createClient()
      await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId)
      console.log("Order cancelled:", orderId)
    } catch (error) {
      console.error("Error cancelling order:", error)
    }
  }

  const failOrder = async (orderId: string) => {
    try {
      const supabase = createClient()
      await supabase
        .from("orders")
        .update({ status: "failed" })
        .eq("id", orderId)
      console.log("Order marked as failed:", orderId)
    } catch (error) {
      console.error("Error marking order as failed:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate pincode
    if (!/^\d{6}$/.test(pincode)) {
      toast.error("Please enter a valid 6-digit pincode")
      setIsLoading(false)
      return
    }

    // Validate phone
    if (!/^\d{10}$/.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number")
      setIsLoading(false)
      return
    }

    try {
      // For Razorpay, create order with pending status first
      // For COD, create order directly
      const order = await createOrderInDatabase()

      // Handle payment based on payment method
      if (paymentMethod === "razorpay") {
        await handleRazorpayPayment(order)
        return // Don't clear loading state here, Razorpay will handle it
      } else {
        // For COD, clear only the items that were checked out
        const itemIds = cartItems.map((item) => item.id)
        if (itemIds.length > 0) {
          const supabase = createClient()
          const { error: cartError } = await supabase.from("cart_items").delete().in("id", itemIds)
          if (cartError) {
            console.error("Error clearing cart:", cartError)
            // Don't throw here, order is already created
          }
        }

        toast.success("Order placed successfully!")
        mutate(["cart-count", userId])
        router.push(`/orders/${order.id}/success`)
      }
    } catch (error) {
      console.error("Order placement error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to place order"
      toast.error(errorMessage)
      setIsLoading(false)
    } finally {
      if (paymentMethod !== "razorpay") {
        setIsLoading(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House/Flat No., Street, Area"
              required
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <select
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select State</option>
                {indianStates.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit pincode"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange}>
            <div className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50">
              <RadioGroupItem value="cod" id="cod" />
              <Label htmlFor="cod" className="flex-1 cursor-pointer">
                <span className="font-medium">Cash on Delivery</span>
                <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50">
              <RadioGroupItem value="razorpay" id="razorpay" />
              <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                <span className="font-medium">Razorpay (UPI, Cards, Wallets)</span>
                <p className="text-sm text-muted-foreground">Secure payment via Razorpay - UPI, Cards, Net Banking & Wallets</p>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? "Placing Order..." : "Place Order"}
      </Button>
    </form>
  )
}
