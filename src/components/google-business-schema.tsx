'use client';

import { StructuredData } from './structured-data';

const googleBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://gghorizon.com/#organization",
  "name": "Nomaryth",
  "alternateName": ["Nomaryth Organization", "Nomaryth Games"],
  "description": "Organização brasileira de desenvolvimento de jogos indie criada pela Axulogic, especializada em MMORPGs com permadeath e narrativas controladas por jogadores.",
  "url": "https://gghorizon.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://gghorizon.com/assets/NomaIcon1.png",
    "width": 512,
    "height": 512
  },
  "image": [
    {
      "@type": "ImageObject",
      "url": "https://gghorizon.com/assets/NomaBanner1.png",
      "width": 1200,
      "height": 630
    }
  ],
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "BR",
    "addressRegion": "Brasil"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+55-11-99999-9999",
    "contactType": "customer service",
    "email": "contact@nomaryth.uk",
    "availableLanguage": ["Portuguese", "English"],
    "areaServed": "Worldwide"
  },
  "sameAs": [
    "https://github.com/Nomaryth",
    "https://discord.gg/nomaryth", 
    "https://twitter.com/nomaryth",
    "https://www.facebook.com/nomaryth",
    "https://www.instagram.com/nomaryth",
    "https://www.youtube.com/@nomaryth"
  ],
  "foundingDate": "2024-01-01",
  "founder": {
    "@type": "Organization",
    "name": "Axulogic",
    "description": "Empresa brasileira de desenvolvimento de software e jogos"
  },
  "parentOrganization": {
    "@type": "Organization",
    "name": "Axulogic"
  },
  "makesOffer": [
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "VideoGame",
        "name": "Nomaryth Ordain",
        "description": "MMORPG interativo gratuito baseado em navegador"
      },
      "price": "0",
      "priceCurrency": "BRL",
      "availability": "https://schema.org/InStock"
    }
  ],
  "knowsAbout": [
    "Game Development",
    "MMORPG Design", 
    "Interactive Storytelling",
    "Community Management",
    "Fantasy World Building",
    "Browser Games",
    "Free-to-Play Games"
  ],
  "serviceType": "Game Development",
  "areaServed": {
    "@type": "Place",
    "name": "Worldwide"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Nomaryth Games",
    "itemListElement": [
      {
        "@type": "VideoGame",
        "name": "Nomaryth Ordain",
        "gamePlatform": "Web Browser",
        "applicationCategory": "Game",
        "operatingSystem": "Web Browser"
      }
    ]
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "4.8",
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": "Comunidade Gaming Brasil"
      },
      "reviewBody": "Inovador sistema de narrativa comunitária que redefine MMORPGs."
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "150",
    "bestRating": "5",
    "worstRating": "1"
  }
};

export function GoogleBusinessSchema() {
  return <StructuredData data={googleBusinessSchema} />;
}
