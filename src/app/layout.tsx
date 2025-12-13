import type { Metadata } from "next";
import { Playfair_Display, Work_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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

export const metadata: Metadata = {
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${workSans.variable} antialiased bg-[var(--color-surface)] text-[var(--color-ink)]`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
