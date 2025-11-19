import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/RichTextEditor';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Seance } from '../types';
import { SEANCE_TYPES, ALL_CRENEAUX, CLASSES } from '../types';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';
import { Eye, BookOpen, GraduationCap, UserCheck, MoreHorizontal, ChevronDown, ChevronRight, Target, ListTodo } from 'lucide-react';
import { useLiens } from '@/hooks/useLiens';
import { ObjectivesSelector } from './ObjectivesSelector';
import { TaskCreator } from './TaskCreator';

const SEANCE_TYPE_ICONS = {
  visite: Eye,
  formation: BookOpen,
  evaluation: GraduationCap,
  suivi: UserCheck,
  autre: MoreHorizontal,
};

// This interface needs to be kept in sync with the one in Seances.tsx
interface SeanceFormData {
  date: string;
  duree: number;
  type: Seance['type'];
  horaireMode?: 'ordinaire' | 'creneau';
  heure?: string;
  creneau?: typeof ALL_CRENEAUX[number] | '';
  notes: string;
  customType?: string;
  classeVisitee?: typeof CLASSES[number] | '';
}

interface SeanceFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editingSeance: Seance | null;
  formData: SeanceFormData;
  setFormData: React.Dispatch<React.SetStateAction<SeanceFormData>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

export function SeanceForm({
  isOpen,
  setIsOpen,
  editingSeance,
  formData,
  setFormData,
  handleSubmit,
  isLoading,
}: SeanceFormProps) {
  const selectableSeanceTypes = SEANCE_TYPES.filter(t => t.value !== 'formation' && t.value !== 'evaluation');
  const { saveLiens } = useLiens();
  const [showObjectives, setShowObjectives] = useState(false);
  const [showTasks, setShowTasks] = useState(false);

  const handleLinksExtracted = (links: string[]) => {
    if (editingSeance && links.length > 0) {
      saveLiens(links, 'seance', editingSeance.id);
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader className="pb-2">
        <DialogTitle>
          {editingSeance ? 'Modifier la séance' : 'Nouvelle séance'}
        </DialogTitle>
        <DialogDescription>
          Renseignez les informations de la séance de suivi
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="duree">Durée (heures)</Label>
            <Input
              id="duree"
              type="number"
              min="0.5"
              step="0.5"
              value={formData.duree}
              onChange={(e) => setFormData(prev => ({ ...prev, duree: parseFloat(e.target.value) }))}
              required
            />
          </div>
        </div>

        <div>
          <Label>Type de séance</Label>
          <div className="grid grid-cols-4 gap-2 mt-1">
            {selectableSeanceTypes.map((type) => {
              const Icon = SEANCE_TYPE_ICONS[type.value as keyof typeof SEANCE_TYPE_ICONS];
              return (
                <Button
                  key={type.value}
                  type="button"
                  size="sm"
                  variant={formData.type === type.value ? 'default' : 'outline'}
                  className="h-auto py-2 flex-col gap-0.5"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    type: type.value as Seance['type'],
                    customType: type.value === 'autre' ? prev.customType : ''
                  }))}
                >
                  <Icon className="w-3 h-3" />
                  <span className="text-[10px]">{type.label}</span>
                </Button>
              );
            })}
          </div>

          {formData.type === 'autre' && (
            <div className="mt-3">
              <Label htmlFor="customType">Type personnalisé</Label>
              <Input
                id="customType"
                value={formData.customType || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, customType: e.target.value }))}
                placeholder="Ex: Coaching, Entretien, Atelier..."
              />
            </div>
          )}
        </div>

        <div>
          <Label>Mode horaire</Label>
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant={formData.horaireMode === 'ordinaire' ? 'default' : 'outline'}
              onClick={() => setFormData(prev => ({ ...prev, horaireMode: 'ordinaire' }))}
            >
              Horaire ordinaire
            </Button>
            <Button
              type="button"
              variant={formData.horaireMode === 'creneau' ? 'default' : 'outline'}
              onClick={() => setFormData(prev => ({ ...prev, horaireMode: 'creneau' }))}
            >
              Créneaux
            </Button>
          </div>
        </div>

        {formData.horaireMode === 'ordinaire' ? (
          <div>
            <Label htmlFor="heure">Heure</Label>
            <Input
              id="heure"
              type="time"
              value={formData.heure}
              onChange={(e) => setFormData(prev => ({ ...prev, heure: e.target.value }))}
              required
            />
          </div>
        ) : (
          <div>
            <Label>Créneau</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {ALL_CRENEAUX.map((creneau) => (
                <Button
                  key={creneau}
                  type="button"
                  variant={formData.creneau === creneau ? 'default' : 'outline'}
                  className={cn(
                    "text-xs",
                    formData.creneau === creneau && (
                      creneau.startsWith('M') ? 'bg-orange-500 hover:bg-orange-600' : 'bg-purple-500 hover:bg-purple-600'
                    )
                  )}
                  onClick={() => setFormData(prev => ({ ...prev, creneau }))}
                >
                  {creneau}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Sélection de la classe (pour visite/suivi) */}
        {(formData.type === 'visite' || formData.type === 'suivi') && (
          <div>
            <Label>Classe visitée</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {CLASSES.map((classe) => (
                <Button
                  key={classe}
                  type="button"
                  variant={formData.classeVisitee === classe ? 'default' : 'outline'}
                  className={cn(
                    formData.classeVisitee === classe && (
                      classe.startsWith('6') ? 'bg-green-500 hover:bg-green-600' :
                      'bg-yellow-500 hover:bg-yellow-600'
                    )
                  )}
                  onClick={() => setFormData(prev => ({ ...prev, classeVisitee: classe }))}
                >
                  {classe}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="notes">Notes et observations</Label>
          <RichTextEditor
            value={formData.notes}
            onValueChange={(value) => {
              const newFormData = { ...formData, notes: value };
              setFormData(prev => ({ ...prev, notes: value }));
            }}
            onLinksExtracted={handleLinksExtracted}
            placeholder="Décrivez le contenu de la séance, les points abordés..."
            rows={3}
          />
        </div>

        {/* Sections collapsibles pour objectifs et tâches */}
        {(formData.type === 'visite' || formData.type === 'suivi') && (
          <div className="space-y-2">
            {/* Toggle Objectifs */}
            <button
              type="button"
              onClick={() => setShowObjectives(!showObjectives)}
              className="flex items-center gap-2 w-full p-2 text-sm font-medium text-left bg-muted/50 rounded hover:bg-muted transition-colors"
            >
              {showObjectives ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <Target className="w-4 h-4 text-primary" />
              Valider des objectifs
            </button>
            {showObjectives && <ObjectivesSelector sessionId={editingSeance?.id} />}

            {/* Toggle Tâches */}
            <button
              type="button"
              onClick={() => setShowTasks(!showTasks)}
              className="flex items-center gap-2 w-full p-2 text-sm font-medium text-left bg-muted/50 rounded hover:bg-muted transition-colors"
            >
              {showTasks ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <ListTodo className="w-4 h-4 text-primary" />
              Assigner des tâches
            </button>
            {showTasks && <TaskCreator sessionId={editingSeance?.id} />}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
            {editingSeance ? 'Modifier' : 'Créer'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
