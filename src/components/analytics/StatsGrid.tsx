import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, MessageSquare, Clock } from 'lucide-react';

interface StatsGridProps {
  totalSeances: number;
  seancesThisWeek: number;
  totalDocuments: number;
  totalCommentaires: number;
  totalReponses: number;
  totalHeures: number;
}

export const StatsGrid = React.memo(({
  totalSeances,
  seancesThisWeek,
  totalDocuments,
  totalCommentaires,
  totalReponses,
  totalHeures
}: StatsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Link to="/seances">
        <Card className="hover:bg-accent transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Séances</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSeances}</div>
            <p className="text-xs text-muted-foreground">
              {seancesThisWeek} cette semaine
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link to="/documents">
        <Card className="hover:bg-accent transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Fichiers disponibles
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link to="/commentaires">
        <Card className="hover:bg-accent transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discussions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCommentaires}</div>
            <p className="text-xs text-muted-foreground">
              +{totalReponses} réponses
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link to="/seances">
        <Card className="hover:bg-accent transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps Total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHeures.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Temps d'accompagnement
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
});
