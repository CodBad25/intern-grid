import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, Circle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface CollaborationIndicatorProps {
  rapportId?: string;
}

interface Collaborator {
  id: string;
  name: string;
  color: string;
  isOnline: boolean;
  lastActivity?: string;
}

export function CollaborationIndicator({ rapportId }: CollaborationIndicatorProps) {
  const { user, profile } = useAuth();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  useEffect(() => {
    if (!rapportId) return;

    // Subscribe to presence changes
    const channel = supabase.channel(`rapport:${rapportId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: Collaborator[] = [];

        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.user_id !== user?.id) {
              users.push({
                id: presence.user_id,
                name: presence.name || 'Collaborateur',
                color: presence.color || '#6366f1',
                isOnline: true,
                lastActivity: presence.editing,
              });
            }
          });
        });

        setCollaborators(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user?.id,
            name: profile?.display_name || 'Utilisateur',
            color: profile?.color || '#6366f1',
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [rapportId, user?.id, profile]);

  // Broadcast editing section
  const broadcastEditing = async (section: string | null) => {
    if (!rapportId) return;

    const channel = supabase.channel(`rapport:${rapportId}`);
    await channel.track({
      user_id: user?.id,
      name: profile?.display_name || 'Utilisateur',
      color: profile?.color || '#6366f1',
      editing: section,
      online_at: new Date().toISOString(),
    });
  };

  if (collaborators.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>Vous êtes seul(e)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {collaborators.length + 1} connecté{collaborators.length > 0 ? 's' : ''}
        </span>
      </div>

      <div className="flex -space-x-2">
        {/* Current user */}
        <Tooltip>
          <TooltipTrigger>
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarFallback
                style={{ backgroundColor: profile?.color || '#6366f1' }}
                className="text-white text-xs"
              >
                {(profile?.display_name || 'U').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <p>{profile?.display_name || 'Vous'} (vous)</p>
          </TooltipContent>
        </Tooltip>

        {/* Other collaborators */}
        {collaborators.map((collab) => (
          <Tooltip key={collab.id}>
            <TooltipTrigger>
              <div className="relative">
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarFallback
                    style={{ backgroundColor: collab.color }}
                    className="text-white text-xs"
                  >
                    {collab.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Circle
                  className="absolute -bottom-0.5 -right-0.5 h-3 w-3 text-green-500 fill-green-500"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div>
                <p className="font-medium">{collab.name}</p>
                {collab.lastActivity && (
                  <p className="text-xs text-muted-foreground">
                    Modifie : {collab.lastActivity}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Activity indicator */}
      {collaborators.some(c => c.lastActivity) && (
        <Badge variant="secondary" className="text-xs animate-pulse">
          {collaborators.find(c => c.lastActivity)?.name} édite...
        </Badge>
      )}
    </div>
  );
}
