import { GeocodeResult } from '../types';

// Nominatim API (OpenStreetMap) - Free geocoding service
// Rate limit: 1 request per second
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'Avionics-Schools-Map/1.0';

// Simple rate limiter
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1100; // 1.1 seconds to be safe

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function geocodeAddress(address: string, city: string, state: string, zipCode: string): Promise<GeocodeResult | null> {
  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }

  const fullAddress = `${address}, ${city}, ${state} ${zipCode}, USA`;

  try {
    const params = new URLSearchParams({
      q: fullAddress,
      format: 'json',
      limit: '1',
      addressdetails: '1'
    });

    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        'User-Agent': USER_AGENT
      }
    });

    lastRequestTime = Date.now();

    if (!response.ok) {
      console.error(`Geocoding failed for ${fullAddress}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        display_name: result.display_name
      };
    }

    console.warn(`No geocoding results found for: ${fullAddress}`);
    return null;
  } catch (error) {
    console.error(`Geocoding error for ${fullAddress}:`, error);
    return null;
  }
}

// Batch geocoding with rate limiting
export async function geocodeBatch<T extends { address: string; city: string; state: string; zipCode: string }>(
  items: T[],
  onProgress?: (current: number, total: number) => void
): Promise<(T & { latitude?: number; longitude?: number })[]> {
  const results: (T & { latitude?: number; longitude?: number })[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const geocoded = await geocodeAddress(item.address, item.city, item.state, item.zipCode);

    if (geocoded) {
      results.push({
        ...item,
        latitude: geocoded.latitude,
        longitude: geocoded.longitude
      });
    } else {
      results.push(item);
    }

    if (onProgress) {
      onProgress(i + 1, items.length);
    }
  }

  return results;
}
