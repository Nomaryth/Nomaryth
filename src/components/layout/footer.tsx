
'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { useTranslation } from '@/context/i18n-context';

export function Footer() {
  const { t } = useTranslation();

  const footerLinks = {
    chronicles: [
      { href: '/docs', labelKey: 'footer.links.lore' },
      { href: '/about', labelKey: 'footer.links.concepts' },
      { href: '/projects', labelKey: 'footer.links.projects' },
    ],
    community: [
      { href: 'https://x.com/Nomaryth', labelKey: 'footer.links.twitter' },
      { href: 'https://github.com/Nomaryth', labelKey: 'footer.links.github' },
    ],
    legal: [
      { href: '/privacy', labelKey: 'footer.links.privacy' },
      { href: '/terms', labelKey: 'footer.links.terms' },
    ],
  };

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
             <Link href="/" className="flex items-center gap-2">
                <Logo />
                 <span className="font-bold font-headline text-lg">
                    Nomaryth
                </span>
            </Link>
            <p className="text-muted-foreground text-sm mt-4 max-w-xs">
              {t('footer.bio')}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-6">
                <br />
            </p>
          </div>
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
              <div>
                <h3 className="font-semibold text-foreground mb-4">{t('footer.headings.chronicles')}</h3>
                <ul className="space-y-3">
                  {footerLinks.chronicles.map((link) => (
                    <li key={link.labelKey}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-accent transition-colors"
                      >
                        {t(link.labelKey)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-4">{t('footer.headings.community')}</h3>
                <ul className="space-y-3">
                  {footerLinks.community.map((link) => (
                    <li key={link.labelKey}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-accent transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t(link.labelKey)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-4">{t('footer.headings.legal')}</h3>
                <ul className="space-y-3">
                  {footerLinks.legal.map((link) => (
                    <li key={link.labelKey}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-accent transition-colors"
                      >
                        {t(link.labelKey)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
