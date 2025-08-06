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
    return NextResponse.json({
      success: true,
      data: {
        current: {
          temp_c: 22,
          condition: {
            text: 'Partly cloudy'
          }
        },
        location: {
          name: 'Nomaryth',
          country: 'Fantasy World'
        }
      }
    });
  } catch (error) {
    console.error('Weather API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 