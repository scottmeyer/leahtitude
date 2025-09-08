'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Activity, PieChart as PieChartIcon } from 'lucide-react';
import { OptimalTimingResult } from '@/lib/optimal-timing';

interface FullWidthAnalysisProps {
  analysis?: OptimalTimingResult;
  monthlyData: Array<{ date: Date; score: number; lifeExpectancyDelta?: number }>;
  isLoading?: boolean;
}

interface ChartDataPoint {
  month: string;
  score: number;
  lifespanImpact: number;
  lifeExpectancyDelta: number;
  date: Date;
}

const COLORS = {
  solar: '#f59e0b',
  seasonal: '#10b981', 
  geographic: '#3b82f6',
  environmental: '#8b5cf6'
};

export function FullWidthAnalysis({ analysis, monthlyData, isLoading }: FullWidthAnalysisProps) {
  // Transform data for the life expectancy chart
  const chartData: ChartDataPoint[] = monthlyData.map(item => ({
    month: format(item.date, 'MMM yy'),
    score: item.score,
    lifespanImpact: calculateLifespanImpactForScore(item.score),
    lifeExpectancyDelta: item.lifeExpectancyDelta || 0,
    date: item.date
  }));

  function calculateLifespanImpactForScore(score: number): number {
    const baseline = 78.5; // Average lifespan
    // More sophisticated impact calculation based on research
    // Higher scores have exponential benefits, lower scores have steeper penalties
    const normalizedScore = (score - 50) / 50; // -1 to 1 range
    const impact = normalizedScore > 0 
      ? normalizedScore * 2.5 // Up to +2.5 years for perfect scores
      : normalizedScore * 3.2; // Up to -3.2 years for worst scores
    return Math.round((baseline + impact) * 10) / 10;
  }

  // Prepare data for category breakdown
  const categoryData = [
    { name: 'Solar', value: 40, color: COLORS.solar, score: analysis ? 100 - Math.abs(analysis.solarData.lifespanImpact) * 15 : 0 },
    { name: 'Seasonal', value: 35, color: COLORS.seasonal, score: analysis?.seasonalData.overallSeasonalScore || 0 },
    { name: 'Geographic', value: 15, color: COLORS.geographic, score: 75 },
    { name: 'Environmental', value: 10, color: COLORS.environmental, score: 75 }
  ];

  // Prepare risk factor data with proper scaling and validation
  const riskFactorData = analysis?.riskFactors.map(factor => ({
    name: factor.name.length > 25 ? factor.name.substring(0, 25) + '...' : factor.name,
    impact: factor.impact, // Use actual value
    displayImpact: Math.abs(factor.impact), // For bar length
    positive: factor.impact > 0,
    severity: factor.severity,
    category: factor.category,
    fullName: factor.name, // Store full name for tooltip
    description: factor.description
  })).sort((a, b) => {
    // Sort by impact value (positive first, then negative)
    if (a.positive !== b.positive) return b.positive ? 1 : -1;
    return b.displayImpact - a.displayImpact;
  }) || [];

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: ChartDataPoint }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label || data.month}</p>
          <p className="text-sm text-primary">
            Optimality: {data.score}/100
          </p>
          <p className="text-sm text-muted-foreground">
            Life Expectancy Impact: {data.lifeExpectancyDelta >= 0 ? '+' : ''}{data.lifeExpectancyDelta.toFixed(2)} years
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; fill: string; score?: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-primary">
            Weight: {data.value}%
          </p>
          {data.score !== undefined && (
            <p className="text-sm text-muted-foreground">
              Score: {Math.round(data.score)}/100
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Risk Factor Analysis & Life Expectancy Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-64 bg-muted rounded-lg"></div>
              <div className="h-64 bg-muted rounded-lg"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis || monthlyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Risk Factor Analysis & Life Expectancy Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <Activity className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <p className="text-lg font-medium">Analysis Pending</p>
              <p className="text-muted-foreground">
                Select location to view detailed risk analysis and life expectancy projections
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const bestScore = Math.max(...chartData.map(d => d.score));
  const worstScore = Math.min(...chartData.map(d => d.score));
  const bestDelta = Math.max(...chartData.map(d => d.lifeExpectancyDelta));
  const worstDelta = Math.min(...chartData.map(d => d.lifeExpectancyDelta));
  const currentData = chartData.find(d => 
    d.date.getTime() === analysis.birthDate.getTime()
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="h-6 w-6" />
              Risk Factor Analysis & Life Expectancy Impact
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              Comprehensive breakdown of health impacts and risk factor distribution
            </p>
          </div>
          <div className="flex items-center gap-2">
            {analysis.lifeExpectancyDelta > 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : analysis.lifeExpectancyDelta < 0 ? (
              <TrendingDown className="h-5 w-5 text-red-600" />
            ) : null}
            <Badge variant="outline" className="text-sm">
              {analysis.lifeExpectancyDelta >= 0 ? '+' : ''}{analysis.lifeExpectancyDelta} years
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Life Expectancy Chart */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Life Expectancy Trend
            </h3>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    fontSize={12}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    domain={(() => {
                      const values = chartData.map(d => d.lifeExpectancyDelta);
                      const min = Math.min(...values);
                      const max = Math.max(...values);
                      const range = max - min;
                      const padding = Math.max(0.2, range * 0.2); // At least 0.2 year padding
                      return [
                        (min - padding).toFixed(1), 
                        (max + padding).toFixed(1)
                      ];
                    })()}
                    fontSize={12}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickFormatter={(value) => `${value >= 0 ? '+' : ''}${Number(value).toFixed(1)}y`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Zero reference line */}
                  <ReferenceLine 
                    y={0} 
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    opacity={0.5}
                  />
                  
                  {currentData && (
                    <ReferenceLine 
                      x={currentData.month} 
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  )}
                  
                  <Line
                    type="monotone"
                    dataKey="lifeExpectancyDelta"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Key Insights */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">
                  {bestDelta >= 0 ? '+' : ''}{bestDelta.toFixed(1)}y
                </div>
                <div className="text-xs text-muted-foreground">
                  Best Impact
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">
                  {analysis.lifeExpectancyDelta >= 0 ? '+' : ''}{analysis.lifeExpectancyDelta.toFixed(1)}y
                </div>
                <div className="text-xs text-muted-foreground">
                  Selected
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-600">
                  {worstDelta >= 0 ? '+' : ''}{worstDelta.toFixed(1)}y
                </div>
                <div className="text-xs text-muted-foreground">
                  Worst Impact
                </div>
              </div>
            </div>
          </div>

          {/* Risk Factor Distribution */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Risk Factor Distribution
            </h3>
            
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
        </div>

        {/* Identified Risk Factors */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Identified Risk Factors</h3>
            <div className="text-sm text-muted-foreground">
              {riskFactorData.filter(f => f.positive).length} beneficial • {riskFactorData.filter(f => !f.positive).length} harmful
            </div>
          </div>
          
          {riskFactorData.length === 0 ? (
            <div className="h-32 flex items-center justify-center bg-muted/20 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">No significant risk factors identified</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This indicates optimal timing with minimal identifiable risks
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Positive Factors */}
              {riskFactorData.filter(f => f.positive).length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-green-600 uppercase tracking-wider">Beneficial Factors</div>
                  {riskFactorData.filter(f => f.positive).map((factor, idx) => (
                    <div key={`pos-${idx}`} className="flex items-center gap-3">
                      <div className="w-32 text-sm text-right truncate">
                        {factor.name}
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 max-w-md">
                          <div 
                            className="h-6 bg-green-500 rounded-r-md transition-all"
                            style={{ width: `${Math.min(factor.displayImpact * 2, 100)}%` }}
                          />
                        </div>
                        <div className="text-sm font-medium text-green-600 w-10">
                          +{factor.displayImpact}
                        </div>
                        <Badge 
                          variant={factor.severity === 'HIGH' ? 'destructive' : factor.severity === 'MEDIUM' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {factor.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Divider */}
              {riskFactorData.filter(f => f.positive).length > 0 && riskFactorData.filter(f => !f.positive).length > 0 && (
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-2 text-xs text-muted-foreground">0</span>
                  </div>
                </div>
              )}
              
              {/* Negative Factors */}
              {riskFactorData.filter(f => !f.positive).length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-red-600 uppercase tracking-wider">Risk Factors</div>
                  {riskFactorData.filter(f => !f.positive).map((factor, idx) => (
                    <div key={`neg-${idx}`} className="flex items-center gap-3">
                      <div className="w-32 text-sm text-right truncate">
                        {factor.name}
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 max-w-md">
                          <div 
                            className="h-6 bg-red-500 rounded-r-md transition-all"
                            style={{ width: `${Math.min(factor.displayImpact * 2, 100)}%` }}
                          />
                        </div>
                        <div className="text-sm font-medium text-red-600 w-10">
                          -{factor.displayImpact}
                        </div>
                        <Badge 
                          variant={factor.severity === 'HIGH' ? 'destructive' : factor.severity === 'MEDIUM' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {factor.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Risk Summary */}
        <div className="p-4 bg-muted/20 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-medium">Risk Assessment Summary</span>
            <div className="flex gap-2">
              {['HIGH', 'MEDIUM', 'LOW'].map(level => {
                const count = analysis.riskFactors.filter(f => f.severity === level).length;
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
          
          <div className="text-sm text-muted-foreground">
            {analysis.riskFactors.length === 0 
              ? 'No significant risk factors identified for this timing period.'
              : `${analysis.riskFactors.length} risk factor${analysis.riskFactors.length > 1 ? 's' : ''} identified. Consider recommendations below to mitigate potential impacts.`
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}