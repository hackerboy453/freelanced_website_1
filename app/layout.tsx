import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Chatbot } from "@/components/chatbot"
import { Toaster } from "@/components/ui/sonner"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Electrotechmart - Buy Electrical Products Online India | Fast Delivery Ahmedabad",
    template: "%s | Electrotechmart - Electricals & Electronics Online Store"
  },
  description: "Shop premium electrical products, wires, switches, MCBs, fans, LEDs & tools at Electrotechmart. Best prices, fast delivery across India from Ahmedabad. Bulk wholesale orders for electricians, contractors & builders.",
  keywords: [
    "buy electrical products online India",
    "electrical shop Ahmedabad",
    "wires cables online",
    "MCB switches wholesale",
    "electrical tools India",
    "fans lights online",
    "bulk electricals resellers",
    "electrician supplies",
    "electrical contractors India",
    "fast electrical delivery"
  ],
  authors: [{ name: "VJ INTERNATIONAL", url: "https://electrotechmart.com" }],
  creator: "VJ INTERNATIONAL",
  publisher: "Electrotechmart",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://electrotechmart.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Electrotechmart - Premium Electrical Products Online India",
    description: "Buy wires, switches, MCBs, fans, LEDs, electrical tools with fast delivery from Ahmedabad. Wholesale bulk orders for electricians & contractors.",
    url: "https://electrotechmart.com",
    siteName: "Electrotechmart",
    images: [
      {
        url: "/logo.avif",
        width: 1200,
        height: 630,
        alt: "Electrotechmart - Electrical Products Online Store India",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Electrotechmart - Buy Electricals Online",
    description: "Premium electrical products with fast delivery across India. Wires, switches, tools & more.",
    images: ["/logo.avif"],
    creator: "@electrotechmart", // Update with actual handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification-code", // Add from Google Search Console
    // yandex: "your-yandex-verification-code",
    // baidu: "your-baidu-verification-code",
  },
  icons: {
    icon: "/logo.avif",
    shortcut: "/logo.avif",
    apple: "/logo.avif",
    other: [
      {
        rel: "icon",
        url: "/logo.avif",
        type: "image/avif",
      },
    ],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f97316" },
    { media: "(prefers-color-scheme: dark)", color: "#f97316" },
  ],
  colorScheme: "light dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html suppressHydrationWarning lang="en-IN">
      <head>
        <link rel="canonical" href="https://electrotechmart.com" />
        <link
          rel="icon"
          type="image/avif"
          href="/logo.avif"
          sizes="any"
        />
        <meta name="theme-color" content="#f97316" />
      </head>
      <body className={`${_geist.className} antialiased min-h-screen flex flex-col bg-background text-foreground`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Chatbot />
        <Toaster position="top-right" />
        <Analytics />
      </body>
    </html>
  )
}
