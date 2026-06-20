import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./styles.css";
import Providers from "./providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartDrawer } from "@/components/cart-drawer";
import { QuickView } from "@/components/quick-view";
import { WhatsAppButton } from "@/components/whatsapp-button";

import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans-next",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display-next",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#b8944b",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://drapeva.com"),
  title: {
    default: "Drapeva — Premium Indian Sarees",
    template: "%s | Drapeva",
  },
  description:
    "Discover a curated collection of premium sarees combining comfort, quality, and timeless elegance. Shop Kanjivaram, Banarasi, Organza, and designer weaves.",
  keywords: [
    "Indian sarees",
    "premium sarees",
    "Kanjivaram sarees",
    "Banarasi sarees",
    "designer sarees",
    "online saree shopping",
    "Drapeva",
    "luxury sarees",
    "bridal sarees",
    "silk sarees",
  ],
  authors: [{ name: "Drapeva" }],
  creator: "Drapeva",
  publisher: "Drapeva",
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
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Drapeva",
    title: "Drapeva — Premium Indian Sarees",
    description:
      "Discover a curated collection of premium sarees combining comfort, quality, and timeless elegance.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Drapeva — Premium Indian Sarees",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Drapeva — Premium Indian Sarees",
    description:
      "Discover a curated collection of premium sarees combining comfort, quality, and timeless elegance.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable}`}
      data-scroll-behavior="smooth"
    >
      <head />
      <body className="antialiased min-h-screen bg-background text-foreground">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Suspense fallback={<div className="h-[72px] md:h-[88px] bg-background" />}>
              <SiteHeader />
            </Suspense>
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <CartDrawer />
          <QuickView />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
