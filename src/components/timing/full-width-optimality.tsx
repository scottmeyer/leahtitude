'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle,
  AlertTriangle,
  Sun,
  Snowflake,
  Shield,
  Calendar
} from 'lucide-react';
import { OptimalTimingResult } from '@/lib/optimal-timing';
import { format } from 'date-fns';

interface FullWidthOptimalityProps {
  analysis?: OptimalTimingResult;
  isLoading?: boolean;
  selectedDate: Date;
}

export function FullWidthOptimality({ analysis, isLoading, selectedDate }: FullWidthOptimalityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Target className="h-6 w-6" />
            Optimality Score Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-16 bg-muted rounded-lg"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Target className="h-6 w-6" />
            Optimality Score Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <p className="text-lg font-medium">Analysis Pending</p>
              <p className="text-muted-foreground">
                Enable location access to calculate optimality for {format(selectedDate, 'MMMM yyyy')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-8 w-8 text-green-600" />;
    return <AlertTriangle className="h-8 w-8 text-yellow-600" />;
  };

  const getScoreDescription = (score: number) => {
    if (score >= 90) return 'Excellent timing with minimal risk factors';
    if (score >= 80) return 'Very good timing with low risk factors';
    if (score >= 70) return 'Good timing with manageable risks';
    if (score >= 60) return 'Fair timing with moderate risks';
    if (score >= 50) return 'Below average with several risk factors';
    return 'Poor timing with significant risk factors';
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'HIGH': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="h-6 w-6" />
              Optimality Score Analysis - {format(selectedDate, 'MMMM yyyy')}
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              Comprehensive assessment of birth timing factors and health outcomes
            </p>
          </div>
          <Badge 
            variant="secondary" 
            className={`${getConfidenceColor(analysis.confidenceLevel)} text-white`}
          >
            {analysis.confidenceLevel} Confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Overall Score */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              {getScoreIcon(analysis.overallScore)}
              <div className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}
              </div>
              <div className="text-2xl text-muted-foreground">/100</div>
            </div>
            
            <div>
              <div className="text-lg font-semibold mb-2">Overall Score</div>
              <Progress value={analysis.overallScore} className="w-full h-3 mb-2" />
              <p className="text-sm text-muted-foreground">
                {getScoreDescription(analysis.overallScore)}
              </p>
            </div>

            {/* Life Expectancy Impact */}
            {analysis.lifeExpectancyDelta !== 0 && (
              <div className="p-3 rounded-lg bg-muted/30 border">
                <div className="flex items-center gap-2 mb-1">
                  {analysis.lifeExpectancyDelta > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">Lifespan Impact</span>
                </div>
                <div className={`text-lg font-bold ${
                  analysis.lifeExpectancyDelta > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analysis.lifeExpectancyDelta > 0 ? '+' : ''}{analysis.lifeExpectancyDelta} years
                </div>
              </div>
            )}
          </div>

          {/* Solar Activity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Sun className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">Solar Activity</h3>
            </div>
            
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {analysis.solarData.sunspotNumber}
                </div>
                <div className="text-sm text-muted-foreground">Sunspot Number</div>
                <Badge 
                  variant={analysis.solarData.solarRisk === 'HIGH' ? 'destructive' : 
                         analysis.solarData.solarRisk === 'MEDIUM' ? 'secondary' : 'default'}
                  className="mt-2"
                >
                  {analysis.solarData.solarRisk} RISK
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-muted/30 rounded">
                  <div className="font-medium">UV Level</div>
                  <div className="text-primary">{analysis.solarData.uvRadiationLevel}/11</div>
                </div>
                <div className="p-2 bg-muted/30 rounded">
                  <div className="font-medium">Mental Health</div>
                  <div className="text-primary">{analysis.solarData.mentalHealthMultiplier}x</div>
                </div>
              </div>

              {analysis.solarData.lifespanImpact !== 0 && (
                <div className="text-xs text-muted-foreground text-center">
                  Solar cycle impact: {analysis.solarData.lifespanImpact} years
                </div>
              )}
            </div>
          </div>

          {/* Seasonal Factors */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Snowflake className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Seasonal Factors</h3>
            </div>
            
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {analysis.seasonalData.overallSeasonalScore}
                </div>
                <div className="text-sm text-muted-foreground">Seasonal Score</div>
                <Progress value={analysis.seasonalData.overallSeasonalScore} className="w-full h-2 mt-2" />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Vitamin D:</span>
                  <span className="font-medium">{analysis.seasonalData.vitaminDScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Infection Risk:</span>
                  <span className="font-medium">{analysis.seasonalData.infectiousRisk}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Age Advantage:</span>
                  <span className="font-medium">{analysis.seasonalData.relativeAgeAdvantage}/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold">Risk Summary</h3>
            </div>
            
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {analysis.riskFactors.length}
                </div>
                <div className="text-sm text-muted-foreground">Risk Factors</div>
              </div>

              <div className="flex flex-wrap gap-1 justify-center">
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

              {analysis.riskFactors.length === 0 ? (
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <div className="text-sm text-green-800">No significant risks identified</div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground text-center">
                  {analysis.riskFactors.slice(0, 2).map(rf => rf.name).join(', ')}
                  {analysis.riskFactors.length > 2 && ` +${analysis.riskFactors.length - 2} more`}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}