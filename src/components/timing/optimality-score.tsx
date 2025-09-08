'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { OptimalTimingResult } from '@/lib/optimal-timing';

interface OptimalityScoreProps {
  analysis?: OptimalTimingResult;
  isLoading?: boolean;
}

export function OptimalityScore({ analysis, isLoading }: OptimalityScoreProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Optimality Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse">
            <div className="h-16 bg-muted rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Optimality Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <Clock className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <p className="font-medium">Analysis Pending</p>
              <p className="text-sm text-muted-foreground">
                Select a date and location to calculate optimality
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
    if (score >= 80) return <CheckCircle className="h-6 w-6 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    return <AlertTriangle className="h-6 w-6 text-red-600" />;
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Optimality Score
          </CardTitle>
          <Badge 
            variant="secondary" 
            className={`${getConfidenceColor(analysis.confidenceLevel)} text-white`}
          >
            {analysis.confidenceLevel} Confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Score Display */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            {getScoreIcon(analysis.overallScore)}
            <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
              {analysis.overallScore}
            </div>
            <div className="text-2xl text-muted-foreground">/100</div>
          </div>
          
          <Progress 
            value={analysis.overallScore} 
            className="w-full h-3"
          />
          
          <p className="text-sm text-muted-foreground">
            {getScoreDescription(analysis.overallScore)}
          </p>
        </div>

        {/* Life Expectancy Impact */}
        {analysis.lifeExpectancyDelta !== 0 && (
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {analysis.lifeExpectancyDelta > 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              <div>
                <div className="font-medium">
                  Estimated Lifespan Impact
                </div>
                <div className={`text-sm ${
                  analysis.lifeExpectancyDelta > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analysis.lifeExpectancyDelta > 0 ? '+' : ''}{analysis.lifeExpectancyDelta} years
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {analysis.solarData.sunspotNumber}
            </div>
            <div className="text-xs text-muted-foreground">
              Sunspot Number
            </div>
            <Badge 
              variant="outline" 
              className="mt-1 text-xs"
            >
              {analysis.solarData.solarRisk}
            </Badge>
          </div>
          
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {analysis.seasonalData.overallSeasonalScore}
            </div>
            <div className="text-xs text-muted-foreground">
              Seasonal Score
            </div>
            <Badge 
              variant="outline" 
              className="mt-1 text-xs"
            >
              /100
            </Badge>
          </div>
        </div>

        {/* Risk Factor Summary */}
        {analysis.riskFactors.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Risk Factor Summary
            </h4>
            <div className="space-y-2">
              {analysis.riskFactors.slice(0, 3).map((factor, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div>
                    <div className="text-sm font-medium">
                      {factor.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {factor.category}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={factor.severity === 'HIGH' ? 'destructive' : 
                              factor.severity === 'MEDIUM' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {factor.severity}
                    </Badge>
                    <div className={`text-sm font-medium ${
                      factor.impact > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {factor.impact > 0 ? '+' : ''}{factor.impact}
                    </div>
                  </div>
                </div>
              ))}
              
              {analysis.riskFactors.length > 3 && (
                <div className="text-center">
                  <Badge variant="outline" className="text-xs">
                    +{analysis.riskFactors.length - 3} more factors
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}