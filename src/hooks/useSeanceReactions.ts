import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/context/AuthContext';

export type SupabaseSeanceReaction = Tables<'seance_reactions'>;

type NewSeanceReactionInput = {
  type: string;
  seance_id: string;
};

export function useSeanceReactions() {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<SupabaseSeanceReaction[]>([]);

  const fetchReactions = async (seanceId?: string) => {
    try {
      let query = supabase
        .from('seance_reactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (seanceId) {
        query = query.eq('seance_id', seanceId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReactions(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des réactions:', error);
    }
  };

  const addReaction = async (reaction: NewSeanceReactionInput) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('seance_reactions')
        .insert({ ...reaction, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setReactions(prev => [data, ...prev]);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réaction:', error);
      throw error;
    }
  };

  const removeReaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('seance_reactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setReactions(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la réaction:', error);
      throw error;
    }
  };

  const getReactionsForSeance = (seanceId: string) => {
    return reactions.filter(r => r.seance_id === seanceId);
  };

  return {
    reactions,
    fetchReactions,
    addReaction,
    removeReaction,
    getReactionsForSeance
  };
}