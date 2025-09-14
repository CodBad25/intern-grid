
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileOptimizedCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function MobileOptimizedCard({ 
  title, 
  description, 
  children, 
  className,
  compact = false 
}: MobileOptimizedCardProps) {
  const isMobile = useIsMobile();

  return (
    <Card className={cn(
      'transition-all duration-200',
      isMobile ? 'rounded-lg shadow-sm' : 'rounded-xl shadow-soft hover:shadow-medium',
      className
    )}>
      {(title || description) && (
        <CardHeader className={cn(
          compact || isMobile ? 'pb-3 px-4 pt-4' : 'pb-6'
        )}>
          {title && (
            <CardTitle className={cn(
              isMobile ? 'text-lg' : 'text-xl'
            )}>
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className={cn(
              isMobile ? 'text-sm' : 'text-base'
            )}>
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={cn(
        compact || isMobile ? 'px-4 pb-4' : 'px-6 pb-6'
      )}>
        {children}
      </CardContent>
    </Card>
  );
}
