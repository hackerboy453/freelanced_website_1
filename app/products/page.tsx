import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import { Skeleton } from "@/components/ui/skeleton"
import type { Product, Category } from "@/lib/types"

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    subcategory?: string
    search?: string
    sort?: string
    minPrice?: string
    maxPrice?: string
  }>
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  // Get all categories with their subcategories
  const { data: allCategories } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, parent_id, created_at")
    .order("name")
  
  if (!allCategories) return []
  
  // Separate main categories and subcategories
  const mainCategories = allCategories.filter((cat) => !cat.parent_id)
  const subcategories = allCategories.filter((cat) => cat.parent_id)
  
  // Attach subcategories to their parent categories
  const categoriesWithSubs = mainCategories.map((category) => ({
    ...category,
    subcategories: subcategories.filter((sub) => sub.parent_id === category.id),
  }))
  
  return categoriesWithSubs
}

async function getProducts(params: {
  category?: string
  subcategory?: string
  search?: string
  sort?: string
  minPrice?: string
  maxPrice?: string
}): Promise<Product[]> {
  const supabase = await createClient()
  let query = supabase.from("products").select("*, category:categories(*)").eq("is_active", true)

  if (params.subcategory) {
    // Filter by subcategory
    const { data: subcat } = await supabase.from("categories").select("id").eq("slug", params.subcategory).single()
    if (subcat) {
      query = query.eq("category_id", subcat.id)
    }
  } else if (params.category) {
    // Filter by main category - include products in subcategories too
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", params.category).single()
    if (cat) {
      // Get all subcategories of this category
      const { data: subcategories } = await supabase
        .from("categories")
        .select("id")
        .eq("parent_id", cat.id)
      
      const categoryIds = [cat.id]
      if (subcategories) {
        categoryIds.push(...subcategories.map((sc) => sc.id))
      }
      
      query = query.in("category_id", categoryIds)
    }
  }

  if (params.search) {
    query = query.ilike("title", `%${params.search}%`)
  }

  if (params.minPrice) {
    query = query.gte("price", Number.parseFloat(params.minPrice))
  }

  if (params.maxPrice) {
    query = query.lte("price", Number.parseFloat(params.maxPrice))
  }

  switch (params.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true })
      break
    case "price-desc":
      query = query.order("price", { ascending: false })
      break
    case "newest":
      query = query.order("created_at", { ascending: false })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  // Limit to 500 products per page
  query = query.limit(500)

  const { data } = await query
  return data || []
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const [categories, products] = await Promise.all([getCategories(), getProducts(params)])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {params.subcategory
            ? categories
                .flatMap((c) => [c, ...(c.subcategories || [])])
                .find((c) => c.slug === params.subcategory)?.name || "Products"
            : params.category
              ? categories.find((c) => c.slug === params.category)?.name || "Products"
              : params.search
                ? `Search results for "${params.search}"`
                : "All Products"}
        </h1>
        <p className="text-muted-foreground">
          {products.length} product{products.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <ProductFilters categories={categories} />
        </aside>

        <main className="flex-1">
          <Suspense fallback={<ProductGridSkeleton />}>
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No products found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search query</p>
              </div>
            )}
          </Suspense>
        </main>
      </div>
    </div>
  )
}
