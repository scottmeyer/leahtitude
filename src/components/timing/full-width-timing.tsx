'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Target } from 'lucide-react';
import { TimeSlider } from './time-slider';
import { addMonths, format } from 'date-fns';

interface FullWidthTimingProps {
  currentDate: Date;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  scores: Array<{ date: Date; score: number }>;
  range?: number;
  isLoading?: boolean;
}

export function FullWidthTiming({ 
  currentDate,
  selectedDate,
  onDateChange, 
  scores,
  range = 24,
  isLoading = false
}: FullWidthTimingProps) {
  
  const getScoreForDate = (date: Date) => {
    return scores.find(s => 
      s.date.getMonth() === date.getMonth() && 
      s.date.getFullYear() === date.getFullYear()
    )?.score;
  };

  const handleQuickNavigation = (monthsOffset: number) => {
    const newDate = addMonths(currentDate, monthsOffset);
    onDateChange(newDate);
  };

  const getQuickNavButtons = () => [
    { label: '-2 Years', months: -24 },
    { label: '-1 Year', months: -12 },
    { label: '-6 Months', months: -6 },
    { label: 'Today', months: 0 },
    { label: '+6 Months', months: 6 },
    { label: '+1 Year', months: 12 },
    { label: '+2 Years', months: 24 }
  ];

  const currentScore = getScoreForDate(selectedDate);
  const monthsFromToday = Math.round(
    (selectedDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );

  // Find optimal months in the range
  const optimalMonths = scores
    .filter(s => s.score >= 80)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score?: number) => {
    if (!score) return 'outline';
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Birth Timing Selection
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              Select your desired conception or birth month to analyze optimal timing
            </p>
          </div>
          <div className="text-right min-h-[60px] flex flex-col justify-center">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-6 bg-muted rounded animate-pulse w-20 ml-auto"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-24 ml-auto"></div>
              </div>
            ) : currentScore ? (
              <div>
                <Badge 
                  variant="outline" 
                  className={`mb-2 min-w-[100px] justify-center ${
                    currentScore >= 80 ? 'border-green-500 text-green-700 bg-green-50' :
                    currentScore >= 60 ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                    'border-red-500 text-red-700 bg-red-50'
                  }`}
                >
                  Score: {currentScore.toString().padStart(2, ' ')}/100
                </Badge>
                <div className="text-sm text-muted-foreground">
                  {monthsFromToday === 0 ? 'Current month' : 
                   monthsFromToday > 0 ? `${monthsFromToday} months ahead` :
                   `${Math.abs(monthsFromToday)} months ago`}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selected Date Display */}
        <div className="text-center">
          <div className="px-6 py-2 bg-primary/10 rounded-lg mb-4">
            <div className="text-2xl font-bold text-primary">
              {format(selectedDate, 'MMMM yyyy')}
            </div>
          </div>

          <div className="min-h-[28px] flex justify-center items-center">
            {isLoading ? (
              <div className="h-6 bg-muted rounded animate-pulse w-48"></div>
            ) : currentScore ? (
              <div className={`text-lg font-semibold ${getScoreColor(currentScore)}`}>
                Optimality Score: {currentScore}/100
              </div>
            ) : null}
          </div>
        </div>

        {/* Time Slider */}
        <div className="bg-muted/30 rounded-lg p-4">
          <TimeSlider
            currentDate={currentDate}
            onDateChange={onDateChange}
            scores={scores}
            range={range}
          />
        </div>

        {/* Quick Navigation */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Quick Navigation</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {getQuickNavButtons().map((btn) => (
              <Button
                key={btn.label}
                variant={btn.months === 0 ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickNavigation(btn.months)}
                className="text-xs"
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Optimal Periods Suggestion */}
        {optimalMonths.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Recommended Optimal Periods
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {optimalMonths.map((optimal, index) => (
                <button
                  key={index}
                  onClick={() => onDateChange(optimal.date)}
                  className="p-3 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
                >
                  <div className="font-medium text-green-800">
                    {format(optimal.date, 'MMMM yyyy')}
                  </div>
                  <div className="text-sm text-green-600">
                    Score: {optimal.score}/100
                  </div>
                  <div className="text-xs text-green-500 mt-1">
                    #{index + 1} Best Option
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current Selection Summary */}
        <div className="bg-muted/20 rounded-lg p-4 min-h-[80px]">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold min-h-[32px] flex items-center justify-center">
                {isLoading ? (
                  <div className="h-8 bg-muted rounded animate-pulse w-12"></div>
                ) : scores.length > 0 ? (
                  <span className="text-green-600">{Math.max(...scores.map(s => s.score))}</span>
                ) : (
                  <span className="text-muted-foreground">--</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">Best Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold min-h-[32px] flex items-center justify-center">
                {isLoading ? (
                  <div className="h-8 bg-muted rounded animate-pulse w-12"></div>
                ) : (
                  <span className={getScoreColor(currentScore)}>
                    {currentScore || '--'}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">Current Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold min-h-[32px] flex items-center justify-center">
                {isLoading ? (
                  <div className="h-8 bg-muted rounded animate-pulse w-12"></div>
                ) : scores.length > 0 ? (
                  <span className="text-red-600">{Math.min(...scores.map(s => s.score))}</span>
                ) : (
                  <span className="text-muted-foreground">--</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">Worst Score</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}