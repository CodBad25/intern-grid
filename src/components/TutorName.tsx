
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TutorNameProps {
  name: string;
  userId?: string;
  color?: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'badge' | 'text' | 'inline';
  className?: string;
}

// Génère une couleur basée sur l'ID utilisateur pour la cohérence
const generateColorFromUserId = (userId?: string): string => {
  if (!userId) return 'hsl(220, 90%, 56%)';
  
  const colors = [
    'hsl(220, 90%, 56%)', // Bleu
    'hsl(142, 76%, 36%)', // Vert
    'hsl(346, 87%, 43%)', // Rouge
    'hsl(262, 83%, 58%)', // Violet
    'hsl(31, 81%, 56%)',  // Orange
    'hsl(193, 95%, 68%)', // Cyan
    'hsl(291, 64%, 42%)', // Magenta
    'hsl(54, 91%, 45%)',  // Jaune
  ];
  
  // Utilise les derniers caractères de l'ID pour générer un index
  const hash = userId.slice(-4).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export function TutorName({ 
  name, 
  userId, 
  color, 
  avatarUrl,
  size = 'default',
  variant = 'text',
  className 
}: TutorNameProps) {
  // Utilise la couleur fournie, sinon génère une couleur basée sur l'userId
  const finalColor = color || generateColorFromUserId(userId);
  const sizeClasses = {
    sm: 'text-sm',
    default: 'text-base',
    lg: 'text-lg'
  };

  const avatarSizeClasses = {
    sm: 'w-6 h-6',
    default: 'w-8 h-8', 
    lg: 'w-10 h-10'
  };

  const dotSizeClasses = {
    sm: 'w-3 h-3',
    default: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  // Fallback pour les noms vides ou inconnus
  const displayName = name && name !== 'Utilisateur inconnu' && name.trim() 
    ? name 
    : 'Utilisateur';

  if (variant === 'badge') {
    return (
      <Badge 
        className={cn('text-white border-0', className)}
        style={{ backgroundColor: finalColor }}
      >
        {displayName}
      </Badge>
    );
  }

  if (variant === 'inline') {
    return (
      <span 
        className={cn('font-medium', sizeClasses[size], className)}
        style={{ color: finalColor }}
      >
        {displayName}
      </span>
    );
  }

  // Génère les initiales pour l'avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderAvatar = () => {
    const initials = getInitials(displayName);
    
    // Si une photo/GIF existe, l'afficher
    if (avatarUrl && avatarUrl.trim()) {
      return (
        <div className="relative">
          <img 
            src={avatarUrl} 
            alt={`Avatar de ${displayName}`}
            className={cn(
              'rounded-full flex-shrink-0 object-cover border-2',
              avatarSizeClasses[size]
            )}
            style={{ borderColor: finalColor }}
            onError={(e) => {
              // En cas d'erreur de chargement, masquer l'image et afficher les initiales
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.parentElement?.querySelector('.initials-fallback') as HTMLElement;
              if (fallback) {
                fallback.style.display = 'flex';
              }
            }}
          />
          {/* Fallback avec initiales (caché par défaut) */}
          <div 
            className={cn(
              'initials-fallback absolute inset-0 rounded-full flex items-center justify-center text-white font-semibold hidden',
              avatarSizeClasses[size]
            )}
            style={{ backgroundColor: finalColor }}
          >
            <span className={cn(
              'text-center',
              size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
            )}>
              {initials}
            </span>
          </div>
        </div>
      );
    }
    
    // Sinon, afficher les initiales colorées
    return (
      <div 
        className={cn(
          'rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold',
          avatarSizeClasses[size]
        )}
        style={{ backgroundColor: finalColor }}
        title={displayName}
      >
        <span className={cn(
          'text-center',
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
        )}>
          {initials}
        </span>
      </div>
    );
  };

  // Pour la variante "text", on affiche l'avatar + nom
  // Pour les autres variantes, on garde le comportement existant
  if (variant === 'text') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {renderAvatar()}
        <span 
          className={cn('font-medium', sizeClasses[size])} 
          style={{ color: finalColor }}
        >
          {displayName}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {renderAvatar()}
      {/* Fallback caché pour les erreurs d'avatar */}
      {avatarUrl && (
        <div 
          className={cn('rounded-full flex-shrink-0 hidden', dotSizeClasses[size])}
          style={{ backgroundColor: finalColor }}
        />
      )}
      <span 
        className={cn('font-medium', sizeClasses[size])} 
        style={{ color: finalColor }}
      >
        {displayName}
      </span>
    </div>
  );
}
