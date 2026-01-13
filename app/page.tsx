// app/page.tsx - COMPLETE SERVER COMPONENT (NO "use client")
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Truck, Shield, CreditCard, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/product-card"
import { CategoryImage } from "@/components/category-image"
import type { Product, Category } from "@/lib/types"
import HeroSlider from "@/components/hero-slider"

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, created_at, parent_id")
    .is("parent_id", null)
    .order("name")
  
  return data || []
}

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(8)
  return data || []
}

const features = [
  {
    icon: Truck,
    title: "Fast Shipping",
    description: "Fast Delivery across India",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "100% secure payment gateway",
  },
  {
    icon: CreditCard,
    title: "Bulk Order",
    description: "Save more with bulk pricing",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated customer support",
  },
]

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getCategories(), 
    getFeaturedProducts()
  ])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/5 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="text-sm">
                Welcome to Electrotechmart
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance">
                Delivering Advanced Electronics <span className="text-primary">With</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                 Uncompromised Quality and Trust.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link href="/products">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/products">Browse Products</Link>
                </Button>
              </div>
            </div>
            <HeroSlider />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col items-center text-center gap-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
              <p className="text-muted-foreground mt-1">Browse our wide range of categories</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link key={category.id} href={`/products?category=${category.slug}`}>
                <Card className="group hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4 flex flex-col items-center text-center h-full">
                    <div className="h-20 w-20 rounded-full bg-muted mb-3 overflow-hidden flex-shrink-0">
                      <CategoryImage
                        src={category.image_url}
                        alt={category.name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform"
                        fallback="/placeholder.svg?height=80&width=80"
                      />
                    </div>
                    <h3 className="font-medium text-sm group-hover:text-primary transition-colors flex-1 flex items-center">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
              <p className="text-muted-foreground mt-1">Handpicked products just for you</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground overflow-hidden">
            <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Get Your First Order Now</h2>
                <p className="opacity-90">Sign up now and enjoy exclusive discounts on your first purchase!</p>
              </div>
              <Button variant="secondary" size="lg" asChild className="shrink-0">
                <Link href="/auth/sign-up">
                  Sign Up Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
