
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

interface UserPresence {
  user_id: string;
  user: string;
  online_at: string;
  status?: string;
}

interface PresenceSettings {
  id?: string;
  user_id: string;
  show_presence: boolean;
  custom_status?: string;
}

interface Profile {
  user_id: string;
  display_name: string;
  role: string;
}

export const useUserPresence = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Record<string, UserPresence>>({});
  const [presenceSettings, setPresenceSettings] = useState<PresenceSettings[]>([]);
  const [userProfiles, setUserProfiles] = useState<Profile[]>([]);
  const [mySettings, setMySettings] = useState<PresenceSettings | null>(null);

  // Charger les profils utilisateurs
  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, display_name, role');
    
    if (error) {
      console.error('Error loading profiles:', error);
      return;
    }

    setUserProfiles(data || []);
  };

  // Charger les paramètres de présence
  const loadPresenceSettings = async () => {
    const { data, error } = await supabase
      .from('user_presence_settings')
      .select('*');
    
    if (error) {
      console.error('Error loading presence settings:', error);
      return;
    }

    setPresenceSettings(data || []);
  };

  // Charger mes paramètres personnels
  const loadMySettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_presence_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error loading my settings:', error);
      return;
    }

    setMySettings(data);
  };

  // Créer ou mettre à jour mes paramètres de présence
  const updateMyPresenceSettings = async (settings: Partial<PresenceSettings>) => {
    if (!user) return;

    const settingsToUpdate = {
      user_id: user.id,
      show_presence: settings.show_presence ?? true,
      custom_status: settings.custom_status || null,
    };

    if (mySettings?.id) {
      // Mise à jour
      const { error } = await supabase
        .from('user_presence_settings')
        .update(settingsToUpdate)
        .eq('id', mySettings.id);

      if (error) {
        console.error('Error updating presence settings:', error);
        toast.error('Erreur lors de la mise à jour des paramètres');
        return;
      }
    } else {
      // Création
      const { error } = await supabase
        .from('user_presence_settings')
        .insert([settingsToUpdate]);

      if (error) {
        console.error('Error creating presence settings:', error);
        toast.error('Erreur lors de la création des paramètres');
        return;
      }
    }

    toast.success('Paramètres de présence mis à jour');
    await loadMySettings();
  };

  // Obtenir les utilisateurs visibles (ceux qui ont autorisé la visibilité)
  const getVisibleUsers = () => {
    const visibleUserIds = presenceSettings
      .filter(setting => setting.show_presence)
      .map(setting => setting.user_id);

    return Object.entries(onlineUsers)
      .filter(([userId]) => visibleUserIds.includes(userId))
      .map(([userId, presence]) => {
        const profile = userProfiles.find(p => p.user_id === userId);
        const settings = presenceSettings.find(s => s.user_id === userId);
        
        return {
          ...presence,
          display_name: profile?.display_name || 'Utilisateur inconnu',
          role: profile?.role || 'stagiaire',
          custom_status: settings?.custom_status,
        };
      });
  };

  useEffect(() => {
    loadProfiles();
    loadPresenceSettings();
    if (user) {
      loadMySettings();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Créer un canal de présence
    const presenceChannel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Écouter les changements de présence
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState<UserPresence>();
        // Convertir le RealtimePresenceState en Record<string, UserPresence>
        const convertedState: Record<string, UserPresence> = {};
        Object.entries(newState).forEach(([key, presences]) => {
          if (presences && presences.length > 0) {
            convertedState[key] = presences[0];
          }
        });
        setOnlineUsers(convertedState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // S'enregistrer comme présent seulement si les paramètres l'autorisent
          const shouldShowPresence = mySettings?.show_presence ?? true;
          
          if (shouldShowPresence) {
            await presenceChannel.track({
              user_id: user.id,
              user: user.name,
              online_at: new Date().toISOString(),
              status: mySettings?.custom_status || 'En ligne',
            });
          }
        }
      });

    // Écouter les changements en temps réel des paramètres de présence
    const settingsSubscription = supabase
      .channel('presence-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence_settings',
        },
        () => {
          loadPresenceSettings();
          if (user) {
            loadMySettings();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(settingsSubscription);
    };
  }, [user, mySettings?.show_presence, mySettings?.custom_status]);

  return {
    onlineUsers: getVisibleUsers(),
    mySettings,
    updateMyPresenceSettings,
  };
};
