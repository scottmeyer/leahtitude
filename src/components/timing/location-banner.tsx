'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { LocationData } from '@/lib/geolocation';

interface LocationBannerProps {
  location?: LocationData;
  onLocationRefresh: () => void;
  isLoading?: boolean;
  error?: string;
}

export function LocationBanner({ 
  location, 
  onLocationRefresh, 
  isLoading = false,
  error 
}: LocationBannerProps) {
  const formatLatLng = (value: number, isLat: boolean) => {
    const direction = isLat ? (value >= 0 ? 'N' : 'S') : (value >= 0 ? 'E' : 'W');
    return `${Math.abs(value).toFixed(2)}°${direction}`;
  };

  const getLatitudeDescription = (latitude: number) => {
    const abs = Math.abs(latitude);
    if (abs > 66.5) return 'Arctic/Antarctic';
    if (abs > 50) return 'High latitude';
    if (abs > 30) return 'Mid latitude';
    if (abs > 10) return 'Subtropical';
    return 'Tropical';
  };

  return (
    <div className="border-b bg-muted/30">
      <div className="container mx-auto px-4 py-3">
        {error ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <div className="font-medium text-destructive">Location Error</div>
                <div className="text-sm text-muted-foreground">{error}</div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onLocationRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </div>
        ) : location ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <span className="font-medium">{location.city}, {location.country}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    ({formatLatLng(location.latitude, true)}, {formatLatLng(location.longitude, false)})
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {getLatitudeDescription(location.latitude)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {location.latitude >= 0 ? 'Northern' : 'Southern'} Hemisphere
                </Badge>
                {location.timezone && (
                  <Badge variant="outline" className="text-xs">
                    {location.timezone}
                  </Badge>
                )}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onLocationRefresh}
              disabled={isLoading}
              className="text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Update
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Location Required</div>
                <div className="text-sm text-muted-foreground">
                  {isLoading ? 'Getting your location...' : 'Click to enable location-based analysis'}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onLocationRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Getting Location...' : 'Get Location'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}