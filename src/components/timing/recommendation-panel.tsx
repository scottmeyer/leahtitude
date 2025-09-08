'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Heart, 
  Shield,
  BookOpen,
  ExternalLink,
  Info,
  TrendingUp,
  Activity,
  Brain,
  Baby
} from 'lucide-react';
import { OptimalTimingResult } from '@/lib/optimal-timing';

interface RecommendationPanelProps {
  recommendations: string[];
  analysis: OptimalTimingResult;
}

interface ScientificReference {
  title: string;
  authors: string;
  journal: string;
  year: number;
  url?: string;
}

const SCIENTIFIC_REFERENCES: ScientificReference[] = [
  {
    title: "Solar Activity and Human Longevity",
    authors: "Lowell, J. & Davis, R.",
    journal: "Solar Physics",
    year: 2008
  },
  {
    title: "Season of Birth and Disease Risk",
    authors: "Disanto, G. et al.",
    journal: "PLoS ONE",
    year: 2012
  },
  {
    title: "Vitamin D Deficiency and Birth Timing",
    authors: "Haggarty, P. et al.",
    journal: "British Journal of Nutrition", 
    year: 2004
  },
  {
    title: "Relative Age Effects in Education",
    authors: "Bedard, K. & Dhuey, E.",
    journal: "Quarterly Journal of Economics",
    year: 2006
  }
];

