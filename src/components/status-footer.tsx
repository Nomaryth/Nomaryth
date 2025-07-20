
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { getWeather } from '@/ai/flows/get-weather-flow';
import { Loader, Milestone, CloudSun } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useTranslation } from '@/context/i18n-context';

interface WeatherData {
  temperature: number;
  description: string;
  locationName: string;
}

export function StatusFooter() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (profile?.location) {
        setLoading(true);
        setError(null);
        try {
          const weatherData = await getWeather({ city: profile.location });
          setWeather(weatherData);
        } catch (err) {
          console.error("Failed to fetch weather:", err);
          setError(t('status.weather_error'));
          setWeather(null);
        } finally {
          setLoading(false);
        }
      } else {
        setWeather(null);
      }
    };

    fetchWeather();
  }, [profile?.location, t]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 rounded-full bg-card/80 backdrop-blur-sm border px-3 py-1.5 shadow-md">
            <Milestone className="h-4 w-4 text-primary" />
            <span className="font-semibold text-muted-foreground">{t('status.build')}:</span>
            <span className="font-mono text-xs text-foreground">{process.env.NEXT_PUBLIC_APP_VERSION || '0.1.1'}</span>
        </div>

      {profile?.location && (
        <div className="flex items-center gap-2 rounded-full bg-card/80 backdrop-blur-sm border px-3 py-1.5 shadow-md min-w-[100px] justify-center">
          {loading ? (
            <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : weather ? (
            <>
              <CloudSun className="h-5 w-5 text-primary" />
              <span className="font-semibold">{weather.temperature}°C</span>
              <span className="text-muted-foreground hidden sm:inline">{weather.locationName}</span>
            </>
          ) : null}
           {!loading && error && (
             <span className="text-xs text-destructive text-center">{error}</span>
          )}
        </div>
      )}
    </div>
  );
}
