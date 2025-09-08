'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { LocationData } from '@/lib/geolocation';

interface LocationDisplayProps {
  location?: LocationData;
  onLocationRefresh: () => void;
  isLoading?: boolean;
  error?: string;
}

export function LocationDisplay({ 
  location, 
  onLocationRefresh, 
  isLoading = false,
  error 
}: LocationDisplayProps) {
  const formatLatLng = (value: number, isLat: boolean) => {
    const direction = isLat ? (value >= 0 ? 'N' : 'S') : (value >= 0 ? 'E' : 'W');
    return `${Math.abs(value).toFixed(4)}°${direction}`;
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onLocationRefresh}
            disabled={isLoading}
            className="h-8"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        {location ? (
          <div className="space-y-3">
            {/* Primary Location Info */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg">
                  {location.city}
                </div>
                <div className="text-sm text-muted-foreground">
                  {location.country}
                </div>
              </div>
              <Badge variant="secondary">
                {getLatitudeDescription(location.latitude)}
              </Badge>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="text-xs text-muted-foreground">Latitude</div>
                <div className="font-mono text-sm">
                  {formatLatLng(location.latitude, true)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Longitude</div>
                <div className="font-mono text-sm">
                  {formatLatLng(location.longitude, false)}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-2 text-sm">
              {location.timezone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timezone:</span>
                  <span className="font-medium">{location.timezone}</span>
                </div>
              )}
              {location.accuracy && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accuracy:</span>
                  <span className="font-medium">±{Math.round(location.accuracy)}m</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hemisphere:</span>
                <span className="font-medium">
                  {location.latitude >= 0 ? 'Northern' : 'Southern'}
                </span>
              </div>
            </div>

            {/* Environmental Context */}
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground mb-2">
                Environmental Context
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  {Math.abs(location.latitude) > 45 ? 'High UV seasonality' : 'Moderate UV variation'}
                </Badge>
                {Math.abs(location.latitude) > 60 && (
                  <Badge variant="outline" className="text-xs">
                    Polar night risk
                  </Badge>
                )}
                {Math.abs(location.latitude) < 10 && (
                  <Badge variant="outline" className="text-xs">
                    Year-round UV exposure
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            {isLoading ? (
              <>
                <div className="animate-pulse">
                  <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-muted rounded w-32 mx-auto mb-2"></div>
                  <div className="h-3 bg-muted rounded w-24 mx-auto"></div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Getting your location...
                </p>
              </>
            ) : (
              <>
                <MapPin className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <p className="font-medium">Location Required</p>
                  <p className="text-sm text-muted-foreground">
                    Click refresh to enable location-based calculations
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}