import { BlogForm } from "@/components/admin/blog-form"

export default function NewBlogPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Blog Post</h1>
        <p className="text-muted-foreground">Write a new blog post for your store</p>
      </div>

      <BlogForm />
    </div>
  )
}
