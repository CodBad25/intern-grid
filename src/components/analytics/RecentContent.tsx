import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Seance, Document, Commentaire } from '@/types';

interface RecentContentProps {
  recentSeances: Seance[];
  recentDocuments: Document[];
  recentCommentaires: Commentaire[];
}

export const RecentContent = React.memo(({
  recentSeances,
  recentDocuments,
  recentCommentaires
}: RecentContentProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Séances récentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Séances Récentes
          </CardTitle>
          <CardDescription>
            Vos dernières séances d'accompagnement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSeances.length > 0 ? (
              recentSeances.map((seance) => (
                <Link to={`/seances#${seance.id}`} key={seance.id} className="block hover:bg-accent/50 rounded-lg transition-colors">
                  <div className="flex justify-between items-start p-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{seance.type}</h4>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(seance.date), 'dd MMM yyyy', { locale: fr })}
                      </p>
                      {seance.duree && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {seance.duree}min
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Aucune séance récente</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents récents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents Récents
          </CardTitle>
          <CardDescription>
            Derniers fichiers ajoutés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentDocuments.length > 0 ? (
              recentDocuments.map((document) => (
                <Link to="/documents" key={document.id} className="block hover:bg-accent/50 rounded-lg transition-colors">
                  <div className="flex justify-between items-start p-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm truncate">{document.titre}</h4>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(document.createdAt), 'dd MMM yyyy', { locale: fr })}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {document.type}
                    </Badge>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Aucun document récent</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Discussions récentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Discussions Récentes
          </CardTitle>
          <CardDescription>
            Dernières questions et échanges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentCommentaires.length > 0 ? (
              recentCommentaires.map((commentaire) => (
                <Link to={`/commentaires#${commentaire.id}`} key={commentaire.id} className="block hover:bg-accent/50 rounded-lg transition-colors">
                  <div className="flex justify-between items-start p-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-2">
                      {commentaire.content.length > 50 
                        ? `${commentaire.content.substring(0, 50)}...` 
                        : commentaire.content}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(commentaire.createdAt), 'dd MMM yyyy', { locale: fr })}
                    </p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {commentaire.type}
                    </Badge>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Aucune discussion récente</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
