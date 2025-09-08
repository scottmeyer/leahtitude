'use client';

import { useState, useEffect, useCallback } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, AlertCircle, Info, Calculator, FileText } from 'lucide-react';
import { LocationBanner } from './location-banner';
import { FullWidthOptimality } from './full-width-optimality';
import { FullWidthTiming } from './full-width-timing';
import { FullWidthAnalysis } from './full-width-analysis';
import { RecommendationPanel } from './recommendation-panel';
import { BirthReport } from './birth-report';
import { getCurrentLocation, LocationData, GeolocationError } from '@/lib/geolocation';
import { calculateOptimalTiming, analyzeTimingRange, OptimalTimingResult, generateOptimalityReport } from '@/lib/optimal-timing';
import { addMonths } from 'date-fns';

export function BirthTimingDashboard() {
  const [mode, setMode] = useState<'calculator' | 'report'>('calculator');
  const [location, setLocation] = useState<LocationData | undefined>();
  const [locationError, setLocationError] = useState<string | undefined>();
  const [locationLoading, setLocationLoading] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [debouncedDate, setDebouncedDate] = useState(new Date());
  const [currentAnalysis, setCurrentAnalysis] = useState<OptimalTimingResult | undefined>();
  const [monthlyScores, setMonthlyScores] = useState<Array<{ date: Date; score: number; lifeExpectancyDelta?: number }>>([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  
  // Get location on component mount
  useEffect(() => {
    handleLocationRefresh();
  }, []);

  // Debounce selectedDate changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedDate(selectedDate);
      setIsSliding(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [selectedDate]);
  
  // Recalculate when location or debounced date changes
  useEffect(() => {
    if (!location) return;
    
    const performAnalysis = async () => {
      setAnalysisLoading(true);
      try {
        // Calculate current timing
        const analysis = await calculateOptimalTiming(location, debouncedDate);
        setCurrentAnalysis(analysis);
        
        // Calculate monthly scores for visualization - get ALL analyses for full variation
        const analyses: OptimalTimingResult[] = [];
        for (let i = -12; i <= 12; i++) {
          const testDate = addMonths(debouncedDate, i);
          const monthAnalysis = await calculateOptimalTiming(location, testDate);
          analyses.push(monthAnalysis);
        }
        
        const scores = analyses.map(w => ({
          date: w.birthDate,
          score: w.overallScore,
          lifeExpectancyDelta: w.lifeExpectancyDelta
        }));
        setMonthlyScores(scores);
        
      } catch (error) {
        console.error('Analysis failed:', error);
      } finally {
        setAnalysisLoading(false);
      }
    };

    performAnalysis();
  }, [location, debouncedDate]);

  const handleLocationRefresh = async () => {
    setLocationLoading(true);
    setLocationError(undefined);
    
    try {
      const locationData = await getCurrentLocation();
      setLocation(locationData);
    } catch (error) {
      const geoError = error as GeolocationError;
      setLocationError(geoError.message);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
    setIsSliding(true);
  }, []);

  const handleExportReport = async () => {
    if (!location || !currentAnalysis) return;
    
    try {
      const report = await generateOptimalityReport(location, selectedDate);
      
      const reportData = {
        ...report,
        exportDate: new Date().toISOString(),
        location: {
          city: location.city,
          country: location.country,
          coordinates: `${location.latitude}, ${location.longitude}`
        }
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `birth-timing-analysis-${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (mode === 'report') {
    return <BirthReport onClose={() => setMode('calculator')} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Optimal Birth Timing Calculator
              </h1>
              <p className="text-muted-foreground">
                Scientific analysis of conception and birth timing based on solar cycles, seasonality, and geographic factors
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setMode('report')} 
                variant="outline"
              >
                <FileText className="h-4 w-4 mr-2" />
                Birth Report
              </Button>
              <Button 
                onClick={handleExportReport} 
                disabled={!currentAnalysis}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scientific Disclaimer */}
      <div className="container mx-auto px-4 py-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This tool is based on population-level statistical correlations from peer-reviewed research. 
            Individual outcomes may vary significantly. Consult healthcare providers for personal medical decisions. 
            Not a substitute for professional medical advice.
          </AlertDescription>
        </Alert>
      </div>

      {/* Location Banner */}
      <LocationBanner
        location={location}
        onLocationRefresh={handleLocationRefresh}
        isLoading={locationLoading}
        error={locationError}
      />

      {/* Full-Width Analysis Panels */}
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* 1. Optimality Score Panel */}
        <FullWidthOptimality
          analysis={currentAnalysis}
          isLoading={analysisLoading || isSliding}
          selectedDate={selectedDate}
        />

        {/* 2. Birth Timing Selection Panel */}
        <FullWidthTiming
          currentDate={new Date()}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          scores={monthlyScores}
          range={24}
          isLoading={analysisLoading || isSliding}
        />

        {/* 3. Combined Risk Factor Analysis & Life Expectancy Panel */}
        <FullWidthAnalysis
          analysis={currentAnalysis}
          monthlyData={monthlyScores}
          isLoading={analysisLoading || isSliding}
        />
      </div>

      {/* Recommendations Section - Below the fold, full width */}
      {currentAnalysis && (
        <div className="border-t bg-muted/20">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight mb-2">
                Detailed Analysis & Recommendations
              </h2>
              <p className="text-muted-foreground">
                Comprehensive breakdown of risk factors and evidence-based recommendations for your selected timing
              </p>
            </div>
            
            <RecommendationPanel
              recommendations={currentAnalysis.recommendations}
              analysis={currentAnalysis}
            />
          </div>
        </div>
      )}
    </div>
  );
}