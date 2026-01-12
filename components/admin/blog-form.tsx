"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Blog } from "@/lib/types"

interface BlogFormProps {
  blog?: Blog
}

export function BlogForm({ blog }: BlogFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState(blog?.title || "")
  const [description, setDescription] = useState(blog?.excerpt || "")
  const [imageUrl, setImageUrl] = useState(blog?.image_url || "")
  const [mediumLink, setMediumLink] = useState(blog?.medium_link || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validation
      if (!title.trim()) {
        toast.error("Blog title is required")
        setIsLoading(false)
        return
      }

      if (!description.trim()) {
        toast.error("Description is required")
        setIsLoading(false)
        return
      }

      if (!mediumLink.trim()) {
        toast.error("Medium link is required")
        setIsLoading(false)
        return
      }

      // Validate URL format
      try {
        new URL(mediumLink.trim())
      } catch {
        toast.error("Please enter a valid Medium URL")
        setIsLoading(false)
        return
      }

      const supabase = createClient()
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      const blogData = {
        title: title.trim(),
        slug,
        content: description.trim(), // Store description in content field for backward compatibility
        excerpt: description.trim(),
        image_url: imageUrl.trim() || null,
        author_name: "Admin",
        is_published: true,
        medium_link: mediumLink.trim(),
        updated_at: new Date().toISOString(),
      }

      if (blog) {
        const { error } = await supabase.from("blogs").update(blogData).eq("id", blog.id)
        if (error) {
          console.error("Update blog error:", error)
          const errorMsg = error.message || error.details || error.hint || "Failed to update blog post"
          toast.error(errorMsg)
          setIsLoading(false)
          return
        }
        toast.success("Blog post updated successfully")
      } else {
        const { error } = await supabase.from("blogs").insert(blogData)
        if (error) {
          console.error("Create blog error:", error)
          const errorMsg = error.message || error.details || error.hint || "Failed to create blog post"
          toast.error(errorMsg)
          setIsLoading(false)
          return
        }
        toast.success("Blog post created successfully")
      }
      router.push("/admin/blogs")
      router.refresh()
    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog title"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL *</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              required
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">Enter the URL of the featured image</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a brief description of the blog post..."
              rows={4}
              required
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">A short description that will be displayed on the blog listing page</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mediumLink">Medium Link *</Label>
            <Input
              id="mediumLink"
              type="url"
              value={mediumLink}
              onChange={(e) => setMediumLink(e.target.value)}
              placeholder="https://medium.com/@username/article-title"
              required
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">Enter the full URL to your Medium article</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : blog ? "Update Post" : "Create Post"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
