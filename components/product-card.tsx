"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils/tax"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { mutate } from "swr"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const supabase = createClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        toast.error("Please login to add items to cart")
        router.push("/auth/login")
        return
      }

      // Check stock
      if (product.stock === 0) {
        toast.error("This product is out of stock")
        return
      }

      // Check if item already in cart
      const { data: existingItem, error: checkError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .maybeSingle()

      if (checkError) {
        console.error("Error checking cart:", checkError)
        toast.error(`Failed to check cart: ${checkError.message}`)
        return
      }

      if (existingItem) {
        // Check stock availability
        const newQuantity = existingItem.quantity + 1
        if (newQuantity > product.stock) {
          toast.error(`Only ${product.stock} items available in stock`)
          return
        }

        // Update quantity
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: newQuantity })
          .eq("id", existingItem.id)

        if (updateError) {
          console.error("Error updating cart:", updateError)
          toast.error(`Failed to update cart: ${updateError.message}`)
          return
        }
      } else {
        // Add new item
        const { error: insertError } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
        })

        if (insertError) {
          console.error("Error adding to cart:", insertError)
          toast.error(`Failed to add to cart: ${insertError.message}`)
          return
        }
      }

      toast.success("Added to cart!")
      mutate(["cart-count", user.id])
      mutate(["cart-items", user.id])
    } catch (err) {
      console.error("Unexpected error:", err)
      toast.error("An unexpected error occurred. Please try again.")
    }
  }

  const productImage = product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg?height=300&width=300"

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group h-full hover:shadow-lg transition-all duration-300 overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={productImage}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {product.stock <= 5 && product.stock > 0 && (
              <Badge variant="destructive" className="absolute top-2 left-2">
                Only {product.stock} left
              </Badge>
            )}
            {product.stock === 0 && (
              <Badge variant="secondary" className="absolute top-2 left-2">
                Out of Stock
              </Badge>
            )}
          </div>
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-primary text-primary" />
              ))}
              <span className="text-xs text-muted-foreground ml-1">(4.5)</span>
            </div>
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {product.title}
            </h3>
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-lg">{formatPrice(product.price)}</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="shrink-0"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="sr-only">Add to cart</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
