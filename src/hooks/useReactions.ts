
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/context/AuthContext';

export type SupabaseReaction = Tables<'reactions'> & {
  profiles?: Tables<'profiles'>;
};

type NewReactionInput = {
  type: string;
  target_id: string;
  target_type: 'comment' | 'response' | string;
};

export function useReactions() {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<SupabaseReaction[]>([]);

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select(`
          *,
          profiles:user_id (
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
      setReactions(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des réactions:', error);
    }
  };

  const addReaction = async (reaction: NewReactionInput) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('reactions')
        .insert({ ...reaction, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setReactions(prev => [data as SupabaseReaction, ...prev]);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réaction:', error);
      throw error;
    }
  };

  const removeReaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setReactions(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la réaction:', error);
      throw error;
    }
  };

  const getReactionsForTarget = (targetId: string, targetType: 'comment' | 'response') => {
    return reactions.filter(r => r.target_id === targetId && r.target_type === targetType);
  };

  return {
    reactions,
    fetchReactions,
    addReaction,
    removeReaction,
    getReactionsForTarget
  };
}
