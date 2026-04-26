import { supabase } from '@/integrations/supabase/client';

const RAPPORT_TASK_TITLE = 'Rédiger le rapport de la visite';

const RAPPORT_TASK_DESCRIPTION = [
  "Quelques pistes (libre à toi de garder, modifier ou ignorer) :",
  "• Contexte : prof observé, classe, niveau, séquence",
  "• Ce qui t'a marquée : gestion de classe, supports, rythme",
  "• Ce que tu veux retenir ou réinvestir",
  "• Questions à creuser avec tes tuteurs",
].join('\n');

/**
 * Crée une tâche "Rédiger le rapport de la visite" liée à la séance.
 * Utilisé après qu'une stagiaire crée une séance de visite.
 */
export async function createRapportVisiteTask(sessionId: string, createdBy: string) {
  const { error } = await supabase.from('objectives').insert({
    title: RAPPORT_TASK_TITLE,
    description: RAPPORT_TASK_DESCRIPTION,
    session_id: sessionId,
    created_by: createdBy,
    type: 'tache',
    isCompleted: false,
    isValidated: false,
  });
  if (error) {
    console.error('Erreur création tâche rapport visite:', error);
  }
}
