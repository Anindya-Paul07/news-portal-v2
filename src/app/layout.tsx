import type { Metadata, Viewport } from "next";
import { Playfair_Display, Work_Sans } from "next/font/google";
import localFont from "next/font/local";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import "./globals.css";
import "swiper/css";
import { Providers } from "./providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const solaimanLipi = localFont({
  src: [
    { path: "./fonts/SolaimanLipi_22-02-2012.ttf", weight: "400", style: "normal" },
    { path: "./fonts/SolaimanLipi_Bold_10-03-12.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-solaimanlipi",
  display: "swap",
  adjustFontFallback: false,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecontemporary.news";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "The Contemporary",
  description:
    "Fast, bilingual news portal with clear hierarchy, powered by The Contemporary backoffice APIs.",
  icons: {
    icon: "/Logo_Canva.jpg",
    shortcut: "/Logo_Canva.jpg",
    apple: "/Logo_Canva.jpg",
  },
  openGraph: {
    title: "The Contemporary",
    description:
      "Live headlines, analysis, and multimedia from The Contemporary newsroom.",
    url: "https://thecontemporary.news",
    siteName: "The Contemporary",
    images: [
      {
        url: "/Logo_Canva.jpg",
        width: 1200,
        height: 630,
        alt: "The Contemporary",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Contemporary",
    description: "Newsportal experience with a modern Material palette.",
    images: ["/Logo_Canva.jpg"],
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
      className={`${playfair.variable} ${workSans.variable} ${solaimanLipi.variable}`}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className="antialiased bg-[var(--news-page)] text-[var(--news-ink)]"
      >
        <AppRouterCacheProvider>
          <Providers>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
