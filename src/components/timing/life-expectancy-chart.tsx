'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { OptimalTimingResult } from '@/lib/optimal-timing';

interface LifeExpectancyVisualizationProps {
  analysis: OptimalTimingResult;
  monthlyData: Array<{ date: Date; score: number }>;
}

interface ChartDataPoint {
  month: string;
  score: number;
  lifespanImpact: number;
  date: Date;
}

export function LifeExpectancyVisualization({ 
  analysis, 
  monthlyData 
}: LifeExpectancyVisualizationProps) {
  
  // Transform data for the chart
  const chartData: ChartDataPoint[] = monthlyData.map(item => ({
    month: format(item.date, 'MMM yy'),
    score: item.score,
    lifespanImpact: calculateLifespanImpactForScore(item.score),
    date: item.date
  }));

  function calculateLifespanImpactForScore(score: number): number {
    // Simplified calculation - in reality would use the full analysis
    const baseline = 78; // Average lifespan
    const impact = (score - 50) * 0.1; // 0.1 years per 10 points
    return Math.round((baseline + impact) * 10) / 10;
  }

  const currentData = chartData.find(d => 
    d.date.getTime() === analysis.birthDate.getTime()
  );

  const bestScore = Math.max(...chartData.map(d => d.score));
  const worstScore = Math.min(...chartData.map(d => d.score));
  
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
            Est. Lifespan: {data.lifespanImpact} years
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Life Expectancy Impact</CardTitle>
          <div className="flex items-center gap-2">
            {analysis.lifeExpectancyDelta > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : analysis.lifeExpectancyDelta < 0 ? (
              <TrendingDown className="h-4 w-4 text-red-600" />
            ) : null}
            <Badge variant="outline" className="text-xs">
              {analysis.lifeExpectancyDelta >= 0 ? '+' : ''}{analysis.lifeExpectancyDelta} years
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart */}
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
                domain={[Math.max(0, worstScore - 10), Math.min(100, bestScore + 10)]}
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Reference line for current selection */}
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
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-600">
              {bestScore}
            </div>
            <div className="text-xs text-muted-foreground">
              Best Score
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">
              {analysis.overallScore}
            </div>
            <div className="text-xs text-muted-foreground">
              Current
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-2xl font-bold text-red-600">
              {worstScore}
            </div>
            <div className="text-xs text-muted-foreground">
              Worst Score
            </div>
          </div>
        </div>

        {/* Solar Cycle Context */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Solar Activity</span>
            <Badge 
              variant={analysis.solarData.solarRisk === 'HIGH' ? 'destructive' : 
                     analysis.solarData.solarRisk === 'MEDIUM' ? 'secondary' : 'default'}
            >
              {analysis.solarData.solarRisk}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Sunspot Number: {analysis.solarData.sunspotNumber}</div>
            <div>UV Radiation Level: {analysis.solarData.uvRadiationLevel}/11</div>
            {analysis.solarData.lifespanImpact !== 0 && (
              <div className={analysis.solarData.lifespanImpact > 0 ? 'text-green-600' : 'text-red-600'}>
                Solar Impact: {analysis.solarData.lifespanImpact} years
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}