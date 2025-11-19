import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RichTextViewer } from '@/components/RichTextViewer';
import { Seance } from '../types';
import { SupabaseSeance } from '../hooks/useSeances';
import { SEANCE_TYPES } from '../types';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EmptyState } from './EmptyState';
import { TutorName } from '@/components/TutorName';
import { SeanceReactionsAndResponses } from '@/components/SeanceReactionsAndResponses';
import { SeanceTasks } from '@/components/SeanceTasks';
import { useProfiles } from '@/hooks/useProfiles';
import { Calendar, Clock, Edit2, Trash2, MoreHorizontal, Eye, BookOpen, GraduationCap, UserCheck } from 'lucide-react';

const SEANCE_TYPE_ICONS = {
  visite: Eye,
  formation: BookOpen,
  evaluation: GraduationCap,
  suivi: UserCheck,
  autre: MoreHorizontal,
};

const SEANCE_TYPE_COLORS = {
  visite: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  formation: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  evaluation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  suivi: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  autre: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

function parseCustomTypeFromNotes(notes: string): { customType?: string; strippedNotes: string } {
  if (!notes) return { strippedNotes: '' };
  const match = notes.match(/^\s*\[([^\]\n]{1,40})\]\s*/);
  if (match) {
    const customType = match[1].trim();
    const strippedNotes = notes.replace(match[0], '');
    return { customType, strippedNotes };
  }
  return { strippedNotes: notes };
}

const getCreneauBadgeColor = (creneau: string) => {
  return creneau.startsWith('M') 
    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
};

interface SeancesListProps {
  filteredSeances: SupabaseSeance[];
  canModify: (seance: SupabaseSeance) => boolean;
  handleEdit: (seance: SupabaseSeance) => void;
  handleDelete: (seance: SupabaseSeance) => void;
  searchTerm: string;
  typeFilter: string;
  userRole?: string;
  resetForm: () => void;
  setIsFormOpen: (isOpen: boolean) => void;
}

export function SeancesList({ 
  filteredSeances, 
  canModify, 
  handleEdit, 
  handleDelete,
  searchTerm,
  typeFilter,
  userRole,
  resetForm,
  setIsFormOpen
}: SeancesListProps) {
  const { getProfile } = useProfiles();
  if (filteredSeances.length === 0) {
    return (
      <EmptyState
        title="Aucune séance trouvée"
        description={searchTerm || typeFilter !== 'all' 
          ? "Aucune séance ne correspond à vos critères de recherche" 
          : "Commencez par ajouter votre première séance de suivi"
        }
        icon={Calendar}
        action={(userRole === 'tuteur' || userRole === 'admin') && !searchTerm && typeFilter === 'all' ? {
          label: "Créer une séance",
          onClick: () => { resetForm(); setIsFormOpen(true); }
        } : undefined}
      />
    );
  }

  return (
    <div className="space-y-4">
      {filteredSeances.map((seance, index) => {
        const Icon = SEANCE_TYPE_ICONS[seance.type];
        const typeDisplay = seance.type === 'autre'
          ? (parseCustomTypeFromNotes(seance.notes).customType || 'Autre')
          : SEANCE_TYPES.find(t => t.value === seance.type)?.label;

        return (
          <Card key={seance.id} className="hover-lift animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {/* Avatar du tuteur en haut - propre et sans icône gênante */}
                    <TutorName 
                      name={seance.profiles?.display_name || `Utilisateur ${seance.tuteur_id.slice(-4)}`}
                      userId={seance.tuteur_id}
                      color={getProfile(seance.tuteur_id)?.color || undefined}
                      avatarUrl={getProfile(seance.tuteur_id)?.avatar_url}
                      variant="text"
                      size="lg"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={SEANCE_TYPE_COLORS[seance.type]}>
                          {typeDisplay}
                        </Badge>
                        {seance.creneau && (
                          <Badge className={getCreneauBadgeColor(seance.creneau)}>
                            {seance.creneau}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(parseISO(seance.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                        </span>
                        {seance.heure && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {seance.heure}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {seance.duree}h
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tâches assignées lors de cette séance */}
                  <SeanceTasks sessionId={seance.id} />

                  <RichTextViewer html={seance.notes} className="mb-2" />

                  <div className="flex items-center justify-between mb-2">
                    <TutorName 
                      name={seance.profiles?.display_name || `Utilisateur ${seance.tuteur_id.slice(-4)}`}
                      userId={seance.tuteur_id}
                      color={getProfile(seance.tuteur_id)?.color || undefined}
                      avatarUrl={getProfile(seance.tuteur_id)?.avatar_url}
                      variant="inline"
                      size="sm"
                    />
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(seance.created_at), 'dd/MM/yyyy à HH:mm')}
                    </span>
                  </div>

                  {/* Système de réactions et réponses */}
                  <SeanceReactionsAndResponses 
                    seanceId={seance.id}
                    seanceAuthorId={seance.tuteur_id}
                  />
                </div>

                {canModify(seance) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(seance)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(seance)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
