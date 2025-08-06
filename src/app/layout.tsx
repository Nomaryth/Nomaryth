import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { PrivacyNotice } from "@/components/privacy-notice";
import { TranslationsProvider } from "@/context/i18n-context";
import { AuthProvider } from "@/context/auth-context";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
  verification: {
    google: 'your-google-verification-code',
  },
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Literata:opsz,wght@6..72,400;6..72,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
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
