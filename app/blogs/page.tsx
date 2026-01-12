import Image from "next/image"
import Link from "next/link"
import { Calendar, User, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import type { Blog } from "@/lib/types"

async function getBlogs(): Promise<Blog[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("blogs")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
  return data || []
}

export default async function BlogsPage() {
  const blogs = await getBlogs()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Blog & Updates</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Stay updated with the latest trends, tips, and news from ShopKart.
        </p>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No blog posts yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Card key={blog.id} className="h-full hover:shadow-lg transition-shadow overflow-hidden group flex flex-col">
              <div className="aspect-video relative overflow-hidden bg-muted">
                <Image
                  src={blog.image_url || "/placeholder.svg?height=200&width=400&query=blog post"}
                  alt={blog.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(blog.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {blog.author_name}
                  </span>
                </div>
                <h2 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {blog.title}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">{blog.excerpt}</p>
                {blog.medium_link && (
                  <a
                    href={blog.medium_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-auto text-primary text-sm font-medium hover:underline"
                  >
                    View on Medium
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
