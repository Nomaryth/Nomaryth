import { type NextRequest, NextResponse } from 'next/server';

interface WeatherData {
  current: {
    temp_c: number;
    condition: { text: string };
  };
  location: { name: string; country: string };
}

export async function GET(req: NextRequest) {
  const withTimeout = async (url: string, init?: RequestInit, ms = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try {
      return await fetch(url, { ...(init || {}), signal: controller.signal });
    } finally {
      clearTimeout(id);
    }
  };

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('location');

    if (!q) {
      return NextResponse.json({ success: false, error: 'location query required' }, { status: 400 });
    }

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=pt&format=json`;
    const geoResp = await withTimeout(geoUrl, { next: { revalidate: 3600 } });
    if (!geoResp.ok) throw new Error('geocoding failed');
    const geoJson = await geoResp.json();
    if (!geoJson.results || geoJson.results.length === 0) {
      return NextResponse.json({ success: false, error: 'no_geocode' }, { status: 404 });
    }
    const g = geoJson.results[0];
    const latitude = g.latitude;
    const longitude = g.longitude;
    const cityName: string = g.name;
    const admin1: string | undefined = g.admin1;
    const countryCode: string = g.country_code;

    const brUfMap: Record<string, string> = {
      'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM', 'Bahia': 'BA',
      'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES', 'Goiás': 'GO', 'Maranhão': 'MA',
      'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB',
      'Paraná': 'PR', 'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
      'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC', 'São Paulo': 'SP',
      'Sergipe': 'SE', 'Tocantins': 'TO'
    };

    const regionDisplay = countryCode === 'BR' && admin1 ? (brUfMap[admin1] || admin1) : (admin1 || countryCode);

    const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const meteoResp = await withTimeout(meteoUrl, { cache: 'no-store' });
    if (!meteoResp.ok) throw new Error('weather failed');
    const meteo = await meteoResp.json();
    const tempC = Math.round(meteo.current_weather?.temperature ?? 0);
    const code = meteo.current_weather?.weathercode ?? 0;

    const codeMap: Record<number, string> = {
      0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
      56: 'Freezing drizzle', 57: 'Heavy freezing drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
      66: 'Freezing rain', 67: 'Heavy freezing rain', 71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
      77: 'Snow grains', 80: 'Rain showers', 81: 'Heavy rain showers', 82: 'Violent rain showers',
      85: 'Snow showers', 86: 'Heavy snow showers', 95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail'
    };

    const conditionText = codeMap[code] || 'Clear';

    const payload: { success: true; data: WeatherData } = {
      success: true,
      data: {
        current: { temp_c: tempC, condition: { text: conditionText } },
        location: { name: cityName, country: regionDisplay },
      },
    };

    return NextResponse.json(payload);
  } catch (error) {
    try {
      const { searchParams } = new URL(req.url);
      const q = searchParams.get('location') || '';
      const wttrUrl = `https://wttr.in/${encodeURIComponent(q)}?format=j1`;
      const wttrResp = await fetch(wttrUrl, { cache: 'no-store' });
      if (wttrResp.ok) {
        const data = await wttrResp.json();
        const current = data?.current_condition?.[0];
        const area = data?.nearest_area?.[0];
        const tempC = current ? parseInt(current.temp_C, 10) : 0;
        const conditionText = current?.weatherDesc?.[0]?.value || 'Clear';
        const cityName = area?.areaName?.[0]?.value || q || 'Unknown';
        const country = area?.country?.[0]?.value || 'Unknown';
        const payload: { success: true; data: WeatherData } = {
          success: true,
          data: {
            current: { temp_c: tempC, condition: { text: conditionText } },
            location: { name: cityName, country },
          },
        };
        return NextResponse.json(payload);
      }
    } catch {}

    return NextResponse.json({ success: false, error: 'weather_unavailable' });
  }
} 