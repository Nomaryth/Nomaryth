'use client';

import { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, Thermometer, MapPin } from 'lucide-react';

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
    return <CloudRain className="h-4 w-4" />;
  } else if (lowerCondition.includes('snow') || lowerCondition.includes('sleet')) {
    return <CloudSnow className="h-4 w-4" />;
  } else if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
    return <Sun className="h-4 w-4" />;
  } else {
    return <Cloud className="h-4 w-4" />;
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

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        
        const response = await fetch('/api/weather');
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
  }, []);

  return (
    <footer className="border-t bg-muted/40 px-6 py-3 mt-0">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>© 2025 Nomaryth</span>
          <span>•</span>
          <span>All rights reserved.</span>
          <span>•</span>
          <span>v{buildVersion}</span>
        </div>
        
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="flex items-center gap-1">
              <Thermometer className="h-3 w-3" />
              <span>Loading weather...</span>
            </div>
          ) : weather ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {getWeatherIcon(weather.current.condition.text)}
                <span>{weather.current.temp_c}°C</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{weather.location.name}, {weather.location.country}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Cloud className="h-3 w-3" />
              <span>Weather unavailable</span>
            </div>
          )}
          
          <span>•</span>
          <span>Protected by Cloudflare</span>
        </div>
      </div>
    </footer>
  );
}
