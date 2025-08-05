import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function UnauthorizedLayout({
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
