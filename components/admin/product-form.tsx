"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Product, Category } from "@/lib/types"

interface ProductFormProps {
  product?: Product
  categories: Category[]
}

interface ProductSpecRow {
  label: string
  value: string
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState(product?.title || "")
  const [description, setDescription] = useState(product?.description || "")
  const [price, setPrice] = useState(product?.price?.toString() || "")
  const [categoryId, setCategoryId] = useState(product?.category_id || "")
  const [stock, setStock] = useState(product?.stock?.toString() || "0")
  const [isActive, setIsActive] = useState(product?.is_active ?? true)
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [newImageUrl, setNewImageUrl] = useState("")
  const [discount21_50, setDiscount21_50] = useState(product?.discount_21_50?.toString() || "10")
  const [discount51Plus, setDiscount51Plus] = useState(product?.discount_51_plus?.toString() || "20")
  const [specs, setSpecs] = useState<ProductSpecRow[]>(
    Array.isArray(product?.specs)
      ? (product!.specs as ProductSpecRow[])
      : [],
  )

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()])
      setNewImageUrl("")
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleAddSpecRow = () => {
    setSpecs([...specs, { label: "", value: "" }])
  }

  const handleRemoveSpecRow = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index))
  }

  const handleSpecChange = (index: number, field: "label" | "value", value: string) => {
    const updated = [...specs]
    updated[index] = { ...updated[index], [field]: value }
    setSpecs(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validation
      if (!title.trim()) {
        toast.error("Product title is required")
        setIsLoading(false)
        return
      }

      const priceNum = Number.parseFloat(price)
      if (isNaN(priceNum) || priceNum < 0) {
        toast.error("Please enter a valid price")
        setIsLoading(false)
        return
      }

      const stockNum = Number.parseInt(stock)
      if (isNaN(stockNum) || stockNum < 0) {
        toast.error("Please enter a valid stock quantity")
        setIsLoading(false)
        return
      }

      const discount21_50Num = Number.parseFloat(discount21_50)
      if (isNaN(discount21_50Num) || discount21_50Num < 0 || discount21_50Num > 100) {
        toast.error("Discount for 21-50 units must be between 0 and 100")
        setIsLoading(false)
        return
      }

      const discount51PlusNum = Number.parseFloat(discount51Plus)
      if (isNaN(discount51PlusNum) || discount51PlusNum < 0 || discount51PlusNum > 100) {
        toast.error("Discount for 51+ units must be between 0 and 100")
        setIsLoading(false)
        return
      }

      const supabase = createClient()

      const cleanedSpecs = specs
        .map((row) => ({
          label: row.label.trim(),
          value: row.value.trim(),
        }))
        .filter((row) => row.label !== "" || row.value !== "")

      const productData = {
        title: title.trim(),
        description: description.trim() || null,
        price: priceNum,
        category_id: categoryId || null,
        stock: stockNum,
        is_active: isActive,
        images: images.length > 0 ? images : [],
        discount_21_50: discount21_50Num,
        discount_51_plus: discount51PlusNum,
        specs: cleanedSpecs,
        updated_at: new Date().toISOString(),
      }

      if (product) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id)

        if (error) {
          console.error("Update product error:", error)
          const errorMsg = error.message || error.details || error.hint || "Failed to update product"
          toast.error(errorMsg)
          setIsLoading(false)
          return
        }

        toast.success("Product updated successfully")
      } else {
        // Create new product
        const { error } = await supabase.from("products").insert(productData)

        if (error) {
          console.error("Create product error:", error)
          const errorMsg = error.message || error.details || error.hint || "Failed to create product"
          toast.error(errorMsg)
          setIsLoading(false)
          return
        }

        toast.success("Product created successfully")
      }

      router.push("/admin/products")
      router.refresh()
    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Product Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter product title"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
              rows={4}
              disabled={isLoading}
            />
          </div>

          {/* Customizable Specs Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Product Details (Table)</Label>
                <p className="text-xs text-muted-foreground">
                  Add custom rows to describe product specifications (e.g. Material, Size, Color).
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSpecRow}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Row
              </Button>
            </div>

            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-12 bg-muted text-xs font-medium border-b">
                <div className="col-span-5 px-3 py-2 border-r">Label</div>
                <div className="col-span-6 px-3 py-2 border-r">Value</div>
                <div className="col-span-1 px-3 py-2 text-center">Actions</div>
              </div>

              {specs.length === 0 ? (
                <div className="px-3 py-3 text-xs text-muted-foreground">
                  No rows added yet. Click &quot;Add Row&quot; to create your first specification.
                </div>
              ) : (
                specs.map((row, index) => (
                  <div key={index} className="grid grid-cols-12 border-t">
                    <div className="col-span-5 border-r px-2 py-1.5">
                      <Input
                        value={row.label}
                        onChange={(e) => handleSpecChange(index, "label", e.target.value)}
                        placeholder="e.g. Material"
                        disabled={isLoading}
                        className="h-8"
                      />
                    </div>
                    <div className="col-span-6 border-r px-2 py-1.5">
                      <Input
                        value={row.value}
                        onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                        placeholder="e.g. 100% Cotton"
                        disabled={isLoading}
                        className="h-8"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center px-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSpecRow(index)}
                        disabled={isLoading}
                        className="text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount21_50">Bulk Discount 21-50 units (%) *</Label>
              <Input
                id="discount21_50"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={discount21_50}
                onChange={(e) => setDiscount21_50(e.target.value)}
                placeholder="10"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Discount percentage for orders of 21-50 units</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount51Plus">Bulk Discount 51+ units (%) *</Label>
              <Input
                id="discount51Plus"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={discount51Plus}
                onChange={(e) => setDiscount51Plus(e.target.value)}
                placeholder="20"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Discount percentage for orders of 51+ units</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={categoryId || undefined} 
              onValueChange={(value) => setCategoryId(value || "")} 
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category (optional)" />
              </SelectTrigger>
              <SelectContent>
                {categories.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">No categories available</div>
                ) : (
                  (() => {
                    // Separate main categories and subcategories
                    const mainCategories = categories.filter((cat) => !cat.parent_id)
                    const subcategories = categories.filter((cat) => cat.parent_id)
                    
                    return (
                      <>
                        {mainCategories.map((category) => {
                          const categorySubs = subcategories.filter((sub) => sub.parent_id === category.id)
                          return (
                            <div key={category.id}>
                              <SelectItem value={category.id}>
                                {category.name}
                              </SelectItem>
                              {categorySubs.map((sub) => (
                                <SelectItem key={sub.id} value={sub.id} className="pl-8">
                                  └ {sub.name}
                                </SelectItem>
                              ))}
                            </div>
                          )
                        })}
                      </>
                    )
                  })()
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="active">Active</Label>
              <p className="text-sm text-muted-foreground">Product will be visible to customers</p>
            </div>
            <Switch id="active" checked={isActive} onCheckedChange={setIsActive} disabled={isLoading} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>Product Images {images.length > 0 && `(${images.length})`}</Label>
            <p className="text-sm text-muted-foreground">
              Add multiple image URLs for your product. The first image will be used as the main product image.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
              className="flex-1"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddImage()
                }
              }}
            />
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleAddImage} 
              disabled={isLoading || !newImageUrl.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </div>

          {images.length > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group aspect-square bg-muted rounded-lg overflow-hidden border-2 border-border">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Product image ${index + 1}`}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=200&width=200"
                      }}
                    />
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        Main
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                      disabled={isLoading}
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      Image {index + 1}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Drag to reorder (coming soon)</span>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    if (images.length > 1) {
                      const newImages = [...images]
                      const first = newImages[0]
                      newImages[0] = newImages[images.length - 1]
                      newImages[images.length - 1] = first
                      setImages(newImages)
                    }
                  }}
                  className="text-primary hover:underline"
                  disabled={isLoading || images.length <= 1}
                >
                  Set last image as main
                </button>
              </div>
            </div>
          )}

          {images.length === 0 && (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No images added yet. Add at least one image URL above.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : product ? (
            "Update Product"
          ) : (
            "Create Product"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}