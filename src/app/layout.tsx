import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { PrivacyNotice } from "@/components/privacy-notice";
import { TranslationsProvider } from "@/context/i18n-context";
import { AuthProvider } from "@/context/auth-context";
import { Exo_2, Teko } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nomaryth",
    template: "%s | Nomaryth"
  },
  description: "An interactive world presentation and documentation for the Nomaryth universe. Explore factions, magic, and the mystical realm of Nomaryth.",
  keywords: ["fantasy", "interactive", "world", "nomaryth", "factions", "magic", "documentation", "universe"],
  authors: [{ name: "Nomaryth Team" }],
  creator: "Nomaryth Team",
  publisher: "Nomaryth",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://gghorizon.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gghorizon.com',
    title: 'Nomaryth - Interactive Fantasy World',
    description: 'An interactive world presentation and documentation for the Nomaryth universe. Explore factions, magic, and the mystical realm of Nomaryth.',
    siteName: 'Nomaryth',
    images: [
      {
        url: '/assets/NomaBanner1.png',
        width: 1200,
        height: 630,
        alt: 'Nomaryth - Interactive Fantasy World',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nomaryth - Interactive Fantasy World',
    description: 'An interactive world presentation and documentation for the Nomaryth universe. Explore factions, magic, and the mystical realm of Nomaryth.',
    images: ['/assets/NomaBanner1.png'],
    creator: '@nomaryth',
    site: '@nomaryth',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const exo2 = Exo_2({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-exo2",
});

const teko = Teko({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "700"],
  variable: "--font-headline",
});


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hdrs = await headers();
  const nonce = hdrs.get('x-csp-nonce') || undefined;
  return (
    <html lang="en" suppressHydrationWarning className={`${exo2.variable} ${teko.variable}`}>
      <head>
        {nonce && <meta name="csp-nonce" content={nonce} />}
      </head>
      <body className="font-sans antialiased">
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            src={(process.env.NEXT_PUBLIC_UMAMI_SRC || 'https://analytics.umami.is/script.js').split(' ')[0]}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
            nonce={nonce}
          />
        )}
        <TranslationsProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <div className="flex flex-col min-h-screen">
                <PrivacyNotice />
                {children}
              </div>
              <Toaster />
              <Analytics />
            </ThemeProvider>
          </AuthProvider>
        </TranslationsProvider>
      </body>
    </html>
  );
}
