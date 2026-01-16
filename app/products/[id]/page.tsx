import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight, Star, Truck, Shield, RotateCcw, CreditCard } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils/tax"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProductCard } from "@/components/product-card"
import { ProductImageGallery } from "@/components/product-image-gallery"
import { ProductQuantityManager } from "@/components/product-quantity-manager"
import type { Product } from "@/lib/types"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("id", id)
    .eq("is_active", true)
    .single()
  return data
}

async function getRelatedProducts(categoryId: string | null, currentId: string): Promise<Product[]> {
  if (!categoryId) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .neq("id", currentId)
    .limit(4)
  return data || []
}

async function getFrequentlyBoughtTogether(currentTitle: string, currentId: string): Promise<Product[]> {
  const supabase = await createClient()
  
  // Get all active products except the current one
  const { data: allProducts } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_active", true)
    .neq("id", currentId)
  
  if (!allProducts || allProducts.length === 0) return []
  
  // Extract keywords from current product title (common words to ignore)
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can'])
  
  const currentWords = currentTitle
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
  
  // Score products based on title similarity
  const scoredProducts = allProducts.map(product => {
    const productWords = product.title
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
    
    // Calculate similarity score (number of matching words)
    const matchingWords = currentWords.filter(word => 
      productWords.some(pWord => pWord.includes(word) || word.includes(pWord))
    )
    
    return {
      product,
      score: matchingWords.length
    }
  })
  
  // Sort by score and return top 4
  return scoredProducts
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(item => item.product)
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.category_id, product.id)
  const frequentlyBoughtTogether = await getFrequentlyBoughtTogether(product.title, product.id)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground truncate max-w-48">{product.title}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <ProductImageGallery images={product.images || []} productTitle={product.title} />

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            {product.category && (
              <Link
                href={`/products?category=${product.category.slug}`}
                className="text-sm text-primary hover:underline"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="text-2xl md:text-3xl font-bold mt-1">{product.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">(4.5 out of 5 | 128 reviews)</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
              {typeof product.discount_51_plus === "number" && product.discount_51_plus > 0 ? (
                <Badge variant="secondary">Up to {product.discount_51_plus}% OFF on bulk</Badge>
              ) : (
                <Badge variant="secondary">Bulk discounts available</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Inclusive of all taxes (base price per unit)</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Availability</h3>
            {product.stock > 0 ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                In Stock ({product.stock} available)
              </Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          <ProductQuantityManager product={product} />

          <Separator />

          <Separator />

          {/* Trust Badges */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 rounded-md border bg-muted/50 px-3 py-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">COD Available</p>
                <p className="text-xs text-muted-foreground">Cash on delivery supported</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md border bg-muted/50 px-3 py-3">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Free Shipping</p>
                <p className="text-xs text-muted-foreground">On orders above ₹2000</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md border bg-muted/50 px-3 py-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">GST Input Credit</p>
                <p className="text-xs text-muted-foreground">Available on all purchases</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Features */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center gap-1">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-xs">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <RotateCcw className="h-5 w-5 text-primary" />
              <span className="text-xs">Bulk Order</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-xs">Secure Payment</span>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || "No description available."}
              </p>
            </div>

            {Array.isArray(product.specs) && product.specs.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Product Details</h3>
                <div className="overflow-hidden rounded-md border text-sm">
                  <div className="grid grid-cols-2 bg-muted/60 font-medium border-b">
                    <div className="px-3 py-2 border-r">Label</div>
                    <div className="px-3 py-2">Value</div>
                  </div>
                  {product.specs.map((row, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-2 border-t odd:bg-muted/30"
                    >
                      <div className="px-3 py-2 border-r">
                        {row.label || "-"}
                      </div>
                      <div className="px-3 py-2">
                        {row.value || "-"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Frequently Bought Together */}
      {frequentlyBoughtTogether.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Frequently Bought Together</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {frequentlyBoughtTogether.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
 
