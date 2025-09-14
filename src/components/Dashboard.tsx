
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { QuickActions } from './QuickActions';
import { StatsGrid } from './analytics/StatsGrid';
import { AnalyticsSection } from './analytics/AnalyticsSection';
import { RecentContent } from './analytics/RecentContent';
import { LoadingSpinner } from './LoadingSpinner';


export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { seances, documents, commentaires, reponses, isLoading } = useData();
  const analytics = useAnalytics();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const recentSeances = seances.slice(0, 3);
  const recentDocuments = documents.slice(0, 3);
  const recentCommentaires = commentaires.slice(0, 3);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  // Calculer les stats manquantes localement
  const seancesThisWeek = seances.filter(seance => {
    const seanceDate = new Date(seance.date);
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    return seanceDate >= weekStart;
  }).length;

  const analyticsData = {
    activityData: analytics.activityData,
    progressData: analytics.progressData,
    completionRate: analytics.completionRate,
    engagementScore: analytics.engagementScore,
    seancesTrend: analytics.globalStats.seancesTrend,
  };

  return (
    <div className="space-y-6">
      {/* En-tête de bienvenue */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-primary mb-2">
          {getGreeting()}, {user?.name || 'Utilisateur'} !
        </h1>
        <p className="text-muted-foreground">
          Voici un aperçu de vos activités récentes
        </p>
      </div>

      {/* Actions rapides */}
      <QuickActions />

      {/* Statistiques générales */}
      <StatsGrid
        totalSeances={analytics.globalStats.totalSeances}
        seancesThisWeek={seancesThisWeek}
        totalDocuments={analytics.globalStats.totalDocuments}
        totalCommentaires={analytics.globalStats.totalCommentaires}
        totalReponses={reponses.length}
        totalHeures={analytics.globalStats.totalHeures}
      />

      {/* Analyses Avancées */}
      <AnalyticsSection analytics={analyticsData} />

      {/* Contenu récent */}
      <RecentContent
        recentSeances={recentSeances}
        recentDocuments={recentDocuments}
        recentCommentaires={recentCommentaires}
      />
    </div>
  );
};
