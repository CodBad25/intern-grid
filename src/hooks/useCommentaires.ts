
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/context/AuthContext';
import { useNotificationSender } from './useNotificationSender';
import { useNotificationPreferences } from '@/context/NotificationPreferencesContext';

export type SupabaseCommentaire = Tables<'commentaires'> & {
  profiles?: Tables<'profiles'>;
};

export type SupabaseReponse = Tables<'reponses'> & {
  profiles?: Tables<'profiles'>;
};

type NewCommentaireInput = {
  type: 'remarque' | 'question';
  content: string;
  tuteur_id: string;
};

type UpdateCommentaireInput = {
  content: string;
};

type NewReponseInput = {
  commentaire_id: string;
  content: string;
  shared_with_peers: boolean;
  tuteur_id: string;
};

type UpdateReponseInput = {
  content: string;
};

export function useCommentaires() {
  const { user } = useAuth();
  const { sendCommentNotification } = useNotificationSender();
  const { isNotificationPermitted } = useNotificationPreferences();
  const [commentaires, setCommentaires] = useState<SupabaseCommentaire[]>([]);
  const [reponses, setReponses] = useState<SupabaseReponse[]>([]);

  const fetchCommentaires = async () => {
    try {
      const { data, error } = await supabase
        .from('commentaires')
        .select(`
          *,
          profiles:tuteur_id (
            id,
            display_name,
            role,
            color,
            avatar_url,
            created_at,
            updated_at,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const commentairesWithProfiles = (data || []).map(commentaire => {
        const profile = commentaire.profiles;
        return {
          ...commentaire,
          profiles: profile ? {
            ...profile,
            display_name: profile.display_name || 
                         `Utilisateur ${commentaire.tuteur_id.slice(-4)}` ||
                         'Utilisateur inconnu'
          } : null
        };
      });
      
      setCommentaires(commentairesWithProfiles);
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
    }
  };

  const fetchReponses = async () => {
    try {
      const { data, error } = await supabase
        .from('reponses')
        .select(`
          *,
          profiles:tuteur_id (
            id,
            display_name,
            role,
            color,
            avatar_url,
            created_at,
            updated_at,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReponses(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des réponses:', error);
    }
  };

  const addCommentaire = async (commentaire: NewCommentaireInput) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('commentaires')
        .insert(commentaire)
        .select()
        .single();

      if (error) throw error;
      setCommentaires(prev => [data as SupabaseCommentaire, ...prev]);
      
      // Envoi de la notification Supabase
      if (isNotificationPermitted('new_comment')) {
        await sendCommentNotification(commentaire.type as 'remarque' | 'question', user?.name);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      throw error;
    }
  };

  const updateCommentaire = async (id: string, updates: UpdateCommentaireInput) => {
    try {
      const { data, error } = await supabase
        .from('commentaires')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setCommentaires(prev =>
        prev.map(c => (c.id === id ? { ...c, ...data } : c))
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour du commentaire:', error);
      throw error;
    }
  };

  const deleteCommentaire = async (id: string) => {
    try {
      const { error } = await supabase
        .from('commentaires')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCommentaires(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      throw error;
    }
  };

  const addReponse = async (reponse: NewReponseInput) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('reponses')
        .insert({ ...reponse, tuteur_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setReponses(prev => [data as SupabaseReponse, ...prev]);

      // Notification géré via hook
      if (isNotificationPermitted('new_response')) {
        // TODO: Implémenter la notification
        console.log('Notification de réponse à implémenter');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réponse:', error);
      throw error;
    }
  };

  const updateReponse = async (id: string, updates: UpdateReponseInput) => {
    try {
      const { data, error } = await supabase
        .from('reponses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setReponses(prev =>
        prev.map(r => (r.id === id ? { ...r, ...data } : r))
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réponse:', error);
      throw error;
    }
  };

  const deleteReponse = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reponses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setReponses(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la réponse:', error);
      throw error;
    }
  };

  // Fonctions de réactions (placeholder - à implémenter si nécessaire)
  const addReaction = async (reaction: any) => {
    console.log('addReaction called:', reaction);
    // TODO: Implémenter avec Supabase
  };

  const removeReaction = async (id: string) => {
    console.log('removeReaction called:', id);
    // TODO: Implémenter avec Supabase
  };

  const getReactionsForTarget = (targetId: string, targetType: 'comment' | 'response') => {
    console.log('getReactionsForTarget called:', targetId, targetType);
    // TODO: Implémenter avec Supabase
    return [];
  };

  return {
    commentaires,
    reponses,
    fetchCommentaires,
    fetchReponses,
    addCommentaire,
    updateCommentaire,
    deleteCommentaire,
    addReponse,
    updateReponse,
    deleteReponse,
    addReaction,
    removeReaction,
    getReactionsForTarget
  };
}
