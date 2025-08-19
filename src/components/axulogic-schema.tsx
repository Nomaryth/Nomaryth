'use client';

import { StructuredData } from './structured-data';

const axulogicSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Axulogic",
  "alternateName": ["Axulogic Software", "Axulogic Games"],
  "description": "Empresa brasileira de desenvolvimento de software e jogos indie, criadora da organização Nomaryth e desenvolvedora do MMORPG inovador Nomaryth Ordain.",
  "url": "https://gghorizon.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://gghorizon.com/assets/NomaIcon1.png",
    "width": 512,
    "height": 512,
    "caption": "Axulogic Logo"
  },
  "foundingDate": "2024-01-01",
  "foundingLocation": {
    "@type": "Place",
    "name": "Brasil",
    "addressCountry": "BR"
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "BR",
    "addressRegion": "Brasil"
  },
  "knowsAbout": [
    "Software Development",
    "Indie Game Development",
    "MMORPG Design",
    "Permadeath Systems",
    "Interactive Storytelling",
    "Fantasy World Building",
    "Player Choice Mechanics",
    "Community-Driven Narratives",
    "Brazilian Game Industry"
  ],
  "areaServed": {
    "@type": "Place",
    "name": "Worldwide"
  },
  "serviceType": "Software Development & Indie Game Development",
  "applicationCategory": "Software Development",
  "department": [
    {
      "@type": "Organization",
      "name": "Nomaryth",
      "description": "Divisão especializada em jogos indie e gerenciamento de projetos MMORPG"
    }
  ],
  "makesOffer": [
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "VideoGame",
        "name": "Nomaryth Ordain",
        "description": "MMORPG inovador com permadeath e narrativa controlada por jogadores"
      },
      "price": "0",
      "priceCurrency": "BRL",
      "availability": "https://schema.org/PreOrder",
      "availabilityStarts": "2025-01-01"
    }
  ],
  "sameAs": [
    "https://github.com/axulogic",
    "https://twitter.com/axulogic",
    "https://linkedin.com/company/axulogic"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "contact@nomaryth.uk",
    "availableLanguage": ["Portuguese", "English"],
    "areaServed": "Worldwide"
  },
  "hasCredential": {
    "@type": "EducationalOccupationalCredential",
    "credentialCategory": "Software Development & Game Design"
  },
  "award": [
    "Innovative Indie Developer 2024",
    "Brazilian Software Excellence Award"
  ],
  "memberOf": {
    "@type": "Organization",
    "name": "Brazilian Software Development Association"
  }
};

export function AxulogicSchema() {
  return <StructuredData data={axulogicSchema} />;
}