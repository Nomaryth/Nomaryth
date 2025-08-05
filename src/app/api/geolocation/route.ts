import { type NextRequest, NextResponse } from 'next/server';

interface GeolocationData {
  ip: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export async function GET(req: NextRequest) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwarded ? forwarded.split(',')[0] : realIp || '';

    if (!clientIp || clientIp === '::1' || clientIp === '127.0.0.1') {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        const externalIp = ipData.ip;
        
        const response = await fetch(`https://ipapi.co/${externalIp}/json/`);
        
        if (!response.ok) {
          throw new Error(`Geolocation service error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(`Geolocation error: ${data.reason || 'Unknown error'}`);
        }

        const geolocationData: GeolocationData = {
          ip: data.ip || externalIp,
          city: data.city || 'Unknown',
          region: data.region || 'Unknown',
          country: data.country_name || 'Unknown',
          latitude: parseFloat(data.latitude) || 0,
          longitude: parseFloat(data.longitude) || 0,
          timezone: data.timezone || 'UTC'
        };

        return NextResponse.json({
          success: true,
          data: geolocationData
        });
      }
    } else {
      const response = await fetch(`https://ipapi.co/${clientIp}/json/`);
      
      if (!response.ok) {
        throw new Error(`Geolocation service error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Geolocation error: ${data.reason || 'Unknown error'}`);
      }

      const geolocationData: GeolocationData = {
        ip: data.ip || clientIp,
        city: data.city || 'Unknown',
        region: data.region || 'Unknown',
        country: data.country_name || 'Unknown',
        latitude: parseFloat(data.latitude) || 0,
        longitude: parseFloat(data.longitude) || 0,
        timezone: data.timezone || 'UTC'
      };

      return NextResponse.json({
        success: true,
        data: geolocationData
      });
    }

    throw new Error('Failed to get IP address');

  } catch (error) {
    console.error('Geolocation error:', error);
    
    return NextResponse.json({
      success: false,
      data: {
        ip: 'Unknown',
        city: 'Unknown',
        region: 'Unknown',
        country: 'Unknown',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC'
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 