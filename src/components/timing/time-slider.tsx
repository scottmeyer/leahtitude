'use client';

import { useState, useEffect } from 'react';
import { addMonths, format, getMonth, getYear } from 'date-fns';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TimeSliderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  range?: number; // months before/after current date
  scores?: Array<{ date: Date; score: number }>;
}

interface MonthData {
  date: Date;
  label: string;
  monthsFromCurrent: number;
  score?: number;
  trend?: 'up' | 'down' | 'stable';
}

export function TimeSlider({ 
  currentDate, 
  onDateChange, 
  range = 24,
  scores = []
}: TimeSliderProps) {
  const [selectedMonth, setSelectedMonth] = useState(currentDate);
  const [monthsData, setMonthsData] = useState<MonthData[]>([]);

  useEffect(() => {
    const data: MonthData[] = [];
    
    for (let i = -range; i <= range; i++) {
      const date = addMonths(currentDate, i);
      const scoreData = scores.find(s => 
        getMonth(s.date) === getMonth(date) && 
        getYear(s.date) === getYear(date)
      );
      
      data.push({
        date,
        label: format(date, 'MMM yyyy'),
        monthsFromCurrent: i,
        score: scoreData?.score,
        trend: calculateTrend(i, scores)
      });
    }
    
    setMonthsData(data);
  }, [currentDate, range, scores]);

  const calculateTrend = (monthOffset: number, scores: Array<{ date: Date; score: number }>): 'up' | 'down' | 'stable' => {
    if (scores.length < 2) return 'stable';
    
    const currentScore = scores.find(s => {
      const testDate = addMonths(currentDate, monthOffset);
      return getMonth(s.date) === getMonth(testDate) && getYear(s.date) === getYear(testDate);
    })?.score;
    
    const prevScore = scores.find(s => {
      const testDate = addMonths(currentDate, monthOffset - 1);
      return getMonth(s.date) === getMonth(testDate) && getYear(s.date) === getYear(testDate);
    })?.score;
    
    if (!currentScore || !prevScore) return 'stable';
    
    const diff = currentScore - prevScore;
    if (diff > 5) return 'up';
    if (diff < -5) return 'down';
    return 'stable';
  };

  const handleSliderChange = (value: number[]) => {
    const monthOffset = value[0];
    const newDate = addMonths(currentDate, monthOffset);
    setSelectedMonth(newDate);
    onDateChange(newDate);
  };

  const getCurrentScore = () => {
    const current = monthsData.find(m => 
      getMonth(m.date) === getMonth(selectedMonth) && 
      getYear(m.date) === getYear(selectedMonth)
    );
    return current?.score;
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-500';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score?: number) => {
    if (!score) return 'Unknown';
    if (score >= 80) return 'Optimal';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
      default: return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const currentScore = getCurrentScore();
  const monthsFromCurrent = Math.round(
    (selectedMonth.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Birth Timing Selection</h3>
            </div>
            <Badge 
              variant={currentScore && currentScore >= 70 ? 'default' : 'secondary'}
              className={`${getScoreColor(currentScore)} text-white`}
            >
              {getScoreLabel(currentScore)}
            </Badge>
          </div>

          {/* Selected Date Display */}
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-primary">
              {format(selectedMonth, 'MMMM yyyy')}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>
                {monthsFromCurrent === 0 ? 'Current month' : 
                 monthsFromCurrent > 0 ? `${monthsFromCurrent} months ahead` :
                 `${Math.abs(monthsFromCurrent)} months ago`}
              </span>
              {getCurrentScore() && getTrendIcon(monthsData.find(m => 
                getMonth(m.date) === getMonth(selectedMonth) && 
                getYear(m.date) === getYear(selectedMonth)
              )?.trend)}
            </div>
            {currentScore && (
              <div className="text-sm">
                <span className="font-medium">Optimality Score: </span>
                <span className={`font-bold ${
                  currentScore >= 80 ? 'text-green-600' :
                  currentScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {currentScore}/100
                </span>
              </div>
            )}
          </div>

          {/* Time Slider */}
          <div className="space-y-4">
            <Slider
              value={[monthsFromCurrent]}
              onValueChange={handleSliderChange}
              min={-range}
              max={range}
              step={1}
              className="w-full"
            />
            
            {/* Range Labels */}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{format(addMonths(currentDate, -range), 'MMM yyyy')}</span>
              <span>Today</span>
              <span>{format(addMonths(currentDate, range), 'MMM yyyy')}</span>
            </div>
          </div>

          {/* Score Visualization */}
          {scores.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Monthly Scores</h4>
              <div className="grid grid-cols-12 gap-1">
                {monthsData.slice(range - 6, range + 7).map((month, index) => {
                  const isSelected = getMonth(month.date) === getMonth(selectedMonth) && 
                                   getYear(month.date) === getYear(selectedMonth);
                  const score = month.score || 0;
                  const height = Math.max(8, (score / 100) * 32);
                  
                  return (
                    <div key={index} className="flex flex-col items-center gap-1">
                      <div 
                        className={`w-full rounded-sm cursor-pointer transition-all ${
                          isSelected ? 'ring-2 ring-primary' : ''
                        } ${getScoreColor(score)}`}
                        style={{ height: `${height}px` }}
                        onClick={() => {
                          setSelectedMonth(month.date);
                          onDateChange(month.date);
                        }}
                        title={`${month.label}: ${score}/100`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {format(month.date, 'MMM')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Navigation */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => {
                const newDate = addMonths(currentDate, -12);
                setSelectedMonth(newDate);
                onDateChange(newDate);
              }}
              className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
            >
              -1 Year
            </button>
            <button
              onClick={() => {
                const newDate = addMonths(currentDate, -6);
                setSelectedMonth(newDate);
                onDateChange(newDate);
              }}
              className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
            >
              -6 Months
            </button>
            <button
              onClick={() => {
                setSelectedMonth(currentDate);
                onDateChange(currentDate);
              }}
              className="px-3 py-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => {
                const newDate = addMonths(currentDate, 6);
                setSelectedMonth(newDate);
                onDateChange(newDate);
              }}
              className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
            >
              +6 Months
            </button>
            <button
              onClick={() => {
                const newDate = addMonths(currentDate, 12);
                setSelectedMonth(newDate);
                onDateChange(newDate);
              }}
              className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
            >
              +1 Year
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}