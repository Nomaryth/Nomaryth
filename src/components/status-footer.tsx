'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Cloud, CloudRain, CloudSnow, Sun, ShieldCheck, Lock, BadgeCheck, MapPin, Copyright } from 'lucide-react';

interface WeatherData {
  current: {
    temp_c: number;
    condition: {
      text: string;
    };
  };
  location: {
    name: string;
    country: string;
  };
}

const getWeatherIcon = (condition: string) => {
  const lowerCondition = condition.toLowerCase();
  
  if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
    return <CloudRain className="h-4 w-4 text-amber-400" />;
  } else if (lowerCondition.includes('snow') || lowerCondition.includes('sleet')) {
    return <CloudSnow className="h-4 w-4 text-amber-400" />;
  } else if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
    return <Sun className="h-4 w-4 text-amber-400" />;
  } else {
    return <Cloud className="h-4 w-4 text-amber-400" />;
  }
};


const getBuildVersion = () => {
  if (process.env.NEXT_PUBLIC_BUILD_VERSION) {
    return process.env.NEXT_PUBLIC_BUILD_VERSION;
  }
  
  
  try {
    const packageJson = require('../../package.json');
    return packageJson.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
};

export function StatusFooter() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const buildVersion = getBuildVersion();
  const { user, profile } = useAuth();

  useEffect(() => {
    const fetchWeather = async () => {
      if (!user || !profile?.location) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/weather?location=${encodeURIComponent(profile.location)}`, { cache: 'no-store' });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setWeather(result.data);
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Failed to fetch weather:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [user, profile?.location]);

  return (
    <footer className="border-t bg-muted/40 px-6 py-3 mt-0">
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 justify-center md:justify-start">
          <span className="text-amber-400 font-semibold">v{buildVersion}</span>
          <span>•</span>
        <span>© 2025 Nomaryth</span>
          <span>•</span>
          <span>All rights reserved.</span>
        </div>

        <div className="hidden md:flex items-center justify-center">
          <div className="relative flex items-center gap-2 text-amber-400">
            <span className="relative inline-flex w-5 h-5 items-center justify-center">
              <span className="absolute inset-0 rounded-full border border-amber-500/40 animate-shieldRing" />
              <span className="absolute inset-0 rounded-full border border-amber-500/20 animate-shieldPulse" />
              <ShieldCheck className="relative h-4 w-4" />
            </span>
            <span className="font-semibold">Nomaryth Gate</span>
            <span className="text-muted-foreground">— Protected by <strong>real-time access filter.</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-4 justify-center md:justify-end">
          {loading ? (
            <></>
          ) : weather ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {getWeatherIcon(weather.current.condition.text)}
                <span className="text-amber-400 font-semibold">{weather.current.temp_c}°C</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-amber-400" />
                <span>{weather.location.name}, {weather.location.country}</span>
              </div>
            </div>
          ) : (
            <></>
          )}
          
          <span className="hidden md:inline">•</span> 
          <span className="hidden md:inline text-amber-400">
              Powered by{" "}
          <span className="inline-flex items-center gap-1 text-amber-400">
              Cloudflare
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Cloudflare_Logo.png/960px-Cloudflare_Logo.png"
            alt="Cloudflare logo"
            className="w-4 h-4 object-contain translate-y-[2px] pointer-events-none select-none"
          />
  </span>
</span>

        </div>
      </div>
    </footer>
  );
}