"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useCallback } from "react"
import { SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import type { Category } from "@/lib/types"

interface ProductFiltersProps {
  categories: Category[]
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const currentCategory = searchParams.get("category") || ""
  const currentSubcategory = searchParams.get("subcategory") || ""
  const currentSort = searchParams.get("sort") || "newest"
  const currentMinPrice = searchParams.get("minPrice") || ""
  const currentMaxPrice = searchParams.get("maxPrice") || ""

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      }
      router.push(`/products?${params.toString()}`)
    },
    [router, searchParams],
  )

  const clearFilters = () => {
    router.push("/products")
  }

  const hasActiveFilters = currentCategory || currentMinPrice || currentMaxPrice || currentSort !== "newest"

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <RadioGroup
          value={currentCategory}
          onValueChange={(value) => {
            updateFilters({ category: value === currentCategory ? "" : value, subcategory: "" })
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="all" />
              <Label htmlFor="all" className="cursor-pointer">
                All Categories
              </Label>
            </div>
            {categories.map((category) => (
              <div key={category.id} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={category.slug} id={category.slug} />
                  <Label htmlFor={category.slug} className="cursor-pointer font-medium">
                    {category.name}
                  </Label>
                </div>
                {/* Show subcategories if parent is selected or if there are subcategories */}
                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="ml-6 space-y-1">
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.id} className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value={subcategory.slug} 
                          id={subcategory.slug}
                          onClick={(e) => {
                            e.stopPropagation()
                            updateFilters({ 
                              category: category.slug, 
                              subcategory: subcategory.slug 
                            })
                          }}
                        />
                        <Label htmlFor={subcategory.slug} className="cursor-pointer text-sm text-muted-foreground">
                          {subcategory.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Sort */}
      <div>
        <h3 className="font-semibold mb-3">Sort By</h3>
        <RadioGroup value={currentSort} onValueChange={(value) => updateFilters({ sort: value })}>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="newest" id="newest" />
              <Label htmlFor="newest" className="cursor-pointer">
                Newest First
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="price-asc" id="price-asc" />
              <Label htmlFor="price-asc" className="cursor-pointer">
                Price: Low to High
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="price-desc" id="price-desc" />
              <Label htmlFor="price-desc" className="cursor-pointer">
                Price: High to Low
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={currentMinPrice}
            onChange={(e) => updateFilters({ minPrice: e.target.value })}
            className="w-24"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="number"
            placeholder="Max"
            value={currentMaxPrice}
            onChange={(e) => updateFilters({ maxPrice: e.target.value })}
            className="w-24"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <>
          <Separator />
          <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full bg-transparent">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block sticky top-24">
        <h2 className="font-semibold text-lg mb-4">Filters</h2>
        <FilterContent />
      </div>
    </>
  )
}
