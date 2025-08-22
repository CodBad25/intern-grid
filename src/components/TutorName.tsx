
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TutorNameProps {
  name: string;
  userId?: string;
  color?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'badge' | 'text' | 'inline';
  className?: string;
}

export function TutorName({ 
  name, 
  userId, 
  color = 'hsl(220, 90%, 56%)', 
  size = 'default',
  variant = 'text',
  className 
}: TutorNameProps) {
  const sizeClasses = {
    sm: 'text-sm',
    default: 'text-base',
    lg: 'text-lg'
  };

  // Fallback pour les noms vides ou inconnus
  const displayName = name && name !== 'Utilisateur inconnu' && name.trim() 
    ? name 
    : 'Utilisateur';

  if (variant === 'badge') {
    return (
      <Badge 
        className={cn('text-white border-0', className)}
        style={{ backgroundColor: color }}
      >
        {displayName}
      </Badge>
    );
  }

  if (variant === 'inline') {
    return (
      <span 
        className={cn('font-medium', sizeClasses[size], className)}
        style={{ color }}
      >
        {displayName}
      </span>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div 
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span 
        className={cn('font-medium', sizeClasses[size])} 
        style={{ color }}
      >
        {displayName}
      </span>
    </div>
  );
}
