import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface Lien {
  id: string;
  user_id: string;
  url: string;
  title?: string;
  description?: string;
  source_type: string;
  source_id: string;
  created_at: string;
  updated_at: string;
}

export function useLiens() {
  const [liens, setLiens] = useState<Lien[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchLiens = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('liens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLiens(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des liens:', error);
      toast.error('Erreur lors du chargement des liens');
    } finally {
      setIsLoading(false);
    }
  };

  const saveLiens = async (urls: string[], sourceType: string, sourceId: string) => {
    if (!user || !urls.length) return;

    try {
      // Remove existing links for this source
      await supabase
        .from('liens')
        .delete()
        .eq('source_type', sourceType)
        .eq('source_id', sourceId);

      // Filter out duplicates and empty URLs
      const uniqueUrls = [...new Set(urls.filter(url => url.trim()))];
      
      // Add new links
      const newLiens = uniqueUrls.map(url => ({
        user_id: user.id,
        url,
        source_type: sourceType,
        source_id: sourceId,
        title: extractTitleFromUrl(url)
      }));

      if (newLiens.length > 0) {
        const { error } = await supabase
          .from('liens')
          .insert(newLiens);

        if (error) throw error;
      }
      
      // Refresh the list
      fetchLiens();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des liens:', error);
      toast.error('Erreur lors de la sauvegarde des liens');
    }
  };

  const extractTitleFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '') + urlObj.pathname;
    } catch {
      return url;
    }
  };

  useEffect(() => {
    fetchLiens();
  }, [user]);

  return {
    liens,
    isLoading,
    saveLiens,
    fetchLiens
  };
}