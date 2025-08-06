'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from '@/context/i18n-context';

interface BreadcrumbItem {
  name: string;
  href: string;
  isCurrent?: boolean;
}

export function DocsBreadcrumbs() {
  const pathname = usePathname();
  const { t } = useTranslation();
  
  const pathSegments = pathname.split('/').filter(Boolean);
  
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      name: t('docs.breadcrumbs.home'),
      href: '/',
      isCurrent: pathname === '/'
    }
  ];

  if (pathSegments[0] === 'docs' && pathSegments[1]) {
    const categoryName = pathSegments[1].split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    breadcrumbItems.push({
      name: categoryName,
      href: '#',
      isCurrent: pathname === `/docs/${pathSegments[1]}`
    });

    if (pathSegments[2]) {
      const docName = pathSegments[2].split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      breadcrumbItems.push({
        name: docName,
        href: `/docs/${pathSegments[1]}/${pathSegments[2]}`,
        isCurrent: true
      });
    }
  }

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      {breadcrumbItems.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />
          )}
          
          {item.isCurrent || item.href === '#' ? (
            <span className="text-foreground font-medium">
              {item.name}
            </span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-accent transition-colors"
            >
              {item.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}