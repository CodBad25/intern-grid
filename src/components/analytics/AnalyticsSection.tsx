import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Zap, TrendingUp } from 'lucide-react';
import { ActivityChart } from './ActivityChart';
import { ProgressChart } from './ProgressChart';

interface AnalyticsData {
  activityData: any[]; // Replace with more specific types if available
  progressData: any[]; // Replace with more specific types if available
  completionRate: number;
  engagementScore: number;
  seancesTrend: number;
}

interface AnalyticsSectionProps {
  analytics: AnalyticsData;
}

export const AnalyticsSection = React.memo(({ analytics }: AnalyticsSectionProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Analyses Avancées</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ActivityChart title="Activité des 7 derniers jours" data={analytics.activityData} />
        <ProgressChart title="Progression des objectifs" data={analytics.progressData} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de complétion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completionRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              Objectif de 40 heures
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score d'engagement</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.engagementScore}</div>
            <p className="text-xs text-muted-foreground">
              Basé sur l'activité globale
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendance des séances</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${analytics.seancesTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {analytics.seancesTrend >= 0 ? '+' : ''}
              {analytics.seancesTrend.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Par rapport à la semaine dernière
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});
