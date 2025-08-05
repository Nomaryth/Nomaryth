import { type NextRequest, NextResponse } from 'next/server';

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const city = searchParams.get('city');

    if (!lat || !lon) {
      const geoResponse = await fetch(`${req.nextUrl.origin}/api/geolocation`);
      const geoData = await geoResponse.json();
      
      if (geoData.success && geoData.data.latitude && geoData.data.longitude) {
        const weatherResponse = await fetch(
          `https://wttr.in?format=j1&lat=${geoData.data.latitude}&lon=${geoData.data.longitude}`
        );
        
        if (weatherResponse.ok) {
          const data = await weatherResponse.json();
          if (data.current_condition && data.current_condition[0]) {
            const current = data.current_condition[0];
            const location = data.nearest_area?.[0] || {};
            
            return NextResponse.json({
              success: true,
              data: {
                current: {
                  temp_c: parseInt(current.temp_C),
                  condition: {
                    text: current.weatherDesc[0].value
                  }
                },
                location: {
                  name: location.areaName?.[0]?.value || geoData.data.city,
                  country: location.country?.[0]?.value || geoData.data.country
                }
              }
            });
          }
        }
      }
      
      const fallbackResponse = await fetch('https://wttr.in/London?format=j1');
      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        if (data.current_condition && data.current_condition[0]) {
          const current = data.current_condition[0];
          return NextResponse.json({
            success: true,
            data: {
              current: {
                temp_c: parseInt(current.temp_C),
                condition: {
                  text: current.weatherDesc[0].value
                }
              },
              location: {
                name: 'London',
                country: 'United Kingdom'
              }
            }
          });
        }
      }
    } else {
      const weatherResponse = await fetch(
        `https://wttr.in?format=j1&lat=${lat}&lon=${lon}`
      );
      
      if (weatherResponse.ok) {
        const data = await weatherResponse.json();
        if (data.current_condition && data.current_condition[0]) {
          const current = data.current_condition[0];
          const location = data.nearest_area?.[0] || {};
          
          return NextResponse.json({
            success: true,
            data: {
              current: {
                temp_c: parseInt(current.temp_C),
                condition: {
                  text: current.weatherDesc[0].value
                }
              },
              location: {
                name: location.areaName?.[0]?.value || city || 'Unknown',
                country: location.country?.[0]?.value || 'Unknown'
              }
            }
          });
        }
      }
    }

    throw new Error('Failed to fetch weather data');

  } catch (error) {
    console.error('Weather API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 