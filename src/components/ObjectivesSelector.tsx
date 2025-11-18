import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Target, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface Objective {
  id: string;
  title: string;
  type: 'tache' | 'objectif';
  isCompleted: boolean;
  isValidated: boolean;
}

interface ObjectivesSelectorProps {
  sessionId?: string;
  onObservationsChange?: (observedIds: string[]) => void;
}

export function ObjectivesSelector({ sessionId, onObservationsChange }: ObjectivesSelectorProps) {
  const { user } = useAuth();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  // Charger les objectifs (seulement type 'objectif', pas les tâches)
  useEffect(() => {
    const loadObjectives = async () => {
      try {
        const { data, error } = await supabase
          .from('objectives')
          .select('id, title, type, isCompleted, isValidated')
          .eq('type', 'objectif')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setObjectives(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des objectifs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadObjectives();
  }, []);

  // Charger les observations existantes pour cette session
  useEffect(() => {
    const loadExistingObservations = async () => {
      if (!sessionId || !user) return;

      try {
        const { data, error } = await supabase
          .from('observations')
          .select('objective_id')
          .eq('session_id', sessionId)
          .eq('observer_id', user.id);

        if (error) throw error;

        const observedIds = data?.map(obs => obs.objective_id.toString()) || [];
        setSelectedObjectives(observedIds);
      } catch (error) {
        console.error('Erreur lors du chargement des observations:', error);
      }
    };

    loadExistingObservations();
  }, [sessionId, user]);

  const handleToggleObjective = (objectiveId: string) => {
    setSelectedObjectives(prev => {
      const newSelection = prev.includes(objectiveId)
        ? prev.filter(id => id !== objectiveId)
        : [...prev, objectiveId];

      onObservationsChange?.(newSelection);
      return newSelection;
    });
  };

  const handleSaveObservations = async () => {
    if (!user || !sessionId) return;

    setIsSaving(true);
    try {
      // Supprimer les anciennes observations de cette session par cet utilisateur
      await supabase
        .from('observations')
        .delete()
        .eq('session_id', sessionId)
        .eq('observer_id', user.id);

      // Créer les nouvelles observations
      if (selectedObjectives.length > 0) {
        const observations = selectedObjectives.map(objId => ({
          objective_id: parseInt(objId),
          observer_id: user.id,
          session_id: sessionId,
          comment: null,
          observed_at: new Date().toISOString()
        }));

        const { error } = await supabase
          .from('observations')
          .insert(observations);

        if (error) throw error;
      }

      toast.success(`${selectedObjectives.length} observation(s) enregistrée(s)`);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des observations:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Chargement des objectifs...</div>;
  }

  if (objectives.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
        Aucun objectif défini. Créez des objectifs dans l'onglet "Objectifs".
      </div>
    );
  }

  // Filtrer les objectifs selon le toggle (non validés par défaut)
  const filteredObjectives = showCompleted
    ? objectives
    : objectives.filter(obj => !obj.isValidated);

  const validatedCount = objectives.filter(obj => obj.isValidated).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-500" />
          <Label className="font-medium">Objectifs observés pendant cette visite</Label>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="show-validated" className="text-xs text-muted-foreground">
            Afficher validés {validatedCount > 0 && `(${validatedCount})`}
          </Label>
          <Switch
            id="show-validated"
            checked={showCompleted}
            onCheckedChange={setShowCompleted}
          />
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-lg bg-muted/20">
        {filteredObjectives.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            {showCompleted
              ? "Aucun objectif disponible"
              : "Tous les objectifs sont validés. Activez le toggle pour les voir."}
          </p>
        )}
        {filteredObjectives.map((objective) => (
          <div
            key={objective.id}
            className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
              selectedObjectives.includes(objective.id)
                ? 'bg-purple-100 dark:bg-purple-900/30'
                : 'hover:bg-muted/50'
            }`}
          >
            <Checkbox
              id={`obj-${objective.id}`}
              checked={selectedObjectives.includes(objective.id)}
              onCheckedChange={() => handleToggleObjective(objective.id)}
            />
            <label
              htmlFor={`obj-${objective.id}`}
              className="flex-1 text-sm cursor-pointer"
            >
              {objective.title}
              {objective.isValidated && (
                <span className="ml-2 text-xs text-green-600">(Validé)</span>
              )}
              {objective.isCompleted && !objective.isValidated && (
                <span className="ml-2 text-xs text-orange-600">(Réalisé)</span>
              )}
            </label>
          </div>
        ))}
      </div>

      {sessionId && (
        <Button
          type="button"
          size="sm"
          onClick={handleSaveObservations}
          disabled={isSaving}
          className="w-full"
        >
          <Eye className="w-4 h-4 mr-2" />
          {isSaving ? 'Enregistrement...' : `Enregistrer ${selectedObjectives.length} observation(s)`}
        </Button>
      )}

      {!sessionId && selectedObjectives.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedObjectives.length} objectif(s) sélectionné(s) - Les observations seront créées après la sauvegarde de la séance
        </p>
      )}
    </div>
  );
}
