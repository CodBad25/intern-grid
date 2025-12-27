import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface Rapport {
  id: string;
  type: 'intermediaire' | 'final';
  annee_scolaire: string;
  status: 'brouillon' | 'en_cours' | 'complet' | 'partage';
  stagiaire_id?: string;
  tuteur1_id: string;
  tuteur2_id?: string;
  stagiaire_nom?: string;
  stagiaire_prenom?: string;
  stagiaire_corps?: string;
  stagiaire_etablissement?: string;
  stagiaire_discipline?: string;
  tuteur1_nom?: string;
  tuteur1_prenom?: string;
  tuteur1_etablissement?: string;
  tuteur1_discipline?: string;
  tuteur2_nom?: string;
  tuteur2_prenom?: string;
  tuteur2_etablissement?: string;
  tuteur2_discipline?: string;
  modalites?: {
    visites_tuteur?: string;
    visites_stagiaire?: string;
    classes_observees_tuteur?: string;
    classes_observees_stagiaire?: string;
    concertations?: string;
  };
  axes?: Array<{
    titre?: string;
    constat_depart?: string;
    evolution?: string;
    etat_actuel?: string;
    competences?: string;
  }>;
  competences?: Record<string, Record<string, string>>;
  axes_fin_annee?: {
    a_conforter?: string;
    a_travailler?: string;
  };
  signature_tuteur1_date?: string;
  signature_tuteur2_date?: string;
  signature_stagiaire_date?: string;
  shared_with_stagiaire?: boolean;
  created_at: string;
  updated_at: string;
}

