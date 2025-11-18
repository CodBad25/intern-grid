import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface Observation {
  id: string;
  objective_id: number;
  observer_id: string;
  session_id: string | null;
  comment: string | null;
  observed_at: string;
  created_at: string;
  updated_at: string;
  observer?: {
    user_id: string;
    display_name: string;
    color: string;
  };
}

export function useObservations(objectiveId?: string) {
  const { user } = useAuth();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadObservations = useCallback(async (id: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log('📥 Chargement des observations pour l\'objectif:', id);

      const { data, error } = await supabase
        .from('observations')
        .select('*')
        .eq('objective_id', parseInt(id))
        .order('observed_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors du chargement des observations:', error);
        throw error;
      }

      if (data && data.length > 0) {
        const observerIds = [...new Set(data.map(obs => obs.observer_id))];
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, display_name, color')
          .in('user_id', observerIds);

        if (profilesError) {
          console.error('❌ Erreur lors du chargement des profils:', profilesError);
        }

        const observationsWithProfiles = data.map(observation => ({
          ...observation,
          observer: profiles?.find(profile => profile.user_id === observation.observer_id)
        }));

        console.log('✅ Observations chargées:', observationsWithProfiles.length);
        setObservations(observationsWithProfiles);
      } else {
        console.log('✅ Aucune observation trouvée');
        setObservations([]);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des observations:', error);
      toast.error('Erreur lors du chargement des observations');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (objectiveId) {
      loadObservations(objectiveId);
    }
  }, [objectiveId, loadObservations]);

  const addObservation = useCallback(async (objectiveId: string, comment: string, sessionId?: string) => {
    if (!user) return;

    try {
      console.log('➕ Ajout d\'une observation pour l\'objectif:', objectiveId, sessionId ? `(session: ${sessionId})` : '');

      const { data, error } = await supabase
        .from('observations')
        .insert({
          objective_id: parseInt(objectiveId),
          observer_id: user.id,
          session_id: sessionId || null,
          comment: comment.trim() || null,
          observed_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        console.error('❌ Erreur lors de l\'ajout de l\'observation:', error);
        throw error;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, display_name, color')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Erreur lors du chargement du profil:', profileError);
      }

      const observationWithProfile = {
        ...data,
        observer: profile
      };

      console.log('✅ Observation ajoutée:', observationWithProfile);
      setObservations(prev => [observationWithProfile, ...prev]);
      toast.success('Observation ajoutée');
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout de l\'observation:', error);
      toast.error('Erreur lors de l\'ajout de l\'observation');
      throw error;
    }
  }, [user]);

  const deleteObservation = useCallback(async (observationId: string) => {
    if (!user) return;

    try {
      console.log('🗑️ Suppression de l\'observation:', observationId);

      const { error } = await supabase
        .from('observations')
        .delete()
        .eq('id', observationId);

      if (error) {
        console.error('❌ Erreur lors de la suppression de l\'observation:', error);
        throw error;
      }

      console.log('✅ Observation supprimée');
      setObservations(prev => prev.filter(obs => obs.id !== observationId));
      toast.success('Observation supprimée');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'observation:', error);
      toast.error('Erreur lors de la suppression de l\'observation');
      throw error;
    }
  }, [user]);

  const updateObservation = useCallback(async (observationId: string, comment: string) => {
    if (!user) return;

    try {
      console.log('✏️ Modification de l\'observation:', observationId);

      const { data, error } = await supabase
        .from('observations')
        .update({
          comment: comment.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', observationId)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Erreur lors de la modification de l\'observation:', error);
        throw error;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, display_name, color')
        .eq('user_id', data.observer_id)
        .single();

      if (profileError) {
        console.error('❌ Erreur lors du chargement du profil:', profileError);
      }

      const observationWithProfile = {
        ...data,
        observer: profile
      };

      console.log('✅ Observation modifiée:', observationWithProfile);
      setObservations(prev =>
        prev.map(obs => obs.id === observationId ? observationWithProfile : obs)
      );
      toast.success('Observation modifiée');
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la modification de l\'observation:', error);
      toast.error('Erreur lors de la modification de l\'observation');
      throw error;
    }
  }, [user]);

  return {
    observations,
    isLoading,
    loadObservations,
    addObservation,
    deleteObservation,
    updateObservation
  };
}
