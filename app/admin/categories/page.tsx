"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Save, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { convertDropboxUrl, isDropboxPreviewUrl } from "@/lib/utils/dropbox-url"
import type { Category } from "@/lib/types"

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editImageUrl, setEditImageUrl] = useState("")
  const [editParentId, setEditParentId] = useState<string>("")
  const [newName, setNewName] = useState("")
  const [newImageUrl, setNewImageUrl] = useState("")
  const [newParentId, setNewParentId] = useState<string>("")
  const [isAdding, setIsAdding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, description, image_url, parent_id, created_at")
        .order("name")

      if (error) {
        console.error("Load categories error:", error)
        toast.error(`Failed to load categories: ${error.message || "Unknown error"}`)
        setCategories([])
        return
      }

      setCategories(data || [])
    } catch (err) {
      console.error("Unexpected error:", err)
      toast.error("An unexpected error occurred")
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error("Category name is required")
      return
    }

    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const slug = generateSlug(newName)

      if (!slug) {
        toast.error("Category name must contain at least one letter or number")
        setIsSubmitting(false)
        return
      }

      // Check for duplicate slug
      const duplicate = categories.find((cat) => cat.slug === slug)
      if (duplicate) {
        toast.error("A category with this name already exists")
        setIsSubmitting(false)
        return
      }

      // Validate image URL - prevent Dropbox preview URLs
      if (newImageUrl.trim() && isDropboxPreviewUrl(newImageUrl.trim())) {
        toast.error("Dropbox preview URLs don't work. Please use a Dropbox share link instead. Right-click the file in Dropbox and select 'Copy link'.")
        setIsSubmitting(false)
        return
      }

      const supabase = createClient()
      
      // Build insert object
      const insertData: { name: string; slug: string; image_url?: string | null; parent_id?: string | null } = {
        name: newName.trim(),
        slug,
      }
      
      // Add parent_id if provided (for subcategories)
      if (newParentId && newParentId !== "") {
        insertData.parent_id = newParentId
      }
      
      // Add image_url if provided (convert Dropbox URLs)
      if (newImageUrl.trim()) {
        let imageUrl = newImageUrl.trim()
        // Convert Dropbox share links to direct download URLs
        if (imageUrl.includes('dropbox.com')) {
          imageUrl = convertDropboxUrl(imageUrl)
        }
        insertData.image_url = imageUrl
      }
      
      const { data, error } = await supabase
        .from("categories")
        .insert(insertData)
        .select("id, name, slug, description, image_url, created_at")
        .single()

      if (error) {
        // Extract error details - PostgrestError has these properties
        console.error("=== ADD CATEGORY ERROR ===")
        
        // Try multiple ways to access error properties
        const err = error as any
        let errorMessage = "Failed to add category"
        let errorCode = ""
        
        // Method 1: Direct property access
        if (err.message) errorMessage = err.message
        if (err.code) errorCode = err.code
        if (err.details && !errorMessage.includes(err.details)) {
          errorMessage = err.details
        }
        if (err.hint && !errorMessage.includes(err.hint)) {
          errorMessage = err.hint
        }
        
        // Method 2: Try to stringify with replacer
        try {
          const errorStr = JSON.stringify(error, (key, value) => {
            if (value && typeof value === 'object' && value.constructor !== Object) {
              return Object.getOwnPropertyNames(value).reduce((acc, prop) => {
                try {
                  acc[prop] = value[prop]
                } catch (e) {
                  acc[prop] = '[unable to access]'
                }
                return acc
              }, {} as any)
            }
            return value
          }, 2)
          console.error("Stringified error:", errorStr)
          
          // Parse back to get properties
          const parsed = JSON.parse(errorStr)
          if (parsed.message) errorMessage = parsed.message
          if (parsed.code) errorCode = parsed.code
          if (parsed.details) errorMessage = parsed.details
          if (parsed.hint) errorMessage = parsed.hint
        } catch (e) {
          console.error("Could not stringify error:", e)
        }
        
        // Method 3: Check error.toString()
        try {
          const errorString = error.toString()
          console.error("Error toString():", errorString)
          if (errorString && errorString !== "[object Object]") {
            errorMessage = errorString
          }
        } catch (e) {
          // Ignore
        }
        
        // Log all attempts
        console.error("Error code:", errorCode)
        console.error("Error message:", errorMessage)
        console.error("Raw error:", error)
        
        // Map common error codes to user-friendly messages
        if (errorCode === "42501" || errorMessage.toLowerCase().includes("permission") || errorMessage.toLowerCase().includes("policy") || errorMessage.toLowerCase().includes("row-level security")) {
          errorMessage = "Permission denied. Make sure:\n1. You have admin access (is_admin = true)\n2. RLS policies are set up (run scripts/009_complete_rls_policies.sql)\n3. You're logged in as an admin user"
        } else if (errorCode === "23505" || errorMessage.toLowerCase().includes("unique") || errorMessage.toLowerCase().includes("duplicate")) {
          errorMessage = "A category with this name or slug already exists."
        } else if (errorCode === "42P01" || errorMessage.toLowerCase().includes("does not exist") || errorMessage.toLowerCase().includes("relation")) {
          errorMessage = "Categories table not found. Please check your database setup."
        } else if (!errorCode && errorMessage === "Failed to add category") {
          // If we still don't have details, it's likely an RLS issue
          errorMessage = "Insert failed. This is likely a permissions issue. Please check:\n1. Your admin status\n2. RLS policies are configured\n3. The is_admin() function exists"
        }
        
        toast.error(errorMessage)
        setIsSubmitting(false)
        return
      }

      toast.success("Category added successfully")
      setNewName("")
      setNewImageUrl("")
      setNewParentId("")
      setIsAdding(false)
      await loadCategories()
    } catch (err) {
      console.error("Unexpected error:", err)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) {
      toast.error("Category name is required")
      return
    }

    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const slug = generateSlug(editName)

      if (!slug) {
        toast.error("Category name must contain at least one letter or number")
        setIsSubmitting(false)
        return
      }

      // Check for duplicate slug (excluding current)
      const duplicate = categories.find((cat) => cat.slug === slug && cat.id !== id)
      if (duplicate) {
        toast.error("A category with this name already exists")
        setIsSubmitting(false)
        return
      }

      // Validate image URL - prevent Dropbox preview URLs
      if (editImageUrl.trim() && isDropboxPreviewUrl(editImageUrl.trim())) {
        toast.error("Dropbox preview URLs don't work. Please use a Dropbox share link instead. Right-click the file in Dropbox and select 'Copy link'.")
        setIsSubmitting(false)
        return
      }

      const supabase = createClient()
      
      // Build update object
      const updateData: { name: string; slug: string; image_url?: string | null; parent_id?: string | null } = {
        name: editName.trim(),
        slug,
      }
      
      // Add parent_id if provided (for subcategories)
      if (editParentId && editParentId !== "") {
        updateData.parent_id = editParentId
      } else {
        updateData.parent_id = null
      }
      
      // Add image_url if provided (convert Dropbox URLs)
      if (editImageUrl.trim()) {
        let imageUrl = editImageUrl.trim()
        // Convert Dropbox share links to direct download URLs
        if (imageUrl.includes('dropbox.com')) {
          imageUrl = convertDropboxUrl(imageUrl)
        }
        updateData.image_url = imageUrl
      } else {
        // If image URL is cleared, set to null
        updateData.image_url = null
      }
      
      const { error } = await supabase
        .from("categories")
        .update(updateData)
        .eq("id", id)

      if (error) {
        console.error("Update category error:", error)
        const errorMsg = error.message || error.details || error.hint || "Failed to update category"
        toast.error(errorMsg)
        setIsSubmitting(false)
        return
      }

      toast.success("Category updated successfully")
      setEditingId(null)
      setEditName("")
      setEditImageUrl("")
      await loadCategories()
    } catch (err) {
      console.error("Unexpected error:", err)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return
    }

    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Check if category has products
      const { data: products } = await supabase
        .from("products")
        .select("id")
        .eq("category_id", id)
        .limit(1)

      if (products && products.length > 0) {
        toast.error("Cannot delete category with existing products")
        setIsSubmitting(false)
        return
      }

      const { error } = await supabase.from("categories").delete().eq("id", id)

      if (error) {
        console.error("Delete category error:", error)
        const errorMsg = error.message || error.details || error.hint || "Failed to delete category"
        toast.error(errorMsg)
        setIsSubmitting(false)
        return
      }

      toast.success("Category deleted successfully")
      await loadCategories()
    } catch (err) {
      console.error("Unexpected error:", err)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setEditName(category.name)
    setEditImageUrl((category as any).image_url || "")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName("")
    setEditImageUrl("")
    setEditParentId("")
  }

  const cancelAdd = () => {
    setIsAdding(false)
    setNewName("")
    setNewImageUrl("")
    setNewParentId("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage product categories</p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding || isSubmitting}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Dropbox URL Help */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          📸 Using Dropbox Images?
        </h3>
        <p className="text-xs text-blue-800 dark:text-blue-200 mb-2">
          <strong>Don't use preview URLs!</strong> Preview URLs (previews.dropbox.com) won't work.
        </p>
        <ol className="text-xs text-blue-800 dark:text-blue-200 list-decimal list-inside space-y-1">
          <li>Right-click your image in Dropbox</li>
          <li>Select "Copy link" or "Share" → "Copy link"</li>
          <li>Paste the share link (looks like: www.dropbox.com/s/xxxxx/file.png?dl=0)</li>
          <li>It will automatically convert to a direct download URL</li>
        </ol>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Parent Category</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : (
              <>
                {isAdding && (
                  <TableRow>
                    <TableCell>
                      <div className="space-y-2">
                        <Input
                          value={newImageUrl}
                          onChange={(e) => {
                            let value = e.target.value.trim()
                            // Auto-convert Dropbox share links
                            if (value.includes('dropbox.com/s/') && !value.includes('dl.dropboxusercontent.com')) {
                              value = convertDropboxUrl(value)
                            }
                            setNewImageUrl(value)
                          }}
                          placeholder="Image URL (optional)"
                          disabled={isSubmitting}
                        />
                        {isDropboxPreviewUrl(newImageUrl) && (
                          <p className="text-xs text-destructive">
                            ⚠️ Dropbox preview URLs don't work. Use a share link instead.
                          </p>
                        )}
                        {newImageUrl.includes('dropbox.com/s/') && !newImageUrl.includes('dl.dropboxusercontent.com') && (
                          <p className="text-xs text-muted-foreground">
                            💡 Tip: Converting Dropbox share link to direct URL...
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Category name"
                        autoFocus
                        disabled={isSubmitting}
                      />
                    </TableCell>
                    <TableCell>
                      <Select value={newParentId} onValueChange={setNewParentId} disabled={isSubmitting}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Main Category (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Main Category</SelectItem>
                          {categories.filter((cat) => !cat.parent_id).map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {generateSlug(newName) || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" onClick={handleAdd} disabled={isSubmitting}>
                          {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelAdd} disabled={isSubmitting}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {editingId === category.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editImageUrl}
                            onChange={(e) => {
                              let value = e.target.value.trim()
                              // Auto-convert Dropbox share links
                              if (value.includes('dropbox.com/s/') && !value.includes('dl.dropboxusercontent.com')) {
                                value = convertDropboxUrl(value)
                              }
                              setEditImageUrl(value)
                            }}
                            placeholder="Image URL"
                            disabled={isSubmitting}
                            className="w-full"
                          />
                          {isDropboxPreviewUrl(editImageUrl) && (
                            <p className="text-xs text-destructive">
                              ⚠️ Dropbox preview URLs don't work. Use a share link instead.
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="h-12 w-12 relative rounded overflow-hidden bg-muted">
                          {(category as any).image_url ? (
                            <div className="relative w-full h-full">
                              {isDropboxPreviewUrl((category as any).image_url) && (
                                <div className="absolute inset-0 bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center z-10 border border-yellow-400">
                                  <span className="text-[8px] text-yellow-800 dark:text-yellow-200 font-bold px-1 text-center">
                                    Fix URL
                                  </span>
                                </div>
                              )}
                              <img
                                src={(category as any).image_url}
                                alt={category.name}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg?height=48&width=48"
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              No image
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === category.id ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          disabled={isSubmitting}
                        />
                      ) : (
                        <span className="font-medium">
                          {category.name}
                          {(category as any).parent_id && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (Subcategory)
                            </span>
                          )}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === category.id ? (
                        <Select value={editParentId} onValueChange={setEditParentId} disabled={isSubmitting}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Main Category (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Main Category</SelectItem>
                            {categories
                              .filter((cat) => !cat.parent_id && cat.id !== category.id)
                              .map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {(category as any).parent_id
                            ? categories.find((c) => c.id === (category as any).parent_id)?.name || "Unknown"
                            : "Main Category"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {category.slug}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === category.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdate(category.id)}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelEdit} disabled={isSubmitting}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(category)}
                            disabled={isSubmitting || isAdding || editingId !== null}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(category.id)}
                            disabled={isSubmitting || isAdding || editingId !== null}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && categories.length === 0 && !isAdding && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No categories found. Add your first category!
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
