'use client';

import { ErrorDisplay } from '@/components/error-display';
import { useTranslation } from '@/context/i18n-context';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';


export default function NotFound() {
  const { t } = useTranslation();

  return (
    <>
     <Header />
      <ErrorDisplay
        errorCode="404"
        title={t('error_pages.404.title')}
        description={t('error_pages.404.description')}
      />
      <Footer />
    </>
  );
}
