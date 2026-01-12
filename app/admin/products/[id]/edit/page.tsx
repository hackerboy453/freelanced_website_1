import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "@/components/admin/product-form"
import { PricingTiers } from "@/components/pricing-tiers"
import { Separator } from "@/components/ui/separator"

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: string) {
  const supabase = await createClient()
  const { data } = await supabase.from("products").select("*").eq("id", id).single()
  return data
}

async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, parent_id, created_at")
    .order("name")
  return data || []
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  const [product, categories] = await Promise.all([getProduct(id), getCategories()])

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground">Update product information</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <ProductForm product={product} categories={categories} />
        </div>
        <div>
          <PricingTiers
            basePrice={product.price}
            discount21_50={product.discount_21_50 ?? undefined}
            discount51Plus={product.discount_51_plus ?? undefined}
          />
        </div>
      </div>
    </div>
  )
}
