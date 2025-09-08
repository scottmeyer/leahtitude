'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Sun, Snowflake } from 'lucide-react';
import { RiskFactor } from '@/lib/optimal-timing';

interface RiskBreakdownChartProps {
  riskFactors: RiskFactor[];
  solarData: {
    sunspotNumber: number;
    solarRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    lifespanImpact: number;
    uvRadiationLevel: number;
  };
  seasonalData: {
    vitaminDScore: number;
    infectiousRisk: number;
    relativeAgeAdvantage: number;
    overallSeasonalScore: number;
  };
}

const COLORS = {
  solar: '#f59e0b',
  seasonal: '#10b981', 
  geographic: '#3b82f6',
  environmental: '#8b5cf6'
};

const RISK_COLORS = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b', 
  HIGH: '#ef4444'
};

export function RiskBreakdownChart({ 
  riskFactors, 
  solarData, 
  seasonalData 
}: RiskBreakdownChartProps) {
  
  // Prepare data for risk factor chart
  const riskFactorData = riskFactors.map(factor => ({
    name: factor.name,
    impact: Math.abs(factor.impact),
    positive: factor.impact > 0,
    severity: factor.severity,
    category: factor.category
  }));

  // Prepare data for category breakdown
  const categoryData = [
    { name: 'Solar', value: 40, color: COLORS.solar, score: 100 - Math.abs(solarData.lifespanImpact) * 15 },
    { name: 'Seasonal', value: 35, color: COLORS.seasonal, score: seasonalData.overallSeasonalScore },
    { name: 'Geographic', value: 15, color: COLORS.geographic, score: 75 },
    { name: 'Environmental', value: 10, color: COLORS.environmental, score: 75 }
  ];

  // Detailed metrics data
  const detailedMetrics = [
    {
      category: 'Solar Activity',
      icon: Sun,
      metrics: [
        { name: 'Sunspot Number', value: solarData.sunspotNumber, max: 200, unit: '' },
        { name: 'UV Radiation', value: solarData.uvRadiationLevel, max: 11, unit: '' },
        { name: 'Lifespan Impact', value: Math.abs(solarData.lifespanImpact), max: 10, unit: 'years', negative: solarData.lifespanImpact < 0 }
      ]
    },
    {
      category: 'Seasonal Factors',
      icon: Snowflake,
      metrics: [
        { name: 'Vitamin D Score', value: seasonalData.vitaminDScore, max: 100, unit: '/100' },
        { name: 'Infection Risk', value: seasonalData.infectiousRisk, max: 100, unit: '/100', negative: true },
        { name: 'Age Advantage', value: seasonalData.relativeAgeAdvantage, max: 100, unit: '/100' }
      ]
    }
  ];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; impact: number; severity: string; description: string } }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className={`text-sm ${data.positive ? 'text-green-600' : 'text-red-600'}`}>
            Impact: {data.positive ? '+' : '-'}{data.impact}
          </p>
          <p className="text-sm text-muted-foreground">
            Severity: {data.severity}
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; fill: string } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-primary">
            Weight: {data.value}%
          </p>
          <p className="text-sm text-muted-foreground">
            Score: {Math.round(data.score)}/100
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Risk Factor Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Category Weight Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Analysis Weight Distribution
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Factors Impact */}
        {riskFactorData.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Identified Risk Factors
            </h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskFactorData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    type="number" 
                    fontSize={12}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    fontSize={10}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="impact" 
                    fill={COLORS.solar}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Detailed Metrics */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Detailed Metrics
          </h4>
          
          {detailedMetrics.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{category.category}</span>
                </div>
                
                <div className="space-y-2 ml-6">
                  {category.metrics.map((metric) => (
                    <div key={metric.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {metric.name}
                        </span>
                        <span className={`text-xs font-medium ${
                          metric.negative ? 'text-red-600' : 'text-primary'
                        }`}>
                          {metric.value}{metric.unit}
                        </span>
                      </div>
                      <Progress 
                        value={(metric.value / metric.max) * 100}
                        className="h-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Risk Summary */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Risk Summary</span>
            <div className="flex gap-1">
              {['HIGH', 'MEDIUM', 'LOW'].map(level => {
                const count = riskFactors.filter(f => f.severity === level).length;
                return count > 0 ? (
                  <Badge 
                    key={level}
                    variant={level === 'HIGH' ? 'destructive' : 
                           level === 'MEDIUM' ? 'secondary' : 'default'}
                    className="text-xs"
                  >
                    {count} {level}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {riskFactors.length === 0 
              ? 'No significant risk factors identified'
              : `${riskFactors.length} risk factor${riskFactors.length > 1 ? 's' : ''} identified`
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}