
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/context/AuthContext';

export type SupabaseNotification = Tables<'notifications'> & {
  profiles?: Tables<'profiles'>;
};

type NewNotificationInput = {
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error';
  target_user_id?: string | null;
  action_url?: string | null;
  metadata?: any;
};

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SupabaseNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`target_user_id.is.null,target_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const list = (data || []) as SupabaseNotification[];
      const unique = Array.from(new Map(list.map(n => [n.id, n])).values());
      setNotifications(unique);
      setUnreadCount(unique.filter(n => !n.read).length);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .or(`target_user_id.is.null,target_user_id.eq.${user.id}`)
        .eq('read', false);

      if (error) throw error;
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur lors du marquage global:', error);
    }
  };

  const createNotification = async (notification: NewNotificationInput) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({ ...notification, created_by: user.id })
        .select()
        .single();

      if (error) throw error;
      
      // No need to refetch, real-time listener will handle it.
    } catch (error) {
      console.error('Erreur lors de la création de notification:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  useEffect(() => {
    if (!user) {
      // Clear notifications if user logs out
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();
    
    const channel = supabase.channel(`notifications-user-${user.id}`);

    const handleRealtimeChange = (payload: any) => {
      console.log('Real-time event received:', payload);
      const { eventType, new: newRecord, old: oldRecord } = payload;

      if (eventType === 'INSERT') {
        const newNotification = newRecord as SupabaseNotification;
        // Prevent duplicates by checking if notification already exists
        setNotifications(prev => {
          const exists = prev.some(n => n.id === newNotification.id);
          if (exists) return prev;
          if (!newNotification.read) {
            setUnreadCount(p => p + 1);
          }
          return [newNotification, ...prev];
        });
      } else if (eventType === 'UPDATE') {
        const updatedNotification = newRecord as SupabaseNotification;
        setNotifications(prev => {
          const existing = prev.find(n => n.id === updatedNotification.id);
          const next = prev.map(n => (n.id === updatedNotification.id ? updatedNotification : n));
          if (existing && existing.read !== updatedNotification.read) {
            setUnreadCount(p => p + (updatedNotification.read ? -1 : 1));
          }
          return next;
        });
      } else if (eventType === 'DELETE') {
        const deletedNotification = oldRecord as SupabaseNotification;
        setNotifications(prev => {
          const existed = prev.find(n => n.id === deletedNotification.id);
          const next = prev.filter(n => n.id !== deletedNotification.id);
          if (existed && !existed.read) {
            setUnreadCount(p => Math.max(0, p - 1));
          }
          return next;
        });
      }
    };

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `target_user_id=eq.${user.id}`,
        },
        handleRealtimeChange
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: 'target_user_id=is.null',
        },
        handleRealtimeChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification
  };
}
