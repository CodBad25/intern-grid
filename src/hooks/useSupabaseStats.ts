
import { useSeances } from './useSeances';
import { useCommentaires } from './useCommentaires';

export function useSupabaseStats() {
  const { seances } = useSeances();
  const { commentaires, reponses } = useCommentaires();

  const getStats = () => {
    const totalHeures = seances.reduce((sum, seance) => sum + seance.duree, 0);
    const nombreSeances = seances.length;
    
    // Questions sans réponses
    const questionsIds = new Set(
      commentaires
        .filter(c => c.type === 'question')
        .map(c => c.id)
    );
    const reponsesIds = new Set(reponses.map(r => r.commentaire_id));
    const questionsEnAttente = questionsIds.size - 
      Array.from(questionsIds).filter(id => reponsesIds.has(id)).length;

    return {
      totalHeures,
      nombreSeances,
      questionsEnAttente,
      totalSeances: nombreSeances,
      pendingQuestions: questionsEnAttente,
      totalHours: totalHeures,
      progression: Math.min(100, (totalHeures / 40) * 100)
    };
  };

  return { getStats };
}
