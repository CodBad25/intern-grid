import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type SupabaseProfile = Tables<'profiles'>;

export function useProfiles() {
  const [profiles, setProfiles] = useState<SupabaseProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('display_name');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des profils:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProfile = (userId: string) => {
    return profiles.find(p => p.user_id === userId);
  };

  return {
    profiles,
    isLoading,
    getProfile,
    fetchProfiles
  };
}