'use client';

import { useEffect } from 'react';

interface StructuredDataProps {
  data: Record<string, any>;
}

export function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    const existingScript = document.querySelector('script[data-structured-data="true"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured-data', 'true');
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[data-structured-data="true"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data]);

  return null;
}

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Nomaryth",
  "description": "An interactive world presentation and documentation for the Nomaryth universe. Explore factions, magic, and the mystical realm of Nomaryth.",
  "url": "https://gghorizon.com",
  "inLanguage": ["pt-BR", "en-US"],
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://gghorizon.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Nomaryth",
    "url": "https://gghorizon.com"
  }
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Nomaryth",
  "url": "https://gghorizon.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://gghorizon.com/assets/NomaIcon1.png",
    "width": 512,
    "height": 512
  },
  "description": "An interactive world presentation and documentation for the Nomaryth universe.",
  "sameAs": [
    "https://github.com/Nomaryth"
  ],
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "contact@nomaryth.uk",
      "availableLanguage": ["pt-BR", "en-US"]
    }
  ]
};

export const creativeWorkSchema = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "Nomaryth Universe",
  "description": "An interactive world presentation and documentation for the Nomaryth universe. Explore factions, magic, and the mystical realm of Nomaryth.",
  "author": {
    "@type": "Organization",
    "name": "Nomaryth Team"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Nomaryth"
  },
  "genre": ["Fantasy", "Interactive", "Documentation"],
  "keywords": "fantasy, interactive, world, nomaryth, factions, magic, documentation, universe"
}; 