import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/context/AuthContext';

export type SupabaseSeance = Tables<'seances'> & {
  profiles?: Tables<'profiles'>;
};

type NewSeanceInput = {
  date: string;
  duree: number;
  type: string;
  horaire_mode?: 'ordinaire' | 'creneau';
  heure?: string | null;
  creneau?: string | null;
  notes: string;
  custom_label?: string | null;
  shared_with_peers?: boolean | null;
  classe_visitee?: string | null;
};

type UpdateSeanceInput = Partial<NewSeanceInput>;

export function useSeances() {
  const { user } = useAuth();
  const [seances, setSeances] = useState<SupabaseSeance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSeances = async () => {
    try {
      const { data, error } = await supabase
        .from('seances')
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
      
      const seancesWithProfiles = (data || []).map(seance => {
        const profile = seance.profiles;
        return {
          ...seance,
          profiles: profile ? {
            ...profile,
            display_name: profile.display_name || 
                         `Utilisateur ${seance.tuteur_id.slice(-4)}` ||
                         'Utilisateur inconnu'
          } : null
        };
      });
      
      setSeances(seancesWithProfiles);
    } catch (error) {
      console.error('Erreur lors du chargement des séances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSeance = async (seance: NewSeanceInput) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('seances')
        .insert({ ...seance, tuteur_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setSeances(prevSeances => [data as SupabaseSeance, ...prevSeances]);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la séance:', error);
      throw error;
    }
  };

  const updateSeance = async (id: string, updates: UpdateSeanceInput) => {
    try {
      const { data, error } = await supabase
        .from('seances')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setSeances(prevSeances =>
        prevSeances.map(seance => (seance.id === id ? { ...seance, ...data } : seance))
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la séance:', error);
      throw error;
    }
  };

  const deleteSeance = async (id: string) => {
    try {
      const { error } = await supabase
        .from('seances')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSeances(prevSeances => prevSeances.filter(seance => seance.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la séance:', error);
      throw error;
    }
  };

  return {
    seances,
    isLoading,
    fetchSeances,
    addSeance,
    updateSeance,
    deleteSeance
  };
}
