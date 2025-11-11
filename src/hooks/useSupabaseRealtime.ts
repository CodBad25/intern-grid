import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface RealtimeCallbacks {
  onCommentaireChange?: () => void;
  onReponseChange?: () => void;
  onDocumentChange?: () => void;
  onSeanceChange?: () => void;
  onReactionChange?: () => void;
}

export const useSupabaseRealtime = (callbacks: RealtimeCallbacks) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    console.log('Setting up Supabase Realtime subscriptions...');

    // Subscription pour les commentaires
    const commentairesSubscription = supabase
      .channel('commentaires-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'commentaires',
        },
        (payload) => {
          console.log('Commentaire change detected:', payload);
          callbacks.onCommentaireChange?.();
        }
      )
      .subscribe();

    // Subscription pour les réponses
    const reponsesSubscription = supabase
      .channel('reponses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reponses',
        },
        (payload) => {
          console.log('Reponse change detected:', payload);
          callbacks.onReponseChange?.();
        }
      )
      .subscribe();

    // Subscription pour les documents
    const documentsSubscription = supabase
      .channel('documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
        },
        (payload) => {
          console.log('Document change detected:', payload);
          callbacks.onDocumentChange?.();
        }
      )
      .subscribe();

    // Subscription pour les séances
    const seancesSubscription = supabase
      .channel('seances-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seances',
        },
        (payload) => {
          console.log('Seance change detected:', payload);
          callbacks.onSeanceChange?.();
        }
      )
      .subscribe();

    // Subscription pour les réactions
    const reactionsSubscription = supabase
      .channel('reactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions',
        },
        (payload) => {
          console.log('Reaction change detected:', payload);
          callbacks.onReactionChange?.();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up Supabase Realtime subscriptions...');
      supabase.removeChannel(commentairesSubscription);
      supabase.removeChannel(reponsesSubscription);
      supabase.removeChannel(documentsSubscription);
      supabase.removeChannel(seancesSubscription);
      supabase.removeChannel(reactionsSubscription);
    };
  }, [user]); // ✅ Removed callbacks from dependencies
};
