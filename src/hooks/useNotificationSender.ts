
// NotificationContext supprimé - utilisation de Supabase uniquement
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  role: 'tuteur' | 'admin' | 'stagiaire';
}

// Type d'application vers type BDD
type AppNotificationType = 'new_comment' | 'new_response' | 'new_document' | 'new_event';
type DbNotificationType = 'info' | 'success' | 'warning' | 'error';

// ✅ Mapping des types d'application vers les types de base de données
const mapNotificationType = (appType: AppNotificationType): DbNotificationType => {
  const mapping: Record<AppNotificationType, DbNotificationType> = {
    'new_comment': 'info',
    'new_response': 'success',
    'new_document': 'info',
    'new_event': 'warning',
  };
  return mapping[appType];
};

export function useNotificationSender() {
  const { user } = useAuth();

  const getAllUsers = async (): Promise<UserProfile[]> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, display_name, role');
      
      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }
      
      // Cast the role to the correct type and filter out invalid roles
      const validUsers = (data || [])
        .filter(user => ['tuteur', 'admin', 'stagiaire'].includes(user.role))
        .map(user => ({
          ...user,
          role: user.role as 'tuteur' | 'admin' | 'stagiaire'
        }));
      
      return validUsers;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return [];
    }
  };

  const sendCommentNotification = async (commentType: 'question' | 'remarque', authorName?: string) => {
    if (!user) return;

    const senderName = authorName || user.name;
    const users = await getAllUsers();

    // Notifier tous les autres utilisateurs
    const notifications = users
      .filter(u => u.user_id !== user.id)
      .map((targetUser) => ({
        target_user_id: targetUser.user_id,
        created_by: user.id,
        type: mapNotificationType('new_comment'), // ✅ Mapped type
        title: `Nouvelle ${commentType}`,
        content: `${senderName} a publié une nouvelle ${commentType}`,
        metadata: { app_type: 'new_comment', comment_type: commentType }, // Store original type
      }));

    if (notifications.length > 0) {
      try {
        const { error } = await supabase.from('notifications').insert(notifications);
        if (error) {
          console.error('Erreur insertion notifications:', error);
          toast.error('Erreur lors de l\'envoi des notifications');
        }
      } catch (error) {
        console.error('Erreur notification:', error);
        toast.error('Erreur lors de l\'envoi des notifications');
      }
    }
  };

  const sendResponseNotification = async (commentaireId: string, sharedWithPeers: boolean, authorName?: string) => {
    if (!user) return;

    const senderName = authorName || user.name;
    const users = await getAllUsers();

    // Notifier le stagiaire et l'autre tuteur selon les règles de partage
    const notifications = [];
    for (const targetUser of users) {
      if (targetUser.user_id === user.id) continue; // Ne pas se notifier soi-même

      let shouldNotify = false;

      if (targetUser.role === 'stagiaire') {
        // Toujours notifier le stagiaire
        shouldNotify = true;
      } else if (targetUser.role === 'tuteur' && sharedWithPeers) {
        // Notifier l'autre tuteur seulement si partagé
        shouldNotify = true;
      }

      if (shouldNotify) {
        notifications.push({
          target_user_id: targetUser.user_id,
          created_by: user.id,
          type: mapNotificationType('new_response'), // ✅ Mapped type
          title: 'Nouvelle réponse',
          content: `${senderName} a répondu à une question`,
          metadata: { app_type: 'new_response', commentaire_id: commentaireId, shared: sharedWithPeers },
        });
      }
    }

    if (notifications.length > 0) {
      try {
        const { error } = await supabase.from('notifications').insert(notifications);
        if (error) {
          console.error('Erreur insertion notifications:', error);
          toast.error('Erreur lors de l\'envoi des notifications');
        }
      } catch (error) {
        console.error('Erreur notification:', error);
        toast.error('Erreur lors de l\'envoi des notifications');
      }
    }
  };

  const sendDocumentNotification = async (authorName?: string) => {
    if (!user) return;

    const senderName = authorName || user.name;
    const users = await getAllUsers();

    // Notifier tous les autres utilisateurs
    const notifications = users
      .filter(u => u.user_id !== user.id)
      .map((targetUser) => ({
        target_user_id: targetUser.user_id,
        created_by: user.id,
        type: mapNotificationType('new_document'), // ✅ Mapped type
        title: 'Nouveau document',
        content: `${senderName} a ajouté un nouveau document`,
        metadata: { app_type: 'new_document' },
      }));

    if (notifications.length > 0) {
      try {
        const { error } = await supabase.from('notifications').insert(notifications);
        if (error) {
          console.error('Erreur insertion notifications:', error);
          toast.error('Erreur lors de l\'envoi des notifications');
        }
      } catch (error) {
        console.error('Erreur notification:', error);
        toast.error('Erreur lors de l\'envoi des notifications');
      }
    }
  };

  const sendEventNotification = async (authorName?: string) => {
    if (!user) return;

    const senderName = authorName || user.name;
    const users = await getAllUsers();

    // Notifier tous les autres utilisateurs
    const notifications = users
      .filter(u => u.user_id !== user.id)
      .map((targetUser) => ({
        target_user_id: targetUser.user_id,
        created_by: user.id,
        type: mapNotificationType('new_event'), // ✅ Mapped type
        title: 'Nouvel événement',
        content: `${senderName} a planifié un nouvel événement`,
        metadata: { app_type: 'new_event' },
      }));

    if (notifications.length > 0) {
      try {
        const { error } = await supabase.from('notifications').insert(notifications);
        if (error) {
          console.error('Erreur insertion notifications:', error);
          toast.error('Erreur lors de l\'envoi des notifications');
        }
      } catch (error) {
        console.error('Erreur notification:', error);
        toast.error('Erreur lors de l\'envoi des notifications');
      }
    }
  };

  return {
    sendCommentNotification,
    sendResponseNotification,
    sendDocumentNotification,
    sendEventNotification,
  };
}
