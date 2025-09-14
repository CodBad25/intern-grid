
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/context/AuthContext';

export type SupabaseDocument = Tables<'documents'> & {
  profiles?: Tables<'profiles'>;
};

export type SupabaseEvenement = Tables<'evenements'> & {
  profiles?: Tables<'profiles'>;
};

type NewDocumentInput = {
  titre: string;
  type: 'document' | 'lien' | string;
  url?: string | null;
  description: string;
  shared_with_peers: boolean;
};

export function useDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<SupabaseDocument[]>([]);
  const [evenements, setEvenements] = useState<SupabaseEvenement[]>([]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
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
      setDocuments(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    }
  };

  const fetchEvenements = async () => {
    try {
      const { data, error } = await supabase
        .from('evenements')
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
      setEvenements(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    }
  };

  const addDocument = async (document: NewDocumentInput) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({ ...document, tuteur_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setDocuments(prev => [data as SupabaseDocument, ...prev]);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du document:', error);
      throw error;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      throw error;
    }
  };

  return {
    documents,
    evenements,
    fetchDocuments,
    fetchEvenements,
    addDocument,
    deleteDocument
  };
}
