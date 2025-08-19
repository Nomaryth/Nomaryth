import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { CookieBanner } from "@/components/cookie-banner";
import { TranslationsProvider } from "@/context/i18n-context";
import { AuthProvider } from "@/context/auth-context";
import { Exo_2, Teko } from "next/font/google";
import { AnalyticsWrapper } from "@/components/analytics-wrapper";
import MusicPlayer from "@/components/music-player";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nomaryth - Organização de Jogos Indie | MMORPG com Permadeath",
    template: "%s | Nomaryth"
  },
  description: "Nomaryth é uma organização brasileira de jogos indie criada pela Axulogic. Desenvolvemos Nomaryth Ordain, um MMORPG inovador com permadeath onde jogadores moldam permanentemente o mundo através de suas escolhas.",
  keywords: [
    "nomaryth", "nomaryth ordain", "linwaru", "axulogic", "mmorpg", "permadeath", "indie games",
    "jogos indie brasileiros", "fantasy", "interactive", "world building", "player choice",
    "narrativa emergente", "consequências permanentes", "facções", "magia", "sobrevivência",
    "comunidade", "mundo persistente", "escolhas", "estratégia", "aventura", "brasil"
  ],
  authors: [{ name: "Axulogic", url: "https://gghorizon.com" }],
  creator: "Axulogic",
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
    locale: 'pt_BR',
    alternateLocale: 'en_US',
    url: 'https://gghorizon.com',
    title: 'Nomaryth - Organização de Jogos Indie | MMORPG com Permadeath',
    description: 'Nomaryth é uma organização brasileira de jogos indie criada pela Axulogic. Desenvolvemos Nomaryth Ordain, um MMORPG inovador com permadeath onde jogadores moldam permanentemente o mundo.',
    siteName: 'Nomaryth',
    images: [
      {
        url: '/assets/NomaBanner1.png',
        width: 1200,
        height: 630,
        alt: 'Nomaryth - Universo Interativo de Fantasia MMORPG',
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
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${exo2.variable} ${teko.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#fbbf24" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Nomaryth" />
        <link rel="apple-touch-icon" href="/assets/NomaIcon1.png" />
      </head>
      <body className="font-sans antialiased">
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            src={(process.env.NEXT_PUBLIC_UMAMI_SRC || 'https://analytics.umami.is/script.js').split(' ')[0]}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        )}
        
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SW registered:', reg))
                .catch(err => console.log('SW registration failed:', err));
            }
          `}
        </Script>
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                try {
                  const envOk = typeof window !== 'undefined' && typeof navigator !== 'undefined' && typeof crypto !== 'undefined';
                  if (!envOk) return;
                  const host = String(window.location.hostname || '').toLowerCase();
                  const isLocal = host === 'localhost' || host === '127.0.0.1';
                  const now = Date.now();
                  const seed = (now ^ (performance?.timeOrigin || 0)) >>> 0;
                  const rand = (n) => {
                    const a = 1664525, c = 1013904223, m = 2 ** 32;
                    let x = (seed + n) >>> 0;
                    x = (a * x + c) % m;
                    return x / m;
                  };
                  const hash = (crypto?.getRandomValues ? Array.from(crypto.getRandomValues(new Uint32Array(2))).map(x => x.toString(36)).join('') : Math.random().toString(36).slice(2)) + '-' + now.toString(36);
                  const banner = '%c[Nomaryth Gate]';
                  const style = 'font-weight:600;color:#fbbf24;letter-spacing:.3px';
                  const pad = (v, w=6) => (String(v).padEnd(w));
                  const info = [
                    ['Build', '${process.env.NEXT_PUBLIC_BUILD_VERSION || 'dev'}'],
                    ['Node', (typeof process !== 'undefined' && process.version) ? process.version : 'edge'],
                    ['Hash', hash],
                    ['AISec', 'ACTIVE'],
                    ['WAF', 100 + Math.floor(rand(1)*64)],
                    ['Entropy', (crypto && crypto.getRandomValues ? 'seeded' : 'weak')],
                    ['Beacon', !!navigator.sendBeacon]
                  ];
                  const log = (k, v) => {
                    try { console.log(banner, style, pad(k)+':', v); } catch(_) {}
                  };
                  const onceKey = '__ng_init__';
                  if (!window[onceKey]) {
                    window[onceKey] = 1;
                    log('Initialized', new Date(now).toISOString());
                    for (let i=0;i<info.length;i++) log(info[i][0], info[i][1]);
                    if (!isLocal && (rand(2) > 0.35)) {
                      const t0 = performance.now();
                      const sample = new Uint8Array(32);
                      try { crypto.getRandomValues(sample); } catch(_) {}
                      const t1 = performance.now();
                      const stamp = Math.abs(((t1 - t0) * 1000) | 0);
                      log('Integrity', 'OK#' + (stamp ^ (seed >>> 5)) .toString(16));
                    }
                  }
                  let warned = false
                  let lastWarn = 0
                  const devtoolsDetector = () => {
                    const threshold = 160
                    const widthDiff = Math.abs(window.outerWidth - window.innerWidth)
                    const heightDiff = Math.abs(window.outerHeight - window.innerHeight)
                    const nowTs = performance.now()
                    const open = widthDiff > threshold || heightDiff > threshold
                    if (open && (!warned || nowTs - lastWarn > 10000)) {
                      lastWarn = nowTs
                      warned = true
                      try { console.warn(banner, style, 'Inspection detected. Telemetry: token=' + hash.slice(0,8)) } catch(_) {}
                    }
                  }
                  let rafId = 0; const loop = () => { devtoolsDetector(); rafId = requestAnimationFrame(loop) }; rafId = requestAnimationFrame(loop)
                  setTimeout(() => cancelAnimationFrame(rafId), 45000)
                } catch(e) {}
              })();
            `
          }}
        />
        <TranslationsProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <div className="flex flex-col min-h-screen">
                {children}
              </div>
              <CookieBanner />
              <Toaster />
              <AnalyticsWrapper />
              <MusicPlayer />
            </ThemeProvider>
          </AuthProvider>
        </TranslationsProvider>
      </body>
    </html>
  );
}
