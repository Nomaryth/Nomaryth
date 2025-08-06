'use client';

import type { Metadata } from "next";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Sidebar, SidebarProvider, SidebarContent, SidebarInset } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StatusFooter } from "@/components/status-footer";
import { ReadingModeToggle } from "@/components/reading-mode-toggle";
import { ReadingProgress } from "@/components/reading-progress";
import { ContextualNavigation } from "@/components/contextual-navigation";
import { DocsBreadcrumbs } from "@/components/docs-breadcrumbs";
import { DocsSidebar } from "@/components/docs-sidebar";

interface Doc {
  slug: string;
  title: string;
  content: string;
}

interface Category {
  categorySlug: string;
  categoryTitle: string;
  documents: Doc[];
}

function DocsLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [docsData, setDocsData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReadingMode, setIsReadingMode] = useState(false);

  useEffect(() => {
    fetch('/api/docs')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: Category[] | any) => {
        if (Array.isArray(data)) {
            setDocsData(data);
        } else {
            setDocsData([]);
        }
        setLoading(false);
      })
      .catch(err => {
        if (process.env.NODE_ENV === 'development') {
          console.error("Failed to fetch docs data", err);
        }
        setDocsData([]);
        setLoading(false);
      });
  }, []);

  return (
    <SidebarProvider>
      <div className="relative">
        <div className="flex min-h-0">
          <Sidebar className="sticky top-16 h-[calc(100vh-4rem)] z-30 w-80 flex-shrink-0 max-w-[320px] min-w-[280px]">
            <SidebarContent>
              <DocsSidebar docsData={docsData} loading={loading} />
            </SidebarContent>
          </Sidebar>
          <SidebarInset className="flex-1 min-w-0">
            <div className="sticky top-16 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
              <div className="px-6 py-2">
                <ReadingProgress />
              </div>
            </div>
            
            <div className="p-4 md:p-8 max-w-none min-h-[calc(100vh-4rem-4rem)] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <DocsBreadcrumbs />
                <ReadingModeToggle onModeChange={setIsReadingMode} />
              </div>
              
              <div className={cn(
                "transition-all duration-300 flex-1",
                isReadingMode && "max-w-4xl mx-auto px-4"
              )}>
                {children}
              </div>

              <div className="mt-12 pt-8 border-t flex-shrink-0">
                <ContextualNavigation currentDoc={pathname} docsData={docsData} />
              </div>
            </div>
          </SidebarInset>
        </div>
        <StatusFooter />
      </div>
    </SidebarProvider>
  );
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
     <>
        <Header />
        <main className="flex-grow animate-fadeIn">
            <DocsLayoutContent>{children}</DocsLayoutContent>
        </main>
        <Footer />
     </>
  );
}
