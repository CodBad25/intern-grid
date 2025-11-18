import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface Item {
  id: string;
  title: string;
  description: string | null;
  session_id: string | null;
  created_by: string;
  isCompleted: boolean;
  isValidated: boolean;
  completed_at: string | null;
  validated_at: string | null;
  validated_by: string | null;
  created_at: string;
  updated_at: string;
  type: 'tache' | 'objectif';
  creator?: {
    user_id: string;
    display_name: string;
    color: string;
  };
  validator?: {
    user_id: string;
    display_name: string;
    color: string;
  };
}

export function useItems() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger tous les éléments (tâches et objectifs)
  const loadItems = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log('📥 Chargement des éléments depuis Supabase...');

      const { data, error } = await supabase
        .from('objectives')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors du chargement des éléments:', error);
        throw error;
      }

      // Récupérer les profils des créateurs et validateurs
      if (data && data.length > 0) {
        const userIds = [...new Set([
          ...data.map(item => item.created_by),
          ...data.map(item => item.validated_by).filter(Boolean)
        ])];

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, display_name, color')
          .in('user_id', userIds);

        if (profilesError) {
          console.error('❌ Erreur lors du chargement des profils:', profilesError);
        }

        // Mapper les profils aux éléments et définir le type
        const itemsWithProfiles = data.map(item => ({
          ...item,
          type: item.type || 'objectif', // Par défaut objectif si pas de type
          creator: profiles?.find(profile => profile.user_id === item.created_by),
          validator: item.validated_by ? profiles?.find(profile => profile.user_id === item.validated_by) : null
        }));

        console.log('✅ Éléments chargés:', itemsWithProfiles.length);
        setItems(itemsWithProfiles);
      } else {
        console.log('✅ Aucun élément trouvé');
        setItems([]);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des éléments:', error);
      toast.error('Erreur lors du chargement des éléments');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Charger les éléments au montage du composant
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Créer un nouvel élément (tâche ou objectif)
  const createItem = useCallback(async (title: string, description: string, type: 'tache' | 'objectif', sessionId?: string) => {
    if (!user) return;

    try {
      console.log('➕ Création d\'un nouvel élément:', title, 'Type:', type);

      const { data, error } = await supabase
        .from('objectives')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          session_id: sessionId || null,
          created_by: user.id,
          type: type,
          isCompleted: false,
          isValidated: false
        })
        .select('*')
        .single();

      if (error) {
        console.error('❌ Erreur lors de la création de l\'élément:', error);
        throw error;
      }

      // Récupérer le profil du créateur
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, display_name, color')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Erreur lors du chargement du profil:', profileError);
      }

      const itemWithProfile = {
        ...data,
        type: type,
        creator: profile
      };

      console.log('✅ Élément créé:', itemWithProfile);

      // Mettre à jour l'état local
      setItems(prev => [itemWithProfile, ...prev]);

      toast.success(`${type === 'tache' ? 'Tâche' : 'Objectif'} créé(e)`);
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'élément:', error);
      toast.error('Erreur lors de la création de l\'élément');
      throw error;
    }
  }, [user]);

  // Marquer un élément comme réalisé (stagiaire)
  const markItemAsCompleted = useCallback(async (itemId: string) => {
    if (!user) return;

    try {
      console.log('✅ Marquage de l\'élément comme réalisé:', itemId);

      const { data, error } = await supabase
        .from('objectives')
        .update({
          isCompleted: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Erreur lors du marquage de l\'élément:', error);
        throw error;
      }

      console.log('✅ Élément marqué comme réalisé');

      // Mettre à jour l'état local
      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, ...data } : item
      ));

      toast.success('Élément marqué comme réalisé');
      return data;
    } catch (error) {
      console.error('❌ Erreur lors du marquage de l\'élément:', error);
      toast.error('Erreur lors du marquage de l\'élément');
      throw error;
    }
  }, [user]);

  // Marquer un élément comme non réalisé (stagiaire)
  const markItemAsNotCompleted = useCallback(async (itemId: string) => {
    if (!user) return;

    try {
      console.log('❌ Marquage de l\'élément comme non réalisé:', itemId);

      const { data, error } = await supabase
        .from('objectives')
        .update({
          isCompleted: false,
          completed_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Erreur lors du marquage de l\'élément:', error);
        throw error;
      }

      console.log('✅ Élément marqué comme non réalisé');

      // Mettre à jour l'état local
      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, ...data } : item
      ));

      toast.success('Élément marqué comme non réalisé');
      return data;
    } catch (error) {
      console.error('❌ Erreur lors du marquage de l\'élément:', error);
      toast.error('Erreur lors du marquage de l\'élément');
      throw error;
    }
  }, [user]);

  // Valider un élément (tuteur)
  const validateItem = useCallback(async (itemId: string) => {
    if (!user) return;

    try {
      console.log('✅ Validation de l\'élément:', itemId);

      const { data, error } = await supabase
        .from('objectives')
        .update({
          isValidated: true,
          validated_at: new Date().toISOString(),
          validated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Erreur lors de la validation de l\'élément:', error);
        throw error;
      }

      // Récupérer le profil du validateur
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, display_name, color')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Erreur lors du chargement du profil:', profileError);
      }

      const itemWithValidator = {
        ...data,
        validator: profile
      };

      console.log('✅ Élément validé:', itemWithValidator);

      // Mettre à jour l'état local
      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, ...itemWithValidator } : item
      ));

      toast.success('Élément validé');
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la validation de l\'élément:', error);
      toast.error('Erreur lors de la validation de l\'élément');
      throw error;
    }
  }, [user]);

  // Annuler la validation d'un élément (tuteur)
  const unvalidateItem = useCallback(async (itemId: string) => {
    if (!user) return;

    try {
      console.log('❌ Annulation de la validation de l\'élément:', itemId);

      const { data, error } = await supabase
        .from('objectives')
        .update({
          isValidated: false,
          validated_at: null,
          validated_by: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Erreur lors de l\'annulation de la validation:', error);
        throw error;
      }

      console.log('✅ Validation de l\'élément annulée');

      // Mettre à jour l'état local
      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, ...data, validator: null } : item
      ));

      toast.success('Validation de l\'élément annulée');
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de l\'annulation de la validation:', error);
      toast.error('Erreur lors de l\'annulation de la validation');
      throw error;
    }
  }, [user]);

  // Modifier un élément
  const updateItem = useCallback(async (itemId: string, title: string, description: string) => {
    if (!user) return;

    try {
      console.log('✏️ Modification de l\'élément:', itemId);

      const { data, error } = await supabase
        .from('objectives')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Erreur lors de la modification de l\'élément:', error);
        throw error;
      }

      console.log('✅ Élément modifié:', data);

      // Mettre à jour l'état local
      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, ...data } : item
      ));

      toast.success('Élément modifié');
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la modification de l\'élément:', error);
      toast.error('Erreur lors de la modification de l\'élément');
      throw error;
    }
  }, [user]);

  // Supprimer un élément
  const deleteItem = useCallback(async (itemId: string) => {
    if (!user) return;

    try {
      console.log('🗑️ Suppression de l\'élément:', itemId);

      const { error } = await supabase
        .from('objectives')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('❌ Erreur lors de la suppression de l\'élément:', error);
        throw error;
      }

      console.log('✅ Élément supprimé');

      // Mettre à jour l'état local
      setItems(prev => prev.filter(item => item.id !== itemId));

      toast.success('Élément supprimé');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'élément:', error);
      toast.error('Erreur lors de la suppression de l\'élément');
      throw error;
    }
  }, [user]);

  // Modifier la date de validation
  const updateValidatedDate = useCallback(async (itemId: string, newDate: string) => {
    if (!user) return;

    try {
      console.log('📅 Modification de la date de validation:', itemId, newDate);

      const { data, error } = await supabase
        .from('objectives')
        .update({
          validated_at: new Date(newDate).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Erreur lors de la modification de la date:', error);
        throw error;
      }

      console.log('✅ Date de validation modifiée');

      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, ...data } : item
      ));

      toast.success('Date de validation modifiée');
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la modification de la date:', error);
      toast.error('Erreur lors de la modification de la date');
      throw error;
    }
  }, [user]);

  // Modifier la date de réalisation
  const updateCompletedDate = useCallback(async (itemId: string, newDate: string) => {
    if (!user) return;

    try {
      console.log('📅 Modification de la date de réalisation:', itemId, newDate);

      const { data, error } = await supabase
        .from('objectives')
        .update({
          completed_at: new Date(newDate).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Erreur lors de la modification de la date:', error);
        throw error;
      }

      console.log('✅ Date de réalisation modifiée');

      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, ...data } : item
      ));

      toast.success('Date de réalisation modifiée');
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la modification de la date:', error);
      toast.error('Erreur lors de la modification de la date');
      throw error;
    }
  }, [user]);

  return {
    items,
    isLoading,
    loadItems,
    createItem,
    markItemAsCompleted,
    markItemAsNotCompleted,
    validateItem,
    unvalidateItem,
    updateItem,
    deleteItem,
    updateValidatedDate,
    updateCompletedDate
  };
}
