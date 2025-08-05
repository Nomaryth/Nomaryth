import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { PrivacyNotice } from "@/components/privacy-notice";
import { TranslationsProvider } from "@/context/i18n-context";
import { AuthProvider } from "@/context/auth-context";
import { Inter } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nomaryth",
  description: "An interactive world presentation and documentation for the Nomaryth universe.",
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
            </ThemeProvider>
          </AuthProvider>
        </TranslationsProvider>
      </body>
    </html>
  );
}
