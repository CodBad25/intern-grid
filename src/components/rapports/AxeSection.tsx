import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Target } from 'lucide-react';

interface Axe {
  titre: string;
  constat_depart: string;
  evolution: string;
  etat_actuel: string;
  competences: string;
}

interface TuteurProfile {
  display_name?: string;
  avatar_url?: string;
  color?: string;
}

interface AxeSectionProps {
  index: number;
  axe: Axe;
  onChange: (field: string, value: string) => void;
  tuteurProfile?: TuteurProfile;
}

const axeColors = [
  { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-600' },
  { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-600' },
  { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-600' },
  { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-600' },
];

const axeTypes = [
  'Transversal',
  'Transversal',
  'Disciplinaire',
  'Disciplinaire',
];

export function AxeSection({ index, axe, onChange, tuteurProfile }: AxeSectionProps) {
  const colors = axeColors[index];
  const axeType = axeTypes[index];
  const tuteurColor = tuteurProfile?.color || '#6b7280';
  const tuteurInitials = tuteurProfile?.display_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  // Refs pour les inputs non-contrôlés
  const titreRef = useRef<HTMLInputElement>(null);
  const constatRef = useRef<HTMLTextAreaElement>(null);
  const evolutionRef = useRef<HTMLTextAreaElement>(null);
  const etatRef = useRef<HTMLTextAreaElement>(null);
  const competencesRef = useRef<HTMLInputElement>(null);

  // Synchroniser les valeurs initiales
  useEffect(() => {
    if (titreRef.current && titreRef.current.value !== axe.titre) {
      titreRef.current.value = axe.titre || '';
    }
    if (constatRef.current && constatRef.current.value !== axe.constat_depart) {
      constatRef.current.value = axe.constat_depart || '';
    }
    if (evolutionRef.current && evolutionRef.current.value !== axe.evolution) {
      evolutionRef.current.value = axe.evolution || '';
    }
    if (etatRef.current && etatRef.current.value !== axe.etat_actuel) {
      etatRef.current.value = axe.etat_actuel || '';
    }
    if (competencesRef.current && competencesRef.current.value !== axe.competences) {
      competencesRef.current.value = axe.competences || '';
    }
  }, [axe]);

  // Handler pour sauvegarder sur blur OU après un délai d'inactivité
  const handleChange = (field: string, ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement>) => {
    if (ref.current) {
      onChange(field, ref.current.value);
    }
  };

  return (
    <Card
      className={`${colors.bg} border-2 relative overflow-hidden`}
      style={{
        borderLeftWidth: '6px',
        borderLeftColor: tuteurColor,
      }}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white dark:bg-gray-800`}>
              <Target className={`h-5 w-5 ${colors.text}`} />
            </div>
            <CardTitle className="text-lg">Axe {index + 1}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={colors.text}>
              {axeType}
            </Badge>
            <Avatar
              className="h-8 w-8 border-2"
              style={{ borderColor: tuteurColor }}
              title={tuteurProfile?.display_name || 'Tuteur'}
            >
              {tuteurProfile?.avatar_url ? (
                <AvatarImage src={tuteurProfile.avatar_url} alt={tuteurProfile.display_name} />
              ) : null}
              <AvatarFallback
                style={{ backgroundColor: tuteurColor, color: 'white' }}
                className="text-xs font-medium"
              >
                {tuteurInitials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="font-semibold">Titre de l'axe de formation</Label>
          <input
            ref={titreRef}
            defaultValue={axe.titre || ''}
            onBlur={() => handleChange('titre', titreRef)}
            placeholder="Ex: Régulariser la gestion du rythme de la séance"
            className="flex h-10 w-full rounded-md border border-input bg-white dark:bg-gray-800 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Constat de départ</Label>
            <textarea
              ref={constatRef}
              defaultValue={axe.constat_depart || ''}
              onBlur={() => handleChange('constat_depart', constatRef)}
              placeholder="Décrire la situation initiale observée..."
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-white dark:bg-gray-800 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Évolution constatée</Label>
            <textarea
              ref={evolutionRef}
              defaultValue={axe.evolution || ''}
              onBlur={() => handleChange('evolution', evolutionRef)}
              placeholder="Décrire les progrès observés..."
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-white dark:bg-gray-800 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>État des lieux à ce jour</Label>
            <textarea
              ref={etatRef}
              defaultValue={axe.etat_actuel || ''}
              onBlur={() => handleChange('etat_actuel', etatRef)}
              placeholder="Décrire la situation actuelle..."
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-white dark:bg-gray-800 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Compétences professionnelles du référentiel associées</Label>
          <input
            ref={competencesRef}
            defaultValue={axe.competences || ''}
            onBlur={() => handleChange('competences', competencesRef)}
            placeholder="Ex: P3, CC3"
            className="flex h-10 w-full rounded-md border border-input bg-white dark:bg-gray-800 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}
