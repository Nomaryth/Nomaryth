'use client';

import { StructuredData } from './structured-data';

const linwaruPersonSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Linwaru",
  "alternateName": ["Lin", "Linwaru Dev"],
  "jobTitle": "Game Developer & Creative Director",
  "description": "Desenvolvedora brasileira de jogos indie, criadora da Axulogic e fundadora da organização Nomaryth. Especialista em MMORPGs inovadores com foco em permadeath e narrativas emergentes.",
  "nationality": {
    "@type": "Country",
    "name": "Brasil"
  },
  "birthPlace": {
    "@type": "Place",
    "name": "Brasil",
    "addressCountry": "BR"
  },
  "gender": "Female",
  "knowsAbout": [
    "Game Development",
    "MMORPG Design",
    "Permadeath Systems",
    "Interactive Storytelling",
    "Indie Game Development",
    "Fantasy World Building",
    "Player Choice Mechanics",
    "Community-Driven Narratives",
    "Brazilian Game Industry"
  ],
  "hasOccupation": {
    "@type": "Occupation",
    "name": "Game Developer",
    "description": "Desenvolve jogos indie inovadores com foco em mecânicas únicas e narrativas emergentes",
    "occupationalCategory": "Software Development",
    "skills": [
      "Game Design",
      "Programming", 
      "Project Management",
      "Creative Direction",
      "Community Management"
    ]
  },
  "worksFor": [
    {
      "@type": "Organization",
      "name": "Axulogic",
      "description": "Empresa principal criada por Linwaru"
    },
    {
      "@type": "Organization", 
      "name": "Nomaryth",
      "description": "Organização de jogos indie sob a Axulogic"
    }
  ],
  "founder": [
    {
      "@type": "Organization",
      "name": "Axulogic",
      "foundingDate": "2024"
    },
    {
      "@type": "Organization",
      "name": "Nomaryth",
      "foundingDate": "2024"
    }
  ],
  "creator": [
    {
      "@type": "VideoGame",
      "name": "Nomaryth Ordain",
      "description": "MMORPG inovador com permadeath"
    }
  ],
  "url": "https://gghorizon.com",
  "sameAs": [
    "https://github.com/linwaru",
    "https://twitter.com/linwaru", 
    "https://linkedin.com/in/linwaru"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "professional",
    "email": "contact@nomaryth.uk",
    "availableLanguage": ["Portuguese", "English"]
  },
  "award": [
    "Innovative Indie Developer 2024",
    "Brazilian Game Developer Recognition"
  ],
  "memberOf": {
    "@type": "Organization",
    "name": "Brazilian Indie Game Developers Community"
  }
};

export function PersonSchema() {
  return <StructuredData data={linwaruPersonSchema} />;
}
