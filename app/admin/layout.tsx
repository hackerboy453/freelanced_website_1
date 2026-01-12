import type React from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Store, Package, ShoppingBag, FileText, Settings, LayoutDashboard } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/categories", label: "Categories", icon: Settings },
  { href: "/admin/blogs", label: "Blogs", icon: FileText },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check admin status - handle both boolean true and string "true"
  const isAdmin = user?.user_metadata?.is_admin === true || user?.user_metadata?.is_admin === "true"

  if (!user || !isAdmin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r shrink-0 hidden md:block">
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <span className="font-bold">Admin Panel</span>
          </Link>
        </div>
        <nav className="px-4 space-y-1">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden border-b p-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              <span className="font-bold">Admin</span>
            </Link>
          </div>
          <nav className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-muted hover:bg-muted/80 whitespace-nowrap"
              >
                <link.icon className="h-3 w-3" />
                {link.label}
              </Link>
            ))}
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
