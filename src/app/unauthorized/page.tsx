'use client';

import { ErrorDisplay } from '@/components/error-display';
import { useTranslation } from '@/context/i18n-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Lock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';

function UnauthorizedPageContent() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    setTimestamp(new Date().toLocaleString())
    ;(async () => {
      try {
        const data = {
          ip: '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          path: typeof window !== 'undefined' ? window.location.pathname : '/unauthorized',
          method: 'GET',
          isAuthenticated: !!user,
          userId: user?.uid || null,
          email: user?.email || null,
          referer: typeof document !== 'undefined' ? document.referrer : '',
          origin: typeof location !== 'undefined' ? location.origin : '',
          agentHint: typeof navigator !== 'undefined' ? (navigator as any)['userAgentData']?.brands?.map((b: any) => b.brand+"/"+b.version).join(' ') || '' : ''
        }
        await fetch('/api/security-log', { method: 'POST', cache: 'no-store', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) })
      } catch {}
    })()
  }, []);
  
  const accessDetails = (
    <Card className="mt-8 w-full max-w-md bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-primary">
          <ShieldAlert className="h-5 w-5" />
          {t('error_pages.403.details_title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('error_pages.403.required_level')}:</span>
          <span>{t('profile.admin.role')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('error_pages.403.account_status')}:</span>
          <span className="text-destructive">{user ? t('error_pages.403.not_authorized') : t('error_pages.403.not_logged_in')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('error_pages.403.last_attempt')}:</span>
          <span>{timestamp}</span>
        </div>
        <Separator className="my-4" />
        <p className="text-xs text-center text-muted-foreground pt-2">
          {t('error_pages.403.contact_admin')}
        </p>
      </CardContent>
    </Card>
  );

  return (
      <ErrorDisplay
        errorCode="403"
        title={t('error_pages.403.title')}
        description={t('error_pages.403.description')}
        details={accessDetails}
        icon={<Lock className="w-16 h-16 text-accent/20 mt-8" />}
      />
  );
}


export default function UnauthorizedPage() {
    return <UnauthorizedPageContent />;
}
