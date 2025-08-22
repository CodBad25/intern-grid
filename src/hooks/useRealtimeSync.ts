
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface RealtimeSyncOptions {
  onSeanceChange?: () => void;
  onCommentaireChange?: () => void;
  onReponseChange?: () => void;
  onDocumentChange?: () => void;
  onEvenementChange?: () => void;
  onProfileChange?: () => void;
}

export const useRealtimeSync = (options: RealtimeSyncOptions) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Canal principal pour les changements de données
    const dataChannel = supabase
      .channel('data-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seances',
        },
        () => {
          console.log('Seance changed - syncing...');
          options.onSeanceChange?.();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'commentaires',
        },
        () => {
          console.log('Commentaire changed - syncing...');
          options.onCommentaireChange?.();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reponses',
        },
        () => {
          console.log('Reponse changed - syncing...');
          options.onReponseChange?.();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
        },
        () => {
          console.log('Document changed - syncing...');
          options.onDocumentChange?.();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'evenements',
        },
        () => {
          console.log('Evenement changed - syncing...');
          options.onEvenementChange?.();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          console.log('Profile changed - syncing...');
          options.onProfileChange?.();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(dataChannel);
    };
  }, [user, options]);
};
