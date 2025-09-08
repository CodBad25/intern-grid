import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/context/AuthContext';

export type SupabaseSeanceResponse = Tables<'seance_responses'>;

type NewSeanceResponseInput = {
  seance_id: string;
  content: string;
  shared_with_peers: boolean;
};

type UpdateSeanceResponseInput = Partial<Pick<SupabaseSeanceResponse, 'content' | 'shared_with_peers'>>;

export function useSeanceResponses() {
  const { user } = useAuth();
  const [responses, setResponses] = useState<SupabaseSeanceResponse[]>([]);

  const fetchResponses = async (seanceId?: string) => {
    try {
      let query = supabase
        .from('seance_responses')
        .select('*')
        .order('created_at', { ascending: true });

      if (seanceId) {
        query = query.eq('seance_id', seanceId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des réponses:', error);
    }
  };

  const addResponse = async (response: NewSeanceResponseInput) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('seance_responses')
        .insert({ ...response, user_id: user.id })
        .select('*')
        .single();

      if (error) throw error;
      setResponses(prev => [...prev, data]);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réponse:', error);
      throw error;
    }
  };

  const updateResponse = async (id: string, updates: UpdateSeanceResponseInput) => {
    try {
      const { data, error } = await supabase
        .from('seance_responses')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      setResponses(prev => prev.map(r => r.id === id ? data : r));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réponse:', error);
      throw error;
    }
  };

  const deleteResponse = async (id: string) => {
    try {
      const { error } = await supabase
        .from('seance_responses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setResponses(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la réponse:', error);
      throw error;
    }
  };

  const getResponsesForSeance = (seanceId: string) => {
    return responses.filter(r => r.seance_id === seanceId);
  };

  return {
    responses,
    fetchResponses,
    addResponse,
    updateResponse,
    deleteResponse,
    getResponsesForSeance
  };
}