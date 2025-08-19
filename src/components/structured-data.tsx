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
  "alternateName": ["Nomaryth Organization", "Nomaryth Games"],
  "url": "https://gghorizon.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://gghorizon.com/assets/NomaIcon1.png",
    "width": 512,
    "height": 512,
    "caption": "Nomaryth Logo"
  },
  "image": [
    {
      "@type": "ImageObject",
      "url": "https://gghorizon.com/assets/NomaBanner1.png",
      "width": 1200,
      "height": 630,
      "caption": "Nomaryth Banner"
    },
    {
      "@type": "ImageObject", 
      "url": "https://gghorizon.com/assets/NomaChara1.png",
      "width": 800,
      "height": 600,
      "caption": "Nomaryth Character Art"
    }
  ],
  "description": "Nomaryth é uma organização brasileira especializada no desenvolvimento e gerenciamento de jogos indie inovadores, focada em experiências interativas que permitem aos jogadores moldar narrativas através de suas escolhas.",
  "foundingDate": "2024-01-01",
  "foundingLocation": {
    "@type": "Place",
    "name": "Brasil",
    "addressCountry": "BR"
  },
  "founder": {
    "@type": "Organization",
    "name": "Axulogic",
    "description": "Empresa brasileira de desenvolvimento de software e jogos indie"
  },
  "parentOrganization": {
    "@type": "Organization", 
    "name": "Axulogic",
    "founder": {
      "@type": "Person",
      "name": "Linwaru"
    }
  },
  "department": [
    {
      "@type": "Organization",
      "name": "Nomaryth Game Development",
      "description": "Divisão responsável pelo desenvolvimento do jogo Nomaryth Ordain"
    }
  ],
  "knowsAbout": [
    "Indie Game Development",
    "Interactive Storytelling", 
    "MMORPG Design",
    "Permadeath Mechanics",
    "Community-Driven Narratives",
    "Fantasy World Building",
    "Player Choice Systems"
  ],
  "areaServed": {
    "@type": "Place",
    "name": "Worldwide"
  },
  "serviceType": "Indie Game Development & Management",
  "applicationCategory": "Game Development",
  "isAccessibleForFree": true,
  "sameAs": [
    "https://github.com/Nomaryth",
    "https://discord.gg/nomaryth",
    "https://twitter.com/nomaryth",
    "https://www.facebook.com/nomaryth",
    "https://www.instagram.com/nomaryth",
    "https://www.youtube.com/@nomaryth"
  ],
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "contact@nomaryth.uk",
      "availableLanguage": ["pt-BR", "en-US"],
      "areaServed": "Worldwide"
    }
  ],
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "BR",
    "addressRegion": "Brasil"
  },
  "makesOffer": [
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "VideoGame",
        "name": "Nomaryth Ordain",
        "description": "MMORPG com permadeath e narrativa controlada por jogadores"
      },
      "price": "0",
      "priceCurrency": "BRL",
      "availability": "https://schema.org/PreOrder"
    }
  ]
};

export const creativeWorkSchema = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "name": "Nomaryth Ordain",
  "alternateName": "Nomaryth",
  "description": "MMORPG inovador com sistema de permadeath onde as escolhas dos jogadores moldam permanentemente o mundo. Desenvolvido pela Axulogic através da organização Nomaryth, oferece narrativa emergente e consequências reais para cada decisão.",
  "author": {
    "@type": "Organization",
    "name": "Axulogic",
    "description": "Empresa brasileira de desenvolvimento de jogos indie"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Nomaryth",
    "parentOrganization": {
      "@type": "Organization",
      "name": "Axulogic"
    }
  },
  "developer": {
    "@type": "Organization",
    "name": "Axulogic"
  },
  "genre": ["Fantasy", "MMORPG", "Permadeath", "Interactive Fiction", "Indie"],
  "keywords": "nomaryth, nomaryth ordain, mmorpg, permadeath, fantasy, interactive, linwaru, axulogic, indie game, player choice",
  "gamePlatform": ["Web Browser", "PC"],
  "applicationCategory": "Game",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "BRL",
    "availability": "https://schema.org/PreOrder",
    "availabilityStarts": "2025-01-01"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "25",
    "bestRating": "5",
    "worstRating": "1"
  },
  "gameFeature": [
    "Permadeath System",
    "Player-Driven Narrative",
    "Faction Warfare", 
    "Persistent World Changes",
    "Community Decision Making"
  ],
  "inLanguage": ["pt-BR", "en-US"],
  "datePublished": "2025-01-01",
  "copyrightYear": "2025",
  "copyrightHolder": {
    "@type": "Organization",
    "name": "Axulogic"
  }
};

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "O que é Nomaryth?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nomaryth é um universo interativo de fantasia onde jogadores moldam o mundo através de escolhas estratégicas. É um projeto experimental focado em criar um mundo persistente e reativo com forte influência da comunidade de jogadores."
      }
    },
    {
      "@type": "Question", 
      "name": "Como posso participar do projeto Nomaryth?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Você pode explorar o universo através do site gghorizon.com, participar das discussões da comunidade, criar ou se juntar a facções, e contribuir para a construção do mundo através das suas escolhas e feedback."
      }
    },
    {
      "@type": "Question",
      "name": "Nomaryth é gratuito?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sim, o acesso ao universo Nomaryth e suas funcionalidades principais são completamente gratuitos. O projeto foca em criar uma experiência acessível para toda a comunidade."
      }
    }
  ]
};

export const breadcrumbListSchema = (items: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
}); 