import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useObservations } from '@/hooks/useObservations';
import { useAuth } from '@/context/AuthContext';
import { Eye, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ObjectiveObservationsProps {
  objectiveId: string;
  objectiveTitle: string;
}

export function ObjectiveObservations({ objectiveId, objectiveTitle }: ObjectiveObservationsProps) {
  const { user } = useAuth();
  const { observations, isLoading, addObservation, deleteObservation } = useObservations(objectiveId);

  const [newComment, setNewComment] = useState('');
  const [isAddingObservation, setIsAddingObservation] = useState(false);
  const [editingDateId, setEditingDateId] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState('');

  // Vérifier si l'utilisateur est tuteur ou admin
  const isTutor = user?.role === 'tuteur' || user?.role === 'admin';

  const handleAddObservation = async () => {
    setIsAddingObservation(true);
    try {
      await addObservation(objectiveId, newComment);
      setNewComment('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'observation:', error);
    } finally {
      setIsAddingObservation(false);
    }
  };

  const handleEditDate = (observation: any) => {
    setEditingDateId(observation.id);
    const date = new Date(observation.observed_at);
    const formattedDate = date.toISOString().split('T')[0];
    setEditingDate(formattedDate);
  };

  const handleSaveDate = async (observationId: string) => {
    try {
      setEditingDateId(null);
      setEditingDate('');
    } catch (error) {
      console.error('Erreur lors de la modification de la date:', error);
    }
  };

  const handleCancelEditDate = () => {
    setEditingDateId(null);
    setEditingDate('');
  };

  const handleDeleteObservation = async (observationId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette observation ?')) {
      try {
        await deleteObservation(observationId);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'observation:', error);
      }
    }
  };

  // Vérifier si l'utilisateur a déjà observé cet objectif
  const hasUserObserved = observations.some(obs => obs.observer_id === user?.id);

  // Fonction pour obtenir la couleur d'un observateur (couleurs fixes)
  const getObserverColor = (observation: any) => {
    const observerName = observation.observer?.display_name || '';

    // Couleurs fixes basées sur les noms des tuteurs
    if (observerName.toLowerCase().includes('belhaj')) {
      return '#3b82f6'; // Bleu pour M. Belhaj
    } else if (observerName.toLowerCase().includes('mauny')) {
      return '#10b981'; // Vert pour Mme Mauny
    } else if (observerName.toLowerCase().includes('admin')) {
      return '#8b5cf6'; // Violet pour admin
    } else {
      return '#6b7280'; // Gris
    }
  };

  return (
    <div className="mt-3 p-2 bg-muted/20 rounded-lg">
      {/* Indicateurs visuels des observations */}
      {observations.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center mb-2">
          <span className="text-xs text-muted-foreground">
            {observations.length} observation{observations.length > 1 ? 's' : ''}
          </span>

          {/* Cibles colorées pour chaque tuteur */}
          {observations.map((observation, index) => (
            <TooltipProvider key={observation.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center gap-1 relative group">
                    {/* Cible colorée */}
                    <div
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
                      style={{
                        backgroundColor: getObserverColor(observation),
                        borderColor: 'white'
                      }}
                    >
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>

                    {/* Bouton de suppression (visible au survol pour les tuteurs, seulement pour leurs propres observations) */}
                    {isTutor && observation.observer_id === user?.id && (
                      <button
                        onClick={() => handleDeleteObservation(observation.id)}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Supprimer votre observation"
                      >
                        ×
                      </button>
                    )}

                    {/* Date de l'observation */}
                    {editingDateId === observation.id ? (
                      <div className="flex flex-col gap-1">
                        <input
                          type="date"
                          value={editingDate}
                          onChange={(e) => setEditingDate(e.target.value)}
                          className="text-xs border rounded px-1 py-0.5"
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleSaveDate(observation.id)}
                            className="text-xs bg-green-500 text-white px-1 py-0.5 rounded"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelEditDate}
                            className="text-xs bg-red-500 text-white px-1 py-0.5 rounded"
                          >
                            ✗
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span
                        className={`text-xs text-muted-foreground ${isTutor && observation.observer_id === user?.id ? 'cursor-pointer hover:text-foreground' : ''}`}
                        onClick={() => handleEditDate(observation)}
                        title={isTutor && observation.observer_id === user?.id ? 'Cliquer pour modifier la date' : ''}
                      >
                        {format(new Date(observation.observed_at), 'dd/MM', { locale: fr })}
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <div
                      className="font-medium"
                      style={{ color: getObserverColor(observation) }}
                    >
                      {observation.observer?.display_name || 'Tuteur inconnu'}
                    </div>
                    <div className="text-muted-foreground">
                      {format(new Date(observation.observed_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </div>
                    {observation.comment && (
                      <div className="mt-1 italic">
                        "{observation.comment}"
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}

          {/* Bouton Observer à côté des observations */}
          {isTutor && (
            <Button
              size="sm"
              variant={hasUserObserved ? "default" : "outline"}
              onClick={handleAddObservation}
              disabled={isAddingObservation}
              className="flex items-center gap-1 text-xs h-6 px-2"
            >
              <Eye className="w-3 h-3" />
              {hasUserObserved ? 'Observé' : 'Observer'}
            </Button>
          )}
        </div>
      )}

      {/* Champ de remarque optionnel et bouton (visible seulement pour les tuteurs qui n'ont pas encore observé) */}
      {isTutor && !hasUserObserved && (
        <div className="space-y-2">
          <Textarea
            placeholder="Remarque optionnelle..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={1}
            className="text-sm resize-none"
            style={{ minHeight: '32px', maxHeight: '80px' }}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddObservation}
            disabled={isAddingObservation}
            className="flex items-center gap-1 text-xs"
          >
            <Eye className="w-3 h-3" />
            Observer
          </Button>
        </div>
      )}

    </div>
  );
}
