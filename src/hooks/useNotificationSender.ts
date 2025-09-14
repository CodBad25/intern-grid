
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  role: 'tuteur' | 'admin' | 'stagiaire';
}

export function useNotificationSender() {
  const { addNotification } = useNotifications();
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
    users
      .filter(u => u.user_id !== user.id)
      .forEach(targetUser => {
        addNotification({
          userId: targetUser.user_id,
          type: 'comment',
          title: `Nouvelle ${commentType}`,
          message: `${senderName} a publié une nouvelle ${commentType}`,
        });
      });
  };

  const sendResponseNotification = async (commentaireId: string, sharedWithPeers: boolean, authorName?: string) => {
    if (!user) return;

    const senderName = authorName || user.name;
    const users = await getAllUsers();

    // Notifier le stagiaire et l'autre tuteur selon les règles de partage
    users.forEach(targetUser => {
      if (targetUser.user_id === user.id) return; // Ne pas se notifier soi-même

      let shouldNotify = false;

      if (targetUser.role === 'stagiaire') {
        // Toujours notifier le stagiaire
        shouldNotify = true;
      } else if (targetUser.role === 'tuteur' && sharedWithPeers) {
        // Notifier l'autre tuteur seulement si partagé
        shouldNotify = true;
      }

      if (shouldNotify) {
        addNotification({
          userId: targetUser.user_id,
          type: 'response',
          title: 'Nouvelle réponse',
          message: `${senderName} a répondu à une question`,
        });
      }
    });
  };

  const sendDocumentNotification = async (authorName?: string) => {
    if (!user) return;

    const senderName = authorName || user.name;
    const users = await getAllUsers();

    // Notifier tous les autres utilisateurs
    users
      .filter(u => u.user_id !== user.id)
      .forEach(targetUser => {
        addNotification({
          userId: targetUser.user_id,
          type: 'document',
          title: 'Nouveau document',
          message: `${senderName} a ajouté un nouveau document`,
        });
      });
  };

  const sendEventNotification = async (authorName?: string) => {
    if (!user) return;

    const senderName = authorName || user.name;
    const users = await getAllUsers();

    // Notifier tous les autres utilisateurs
    users
      .filter(u => u.user_id !== user.id)
      .forEach(targetUser => {
        addNotification({
          userId: targetUser.user_id,
          type: 'event',
          title: 'Nouvel événement',
          message: `${senderName} a planifié un nouvel événement`,
        });
      });
  };

  return {
    sendCommentNotification,
    sendResponseNotification,
    sendDocumentNotification,
    sendEventNotification,
  };
}