export function useRapports() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all rapports for current user
  const { data: rapports, isLoading, error, refetch } = useQuery({
    queryKey: ['rapports', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('rapports')
        .select('*')
        .or(`tuteur1_id.eq.${user.id},tuteur2_id.eq.${user.id},stagiaire_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching rapports:', error);
        throw error;
      }

      return data as Rapport[];
    },
    enabled: !!user?.id,
  });

  // Auto-fix: Ajouter tuteur2_id aux rapports existants qui n'en ont pas
  useEffect(() => {
    const fixMissingTuteur2 = async () => {
      if (!rapports || rapports.length === 0) {
        console.log('[useRapports] No rapports to fix');
        return;
      }

      console.log('[useRapports] Checking rapports:', rapports.map(r => ({ id: r.id, tuteur1_id: r.tuteur1_id, tuteur2_id: r.tuteur2_id })));

      // Chercher les rapports sans tuteur2_id
      const rapportsSansTuteur2 = rapports.filter(r => !r.tuteur2_id && r.tuteur1_id);
      if (rapportsSansTuteur2.length === 0) {
        console.log('[useRapports] All rapports have tuteur2_id');
        return;
      }

      console.log('[useRapports] Rapports missing tuteur2_id:', rapportsSansTuteur2.length);

      // Chercher l'ID de l'autre tuteur
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name');

      if (profilesError) {
        console.error('[useRapports] Error fetching profiles:', profilesError);
        return;
      }

      console.log('[useRapports] Profiles found:', profiles);

      const laurence = profiles?.find(p =>
        p.display_name?.toLowerCase().includes('laurence') ||
        p.display_name?.toLowerCase().includes('mauny')
      );
      const badri = profiles?.find(p =>
        p.display_name?.toLowerCase().includes('badri') ||
        p.display_name?.toLowerCase().includes('belhaj')
      );

      console.log('[useRapports] Laurence:', laurence, 'Badri:', badri);

      for (const rapport of rapportsSansTuteur2) {
        // Si tuteur1 est Laurence, tuteur2 est Badri et vice versa
        let tuteur2Id = null;
        if (rapport.tuteur1_id === laurence?.user_id) {
          tuteur2Id = badri?.user_id;
        } else if (rapport.tuteur1_id === badri?.user_id) {
          tuteur2Id = laurence?.user_id;
        }

        console.log(`[useRapports] Rapport ${rapport.id}: tuteur1_id=${rapport.tuteur1_id}, computed tuteur2Id=${tuteur2Id}`);

        if (tuteur2Id) {
          console.log(`[useRapports] Fixing rapport ${rapport.id}: adding tuteur2_id = ${tuteur2Id}`);
          const { error: updateError } = await supabase
            .from('rapports')
            .update({ tuteur2_id: tuteur2Id })
            .eq('id', rapport.id);

          if (updateError) {
            console.error('[useRapports] Error updating rapport:', updateError);
          } else {
            console.log('[useRapports] Rapport updated successfully');
            // Rafraîchir les données après fix
            queryClient.invalidateQueries({ queryKey: ['rapports'] });
          }
        }
      }
    };

    fixMissingTuteur2();
  }, [rapports, queryClient]);

  // Get specific rapports
  const rapportIntermediaire = rapports?.find(r => r.type === 'intermediaire');
  const rapportFinal = rapports?.find(r => r.type === 'final');

  // Create rapport mutation
  const createMutation = useMutation({
    mutationFn: async (type: 'intermediaire' | 'final') => {
      if (!user?.id) throw new Error('User not authenticated');

      // Vérifier si un rapport de ce type existe déjà (anti-doublon)
      const { data: existingRapports } = await supabase
        .from('rapports')
        .select('id, tuteur1_id, tuteur2_id')
        .eq('type', type)
        .eq('annee_scolaire', '2025-2026');

      if (existingRapports && existingRapports.length > 0) {
        console.log(`[useRapports] Rapport ${type} already exists, skipping creation`);
        toast.info('Un rapport de ce type existe déjà');
        throw new Error('Rapport already exists');
      }

      // Chercher les deux tuteurs dans les profils
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name');

      const laurence = profiles?.find(p =>
        p.display_name?.toLowerCase().includes('laurence') ||
        p.display_name?.toLowerCase().includes('mauny')
      );
      const badri = profiles?.find(p =>
        p.display_name?.toLowerCase().includes('badri') ||
        p.display_name?.toLowerCase().includes('belhaj')
      );

      const newRapport = {
        type,
        annee_scolaire: '2025-2026',
        status: 'brouillon' as const,
        tuteur1_id: laurence?.user_id || user.id,
        tuteur2_id: badri?.user_id || null,
        // Pré-remplissage avec les informations réelles
        stagiaire_nom: 'V',
        stagiaire_prenom: 'Barbara',
        stagiaire_corps: 'Certifié',
        stagiaire_etablissement: '',
        stagiaire_discipline: 'Mathématiques',
        tuteur1_nom: 'Mauny',
        tuteur1_prenom: 'Laurence',
        tuteur1_etablissement: '',
        tuteur1_discipline: 'Physique-Chimie',
        tuteur2_nom: 'Belhaj',
        tuteur2_prenom: 'Badri',
        tuteur2_etablissement: '',
        tuteur2_discipline: 'Mathématiques',
        modalites: {
          visites_tuteur: '',
          visites_stagiaire: '',
          classes_observees_tuteur: '',
          classes_observees_stagiaire: '',
          concertations: '',
        },
        axes: [
          { titre: 'Régulariser la gestion du rythme de la séance', constat_depart: '', evolution: '', etat_actuel: '', competences: '' },
          { titre: 'Corréler la gestion de classe en fonction du type de classe', constat_depart: '', evolution: '', etat_actuel: '', competences: '' },
          { titre: '', constat_depart: '', evolution: '', etat_actuel: '', competences: '' },
          { titre: '', constat_depart: '', evolution: '', etat_actuel: '', competences: '' },
        ],
        competences: {},
        axes_fin_annee: {
          a_conforter: '',
          a_travailler: '',
        },
      };

      const { data, error } = await supabase
        .from('rapports')
        .insert(newRapport)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rapports', user?.id] });
      toast.success('Rapport créé avec succès');
    },
    onError: (error) => {
      console.error('Error creating rapport:', error);
      toast.error('Erreur lors de la création du rapport');
    },
  });

  // Update rapport mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Rapport> }) => {
      const { error } = await supabase
        .from('rapports')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
          last_modified_by: user?.id,
        })
        .eq('id', id);

      if (error) throw error;
    },
    // Ne pas invalider les queries après update pour éviter les problèmes de scroll
    // Les données locales sont déjà à jour via formData
    onError: (error) => {
      console.error('Error updating rapport:', error);
      toast.error('Erreur lors de la sauvegarde');
    },
  });

  // Delete rapport mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rapports')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rapports', user?.id] });
      toast.success('Rapport supprimé');
    },
    onError: (error) => {
      console.error('Error deleting rapport:', error);
      toast.error('Erreur lors de la suppression');
    },
  });

  const createRapport = useCallback(
    (type: 'intermediaire' | 'final') => createMutation.mutateAsync(type),
    [createMutation]
  );

  const updateRapport = useCallback(
    (id: string, data: Partial<Rapport>) => updateMutation.mutateAsync({ id, data }),
    [updateMutation]
  );

  const deleteRapport = useCallback(
    (id: string) => deleteMutation.mutateAsync(id),
    [deleteMutation]
  );

  return {
    rapports,
    rapportIntermediaire,
    rapportFinal,
    isLoading,
    error,
    refetch,
    createRapport,
    updateRapport,
    deleteRapport,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
