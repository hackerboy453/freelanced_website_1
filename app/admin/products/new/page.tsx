import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "@/components/admin/product-form"

async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, parent_id, created_at")
    .order("name")
  return data || []
}

export default async function NewProductPage() {
  const categories = await getCategories()

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground">Create a new product for your store</p>
      </div>

      <ProductForm categories={categories} />
    </div>
  )
}
