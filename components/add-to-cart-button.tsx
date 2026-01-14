"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { mutate } from "swr"
import type { Product } from "@/lib/types"

interface AddToCartButtonProps {
  product: Product
  quantity?: number
  onQuantityChange?: (quantity: number) => void
}

export function AddToCartButton({ product, quantity: externalQuantity, onQuantityChange }: AddToCartButtonProps) {
  const [internalQuantity, setInternalQuantity] = useState(1)
  const [inputValue, setInputValue] = useState("1")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Use external quantity if provided, otherwise use internal state
  const quantity = externalQuantity !== undefined ? externalQuantity : internalQuantity
  const setQuantity = (qty: number) => {
    if (onQuantityChange) {
      onQuantityChange(qty)
    } else {
      setInternalQuantity(qty)
    }
  }

  // Sync input value with quantity
  useEffect(() => {
    setInputValue(quantity.toString())
  }, [quantity])

  // Sync internal state with external quantity changes
  useEffect(() => {
    if (externalQuantity !== undefined) {
      setInternalQuantity(externalQuantity)
    }
  }, [externalQuantity])

  const handleQuantityChange = (value: string) => {
    // Allow empty input while typing
    if (value === "") {
      setInputValue("")
      return
    }

    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, "")
    if (numericValue === "") {
      setInputValue("")
      return
    }

    const numValue = parseInt(numericValue, 10)
    
    // Validate range
    if (numValue < 1) {
      setInputValue("1")
      setQuantity(1)
      return
    }
    
    if (numValue > product.stock) {
      setInputValue(product.stock.toString())
      setQuantity(product.stock)
      toast.error(`Only ${product.stock} items available`)
      return
    }

    setInputValue(numericValue)
    setQuantity(numValue)
  }

  const handleQuantityBlur = () => {
    // Ensure quantity is at least 1 when input loses focus
    if (inputValue === "" || parseInt(inputValue, 10) < 1) {
      setInputValue("1")
      setQuantity(1)
    } else {
      const numValue = parseInt(inputValue, 10)
      if (numValue > product.stock) {
        setInputValue(product.stock.toString())
        setQuantity(product.stock)
      } else {
        setQuantity(numValue)
      }
    }
  }

  const handleAddToCart = async () => {
    setIsLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        toast.error("Please login to add items to cart")
        router.push("/auth/login")
        setIsLoading(false)
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
        setIsLoading(false)
        return
      }

      if (existingItem) {
        // Check stock availability
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > product.stock) {
          toast.error(`Only ${product.stock} items available in stock`)
          setIsLoading(false)
          return
        }

        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: newQuantity })
          .eq("id", existingItem.id)

        if (updateError) {
          console.error("Error updating cart:", updateError)
          toast.error(`Failed to update cart: ${updateError.message}`)
          setIsLoading(false)
          return
        }
      } else {
        // Check stock availability
        if (quantity > product.stock) {
          toast.error(`Only ${product.stock} items available in stock`)
          setIsLoading(false)
          return
        }

        const { error: insertError } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: product.id,
          quantity,
        })

        if (insertError) {
          console.error("Error adding to cart:", insertError)
          toast.error(`Failed to add to cart: ${insertError.message}`)
          setIsLoading(false)
          return
        }
      }

      toast.success(`Added ${quantity} item(s) to cart!`)
      mutate(["cart-count", user.id])
      mutate(["cart-items", user.id])
    } catch (err) {
      console.error("Unexpected error:", err)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Quantity:</span>
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const newQty = Math.max(1, quantity - 1)
              setQuantity(newQty)
              setInputValue(newQty.toString())
            }}
            disabled={quantity <= 1}
            className="h-9 w-9"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={(e) => handleQuantityChange(e.target.value)}
            onBlur={handleQuantityBlur}
            onKeyDown={(e) => {
              // Prevent non-numeric keys except backspace, delete, arrow keys, etc.
              if (
                !/[0-9]/.test(e.key) &&
                !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter"].includes(e.key)
              ) {
                e.preventDefault()
              }
            }}
            className="w-16 h-9 text-center font-medium border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
            disabled={isLoading || product.stock === 0}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const newQty = Math.min(product.stock, quantity + 1)
              setQuantity(newQty)
              setInputValue(newQty.toString())
            }}
            disabled={quantity >= product.stock}
            className="h-9 w-9"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {product.stock > 0 && (
          <span className="text-xs text-muted-foreground">Max: {product.stock}</span>
        )}
      </div>

      <Button onClick={handleAddToCart} disabled={product.stock === 0 || isLoading} className="w-full" size="lg">
        <ShoppingCart className="h-4 w-4 mr-2" />
        {isLoading ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
      </Button>
    </div>
  )
}

