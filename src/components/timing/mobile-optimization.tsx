'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileOptimizedViewProps {
  children: React.ReactNode[];
  labels: string[];
}

export function MobileOptimizedView({ children, labels }: MobileOptimizedViewProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) {
    return <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">{children}</div>;
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % children.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + children.length) % children.length);
  };

  return (
    <div className="space-y-4">
      {/* Mobile Navigation */}
      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-sm font-medium">
          {labels[currentIndex]} ({currentIndex + 1}/{children.length})
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={currentIndex === children.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Current View */}
      <div className="min-h-[400px]">
        {children[currentIndex]}
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2">
        {children.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-primary' : 'bg-muted'
            }`}
            aria-label={`Go to ${labels[index]}`}
          />
        ))}
      </div>
    </div>
  );
}

export function ResponsiveTabs({ 
  children, 
  labels,
  defaultValue 
}: { 
  children: React.ReactNode[];
  labels: string[];
  defaultValue: string;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <MobileOptimizedView labels={labels}>
        {children}
      </MobileOptimizedView>
    );
  }

  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        {labels.map((label, index) => (
          <TabsTrigger key={index} value={label.toLowerCase()}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {children.map((child, index) => (
        <TabsContent key={index} value={labels[index].toLowerCase()}>
          {child}
        </TabsContent>
      ))}
    </Tabs>
  );
}