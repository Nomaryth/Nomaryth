'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { useTranslation } from '@/context/i18n-context';

export default function SettingsPage() {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.settings.title')}</CardTitle>
        <CardDescription>
          {t('admin.settings.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
         <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
            <Settings className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">{t('admin.settings.wip_title')}</h3>
            <p className="text-muted-foreground">
                {t('admin.settings.wip_desc')}
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
