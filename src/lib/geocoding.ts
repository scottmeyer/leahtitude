export interface GeocodingResult {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  formattedAddress: string;
  confidence: number;
}

export interface GeocodingError {
  message: string;
  code: 'NO_RESULTS' | 'API_ERROR' | 'INVALID_INPUT';
}

// Cache for geocoding results to avoid repeated API calls
const geocodingCache = new Map<string, GeocodingResult>();

export const geocodeAddress = async (address: string): Promise<GeocodingResult> => {
  // Clean and normalize the address
  const cleanAddress = address.trim();
  if (!cleanAddress) {
    throw {
      message: 'Address cannot be empty',
      code: 'INVALID_INPUT'
    } as GeocodingError;
  }

  // Check cache first
  const cacheKey = cleanAddress.toLowerCase();
  if (geocodingCache.has(cacheKey)) {
    return geocodingCache.get(cacheKey)!;
  }

  try {
    // Try multiple geocoding services for better coverage
    let result: GeocodingResult;
    
    // First, try OpenStreetMap Nominatim (free, no API key required)
    try {
      result = await geocodeWithNominatim(cleanAddress);
    } catch (nominatimError) {
      // Fallback to a simpler geocoding service
      result = await geocodeWithSimpleService(cleanAddress);
    }

    // Cache the successful result
    geocodingCache.set(cacheKey, result);
    return result;

  } catch (error) {
    console.error('Geocoding failed:', error);
    throw {
      message: 'Could not find location. Please check the spelling and try again.',
      code: 'NO_RESULTS'
    } as GeocodingError;
  }
};

async function geocodeWithNominatim(address: string): Promise<GeocodingResult> {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Birth-Timing-Calculator/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`Nominatim API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data || data.length === 0) {
    throw new Error('No results found');
  }

  const result = data[0];
  const addressComponents = result.address || {};

  return {
    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.lon),
    city: addressComponents.city || 
          addressComponents.town || 
          addressComponents.village || 
          addressComponents.hamlet || 
          'Unknown City',
    country: addressComponents.country || 'Unknown Country',
    formattedAddress: result.display_name || address,
    confidence: parseFloat(result.importance || '0.5')
  };
}

async function geocodeWithSimpleService(address: string): Promise<GeocodingResult> {
  // Fallback to a simple pattern-based geocoding for common locations
  const knownLocations = getKnownLocations();
  const normalizedAddress = address.toLowerCase();
  
  for (const [pattern, location] of knownLocations) {
    if (normalizedAddress.includes(pattern)) {
      return location;
    }
  }
  
  throw new Error('Location not found in fallback database');
}

function getKnownLocations(): Map<string, GeocodingResult> {
  // A small database of major world cities for fallback
  const locations = new Map<string, GeocodingResult>();
  
  // Major US cities
  locations.set('new york', {
    latitude: 40.7128, longitude: -74.0060,
    city: 'New York', country: 'United States',
    formattedAddress: 'New York, NY, USA', confidence: 0.9
  });
  
  locations.set('los angeles', {
    latitude: 34.0522, longitude: -118.2437,
    city: 'Los Angeles', country: 'United States',
    formattedAddress: 'Los Angeles, CA, USA', confidence: 0.9
  });
  
  locations.set('chicago', {
    latitude: 41.8781, longitude: -87.6298,
    city: 'Chicago', country: 'United States',
    formattedAddress: 'Chicago, IL, USA', confidence: 0.9
  });
  
  locations.set('houston', {
    latitude: 29.7604, longitude: -95.3698,
    city: 'Houston', country: 'United States',
    formattedAddress: 'Houston, TX, USA', confidence: 0.9
  });
  
  locations.set('san francisco', {
    latitude: 37.7749, longitude: -122.4194,
    city: 'San Francisco', country: 'United States',
    formattedAddress: 'San Francisco, CA, USA', confidence: 0.9
  });
  
  // International cities
  locations.set('london', {
    latitude: 51.5074, longitude: -0.1278,
    city: 'London', country: 'United Kingdom',
    formattedAddress: 'London, UK', confidence: 0.9
  });
  
  locations.set('paris', {
    latitude: 48.8566, longitude: 2.3522,
    city: 'Paris', country: 'France',
    formattedAddress: 'Paris, France', confidence: 0.9
  });
  
  locations.set('tokyo', {
    latitude: 35.6762, longitude: 139.6503,
    city: 'Tokyo', country: 'Japan',
    formattedAddress: 'Tokyo, Japan', confidence: 0.9
  });
  
  locations.set('sydney', {
    latitude: -33.8688, longitude: 151.2093,
    city: 'Sydney', country: 'Australia',
    formattedAddress: 'Sydney, NSW, Australia', confidence: 0.9
  });
  
  locations.set('toronto', {
    latitude: 43.6532, longitude: -79.3832,
    city: 'Toronto', country: 'Canada',
    formattedAddress: 'Toronto, ON, Canada', confidence: 0.9
  });

  locations.set('berlin', {
    latitude: 52.5200, longitude: 13.4050,
    city: 'Berlin', country: 'Germany',
    formattedAddress: 'Berlin, Germany', confidence: 0.9
  });

  locations.set('madrid', {
    latitude: 40.4168, longitude: -3.7038,
    city: 'Madrid', country: 'Spain',
    formattedAddress: 'Madrid, Spain', confidence: 0.9
  });

  locations.set('rome', {
    latitude: 41.9028, longitude: 12.4964,
    city: 'Rome', country: 'Italy',
    formattedAddress: 'Rome, Italy', confidence: 0.9
  });
  
  return locations;
}

// Helper function to suggest locations based on partial input
export const suggestLocations = (partial: string): string[] => {
  if (partial.length < 2) return [];
  
  const knownLocations = getKnownLocations();
  const suggestions: string[] = [];
  
  for (const [pattern, location] of knownLocations) {
    if (pattern.startsWith(partial.toLowerCase()) || 
        location.city.toLowerCase().includes(partial.toLowerCase()) ||
        location.country.toLowerCase().includes(partial.toLowerCase())) {
      suggestions.push(location.formattedAddress);
    }
  }
  
  return suggestions.slice(0, 5); // Return top 5 suggestions
};