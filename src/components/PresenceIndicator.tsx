
import React from 'react';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PresenceIndicatorProps {
  isOnline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PresenceIndicator({ 
  isOnline = false, 
  size = 'md',
  className 
}: PresenceIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <Circle 
      className={cn(
        sizeClasses[size],
        isOnline 
          ? 'fill-green-500 text-green-500' 
          : 'fill-gray-300 text-gray-300',
        className
      )}
    />
  );
}
