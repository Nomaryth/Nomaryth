'use client';

import { StructuredData } from '@/components/structured-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const aboutSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'Sobre Nomaryth',
  url: 'https://gghorizon.com/about',
  mainEntity: {
    '@type': 'Organization',
    name: 'Nomaryth',
    url: 'https://gghorizon.com',
    logo: 'https://gghorizon.com/assets/NomaIcon1.png',
    sameAs: [
      'https://github.com/Nomaryth',
    ],
    description:
      'Nomaryth é um projeto de mundo interativo e documentação do universo de Nomaryth. Explora facções, magia e sistemas do mundo.',
  },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <StructuredData data={aboutSchema} />
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Sobre Nomaryth</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Nomaryth é um projeto de apresentação de mundo interativo com foco em
            transparência e documentação. Nossa missão é oferecer uma visão clara dos
            sistemas, facções e história de Nomaryth, com atualizações contínuas.
          </p>
          <p>
            Entre em contato: <a className="underline" href="mailto:contact@nomaryth.uk">contact@nomaryth.uk</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}