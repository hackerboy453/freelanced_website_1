import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BlogForm } from "@/components/admin/blog-form"

interface EditBlogPageProps {
  params: Promise<{ id: string }>
}

async function getBlog(id: string) {
  const supabase = await createClient()
  const { data } = await supabase.from("blogs").select("*").eq("id", id).single()
  return data
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params
  const blog = await getBlog(id)

  if (!blog) {
    notFound()
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Blog Post</h1>
        <p className="text-muted-foreground">Update blog post content</p>
      </div>

      <BlogForm blog={blog} />
    </div>
  )
}
