export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  timezone?: string;
  accuracy?: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        try {
          const locationDetails = await reverseGeocode(latitude, longitude);
          resolve({
            latitude,
            longitude,
            accuracy: accuracy || undefined,
            ...locationDetails
          });
        } catch (error) {
          resolve({
            latitude,
            longitude,
            accuracy: accuracy || undefined
          });
        }
      },
      (error) => {
        reject({
          code: error.code,
          message: getGeolocationErrorMessage(error.code)
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

const getGeolocationErrorMessage = (code: number): string => {
  switch (code) {
    case 1:
      return 'Location access denied. Please enable location permissions.';
    case 2:
      return 'Location unavailable. Please check your connection.';
    case 3:
      return 'Location request timed out. Please try again.';
    default:
      return 'An unknown error occurred while getting your location.';
  }
};

const reverseGeocode = async (latitude: number, longitude: number) => {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    
    return {
      city: data.city || data.locality || 'Unknown',
      country: data.countryName || 'Unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    return {
      city: 'Unknown',
      country: 'Unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }
};

export const calculateDistanceFromEquator = (latitude: number): number => {
  return Math.abs(latitude);
};

export const isNorthernHemisphere = (latitude: number): boolean => {
  return latitude > 0;
};

export const calculateUVIntensityByLatitude = (latitude: number, month: number): number => {
  const distanceFromEquator = calculateDistanceFromEquator(latitude);
  const baseIntensity = Math.max(0, 10 - (distanceFromEquator / 90) * 10);
  
  const seasonalMultiplier = isNorthernHemisphere(latitude) 
    ? Math.cos(((month - 6) * Math.PI) / 6) * 0.3 + 1
    : Math.cos(((month - 12) * Math.PI) / 6) * 0.3 + 1;
  
  return Math.max(0, Math.min(11, baseIntensity * seasonalMultiplier));
};