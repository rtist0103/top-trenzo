import type { Metadata } from "next";

import { Inter, Chivo, Source_Serif_4 } from "next/font/google";

import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { getSettingsMap } from "@/features/settings/repositories/settings.repositories";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const chivo = Chivo({
  subsets: ["latin"],
  variable: "--font-chivo",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettingsMap();

  return {
    metadataBase: new URL(s.site_url || "http://localhost:3000"),
    title: {
      default: `${s.site_name} — ${s.site_description}`,
      template: `%s | ${s.site_name}`,
    },
    description: s.site_description,
    robots: { index: true, follow: true },
    openGraph: {
      siteName: s.site_name,
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${chivo.variable} ${sourceSerif.variable}`}
    >
      <body className="antialiased bg-background text-foreground">
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