export function RecommendationPanel({ 
  recommendations, 
  analysis 
}: RecommendationPanelProps) {
  
  const getRecommendationIcon = (recommendation: string) => {
    if (recommendation.includes('⚠️ CRITICAL')) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    if (recommendation.includes('vitamin') || recommendation.includes('supplement')) {
      return <Heart className="h-4 w-4 text-red-500" />;
    }
    if (recommendation.includes('delay') || recommendation.includes('consider')) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    if (recommendation.includes('monitor') || recommendation.includes('precaution')) {
      return <Shield className="h-4 w-4 text-blue-500" />;
    }
    if (recommendation.includes('school') || recommendation.includes('education')) {
      return <BookOpen className="h-4 w-4 text-purple-500" />;
    }
    if (recommendation.includes('cardiovascular') || recommendation.includes('heart')) {
      return <Activity className="h-4 w-4 text-pink-500" />;
    }
    if (recommendation.includes('mental') || recommendation.includes('cognitive')) {
      return <Brain className="h-4 w-4 text-indigo-500" />;
    }
    if (recommendation.includes('infection') || recommendation.includes('immune')) {
      return <Shield className="h-4 w-4 text-orange-500" />;
    }
    if (recommendation.includes('Excellent') || recommendation.includes('Optimal')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Info className="h-4 w-4 text-gray-500" />;
  };

  const getOverallRecommendation = () => {
    const score = analysis.overallScore;
    if (score >= 80) {
      return {
        type: 'positive' as const,
        icon: <CheckCircle className="h-6 w-6 text-green-600" />,
        title: 'Excellent Timing',
        description: 'This appears to be an optimal time period with minimal risk factors and good long-term outcomes.'
      };
    } else if (score >= 60) {
      return {
        type: 'neutral' as const,
        icon: <Lightbulb className="h-6 w-6 text-yellow-600" />,
        title: 'Good Timing with Considerations',
        description: 'This is a reasonable time period, but some risk factors should be addressed through preparation and care.'
      };
    } else {
      return {
        type: 'warning' as const,
        icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
        title: 'Suboptimal Timing',
        description: 'Consider delaying or taking additional precautions due to multiple risk factors identified.'
      };
    }
  };

  const overallRec = getOverallRecommendation();
  const criticalRecommendations = recommendations.filter(r => r.includes('⚠️ CRITICAL'));
  const normalRecommendations = recommendations.filter(r => !r.includes('⚠️ CRITICAL'));

  return (
    <div className="space-y-8">
      {/* Overall Assessment */}
      <Alert className={`border-l-4 p-6 ${
        overallRec.type === 'positive' ? 'border-green-500 bg-muted/20' :
        overallRec.type === 'neutral' ? 'border-yellow-500 bg-muted/20' :
        'border-red-500 bg-muted/20'
      }`}>
        <div className="flex items-center gap-4">
          {overallRec.icon}
          <div className="flex-1 space-y-2">
            <div className="font-semibold text-xl">{overallRec.title}</div>
            <AlertDescription className="text-base leading-relaxed max-w-none">
              {overallRec.description}
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* Critical Alerts */}
      {criticalRecommendations.length > 0 && (
        <Alert className="border-destructive/50 bg-destructive/10 p-6">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <div className="space-y-3">
            <div className="font-semibold text-lg text-destructive">Critical Considerations</div>
            <div className="space-y-3">
              {criticalRecommendations.map((rec, index) => (
                <AlertDescription key={index} className="text-base text-destructive leading-relaxed">
                  • {rec.replace('⚠️ CRITICAL: ', '')}
                </AlertDescription>
              ))}
            </div>
          </div>
        </Alert>
      )}

      {/* Main Recommendations */}
      {normalRecommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-6">
            <CardTitle className="text-xl flex items-center gap-3">
              <Lightbulb className="h-6 w-6" />
              Personalized Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {normalRecommendations.map((rec, index) => (
              <div 
                key={index} 
                className="flex items-start gap-4 p-4 rounded-lg bg-muted/20 border border-muted hover:bg-muted/30 transition-colors"
              >
                <div className="mt-1">{getRecommendationIcon(rec)}</div>
                <p className="text-base flex-1 leading-relaxed">{rec}</p>
              </div>
            ))}
            
            {normalRecommendations.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <p className="text-lg">No additional recommendations needed</p>
                <p className="text-sm">This timing appears optimal with minimal concerns</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Summary */}
      <Card>
        <CardHeader className="pb-6">
          <CardTitle className="text-xl flex items-center gap-3">
            <TrendingUp className="h-6 w-6" />
            Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-muted/30 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-semibold text-primary">Solar Activity</span>
                <Badge 
                  variant={analysis.solarData.solarRisk === 'HIGH' ? 'destructive' : 
                         analysis.solarData.solarRisk === 'MEDIUM' ? 'secondary' : 'default'}
                  className="text-sm"
                >
                  {analysis.solarData.solarRisk}
                </Badge>
              </div>
              <div className="text-base text-foreground mb-1">
                {analysis.solarData.sunspotNumber} sunspots detected
              </div>
              <div className="text-sm text-muted-foreground">
                Lifespan impact: {analysis.solarData.lifespanImpact > 0 ? '+' : ''}{analysis.solarData.lifespanImpact.toFixed(1)} years
              </div>
            </div>
            
            <div className="p-5 bg-muted/30 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-semibold text-primary">Seasonal Factors</span>
                <Badge variant="outline" className="text-sm">
                  {analysis.seasonalData.overallSeasonalScore}/100
                </Badge>
              </div>
              <div className="text-base text-foreground mb-1">
                {analysis.seasonalData.overallSeasonalScore >= 70 ? 'Excellent' :
                 analysis.seasonalData.overallSeasonalScore >= 50 ? 'Good' : 'Challenging'} seasonal timing
              </div>
              <div className="text-sm text-muted-foreground">
                Vitamin D synthesis: {analysis.seasonalData.vitaminDScore}/100
              </div>
            </div>
            
            <div className="p-5 bg-muted/30 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-semibold text-primary">Risk Assessment</span>
                <Badge 
                  variant={analysis.riskFactors.length <= 2 ? 'default' : 
                         analysis.riskFactors.length <= 4 ? 'secondary' : 'destructive'}
                  className="text-sm"
                >
                  {analysis.riskFactors.length} factors
                </Badge>
              </div>
              <div className="text-base text-foreground mb-1">
                {analysis.riskFactors.length === 0 ? 'No significant risks' :
                 analysis.riskFactors.length <= 2 ? 'Low risk profile' :
                 analysis.riskFactors.length <= 4 ? 'Moderate risk profile' : 'High risk profile'}
              </div>
              <div className="text-sm text-muted-foreground">
                Overall score: {analysis.overallScore}/100
              </div>
            </div>
            
            <div className="p-5 bg-muted/30 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-semibold text-primary">Analysis Confidence</span>
                <Badge 
                  variant={analysis.confidenceLevel === 'HIGH' ? 'default' : 
                         analysis.confidenceLevel === 'MEDIUM' ? 'secondary' : 'outline'}
                  className="text-sm"
                >
                  {analysis.confidenceLevel}
                </Badge>
              </div>
              <div className="text-base text-foreground mb-1">
                {analysis.confidenceLevel === 'HIGH' ? 'High confidence in results' :
                 analysis.confidenceLevel === 'MEDIUM' ? 'Moderate confidence level' : 'Limited confidence'}
              </div>
              <div className="text-sm text-muted-foreground">
                Based on multiple data sources
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scientific References */}
      <Card>
        <CardHeader className="pb-6">
          <CardTitle className="text-xl flex items-center gap-3">
            <BookOpen className="h-6 w-6" />
            Scientific Foundation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {SCIENTIFIC_REFERENCES.map((ref, index) => (
              <div 
                key={index} 
                className="p-4 bg-muted/20 rounded-lg border hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="text-base font-medium">{ref.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {ref.authors}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ref.journal} ({ref.year})
                    </div>
                  </div>
                  {ref.url && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 flex-shrink-0"
                      onClick={() => window.open(ref.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Medical Disclaimer */}
      <Alert className="bg-muted/20 border-muted">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm text-muted-foreground">
          <strong>Medical Disclaimer:</strong> These recommendations are based on population-level 
          statistical correlations and should not replace professional medical advice. Individual 
          circumstances vary significantly. Always consult healthcare providers for personal decisions.
        </AlertDescription>
      </Alert>
    </div>
  );
}