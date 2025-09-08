'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar,
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Heart,
  Shield,
  Sun,
  Snowflake,
  Download,
  Info
} from 'lucide-react';
import { format, parse } from 'date-fns';
import { LocationData } from '@/lib/geolocation';
import { calculateOptimalTiming, OptimalTimingResult } from '@/lib/optimal-timing';
import { geocodeAddress, suggestLocations, GeocodingResult } from '@/lib/geocoding';

interface BirthReportProps {
  onClose: () => void;
}

interface BirthData {
  birthDate: Date;
  location: LocationData;
  cityName: string;
  countryName: string;
}

export function BirthReport({ onClose }: BirthReportProps) {
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [analysis, setAnalysis] = useState<OptimalTimingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [birthDateString, setBirthDateString] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);

  const handleGenerateReport = async () => {
    setError(null);
    
    // Validate inputs
    if (!birthDateString || !birthLocation) {
      setError('Please enter both birth date and location');
      return;
    }

    let birthDate: Date;
    try {
      birthDate = parse(birthDateString, 'yyyy-MM-dd', new Date());
    } catch {
      setError('Please enter a valid date in YYYY-MM-DD format');
      return;
    }

    setLoading(true);
    setGeocoding(true);

    try {
      // Geocode the location
      const geocodingResult: GeocodingResult = await geocodeAddress(birthLocation);
      
      const location: LocationData = {
        latitude: geocodingResult.latitude,
        longitude: geocodingResult.longitude,
        city: geocodingResult.city,
        country: geocodingResult.country,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      const data: BirthData = {
        birthDate,
        location,
        cityName: geocodingResult.city,
        countryName: geocodingResult.country
      };

      setBirthData(data);
      setGeocoding(false);
      
      // Generate analysis
      const result = await calculateOptimalTiming(location, birthDate);
      setAnalysis(result);
      
    } catch (err) {
      console.error('Report generation failed:', err);
      if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
        setError(`Location error: ${(err as { message: string }).message}`);
      } else {
        setError('Failed to find location or generate report. Please check the location spelling and try again.');
      }
      setGeocoding(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle location input changes and provide suggestions
  const handleLocationChange = (value: string) => {
    setBirthLocation(value);
    if (value.length >= 2) {
      const suggestions = suggestLocations(value);
      setLocationSuggestions(suggestions);
    } else {
      setLocationSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setBirthLocation(suggestion);
    setLocationSuggestions([]);
  };

  const handleExportReport = () => {
    if (!birthData || !analysis) return;

    const reportData = {
      title: `Birth Analysis Report for ${birthData.cityName}, ${birthData.countryName}`,
      birthDate: format(birthData.birthDate, 'MMMM dd, yyyy'),
      location: {
        city: birthData.cityName,
        country: birthData.countryName,
        coordinates: `${birthData.location.latitude}, ${birthData.location.longitude}`
      },
      analysis: {
        overallScore: analysis.overallScore,
        lifeExpectancyDelta: analysis.lifeExpectancyDelta,
        confidenceLevel: analysis.confidenceLevel,
        riskFactors: analysis.riskFactors.map(rf => ({
          name: rf.name,
          category: rf.category,
          severity: rf.severity,
          description: rf.description
        })),
        solarData: analysis.solarData,
        seasonalData: analysis.seasonalData,
        recommendations: analysis.recommendations
      },
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `birth-report-${format(birthData.birthDate, 'yyyy-MM-dd')}-${birthData.cityName.replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 50) return 'Below Average';
    return 'Poor';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Birth Analysis Report
              </h1>
              <p className="text-muted-foreground">
                Analyze the timing and environmental factors at the time of your birth
              </p>
            </div>
            <div className="flex gap-2">
              {analysis && (
                <Button onClick={handleExportReport} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              )}
              <Button onClick={onClose} variant="outline">
                Back to Calculator
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {!birthData || !analysis ? (
          // Input Form
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Enter Your Birth Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Birth Date</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDateString}
                    onChange={(e) => setBirthDateString(e.target.value)}
                    placeholder="YYYY-MM-DD"
                  />
                </div>
                
                <div className="space-y-2 relative">
                  <Label htmlFor="location">Birth Location</Label>
                  <Input
                    id="location"
                    value={birthLocation}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    placeholder="e.g., New York, NY or London, UK or Paris, France"
                    disabled={geocoding}
                  />
                  
                  {/* Location suggestions dropdown */}
                  {locationSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {locationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {geocoding && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      Looking up location...
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Easy Location Entry:</strong> Just type the city and country where you were born. 
                  We&apos;ll automatically look up the coordinates for you! Try &quot;New York, NY&quot;, &quot;London, UK&quot;, or &quot;Tokyo, Japan&quot;.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleGenerateReport}
                disabled={loading || geocoding}
                className="w-full"
              >
                {loading ? (geocoding ? 'Looking up location...' : 'Generating Report...') : 'Generate Birth Report'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Report Results
          <div className="space-y-8">
            {/* Report Header */}
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  Birth Analysis Report
                </CardTitle>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-lg">
                    <Calendar className="h-5 w-5" />
                    {format(birthData.birthDate, 'MMMM dd, yyyy')}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {birthData.cityName}, {birthData.countryName}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Birth Timing Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className={`text-6xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore}
                    <span className="text-2xl text-muted-foreground">/100</span>
                  </div>
                  <div className="text-xl font-medium">
                    {getScoreDescription(analysis.overallScore)} Timing
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {analysis.confidenceLevel} Confidence
                  </Badge>
                  
                  {analysis.lifeExpectancyDelta !== 0 && (
                    <div className="flex items-center justify-center gap-2 p-4 bg-muted/30 rounded-lg">
                      {analysis.lifeExpectancyDelta > 0 ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-medium">
                        Estimated Lifespan Impact: {analysis.lifeExpectancyDelta > 0 ? '+' : ''}{analysis.lifeExpectancyDelta} years
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Key Factors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Solar Activity */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sun className="h-5 w-5 text-yellow-500" />
                    Solar Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {analysis.solarData.sunspotNumber}
                    </div>
                    <div className="text-sm text-muted-foreground">Sunspot Number</div>
                  </div>
                  <Badge 
                    variant={analysis.solarData.solarRisk === 'HIGH' ? 'destructive' : 
                           analysis.solarData.solarRisk === 'MEDIUM' ? 'secondary' : 'default'}
                    className="w-full justify-center"
                  >
                    {analysis.solarData.solarRisk} RISK
                  </Badge>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>UV Level: {analysis.solarData.uvRadiationLevel}/11</div>
                    <div>Mental Health Factor: {analysis.solarData.mentalHealthMultiplier}x</div>
                  </div>
                </CardContent>
              </Card>

              {/* Seasonal Factors */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Snowflake className="h-5 w-5 text-blue-500" />
                    Seasonal Factors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {analysis.seasonalData.overallSeasonalScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Seasonal Score</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Vitamin D:</span>
                      <span className="font-medium">{analysis.seasonalData.vitaminDScore}/100</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Infection Risk:</span>
                      <span className="font-medium">{analysis.seasonalData.infectiousRisk}/100</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Age Advantage:</span>
                      <span className="font-medium">{analysis.seasonalData.relativeAgeAdvantage}/100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5 text-purple-500" />
                    Risk Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {analysis.riskFactors.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Risk Factors</div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {['HIGH', 'MEDIUM', 'LOW'].map(severity => {
                      const count = analysis.riskFactors.filter(rf => rf.severity === severity).length;
                      return count > 0 ? (
                        <Badge 
                          key={severity}
                          variant={severity === 'HIGH' ? 'destructive' : 
                                 severity === 'MEDIUM' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {count} {severity}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Factors Detail */}
            {analysis.riskFactors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Risk Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.riskFactors.map((factor, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{factor.name}</span>
                            <Badge 
                              variant={factor.severity === 'HIGH' ? 'destructive' : 
                                     factor.severity === 'MEDIUM' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {factor.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{factor.description}</p>
                          <div className="text-xs text-muted-foreground mt-1">
                            Category: {factor.category} • Impact: {factor.impact > 0 ? '+' : ''}{factor.impact}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommendations & Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                      <Heart className="h-5 w-5 text-red-500 mt-0.5" />
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Scientific Disclaimer */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Scientific Disclaimer:</strong> This analysis is based on population-level 
                statistical correlations from peer-reviewed research. Individual outcomes vary significantly. 
                This report is for informational purposes only and should not replace professional medical advice.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}