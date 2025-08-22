
import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { subDays, format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export function useAnalytics() {
  const { seances, commentaires, documents, evenements } = useData();

  const analytics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sevenDaysAgo = subDays(now, 7);

    // Stats globales
    const totalSeances = seances.length;
    const totalHeures = seances.reduce((sum, s) => sum + s.duree, 0);
    const totalCommentaires = commentaires.length;
    const totalDocuments = documents.length;

    // Stats des 30 derniers jours
    const recentSeances = seances.filter(s => 
      new Date(s.createdAt) >= thirtyDaysAgo
    );
    const recentCommentaires = commentaires.filter(c => 
      new Date(c.createdAt) >= thirtyDaysAgo
    );
    const recentDocuments = documents.filter(d => 
      new Date(d.createdAt) >= thirtyDaysAgo
    );

    // Tendances (7 derniers jours vs 7 jours précédents)
    const last7Days = seances.filter(s => 
      new Date(s.createdAt) >= sevenDaysAgo
    ).length;
    const previous7Days = seances.filter(s => {
      const date = new Date(s.createdAt);
      return date >= subDays(sevenDaysAgo, 7) && date < sevenDaysAgo;
    }).length;

    const seancesTrend = previous7Days > 0 
      ? ((last7Days - previous7Days) / previous7Days) * 100
      : last7Days > 0 ? 100 : 0;

    // Données pour le graphique d'activité (7 derniers jours)
    const activityData = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      return {
        date: format(date, 'yyyy-MM-dd'),
        seances: seances.filter(s => 
          isWithinInterval(new Date(s.createdAt), { start: dayStart, end: dayEnd })
        ).length,
        commentaires: commentaires.filter(c => 
          isWithinInterval(new Date(c.createdAt), { start: dayStart, end: dayEnd })
        ).length,
        documents: documents.filter(d => 
          isWithinInterval(new Date(d.createdAt), { start: dayStart, end: dayEnd })
        ).length,
      };
    });

    // Répartition par type de séance
    const seancesByType = seances.reduce((acc, seance) => {
      acc[seance.type] = (acc[seance.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Progression vers l'objectif (40h)
    const progressData = [
      {
        label: 'Heures effectuées',
        value: totalHeures,
        total: 40,
        color: 'hsl(var(--primary))'
      },
      {
        label: 'Séances réalisées',
        value: totalSeances,
        total: 20, // Objectif estimé
        color: 'hsl(142 76% 36%)'
      },
      {
        label: 'Documents partagés',
        value: totalDocuments,
        total: 10, // Objectif estimé
        color: 'hsl(47 96% 53%)'
      }
    ];

    return {
      globalStats: {
        totalSeances,
        totalHeures,
        totalCommentaires,
        totalDocuments,
        seancesTrend
      },
      recentActivity: {
        seances: recentSeances.length,
        commentaires: recentCommentaires.length,
        documents: recentDocuments.length
      },
      activityData,
      seancesByType,
      progressData,
      // Métriques avancées
      averageSessionDuration: totalSeances > 0 ? totalHeures / totalSeances : 0,
      completionRate: Math.min(100, (totalHeures / 40) * 100),
      engagementScore: Math.round(
        (totalSeances * 0.4 + totalCommentaires * 0.3 + totalDocuments * 0.3) / 10 * 100
      )
    };
  }, [seances, commentaires, documents]);

  return analytics;
}
