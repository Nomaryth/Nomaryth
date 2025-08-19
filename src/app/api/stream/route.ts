import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  const allowedDomains = [
    'ice1.somafm.com',
    'ice2.somafm.com', 
    'ice3.somafm.com',
    'ice4.somafm.com',
    'ice5.somafm.com',
    'ice6.somafm.com'
  ];

  try {
    const streamUrl = new URL(url);
    
    if (!allowedDomains.includes(streamUrl.hostname)) {
      return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'audio/mpeg, audio/*, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://somafm.com/',
        'Origin': 'https://somafm.com',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      console.error(`Stream fetch failed: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Stream not available: ${response.status}` }, 
        { status: response.status }
      );
    }

    const headers = new Headers();
    
    const contentType = response.headers.get('content-type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    }
    
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Accept, Range');
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Accept-Ranges', 'bytes');

    const range = request.headers.get('range');
    if (range) {
      headers.set('Accept-Ranges', 'bytes');
    }

    return new NextResponse(response.body, {
      status: 200,
      headers: headers,
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy stream' }, 
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, Range',
    },
  });
}
