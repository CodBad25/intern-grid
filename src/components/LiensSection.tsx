import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Link as LinkIcon } from 'lucide-react';
import { useLiens, Lien } from '@/hooks/useLiens';
import { LoadingSpinner } from './LoadingSpinner';

export function LiensSection() {
  const { liens, isLoading } = useLiens();

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Liens extraits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (liens.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Liens extraits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Aucun lien trouvé. Les liens saisis dans vos séances apparaîtront automatiquement ici.
          </p>
        </CardContent>
      </Card>
    );
  }

  const groupedLiens = liens.reduce((acc, lien) => {
    const key = lien.source_type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(lien);
    return acc;
  }, {} as Record<string, Lien[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5" />
          Liens extraits ({liens.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedLiens).map(([sourceType, sourceLiens]) => (
          <div key={sourceType} className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {sourceType}
              </Badge>
              <span>({sourceLiens.length})</span>
            </h4>
            <div className="space-y-2">
              {sourceLiens.map((lien) => (
                <div
                  key={lien.id}
                  className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {lien.title || lien.url}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {lien.url}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenLink(lien.url)}
                    className="ml-2 shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}