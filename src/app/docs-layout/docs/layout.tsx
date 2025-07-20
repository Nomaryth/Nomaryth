
'use client';

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Sidebar, SidebarProvider, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarInset } from "@/components/ui/sidebar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/header";

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

  useEffect(() => {
    fetch('/api/docs')
      .then(res => res.json())
      .then((data: Category[]) => {
        setDocsData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch docs data", err);
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
            <div className="p-8">
              {children}
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocsLayoutContent>{children}</DocsLayoutContent>;
}
