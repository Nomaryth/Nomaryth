'use client';

import type { Metadata } from "next";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Sidebar, SidebarProvider, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarInset } from "@/components/ui/sidebar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StatusFooter } from "@/components/status-footer";
import { ReadingModeToggle } from "@/components/reading-mode-toggle";
import { ReadingProgress } from "@/components/reading-progress";
import { ContextualNavigation } from "@/components/contextual-navigation";
import { DocsBreadcrumbs } from "@/components/docs-breadcrumbs";

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
        <div className="flex">
          <Sidebar className="sticky top-16 h-[calc(100vh-4rem)] z-30">
            <SidebarContent>
              {loading ? (
                <div className="p-4 space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <Accordion type="multiple" defaultValue={docsData.map(c => c.categorySlug)} className="w-full">
                  {docsData.map(category => (
                    <AccordionItem key={category.categorySlug} value={category.categorySlug} className="border-none">
                      <AccordionTrigger className="text-sm font-semibold hover:no-underline px-4">
                        {category.categoryTitle}
                      </AccordionTrigger>
                      <AccordionContent>
                        <SidebarMenu className="pl-4">
                          {category.documents.map(doc => {
                            const href = `/docs/${category.categorySlug}/${doc.slug}`;
                            const isActive = pathname === href;
                            return (
                              <SidebarMenuItem key={href}>
                                <Link href={href} className={cn(
                                  "flex items-center gap-3 rounded-md p-2 text-sm hover:bg-accent/50",
                                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-accent-foreground"
                                )}>
                                  <span>{doc.title}</span>
                                </Link>
                              </SidebarMenuItem>
                            );
                          })}
                        </SidebarMenu>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <div className="sticky top-16 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
              <div className="px-6 py-2">
                <ReadingProgress />
              </div>
            </div>
            
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <DocsBreadcrumbs />
                <ReadingModeToggle onModeChange={setIsReadingMode} />
              </div>
              
              <div className={cn(
                "transition-all duration-300",
                isReadingMode && "max-w-4xl mx-auto px-4"
              )}>
                {children}
              </div>

              <div className="mt-12 pt-8 border-t">
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
