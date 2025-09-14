
// NotificationContext supprimé - utilisation de Supabase uniquement
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  role: 'tuteur' | 'admin' | 'stagiaire';
}

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
    users
      .filter(u => u.user_id !== user.id)
      .forEach(async (targetUser) => {
        try {
          await supabase.from('notifications').insert({
            target_user_id: targetUser.user_id,
            created_by: user.id,
            type: 'new_comment',
            title: `Nouvelle ${commentType}`,
            content: `${senderName} a publié une nouvelle ${commentType}`,
          });
        } catch (error) {
          console.error('Erreur notification:', error);
        }
      });
  };

  const sendResponseNotification = async (commentaireId: string, sharedWithPeers: boolean, authorName?: string) => {
    if (!user) return;

    const senderName = authorName || user.name;
    const users = await getAllUsers();

    // Notifier le stagiaire et l'autre tuteur selon les règles de partage
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
        try {
          await supabase.from('notifications').insert({
            target_user_id: targetUser.user_id,
            created_by: user.id,
            type: 'new_response',
            title: 'Nouvelle réponse',
            content: `${senderName} a répondu à une question`,
          });
        } catch (error) {
          console.error('Erreur notification:', error);
        }
      }
    }
  };

  const sendDocumentNotification = async (authorName?: string) => {
    if (!user) return;

    const senderName = authorName || user.name;
    const users = await getAllUsers();

    // Notifier tous les autres utilisateurs
    users
      .filter(u => u.user_id !== user.id)
      .forEach(async (targetUser) => {
        try {
          await supabase.from('notifications').insert({
            target_user_id: targetUser.user_id,
            created_by: user.id,
            type: 'new_document',
            title: 'Nouveau document',
            content: `${senderName} a ajouté un nouveau document`,
          });
        } catch (error) {
          console.error('Erreur notification:', error);
        }
      });
  };

  const sendEventNotification = async (authorName?: string) => {
    if (!user) return;

    const senderName = authorName || user.name;
    const users = await getAllUsers();

    // Notifier tous les autres utilisateurs
    users
      .filter(u => u.user_id !== user.id)
      .forEach(async (targetUser) => {
        try {
          await supabase.from('notifications').insert({
            target_user_id: targetUser.user_id,
            created_by: user.id,
            type: 'new_event',
            title: 'Nouvel événement',
            content: `${senderName} a planifié un nouvel événement`,
          });
        } catch (error) {
          console.error('Erreur notification:', error);
        }
      });
  };

  return {
    sendCommentNotification,
    sendResponseNotification,
    sendDocumentNotification,
    sendEventNotification,
  };
}
