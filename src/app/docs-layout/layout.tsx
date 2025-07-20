import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Nomaryth Docs",
  description: "Documentation for the Nomaryth universe.",
};

export default function DocsRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <>
        <Header />
        <main className="flex-grow animate-fadeIn">{children}</main>
        <Footer />
     </>
  );
}
