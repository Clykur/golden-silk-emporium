import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./styles.css";
import Providers from "./providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartDrawer } from "@/components/cart-drawer";
import { QuickView } from "@/components/quick-view";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { SmoothScroll } from "@/components/smooth-scroll";

export const dynamic = "force-dynamic";
export const revalidate = 0;
import { Inter, Limelight } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans-next",
  display: "swap",
});

const limelight = Limelight({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-limelight",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://drapeva.com"),
  title: {
    default: "Drapeva: Premium Indian Sarees for Every Generation",
    template: "%s | Drapeva",
  },
  description:
    "Discover a curated collection of premium sarees combining comfort, quality, and timeless elegance. Shop authentic Kanjivaram, Banarasi, and Designer weaves perfect for young trendsetters, radiant brides, and graceful elders alike.",
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
    "sarees for older women",
    "trendy sarees for young women",
    "authentic Indian weaves",
    "traditional sarees online",
    "comfortable sarees",
  ],
  authors: [{ name: "Drapeva" }],
  creator: "Drapeva",
  publisher: "Drapeva",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: "PLACEHOLDER_FOR_GOOGLE_SITE_VERIFICATION",
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
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Drapeva",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://drapeva.com",
    title: "Drapeva: Premium Indian Sarees for Every Generation",
    description:
      "Discover a curated collection of premium sarees combining comfort, quality, and timeless elegance. Authentic weaves perfect for all ages.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Drapeva: Premium Indian Sarees",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Drapeva: Premium Indian Sarees for Every Generation",
    description:
      "Discover a curated collection of premium sarees combining comfort, quality, and timeless elegance. Authentic weaves perfect for all ages.",
    images: ["/og-image.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://drapeva.com/#organization",
      name: "Drapeva",
      url: "https://drapeva.com",
      logo: {
        "@type": "ImageObject",
        url: "https://drapeva.com/media/logo.png",
      },
      sameAs: [
        "https://instagram.com/drapeva",
        "https://youtube.com/@drapeva",
        "https://threads.net/@drapeva",
      ],
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://drapeva.com/#localbusiness",
      name: "Drapeva",
      image: "https://drapeva.com/media/logo.png",
      telephone: "+91-9949740776",
      email: "support@drapeva.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "NPS School Road, Ambedkar Nagar, Chikkabellandur, Mullur",
        addressLocality: "Bengaluru",
        addressRegion: "Karnataka",
        postalCode: "560035",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 12.9097,
        longitude: 77.7126,
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "09:00",
        closes: "20:00",
      },
      priceRange: "$$",
    },
    {
      "@type": "WebSite",
      "@id": "https://drapeva.com/#website",
      url: "https://drapeva.com",
      name: "Drapeva",
      publisher: {
        "@id": "https://drapeva.com/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://drapeva.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${limelight.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <meta name="geo.region" content="IN-KA" />
        <meta name="geo.placename" content="Bengaluru" />
        <meta name="geo.position" content="12.9097;77.7126" />
        <meta name="ICBM" content="12.9097, 77.7126" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="antialiased min-h-screen bg-background text-foreground"
        suppressHydrationWarning
      >
        <SmoothScroll>
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
        </SmoothScroll>
      </body>
    </html>
  );
}
