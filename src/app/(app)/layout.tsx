'use client';

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Particles } from "@/components/particles";
import { StatusFooter } from "@/components/status-footer";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <div className="relative flex flex-col min-h-screen">
        <Header />
        <div className="absolute inset-0 -z-10">
          <Particles
              className="absolute inset-0"
              quantity={150}
              color="hsl(var(--primary))"
              ease={80}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />
        </div>
        <main className="flex-grow animate-fadeIn relative z-10">{children}</main>
        <div className="mt-auto relative z-10">
          <Footer />
          <StatusFooter />
        </div>
     </div>
  );
}
