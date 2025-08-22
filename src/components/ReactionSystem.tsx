import React, { useState } from 'react';
import { Heart, ThumbsUp, ThumbsDown, Smile, Laugh, Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export type ReactionType = 'heart' | 'thumbs_up' | 'thumbs_down' | 'smile' | 'laugh' | 'frown';

export interface Reaction {
  id: string;
  type: ReactionType;
  userId: string;
  userName: string;
  createdAt: string;
}

interface ReactionSystemProps {
  targetId: string; // ID du commentaire ou de la réponse
  reactions: Reaction[];
  onAddReaction: (type: ReactionType) => void;
  onRemoveReaction: (reactionId: string) => void;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

const reactionConfig: Record<ReactionType, { icon: React.ComponentType<any>; label: string; color: string }> = {
  heart: {
    icon: Heart,
    label: 'J\'aime',
    color: 'text-red-500 hover:text-red-600',
  },
  thumbs_up: {
    icon: ThumbsUp,
    label: 'Pouce levé',
    color: 'text-green-500 hover:text-green-600',
  },
  thumbs_down: {
    icon: ThumbsDown,
    label: 'Pouce baissé',
    color: 'text-red-500 hover:text-red-600',
  },
  smile: {
    icon: Smile,
    label: 'Sourire',
    color: 'text-yellow-500 hover:text-yellow-600',
  },
  laugh: {
    icon: Laugh,
    label: 'Rire',
    color: 'text-orange-500 hover:text-orange-600',
  },
  frown: {
    icon: Frown,
    label: 'Mécontent',
    color: 'text-gray-500 hover:text-gray-600',
  },
};

export function ReactionSystem({
  targetId,
  reactions,
  onAddReaction,
  onRemoveReaction,
  size = 'md',
  disabled = false,
}: ReactionSystemProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Grouper les réactions par type
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.type]) {
      acc[reaction.type] = [];
    }
    acc[reaction.type].push(reaction);
    return acc;
  }, {} as Record<ReactionType, Reaction[]>);

  // Vérifier si l'utilisateur a déjà réagi avec ce type
  const hasUserReacted = (type: ReactionType) => {
    return groupedReactions[type]?.some(r => r.userId === user?.id) || false;
  };

  // Obtenir la réaction de l'utilisateur pour un type donné
  const getUserReaction = (type: ReactionType) => {
    return groupedReactions[type]?.find(r => r.userId === user?.id);
  };

  const handleReactionClick = (type: ReactionType) => {
    if (!user || disabled) return;

    const userReaction = getUserReaction(type);
    if (userReaction) {
      onRemoveReaction(userReaction.id);
    } else {
      onAddReaction(type);
    }
    setIsOpen(false);
  };

  const getTotalReactions = () => {
    return reactions.length;
  };

  const getTopReactions = () => {
    return Object.entries(groupedReactions)
      .filter(([_, reactions]) => reactions.length > 0)
      .sort(([, a], [, b]) => b.length - a.length)
      .slice(0, 3);
  };

  const buttonSize = size === 'sm' ? 'sm' : 'default';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-2">
      {/* Affichage des réactions existantes */}
      <div className="flex items-center gap-1">
        {getTopReactions().map(([type, typeReactions]) => {
          const config = reactionConfig[type as ReactionType];
          const Icon = config.icon;
          const userHasReacted = hasUserReacted(type as ReactionType);
          
          return (
            <Tooltip key={type}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size={buttonSize}
                  onClick={() => handleReactionClick(type as ReactionType)}
                  disabled={disabled}
                  className={cn(
                    'p-1 h-auto min-w-0',
                    userHasReacted && 'bg-accent',
                    !disabled && 'hover:bg-accent'
                  )}
                >
                  <Icon className={cn(iconSize, userHasReacted ? config.color : 'text-muted-foreground')} />
                  {typeReactions.length > 0 && (
                    <span className="ml-1 text-xs">{typeReactions.length}</span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-medium">{config.label}</p>
                  <div className="text-xs text-muted-foreground">
                    {typeReactions.slice(0, 3).map(r => r.userName).join(', ')}
                    {typeReactions.length > 3 && ` et ${typeReactions.length - 3} autres`}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Bouton pour ajouter une réaction */}
      {!disabled && user && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size={buttonSize} className="p-1 h-auto">
              <Smile className={cn(iconSize, 'text-muted-foreground')} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="grid grid-cols-3 gap-1">
              {Object.entries(reactionConfig).map(([type, config]) => {
                const Icon = config.icon;
                const userHasReacted = hasUserReacted(type as ReactionType);
                
                return (
                  <Tooltip key={type}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReactionClick(type as ReactionType)}
                        className={cn(
                          'p-2 h-auto',
                          userHasReacted && 'bg-accent'
                        )}
                      >
                        <Icon className={cn('w-5 h-5', userHasReacted ? config.color : 'text-muted-foreground')} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{config.label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Compteur total (optionnel) */}
      {getTotalReactions() > 0 && (
        <Badge variant="secondary" className="text-xs">
          {getTotalReactions()} réaction{getTotalReactions() > 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
}