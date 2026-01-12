"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ShoppingBag, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { formatPrice, calculateSubtotal, calculateTax, calculateTotal, GST_RATE, calculateBulkDiscount } from "@/lib/utils/tax"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { mutate } from "swr"
import type { CartItem, Product } from "@/lib/types"
import Image from "next/image"
import { Trash2, Plus, Minus } from "lucide-react"

interface CartItemWithProduct extends CartItem {
  product: Product
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    loadCartItems()
  }, [])

  // Load saved selections from localStorage
  useEffect(() => {
    if (cartItems.length > 0) {
      const savedSelections = localStorage.getItem("cart-selections")
      if (savedSelections) {
        try {
          const savedIds = JSON.parse(savedSelections) as string[]
          // Only restore selections for items that still exist in cart
          const validIds = savedIds.filter((id) => cartItems.some((item) => item.id === id))
          if (validIds.length > 0) {
            setSelectedItems(new Set(validIds))
          } else {
            // If no valid saved selections, select all by default
            setSelectedItems(new Set(cartItems.map((item) => item.id)))
          }
        } catch (e) {
          // If parsing fails, select all by default
          setSelectedItems(new Set(cartItems.map((item) => item.id)))
        }
      } else {
        // No saved selections, select all by default
        setSelectedItems(new Set(cartItems.map((item) => item.id)))
      }
    }
  }, [cartItems])

  const loadCartItems = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error("Auth error:", authError)
        router.push("/auth/login")
        return
      }

      const { data, error } = await supabase
        .from("cart_items")
        .select("*, product:products(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading cart:", error)
        toast.error(`Failed to load cart items: ${error.message}`)
        setCartItems([])
        return
      }

      const items = (data as CartItemWithProduct[]) || []
      setCartItems(items)
      // Don't set selectedItems here - let the useEffect handle it with localStorage
    } catch (err) {
      console.error("Unexpected error:", err)
      toast.error("An unexpected error occurred. Please refresh the page.")
      setCartItems([])
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      setIsUpdating(true)
      const supabase = createClient()

      const item = cartItems.find((i) => i.id === itemId)
      if (!item) {
        toast.error("Item not found in cart")
        setIsUpdating(false)
        return
      }

      if (newQuantity > item.product.stock) {
        toast.error(`Only ${item.product.stock} items available`)
        setIsUpdating(false)
        return
      }

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", itemId)

      if (error) {
        console.error("Error updating quantity:", error)
        toast.error(`Failed to update quantity: ${error.message}`)
        setIsUpdating(false)
        return
      }

      await loadCartItems()
    } catch (err) {
      console.error("Unexpected error:", err)
      toast.error("An unexpected error occurred")
    } finally {
      setIsUpdating(false)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      setIsUpdating(true)
      const supabase = createClient()

      const { error } = await supabase.from("cart_items").delete().eq("id", itemId)

      if (error) {
        console.error("Error removing item:", error)
        toast.error(`Failed to remove item: ${error.message}`)
        setIsUpdating(false)
        return
      }

      toast.success("Item removed from cart")
      setSelectedItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
      await loadCartItems()
    } catch (err) {
      console.error("Unexpected error:", err)
      toast.error("An unexpected error occurred")
    } finally {
      setIsUpdating(false)
    }
  }

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      // Save to localStorage
      localStorage.setItem("cart-selections", JSON.stringify(Array.from(newSet)))
      return newSet
    })
  }

  const toggleSelectAll = () => {
    const newSet = selectedItems.size === cartItems.length 
      ? new Set<string>()
      : new Set(cartItems.map((item) => item.id))
    setSelectedItems(newSet)
    // Save to localStorage
    localStorage.setItem("cart-selections", JSON.stringify(Array.from(newSet)))
  }

  // Calculate totals for selected items only
  const selectedCartItems = cartItems.filter((item) => selectedItems.has(item.id))

  // Calculate original subtotal and discount
  const items = selectedCartItems.map((item) => ({
    price: item.product.price,
    quantity: item.quantity,
  }))

  const originalSubtotal = calculateSubtotal(items)
  const totalDiscount = selectedCartItems.reduce((sum, item) => {
    const discount21_50 = item.product.discount_21_50 ?? 10
    const discount51Plus = item.product.discount_51_plus ?? 20
    return sum + calculateBulkDiscount(item.product.price, item.quantity, discount21_50, discount51Plus)
  }, 0)
  const subtotal = originalSubtotal - totalDiscount
  const tax = calculateTax(subtotal)
  const total = calculateTotal(subtotal, tax)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven&apos;t added anything to your cart yet.</p>
            <Button asChild>
              <Link href="/products">
                Start Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select All */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                    Select All ({cartItems.length} items)
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Cart Items List */}
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Checkbox
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={() => toggleItemSelection(item.id)}
                      className="mt-2"
                    />
                    <Link href={`/products/${item.product.id}`} className="shrink-0">
                      <div className="h-24 w-24 relative rounded-md overflow-hidden bg-muted">
                        <Image
                          src={
                            item.product.images && item.product.images.length > 0
                              ? item.product.images[0]
                              : "/placeholder.svg?height=96&width=96"
                          }
                          alt={item.product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product.id}`}
                        className="font-medium hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.product.title}
                      </Link>
                      <p className="text-lg font-bold mt-1">{formatPrice(item.product.price)}</p>
                      
                      {(() => {
                        const discount21_50 = item.product.discount_21_50 ?? 10
                        const discount51Plus = item.product.discount_51_plus ?? 20
                        const itemDiscount = calculateBulkDiscount(
                          item.product.price,
                          item.quantity,
                          discount21_50,
                          discount51Plus
                        )
                        const hasDiscount = itemDiscount > 0
                        return hasDiscount && (
                          <p className="text-xs text-green-600 mt-1">
                            Bulk discount: {formatPrice(itemDiscount)} off ({item.quantity} units)
                          </p>
                        )
                      })()}

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isUpdating}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock || isUpdating}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                          disabled={isUpdating}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {(() => {
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
                          <div>
                            {hasDiscount ? (
                              <>
                                <p className="font-semibold line-through text-muted-foreground text-sm">
                                  {formatPrice(originalPrice)}
                                </p>
                                <p className="font-semibold text-green-600">
                                  {formatPrice(discountedPrice)}
                                </p>
                              </>
                            ) : (
                              <p className="font-semibold">{formatPrice(originalPrice)}</p>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({selectedCartItems.length} {selectedCartItems.length === 1 ? "item" : "items"})
                  </span>
                  <span>{formatPrice(originalSubtotal)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium">Bulk Discount</span>
                    <span className="text-green-600 font-medium">-{formatPrice(totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST ({(GST_RATE * 100).toFixed(0)}%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <div className="text-right">
                    <span className="text-green-600">Free (Online Payment)</span>
                    <p className="text-xs text-muted-foreground">₹80 (Cash on Delivery)</p>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                {totalDiscount > 0 && (
                  <p className="text-xs text-green-600 font-medium">
                    You saved {formatPrice(totalDiscount)} with bulk pricing!
                  </p>
                )}
                <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  disabled={selectedCartItems.length === 0 || total < 200}
                  onClick={() => {
                    if (total < 200) {
                      toast.error("Minimum order value is ₹200. Please add more items to proceed.")
                      return
                    }
                    // Store selected items in sessionStorage
                    const selectedIds = Array.from(selectedItems)
                    sessionStorage.setItem("checkout-items", JSON.stringify(selectedIds))
                    router.push("/checkout")
                  }}
                >
                  Proceed to Checkout ({selectedCartItems.length})
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                {total < 200 && selectedCartItems.length > 0 && (
                  <p className="text-xs text-destructive mt-2 text-center w-full">
                    Minimum order value is ₹200. Add items worth ₹{formatPrice(200 - total)} more to proceed.
                  </p>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
