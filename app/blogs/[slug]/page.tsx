import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Calendar, User, ArrowLeft, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Blog } from "@/lib/types"

interface BlogPageProps {
  params: Promise<{ slug: string }>
}

async function getBlog(slug: string): Promise<Blog | null> {
  const supabase = await createClient()
  const { data } = await supabase.from("blogs").select("*").eq("slug", slug).eq("is_published", true).single()
  return data
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params
  const blog = await getBlog(slug)

  if (!blog) {
    notFound()
  }

  return (
    <article className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/blogs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </Button>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">{blog.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(blog.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {blog.author_name}
            </span>
          </div>
        </header>

        {blog.image_url && (
          <div className="aspect-video relative rounded-lg overflow-hidden bg-muted mb-8">
            <Image src={blog.image_url || "/placeholder.svg"} alt={blog.title} fill className="object-cover" />
          </div>
        )}

        {blog.excerpt && (
          <div className="mb-8">
            <p className="text-lg text-muted-foreground leading-relaxed">{blog.excerpt}</p>
          </div>
        )}

        {blog.medium_link ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Read the full article on Medium</p>
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <a href={blog.medium_link} target="_blank" rel="noopener noreferrer">
                    View on Medium
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="prose prose-neutral max-w-none">
            {blog.content.split("\n\n").map((paragraph, index) => (
              <p key={index} className="mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
