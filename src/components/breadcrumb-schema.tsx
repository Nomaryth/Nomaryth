'use client';

import { useEffect } from 'react';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  useEffect(() => {
    const existingScript = document.querySelector('script[data-breadcrumb-schema="true"]');
    if (existingScript) {
      existingScript.remove();
    }

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": `https://gghorizon.com${item.url}`
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-breadcrumb-schema', 'true');
    script.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[data-breadcrumb-schema="true"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [items]);

  return null;
}

export const docsBreadcrumb = [
  { name: "Home", url: "/" },
  { name: "Documentation", url: "/docs" }
];

export const factionsBreadcrumb = [
  { name: "Home", url: "/" },
  { name: "Factions", url: "/factions" }
];

export const projectsBreadcrumb = [
  { name: "Home", url: "/" },
  { name: "Projects", url: "/projects" }
];

export const mapBreadcrumb = [
  { name: "Home", url: "/" },
  { name: "Map", url: "/map" }
];

export const profileBreadcrumb = [
  { name: "Home", url: "/" },
  { name: "Profile", url: "/profile" }
]; 