import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Possible params
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const q = searchParams.get('q'); 
  let url = "";
  
  if (q) {
    url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=in&addressdetails=1`;
  } else if (lat && lon) {

    url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
  } else {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        // Essential: Prevents 403 Forbidden
        'User-Agent': 'VaranasiFoodApp/1.0 (contact@yourdomain.com)',
        'Accept-Language': 'en',
      },
      // Cache results locally for 1 hour to stay within OSM usage limits
      next: { revalidate: 3600 } 
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Nominatim API responded with ${response.status}` }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: "Request timed out" }, { status: 504 });
    }

    console.error("Geocode error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}